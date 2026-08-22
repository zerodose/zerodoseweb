import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

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
    console.error("Pending Zerodose count JWT error:", error);

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
      "_id name designation district town unionCouncil ucmo supervisor supervisorCode",
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

export async function GET(request) {
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
          message: "You are not authorized to view pending Zerodose count.",
        },
        {
          status: 403,
        },
      );
    }

    if (user.designation === "supervisor") {
      const count = await PendingZerodose.countDocuments({
        supervisor: user._id,
        status: "pending",
      });

      return NextResponse.json(
        {
          success: true,
          count,
        },
        {
          status: 200,
        },
      );
    }

    if (user.designation === "ucmo") {
      const supervisors = await User.find({
        designation: "supervisor",
        isActive: true,
        ucmo: user._id,
      })
        .select("_id name supervisorCode")
        .lean();

      const supervisorIds = supervisors.map((supervisor) => supervisor._id);

      if (supervisorIds.length === 0) {
        return NextResponse.json(
          {
            success: true,
            total: 0,
            supervisors: [],
          },
          {
            status: 200,
          },
        );
      }

      const counts = await PendingZerodose.aggregate([
        {
          $match: {
            supervisor: {
              $in: supervisorIds,
            },
            status: "pending",
          },
        },
        {
          $group: {
            _id: "$supervisor",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      const countMap = new Map(
        counts.map((item) => [String(item._id), item.count]),
      );

      const supervisorCounts = supervisors.map((supervisor) => ({
        _id: supervisor._id,
        name: supervisor.name,
        supervisorCode: supervisor.supervisorCode || null,
        count: countMap.get(String(supervisor._id)) || 0,
      }));

      const total = supervisorCounts.reduce(
        (sum, supervisor) => sum + supervisor.count,
        0,
      );

      return NextResponse.json(
        {
          success: true,
          total,
          supervisors: supervisorCounts,
        },
        {
          status: 200,
        },
      );
    }

    if (user.designation === "admin") {
      const counts = await PendingZerodose.aggregate([
        {
          $match: {
            status: "pending",
          },
        },
        {
          $group: {
            _id: "$supervisor",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      const supervisorIds = counts.map((item) => item._id);

      const supervisors = await User.find({
        _id: {
          $in: supervisorIds,
        },
        designation: "supervisor",
      })
        .select("_id name supervisorCode")
        .lean();

      const countMap = new Map(
        counts.map((item) => [String(item._id), item.count]),
      );

      const supervisorCounts = supervisors.map((supervisor) => ({
        _id: supervisor._id,
        name: supervisor.name,
        supervisorCode: supervisor.supervisorCode || null,
        count: countMap.get(String(supervisor._id)) || 0,
      }));

      const total = supervisorCounts.reduce(
        (sum, supervisor) => sum + supervisor.count,
        0,
      );

      return NextResponse.json(
        {
          success: true,
          total,
          supervisors: supervisorCounts,
        },
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid user designation.",
      },
      {
        status: 403,
      },
    );
  } catch (error) {
    console.error("Pending Zerodose count error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch pending Zerodose count.",
      },
      {
        status: 500,
      },
    );
  }
}
