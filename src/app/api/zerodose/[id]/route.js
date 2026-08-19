import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";

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

  return firstId.toString() === secondId.toString();
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
// Populate Zerodose
// ============================================================

function populateZerodose(query) {
  return query
    .populate("campaign", "name year month startDate endDate isActive")
    .populate("district", "name code")
    .populate("town", "name code")
    .populate("unionCouncil", "name code")
    .populate("ucmo", "name contactNumber")
    .populate("supervisor", "name contactNumber supervisorCode")
    .populate("user", "name contactNumber designation workerRole teamNumber");
}

// ============================================================
// Check whether user can access this Zerodose
// ============================================================
//
// worker:
//   Only workers belonging to the same supervisor + teamNumber.
//
// supervisor:
//   Only Zerodose belonging to that supervisor.
//
// ucmo:
//   Only Zerodose belonging to that UCMO.
//
// vaccinator:
//   Only Zerodose belonging to own Union Council.
//
// townFP:
//   Own Town.
//
// districtFP:
//   Own District.
//
// admin:
//   Everything.
//
// ============================================================

function canAccessZerodose(user, zerodose) {
  if (!user || !zerodose) {
    return false;
  }

  // ==========================================================
  // ADMIN
  // ==========================================================

  if (user.designation === "admin") {
    return true;
  }

  // ==========================================================
  // WORKER
  // ==========================================================

  if (user.designation === "worker") {
    if (
      !user.supervisor ||
      user.teamNumber === null ||
      user.teamNumber === undefined
    ) {
      return false;
    }

    const sameSupervisor = objectIdEquals(user.supervisor, zerodose.supervisor);

    const sameTeam = Number(user.teamNumber) === Number(zerodose.teamNumber);

    return sameSupervisor && sameTeam;
  }

  // ==========================================================
  // SUPERVISOR
  // ==========================================================

  if (user.designation === "supervisor") {
    return objectIdEquals(user._id, zerodose.supervisor);
  }

  // ==========================================================
  // UCMO
  // ==========================================================

  if (user.designation === "ucmo") {
    return objectIdEquals(user._id, zerodose.ucmo);
  }

  // ==========================================================
  // VACCINATOR
  // ==========================================================

  if (user.designation === "vaccinator") {
    return objectIdEquals(user.unionCouncil, zerodose.unionCouncil);
  }

  // ==========================================================
  // TOWN FP
  // ==========================================================

  if (user.designation === "townFP") {
    return objectIdEquals(user.town, zerodose.town);
  }

  // ==========================================================
  // DISTRICT FP
  // ==========================================================

  if (user.designation === "districtFP") {
    return objectIdEquals(user.district, zerodose.district);
  }

  return false;
}

// ============================================================
// Get Zerodose By ID
// ============================================================

async function getZerodose(id) {
  return populateZerodose(Zerodose.findById(id)).lean();
}

// ============================================================
// GET
// Get Single Zerodose By ID
// ============================================================
//
// GET /api/zerodose/:id
//
// Scope is checked against logged-in user.
//
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
    // Zerodose ID
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
    // Get Zerodose
    // ========================================================

    const zerodose = await getZerodose(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // Access Scope
    // ========================================================

    if (!canAccessZerodose(user, zerodose)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view this Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // Response
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
    console.error("Get single Zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PATCH
// ============================================================
//
// PATCH /api/zerodose/:id
//
// Three different workflows:
//
// 1. WORKER
//    Request amendment.
//    Actual Zerodose does NOT change.
//    Supervisor approval required.
//
// 2. SUPERVISOR
//    Approve/reject worker amendment.
//
// 3. VACCINATOR
//    Directly update vaccination-related fields.
//    No approval required.
//
// 4. UCMO
//    Can approve/reject DELETE request.
//
// ============================================================

export async function PATCH(request, { params }) {
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
    // Zerodose ID
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
    // Get Zerodose
    // ========================================================

    const zerodose = await Zerodose.findById(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // Parse Body
    // ========================================================

    const body = await request.json();

    // ========================================================
    // WORKER
    // ========================================================
    //
    // Worker does NOT directly update Zerodose.
    //
    // Worker can only request changes to:
    //
    // childName
    // fatherName
    // age
    // address
    // contactNo
    // location
    //
    // Supervisor must approve.
    //
    // ========================================================

    if (user.designation === "worker") {
      // ------------------------------------------------------
      // Team Scope
      // ------------------------------------------------------

      const sameTeam =
        user.supervisor &&
        zerodose.supervisor &&
        objectIdEquals(user.supervisor, zerodose.supervisor) &&
        user.teamNumber !== null &&
        user.teamNumber !== undefined &&
        Number(user.teamNumber) === Number(zerodose.teamNumber);

      if (!sameTeam) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You are not authorized to request changes for this Zerodose.",
          },
          {
            status: 403,
          },
        );
      }

      // ------------------------------------------------------
      // Worker Editable Fields
      // ------------------------------------------------------

      const allowedWorkerFields = [
        "childName",
        "fatherName",
        "age",
        "address",
        "contactNo",
        "location",
      ];

      const receivedFields = Object.keys(body);

      if (receivedFields.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No update data provided.",
          },
          {
            status: 400,
          },
        );
      }

      const invalidFields = receivedFields.filter(
        (field) => !allowedWorkerFields.includes(field),
      );

      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `You are not allowed to update: ${invalidFields.join(
              ", ",
            )}.`,
          },
          {
            status: 403,
          },
        );
      }

      // ------------------------------------------------------
      // Existing Pending Request
      // ------------------------------------------------------

      if (zerodose.updateRequested) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An update request is already pending supervisor approval.",
          },
          {
            status: 409,
          },
        );
      }

      // ------------------------------------------------------
      // Build Pending Update
      // ------------------------------------------------------

      const pendingUpdate = {};

      // ------------------------------------------------------
      // Child Name
      // ------------------------------------------------------

      if (body.childName !== undefined) {
        if (typeof body.childName !== "string" || !body.childName.trim()) {
          return NextResponse.json(
            {
              success: false,
              message: "Valid child name is required.",
            },
            {
              status: 400,
            },
          );
        }

        pendingUpdate.childName = body.childName.trim();
      }

      // ------------------------------------------------------
      // Father Name
      // ------------------------------------------------------

      if (body.fatherName !== undefined) {
        if (typeof body.fatherName !== "string" || !body.fatherName.trim()) {
          return NextResponse.json(
            {
              success: false,
              message: "Valid father name is required.",
            },
            {
              status: 400,
            },
          );
        }

        pendingUpdate.fatherName = body.fatherName.trim();
      }

      // ------------------------------------------------------
      // Age
      // ------------------------------------------------------

      if (body.age !== undefined) {
        if (
          typeof body.age !== "number" ||
          !Number.isInteger(body.age) ||
          body.age < 0 ||
          body.age > 59
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Age must be an integer between 0 and 59.",
            },
            {
              status: 400,
            },
          );
        }

        pendingUpdate.age = body.age;
      }

      // ------------------------------------------------------
      // Address
      // ------------------------------------------------------

      if (body.address !== undefined) {
        if (typeof body.address !== "string" || !body.address.trim()) {
          return NextResponse.json(
            {
              success: false,
              message: "Valid address is required.",
            },
            {
              status: 400,
            },
          );
        }

        pendingUpdate.address = body.address.trim();
      }

      // ------------------------------------------------------
      // Contact Number
      // ------------------------------------------------------

      if (body.contactNo !== undefined) {
        if (
          body.contactNo !== null &&
          body.contactNo !== "" &&
          (typeof body.contactNo !== "string" ||
            !/^03\d{9}$/.test(body.contactNo.trim()))
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Please enter a valid Pakistani mobile number.",
            },
            {
              status: 400,
            },
          );
        }

        pendingUpdate.contactNo = body.contactNo?.trim() || null;
      }

      // ------------------------------------------------------
      // Location
      // ------------------------------------------------------

      if (body.location !== undefined) {
        if (
          !body.location ||
          typeof body.location.latitude !== "number" ||
          typeof body.location.longitude !== "number"
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Valid latitude and longitude are required.",
            },
            {
              status: 400,
            },
          );
        }

        if (body.location.latitude < -90 || body.location.latitude > 90) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid latitude.",
            },
            {
              status: 400,
            },
          );
        }

        if (body.location.longitude < -180 || body.location.longitude > 180) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid longitude.",
            },
            {
              status: 400,
            },
          );
        }

        pendingUpdate.location = {
          latitude: body.location.latitude,
          longitude: body.location.longitude,
        };
      }

      // ------------------------------------------------------
      // Make Sure Something Actually Changed
      // ------------------------------------------------------

      if (Object.keys(pendingUpdate).length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No valid update data provided.",
          },
          {
            status: 400,
          },
        );
      }

      // ------------------------------------------------------
      // Create Update Request
      // ------------------------------------------------------

      zerodose.updateRequested = true;
      zerodose.updateRequestedBy = user._id;
      zerodose.updateRequestedAt = new Date();

      zerodose.pendingUpdate = pendingUpdate;

      zerodose.updateApproved = false;
      zerodose.updateApprovedBy = null;
      zerodose.updateApprovedAt = null;

      await zerodose.save();

      const populated = await getZerodose(id);

      return NextResponse.json(
        {
          success: true,
          message: "Update request submitted. Supervisor approval is required.",
          data: populated,
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // SUPERVISOR
    // ========================================================
    //
    // Supervisor can:
    //
    // approve update request
    // reject update request
    //
    // Supervisor CANNOT directly edit Zerodose.
    //
    // ========================================================

    if (user.designation === "supervisor") {
      // ------------------------------------------------------
      // Supervisor Scope
      // ------------------------------------------------------

      if (!objectIdEquals(user._id, zerodose.supervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to manage this Zerodose.",
          },
          {
            status: 403,
          },
        );
      }

      // ------------------------------------------------------
      // Action
      // ------------------------------------------------------

      const action = body.action;

      if (!["approve", "reject"].includes(action)) {
        return NextResponse.json(
          {
            success: false,
            message: "Supervisor action must be either approve or reject.",
          },
          {
            status: 400,
          },
        );
      }

      // ------------------------------------------------------
      // Check Pending Update
      // ------------------------------------------------------

      if (!zerodose.updateRequested || !zerodose.pendingUpdate) {
        return NextResponse.json(
          {
            success: false,
            message: "No pending update request found.",
          },
          {
            status: 400,
          },
        );
      }

      // ======================================================
      // REJECT
      // ======================================================

      if (action === "reject") {
        zerodose.updateRequested = false;

        zerodose.updateRequestedBy = null;

        zerodose.updateRequestedAt = null;

        zerodose.pendingUpdate = null;

        zerodose.updateApproved = false;

        zerodose.updateApprovedBy = user._id;

        zerodose.updateApprovedAt = new Date();

        await zerodose.save();

        const populated = await getZerodose(id);

        return NextResponse.json(
          {
            success: true,
            message: "Update request rejected.",
            data: populated,
          },
          {
            status: 200,
          },
        );
      }

      // ======================================================
      // APPROVE
      // ======================================================

      const pendingUpdate = zerodose.pendingUpdate;

      const allowedApprovedFields = [
        "childName",
        "fatherName",
        "age",
        "address",
        "contactNo",
        "location",
      ];

      for (const field of allowedApprovedFields) {
        if (pendingUpdate[field] !== undefined) {
          zerodose[field] = pendingUpdate[field];
        }
      }

      // ------------------------------------------------------
      // Clear Request
      // ------------------------------------------------------

      zerodose.updateRequested = false;

      zerodose.updateRequestedBy = null;

      zerodose.updateRequestedAt = null;

      zerodose.pendingUpdate = null;

      zerodose.updateApproved = true;

      zerodose.updateApprovedBy = user._id;

      zerodose.updateApprovedAt = new Date();

      await zerodose.save();

      const populated = await getZerodose(id);

      return NextResponse.json(
        {
          success: true,
          message: "Update request approved and Zerodose updated successfully.",
          data: populated,
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // VACCINATOR
    // ========================================================
    //
    // Vaccinator can directly update:
    //
    // vaccinationStatus
    // clientStatus
    // visitDate
    // coveredDate
    //
    // No supervisor approval.
    //
    // ========================================================

    if (user.designation === "vaccinator") {
      // ------------------------------------------------------
      // Union Council Scope
      // ------------------------------------------------------

      if (
        !user.unionCouncil ||
        !objectIdEquals(user.unionCouncil, zerodose.unionCouncil)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to update this Zerodose.",
          },
          {
            status: 403,
          },
        );
      }

      // ------------------------------------------------------
      // Allowed Fields
      // ------------------------------------------------------

      const allowedFields = [
        "vaccinationStatus",
        "clientStatus",
        "visitDate",
        "coveredDate",
      ];

      const receivedFields = Object.keys(body);

      if (receivedFields.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No update data provided.",
          },
          {
            status: 400,
          },
        );
      }

      const invalidFields = receivedFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Vaccinator cannot update: ${invalidFields.join(", ")}.`,
          },
          {
            status: 403,
          },
        );
      }

      // ------------------------------------------------------
      // Vaccination Status
      // ------------------------------------------------------

      if (body.vaccinationStatus !== undefined) {
        const allowedStatuses = ["recorded", "visited", "covered"];

        if (!allowedStatuses.includes(body.vaccinationStatus)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid vaccinationStatus.",
            },
            {
              status: 400,
            },
          );
        }

        zerodose.vaccinationStatus = body.vaccinationStatus;
      }

      // ------------------------------------------------------
      // Client Status
      // ------------------------------------------------------

      if (body.clientStatus !== undefined) {
        const allowedClientStatuses = [
          "available",
          "refusal",
          "sick",
          "not_available",
          "deceased",
        ];

        if (
          body.clientStatus !== null &&
          !allowedClientStatuses.includes(body.clientStatus)
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid clientStatus.",
            },
            {
              status: 400,
            },
          );
        }

        zerodose.clientStatus = body.clientStatus;
      }

      // ------------------------------------------------------
      // Visit Date
      // ------------------------------------------------------

      if (body.visitDate !== undefined) {
        if (body.visitDate === null) {
          zerodose.visitDate = null;
        } else {
          const visitDate = new Date(body.visitDate);

          if (Number.isNaN(visitDate.getTime())) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid visitDate.",
              },
              {
                status: 400,
              },
            );
          }

          zerodose.visitDate = visitDate;
        }
      }

      // ------------------------------------------------------
      // Covered Date
      // ------------------------------------------------------

      if (body.coveredDate !== undefined) {
        if (body.coveredDate === null) {
          zerodose.coveredDate = null;
        } else {
          const coveredDate = new Date(body.coveredDate);

          if (Number.isNaN(coveredDate.getTime())) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid coveredDate.",
              },
              {
                status: 400,
              },
            );
          }

          zerodose.coveredDate = coveredDate;
        }
      }

      // ------------------------------------------------------
      // Save
      // ------------------------------------------------------

      await zerodose.save();

      const populated = await getZerodose(id);

      return NextResponse.json(
        {
          success: true,
          message: "Zerodose status updated successfully.",
          data: populated,
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // UCMO
    // ========================================================
    //
    // UCMO is responsible for approving/rejecting DELETE.
    //
    // ========================================================

    if (user.designation === "ucmo") {
      // ------------------------------------------------------
      // UCMO Scope
      // ------------------------------------------------------

      if (!objectIdEquals(user._id, zerodose.ucmo)) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to manage this Zerodose.",
          },
          {
            status: 403,
          },
        );
      }

      const action = body.action;

      if (!["approveDelete", "rejectDelete"].includes(action)) {
        return NextResponse.json(
          {
            success: false,
            message: "UCMO action must be approveDelete or rejectDelete.",
          },
          {
            status: 400,
          },
        );
      }

      // ------------------------------------------------------
      // Check Delete Request
      // ------------------------------------------------------

      if (!zerodose.deleteRequested) {
        return NextResponse.json(
          {
            success: false,
            message: "No pending delete request found.",
          },
          {
            status: 400,
          },
        );
      }

      // ======================================================
      // REJECT DELETE
      // ======================================================

      if (action === "rejectDelete") {
        zerodose.deleteRequested = false;

        zerodose.deleteRequestedBy = null;

        zerodose.deleteRequestedAt = null;

        zerodose.deleteApproved = false;

        zerodose.deleteApprovedBy = user._id;

        zerodose.deleteApprovedAt = new Date();

        await zerodose.save();

        const populated = await getZerodose(id);

        return NextResponse.json(
          {
            success: true,
            message: "Delete request rejected.",
            data: populated,
          },
          {
            status: 200,
          },
        );
      }

      // ======================================================
      // APPROVE DELETE
      // ======================================================

      const deletedZerodose = await Zerodose.findByIdAndDelete(id);

      if (!deletedZerodose) {
        return NextResponse.json(
          {
            success: false,
            message: "Zerodose not found.",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Delete request approved. Zerodose deleted successfully.",
          data: {
            _id: deletedZerodose._id,
          },
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // ADMIN
    // ========================================================
    //
    // Admin is not allowed to use this PATCH workflow.
    // Keep admin operations separate if required.
    //
    // ========================================================

    return NextResponse.json(
      {
        success: false,
        message: "You do not have permission to perform this action.",
      },
      {
        status: 403,
      },
    );
  } catch (error) {
    console.error("Patch Zerodose error:", error);

    // ========================================================
    // Mongoose Validation Error
    // ========================================================

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Cast Error
    // ========================================================

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data provided.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process Zerodose update.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DELETE
// ============================================================
//
// DELETE /api/zerodose/:id
//
// ONLY SUPERVISOR can request deletion.
//
// Actual deletion does NOT happen here.
//
// Supervisor:
//     DELETE
//       ↓
// deleteRequested = true
//       ↓
// UCMO approval required
//
// UCMO approves through PATCH:
//
// {
//   "action": "approveDelete"
// }
//
// ============================================================

export async function DELETE(request, { params }) {
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
    // ONLY SUPERVISOR
    // ========================================================

    if (user.designation !== "supervisor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only supervisors can request Zerodose deletion.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // Zerodose ID
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
    // Find Zerodose
    // ========================================================

    const zerodose = await Zerodose.findById(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // Supervisor Scope
    // ========================================================

    if (!objectIdEquals(user._id, zerodose.supervisor)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to delete this Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // Already Pending
    // ========================================================

    if (zerodose.deleteRequested) {
      return NextResponse.json(
        {
          success: false,
          message: "A delete request is already pending UCMO approval.",
        },
        {
          status: 409,
        },
      );
    }

    // ========================================================
    // Create Delete Request
    // ========================================================

    zerodose.deleteRequested = true;

    zerodose.deleteRequestedBy = user._id;

    zerodose.deleteRequestedAt = new Date();

    zerodose.deleteApproved = false;

    zerodose.deleteApprovedBy = null;

    zerodose.deleteApprovedAt = null;

    await zerodose.save();

    // ========================================================
    // Populate Response
    // ========================================================

    const populated = await getZerodose(id);

    // ========================================================
    // Response
    // ========================================================

    return NextResponse.json(
      {
        success: true,
        message: "Delete request submitted. UCMO approval is required.",
        data: populated,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Delete Zerodose error:", error);

    // ========================================================
    // Mongoose Validation Error
    // ========================================================

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Cast Error
    // ========================================================

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data provided.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit delete request.",
      },
      {
        status: 500,
      },
    );
  }
}
