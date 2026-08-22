import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";

// ============================================================
// IMPORTANT MODEL REGISTRATION
// ============================================================
// These imports make sure Mongoose knows about every referenced
// model before populate() is executed.
//
// Without these imports you can get:
// MissingSchemaError: Schema hasn't been registered for model
// "Campaign"
// ============================================================

import Campaign from "@/models/Campaign";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

// Avoid unused import warnings in some environments.
void Campaign;
void District;
void Town;
void UnionCouncil;

// ============================================================
// JWT
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

// ============================================================
// HELPERS
// ============================================================

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function objectIdEquals(first, second) {
  if (!first || !second) {
    return false;
  }

  const firstId = first?._id || first;
  const secondId = second?._id || second;

  return firstId.toString() === secondId.toString();
}

// ============================================================
// AUTHENTICATION
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

// ============================================================
// POPULATE
// ============================================================

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
    );
}

// ============================================================
// NORMALIZE UPDATE DATA
// ============================================================

function normalizeUpdateData(updateData) {
  if (!updateData) {
    return {};
  }

  if (typeof updateData !== "object" || Array.isArray(updateData)) {
    return {};
  }

  return updateData;
}

// ============================================================
// GET
// Pending Zerodose Update Requests
//
// GET /api/zerodose/pendingZerodose
//
// Optional:
// ?supervisor=<id>
//
// Supervisor:
//   Only sees own pending requests.
//
// UCMO:
//   Sees pending requests belonging to that UCMO.
//
// Admin:
//   Sees all pending requests.
// ============================================================

export async function GET(request) {
  try {
    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // AUTH
    // ========================================================

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

    // ========================================================
    // PERMISSION
    // ========================================================

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

    // ========================================================
    // QUERY PARAMETERS
    // ========================================================

    const { searchParams } = new URL(request.url);

    const requestedSupervisorId = searchParams.get("supervisor");

    // ========================================================
    // BASE FILTER
    // ========================================================

    const filter = {
      updateRequested: true,
    };

    // ========================================================
    // SUPERVISOR SCOPE
    // ========================================================
    //
    // IMPORTANT:
    // Never trust the supervisor ID coming from the frontend.
    // The authenticated supervisor controls the scope.
    //
    // ========================================================

    if (user.designation === "supervisor") {
      filter.supervisor = user._id;
    }

    // ========================================================
    // UCMO SCOPE
    // ========================================================

    if (user.designation === "ucmo") {
      filter.ucmo = user._id;

      // If a supervisor ID was supplied, validate that the
      // requested supervisor belongs to this UCMO scope.
      if (requestedSupervisorId) {
        if (!isValidObjectId(requestedSupervisorId)) {
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

        filter.supervisor = new mongoose.Types.ObjectId(requestedSupervisorId);
      }
    }

    // ========================================================
    // ADMIN SCOPE
    // ========================================================

    if (user.designation === "admin" && requestedSupervisorId) {
      if (!isValidObjectId(requestedSupervisorId)) {
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

      filter.supervisor = new mongoose.Types.ObjectId(requestedSupervisorId);
    }

    // ========================================================
    // PAGINATION
    // ========================================================

    const pageValue = Number(searchParams.get("page") || 1);

    const limitValue = Number(searchParams.get("limit") || 10);

    const page =
      Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;

    const limit =
      Number.isFinite(limitValue) && limitValue > 0
        ? Math.min(Math.floor(limitValue), 100)
        : 10;

    const skip = (page - 1) * limit;

    // ========================================================
    // TOTAL
    // ========================================================

    const total = await Zerodose.countDocuments(filter);

    // ========================================================
    // FETCH
    // ========================================================

    const data = await populateZerodose(
      Zerodose.find(filter)
        .sort({
          updateRequestedAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit),
    ).lean();

    // ========================================================
    // NORMALIZE DATA
    // ========================================================
    //
    // We keep the complete Zerodose object.
    //
    // We additionally make sure updateData is always an object
    // so the frontend can safely calculate changed fields.
    //
    // ========================================================

    const normalizedData = data.map((item) => {
      const normalizedUpdateData = normalizeUpdateData(item?.updateData);

      return {
        ...item,

        updateData:
          Object.keys(normalizedUpdateData).length > 0
            ? normalizedUpdateData
            : (item?.updateData ?? null),

        updateChangeCount: Object.keys(normalizedUpdateData).length,

        // Worker who actually owns the Zerodose.
        //
        // This is important because your response already
        // contains the worker here:
        //
        // user: {
        //   name: "Muhammad Qasim",
        //   workerRole: "teamLeader"
        // }
        //
        worker: item?.user || null,
      };
    });

    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return NextResponse.json(
      {
        success: true,

        data: normalizedData,

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
        message: "Failed to fetch pending Zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}
