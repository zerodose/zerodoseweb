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
        "contactNumber",
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
    .populate({
      path: "zerodose",
      populate: [
        {
          path: "campaign",
          select: "name year month startDate endDate isActive",
        },
        {
          path: "district",
          select: "name code",
        },
        {
          path: "town",
          select: "name code",
        },
        {
          path: "unionCouncil",
          select: "name code",
        },
        {
          path: "ucmo",
          select: "name contactNumber",
        },
        {
          path: "supervisor",
          select: "name contactNumber supervisorCode",
        },
        {
          path: "user",
          select: "name contactNumber designation workerRole teamNumber",
        },
        {
          path: "teamLeader",
          select: "name contactNumber designation workerRole teamNumber",
        },
        {
          path: "teamMember",
          select: "name contactNumber designation workerRole teamNumber",
        },
      ],
    })
    .populate(
      "requestedBy",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "supervisor",
      "name contactNumber supervisorCode designation unionCouncil ucmo",
    );
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
          message: "You are not authorized to view pending Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    const { searchParams } = new URL(request.url);

    const pageValue = Number(searchParams.get("page") || 1);
    const limitValue = Number(searchParams.get("limit") || 10);

    const page =
      Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;

    const limit =
      Number.isFinite(limitValue) && limitValue > 0
        ? Math.min(Math.floor(limitValue), 100)
        : 10;

    const skip = (page - 1) * limit;

    const filter = {
      status: "pending",
    };

    if (user.designation === "supervisor") {
      filter.supervisor = user._id;
    }

    if (user.designation === "ucmo") {
      const supervisors = await User.find({
        designation: "supervisor",
        isActive: true,
        ucmo: user._id,
      })
        .select("_id")
        .lean();

      const supervisorIds = supervisors.map((supervisor) => supervisor._id);

      filter.supervisor = {
        $in: supervisorIds,
      };
    }

    const total = await PendingZerodose.countDocuments(filter);

    const data = await populatePendingZerodose(
      PendingZerodose.find(filter)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit),
    ).lean();

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get pending Zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch pending Zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}
