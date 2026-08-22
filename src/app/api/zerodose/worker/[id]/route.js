import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import PendingZerodose from "@/models/PendingZerodose";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function objectIdEquals(first, second) {
  if (!first || !second) {
    return false;
  }

  const firstId = first?._id || first;
  const secondId = second?._id || second;

  return String(firstId) === String(secondId);
}

async function getAuthenticatedUser(request) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 },
      ),
    };
  }

  let payload;

  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch (error) {
    console.error("Worker Zerodose JWT error:", error);

    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication.",
        },
        { status: 401 },
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
        { status: 401 },
      ),
    };
  }

  const user = await User.findOne({
    _id: payload.userId,
    designation: "worker",
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
          message: "Active worker not found.",
        },
        { status: 401 },
      ),
    };
  }

  return {
    user,
  };
}

function populateZerodose(query) {
  return query
    .populate("campaign", "name year month startDate endDate isActive")
    .populate("district", "name code")
    .populate("town", "name code")
    .populate("unionCouncil", "name code")
    .populate("ucmo", "name contactNumber")
    .populate("supervisor", "name contactNumber supervisorCode")
    .populate("user", "name contactNumber designation workerRole teamNumber")
    .populate(
      "teamLeader",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "teamMember",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate("vaccinator", "name contactNumber designation");
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const worker = auth.user;

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        { status: 400 },
      );
    }

    const zerodose = await populateZerodose(Zerodose.findById(id)).lean();

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        { status: 404 },
      );
    }

    if (!objectIdEquals(zerodose.user, worker._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view this Zerodose.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: zerodose,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get worker Zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch Zerodose.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const worker = auth.user;

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Pending Zerodose ID.",
        },
        { status: 400 },
      );
    }

    const pendingZerodose = await PendingZerodose.findById(id).lean();

    if (!pendingZerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending Zerodose not found.",
        },
        { status: 404 },
      );
    }

    // Actual Zerodose verify karein
    const zerodose = await Zerodose.findById(
      pendingZerodose.zerodose,
    ).lean();

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Actual Zerodose not found.",
        },
        { status: 404 },
      );
    }

    // Sirf original worker apni pending request delete kar sakta hai
    if (!objectIdEquals(zerodose.user, worker._id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to delete this pending Zerodose.",
        },
        { status: 403 },
      );
    }

    await PendingZerodose.deleteOne({
      _id: pendingZerodose._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pending Zerodose deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete pending Zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to delete pending Zerodose.",
      },
      { status: 500 },
    );
  }
}