import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";

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

function objectIdEquals(first, second) {
  if (!first || !second) {
    return false;
  }

  const firstId = first?._id || first;
  const secondId = second?._id || second;

  return String(firstId) === String(secondId);
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
    console.error("JWT verification error:", error);

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
// Allowed Update Fields
// ============================================================

const ALLOWED_UPDATE_FIELDS = new Set([
  "childName",
  "fatherName",
  "age",
  "address",
  "contactNo",
  "day",
  "visitDate",
  "coveredDate",
  "location",
  "clientStatus",
  "vaccinationStatus",
]);

// ============================================================
// Normalize updateData
// ============================================================

function normalizeUpdateData(updateData) {
  if (!updateData) {
    return {};
  }

  // Mongoose Map
  if (updateData instanceof Map) {
    return Object.fromEntries(updateData.entries());
  }

  // Object
  if (typeof updateData === "object" && !Array.isArray(updateData)) {
    return { ...updateData };
  }

  return {};
}

// ============================================================
// Date normalization
// ============================================================

function normalizeDateValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return date;
}

// ============================================================
// Number normalization
// ============================================================

function normalizeNumberValue(value, fieldName) {
  if (value === null || value === undefined || value === "") {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return number;
}

// ============================================================
// Location normalization
// ============================================================
//
// IMPORTANT:
//
// If worker changes only latitude:
//
// {
//   location: {
//      latitude: 24.123
//   }
// }
//
// We must preserve existing longitude.
//
// Same for longitude.
//
// ============================================================

function normalizeLocationValue(newLocation, existingLocation) {
  if (
    !newLocation ||
    typeof newLocation !== "object" ||
    Array.isArray(newLocation)
  ) {
    throw new Error("Invalid location data.");
  }

  const existingLatitude = existingLocation?.latitude;
  const existingLongitude = existingLocation?.longitude;

  const latitude =
    newLocation.latitude !== undefined
      ? Number(newLocation.latitude)
      : existingLatitude;

  const longitude =
    newLocation.longitude !== undefined
      ? Number(newLocation.longitude)
      : existingLongitude;

  if (latitude === undefined || latitude === null || Number.isNaN(latitude)) {
    throw new Error("Valid latitude is required.");
  }

  if (
    longitude === undefined ||
    longitude === null ||
    Number.isNaN(longitude)
  ) {
    throw new Error("Valid longitude is required.");
  }

  return {
    latitude,
    longitude,
  };
}

// ============================================================
// Build Safe Update
// ============================================================

function buildSafeUpdateData(updateData, existingZerodose) {
  const normalized = normalizeUpdateData(updateData);

  const safeData = {};

  for (const [field, value] of Object.entries(normalized)) {
    if (!ALLOWED_UPDATE_FIELDS.has(field)) {
      continue;
    }

    // --------------------------------------------------------
    // Location
    // --------------------------------------------------------

    if (field === "location") {
      safeData.location = normalizeLocationValue(
        value,
        existingZerodose.location,
      );

      continue;
    }

    // --------------------------------------------------------
    // Date fields
    // --------------------------------------------------------

    if (field === "visitDate" || field === "coveredDate") {
      safeData[field] = normalizeDateValue(value);
      continue;
    }

    // --------------------------------------------------------
    // Age
    // --------------------------------------------------------

    if (field === "age") {
      const age = normalizeNumberValue(value, "Age");

      if (age < 0 || age > 59) {
        throw new Error("Age must be between 0 and 59.");
      }

      safeData.age = age;

      continue;
    }

    // --------------------------------------------------------
    // Day
    // --------------------------------------------------------

    if (field === "day") {
      safeData.day = normalizeNumberValue(value, "Day");
      continue;
    }

    // --------------------------------------------------------
    // String fields
    // --------------------------------------------------------

    if (
      field === "childName" ||
      field === "fatherName" ||
      field === "address" ||
      field === "contactNo"
    ) {
      if (value === null || value === undefined) {
        safeData[field] = value;
      } else {
        safeData[field] = String(value).trim();
      }

      continue;
    }

    // --------------------------------------------------------
    // Status fields
    // --------------------------------------------------------

    if (field === "clientStatus" || field === "vaccinationStatus") {
      safeData[field] = value;
      continue;
    }
  }

  return safeData;
}

// ============================================================
// GET
// Single Pending Zerodose
// ============================================================

export async function GET(request, { params }) {
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
    // ID
    // ========================================================

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Find Pending Zerodose
    // ========================================================

    const zerodose = await Zerodose.findOne({
      _id: id,
      updateRequested: true,
    })
      .populate("campaign", "name year month startDate endDate isActive")
      .populate("district", "name code")
      .populate("town", "name code")
      .populate("unionCouncil", "name code")
      .populate("ucmo", "name contactNumber")
      .populate("supervisor", "name contactNumber supervisorCode")
      .populate("user", "name contactNumber designation workerRole teamNumber")
      .populate(
        "updateRequestedBy",
        "name contactNumber designation workerRole teamNumber",
      )
      .lean();

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending Zerodose request not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // Supervisor Scope
    // ========================================================

    if (
      user.designation === "supervisor" &&
      !objectIdEquals(user._id, zerodose.supervisor)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view this pending Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // UCMO Scope
    // ========================================================

    if (
      user.designation === "ucmo" &&
      !objectIdEquals(user._id, zerodose.ucmo)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view this pending Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // Return
    // ========================================================

    return NextResponse.json(
      {
        success: true,
        data: zerodose,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get pending Zerodose by ID error:", error);

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

// ============================================================
// PUT
// Approve / Reject Pending Zerodose
// ============================================================

export async function PUT(request, { params }) {
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
    // ONLY SUPERVISOR CAN APPROVE / REJECT
    // ========================================================

    if (user.designation !== "supervisor") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only supervisors can approve or reject Zerodose update requests.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // ID
    // ========================================================

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // BODY
    // ========================================================

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const action = body?.action;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Invalid action. Action must be either "approve" or "reject".',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // FIND PENDING REQUEST
    // ========================================================

    const zerodose = await Zerodose.findOne({
      _id: id,
      updateRequested: true,
    }).lean();

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pending Zerodose update request not found or already processed.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // SUPERVISOR SCOPE
    // ========================================================

    if (!objectIdEquals(user._id, zerodose.supervisor)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to process this Zerodose request.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // APPROVE
    // ========================================================

    if (action === "approve") {
      let safeUpdateData;

      try {
        safeUpdateData = buildSafeUpdateData(zerodose.updateData, zerodose);
      } catch (error) {
        console.error("Pending Zerodose updateData validation error:", error);

        return NextResponse.json(
          {
            success: false,
            message: error?.message || "Invalid pending changes.",
          },
          {
            status: 400,
          },
        );
      }

      // ------------------------------------------------------
      // Make sure changes exist
      // ------------------------------------------------------

      if (Object.keys(safeUpdateData).length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No valid pending changes were found in this request.",
            updateData: zerodose.updateData || null,
          },
          {
            status: 400,
          },
        );
      }

      // ------------------------------------------------------
      // Approval fields
      // ------------------------------------------------------

      const updatePayload = {
        ...safeUpdateData,

        updateRequested: false,
        updateApproved: true,
        updateApprovedBy: user._id,
        updateApprovedAt: new Date(),

        // Request is completed.
        updateData: null,
      };

      // ------------------------------------------------------
      // ATOMIC UPDATE
      // ------------------------------------------------------
      //
      // Do NOT use:
      //
      // zerodose.save()
      //
      // because that can trigger full document validation.
      //
      // We only want to apply the approved fields.
      //
      // ------------------------------------------------------

      const updatedZerodose = await Zerodose.findOneAndUpdate(
        {
          _id: id,
          updateRequested: true,
          supervisor: user._id,
        },
        {
          $set: updatePayload,
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      if (!updatedZerodose) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The pending Zerodose request could not be approved. It may already have been processed.",
          },
          {
            status: 409,
          },
        );
      }

      // ------------------------------------------------------
      // Success
      // ------------------------------------------------------

      return NextResponse.json(
        {
          success: true,
          message: "Zerodose update approved and applied successfully.",
          data: {
            _id: updatedZerodose._id,
            updateRequested: updatedZerodose.updateRequested,
            updateApproved: updatedZerodose.updateApproved,
            updateApprovedBy: updatedZerodose.updateApprovedBy,
            updateApprovedAt: updatedZerodose.updateApprovedAt,
          },
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // REJECT
    // ========================================================

    if (action === "reject") {
      const rejectedZerodose = await Zerodose.findOneAndUpdate(
        {
          _id: id,
          updateRequested: true,
          supervisor: user._id,
        },
        {
          $set: {
            updateRequested: false,

            updateApproved: false,

            updateApprovedBy: null,

            updateApprovedAt: null,

            updateData: null,
          },
        },
        {
          new: true,
        },
      ).lean();

      if (!rejectedZerodose) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The pending Zerodose request could not be rejected. It may already have been processed.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Zerodose update request rejected successfully.",
          data: {
            _id: rejectedZerodose._id,
            updateRequested: rejectedZerodose.updateRequested,
            updateApproved: rejectedZerodose.updateApproved,
            updateApprovedBy: rejectedZerodose.updateApprovedBy,
            updateApprovedAt: rejectedZerodose.updateApprovedAt,
          },
        },
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid approval action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error("Pending Zerodose approval error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to process Zerodose approval.",
        error:
          process.env.NODE_ENV === "development"
            ? {
                name: error?.name,
                message: error?.message,
                errors: error?.errors
                  ? Object.fromEntries(
                      Object.entries(error.errors).map(([key, value]) => [
                        key,
                        value?.message || String(value),
                      ]),
                    )
                  : undefined,
              }
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
