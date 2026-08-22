import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import PendingZerodose from "@/models/PendingZerodose";
import User from "@/models/User";

import Zerodose from "@/models/Zerodose";
import Campaign from "@/models/Campaign";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

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
    console.error("Pending Zerodose JWT error:", error);

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

  const user = await User.findOne({
    _id: payload.userId,
    isActive: true,
  })
    .select(
      [
        "_id",
        "name",
        "designation",
        "district",
        "town",
        "unionCouncil",
        "ucmo",
        "supervisor",
        "supervisorCode",
        "teamNumber",
        "workerRole",
      ].join(" "),
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

function populatePendingZerodose(query) {
  return query
    .populate("zerodose")
    .populate(
      "requestedBy",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate("supervisor", "name contactNumber supervisorCode")
    .populate("zerodose.campaign", "name year month startDate endDate isActive")
    .populate("zerodose.district", "name code")
    .populate("zerodose.town", "name code")
    .populate("zerodose.unionCouncil", "name code")
    .populate("zerodose.ucmo", "name contactNumber")
    .populate(
      "zerodose.user",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "zerodose.teamLeader",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "zerodose.teamMember",
      "name contactNumber designation workerRole teamNumber",
    );
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

    if (!["supervisor", "ucmo", "admin"].includes(user.designation)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view pending Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid supervisor ID.",
        },
        {
          status: 400,
        },
      );
    }

    const supervisor = await User.findOne({
      _id: id,
      designation: "supervisor",
      isActive: true,
    }).lean();

    if (!supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Active supervisor not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      user.designation === "supervisor" &&
      !objectIdEquals(user._id, supervisor._id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to view this supervisor's pending Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      user.designation === "ucmo" &&
      !objectIdEquals(supervisor.ucmo, user._id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to view this supervisor's pending Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    const pendingZerodoses = await populatePendingZerodose(
      PendingZerodose.find({
        supervisor: supervisor._id,
        status: "pending",
      }).sort({
        createdAt: -1,
        _id: -1,
      }),
    ).lean();

    return NextResponse.json(
      {
        success: true,
        supervisor: {
          _id: supervisor._id,
          name: supervisor.name,
          supervisorCode: supervisor.supervisorCode || null,
        },
        data: pendingZerodoses,
        total: pendingZerodoses.length,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get supervisor pending Zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to fetch supervisor pending Zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}
