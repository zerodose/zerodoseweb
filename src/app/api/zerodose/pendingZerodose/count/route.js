import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

// ============================================================
// Helpers
// ============================================================

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

// ============================================================
// Authentication
// ============================================================

async function getAuthenticatedUser(request) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  let payload;

  try {
    const result = await jwtVerify(token, secret);

    payload = result.payload;
  } catch (error) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (!payload.userId || !isValidObjectId(payload.userId)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid authenticated user.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  await connectDB();

  const user = await User.findOne({
    _id: payload.userId,
    isActive: true,
  })
    .select(
      "_id name designation district town unionCouncil ucmo supervisor teamNumber workerRole",
    )
    .lean();

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Active user not found.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  return {
    user,
  };
}

// ============================================================
// GET
// Pending Zerodose Count
// ============================================================
//
// GET /api/zerodose/pendingZerodose/count
//
// ============================================================

export async function GET(request) {
  try {
    await connectDB();

    // ========================================================
    // Authentication
    // ========================================================

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

    // ========================================================
    // Permission
    // ========================================================

    if (
      !["supervisor", "ucmo", "admin"].includes(
        user.designation,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to view pending Zerodose count.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // Filter
    // ========================================================

    const filter = {
      updateRequested: true,
    };

    // ========================================================
    // Supervisor
    // ========================================================

    if (user.designation === "supervisor") {
      filter.supervisor = user._id;
    }

    // ========================================================
    // UCMO
    // ========================================================

    if (user.designation === "ucmo") {
      filter.ucmo = user._id;
    }

    // ========================================================
    // Count
    // ========================================================

    const count = await Zerodose.countDocuments(filter);

    // ========================================================
    // Response
    // ========================================================

    return NextResponse.json(
      {
        success: true,
        count,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Get pending Zerodose count error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch pending Zerodose count.",
      },
      {
        status: 500,
      },
    );
  }
}