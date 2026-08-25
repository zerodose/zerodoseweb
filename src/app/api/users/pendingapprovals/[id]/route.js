import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

// ============================================================
// Approval Hierarchy
// ============================================================

const APPROVAL_HIERARCHY = {
  districtfp: ["admin"],
  townfp: ["districtfp"],
  ucmo: ["townfp"],
  supervisor: ["ucmo"],
  vaccinator: ["ucmo"],
  otherstaff: ["ucmo"],
};

// ============================================================
// GET - Get Pending Approval User
// ============================================================

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // ============================================================
    // Validate ID
    // ============================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Get Pending User
    // ============================================================

    const user = await User.findOne({
      _id: id,
      approvalStatus: "pending",
      isActive: false,
    })
      .select("-password -emailVerificationCode -emailVerificationExpires")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .populate("approvedBy", "_id name designation")
      .lean();

    // ============================================================
    // Not Found
    // ============================================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending approval not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get pending user approval error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load pending approval.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PUT - Approve / Reject Pending User
// ============================================================

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // ============================================================
    // Validate User ID
    // ============================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Request Body
    // ============================================================

    const body = await request.json();

    const { approvalStatus, approverId } = body;

    // ============================================================
    // Validate Approval Status
    // ============================================================

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid approval status.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Validate Approver ID
    // ============================================================

    if (!approverId || !mongoose.Types.ObjectId.isValid(approverId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid approver ID.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Get Approver
    // ============================================================

    const approver = await User.findOne({
      _id: approverId,
      isActive: true,
    })
      .select("_id name designation district town unionCouncil")
      .lean();

    if (!approver) {
      return NextResponse.json(
        {
          success: false,
          message: "Active approver not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // Get Pending User
    // ============================================================

    const user = await User.findOne({
      _id: id,
      approvalStatus: "pending",
      isActive: false,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending approval not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // Get Required Approver
    // ============================================================

    const requiredApprovers = APPROVAL_HIERARCHY[user.designation];

    if (!requiredApprovers) {
      return NextResponse.json(
        {
          success: false,
          message: `${user.designation} does not require approval.`,
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Check Approver Designation
    // ============================================================

    if (!requiredApprovers.includes(approver.designation)) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${requiredApprovers.join(
            " or ",
          )} can approve this account.`,
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // Scope Validation
    // ============================================================

    // ------------------------------------------------------------
    // districtfp → approves TownFP from same district
    // ------------------------------------------------------------

    if (user.designation === "townfp") {
      if (
        !approver.district ||
        !user.district ||
        String(approver.district) !== String(user.district)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "You can only approve TownFP requests from your district.",
          },
          {
            status: 403,
          },
        );
      }
    }

    // ------------------------------------------------------------
    // TownFP → approves UCMO from same town
    // ------------------------------------------------------------

    if (user.designation === "ucmo") {
      if (
        !approver.town ||
        !user.town ||
        String(approver.town) !== String(user.town)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "You can only approve UCMO requests from your town.",
          },
          {
            status: 403,
          },
        );
      }
    }

    // ------------------------------------------------------------
    // UCMO → approves Supervisor/Vaccinator/OtherStaff
    //
    // Supervisor:
    // Only the specifically assigned UCMO can approve.
    //
    // Vaccinator:
    // Any UCMO can approve.
    //
    // OtherStaff:
    // Any UCMO can approve.
    // ------------------------------------------------------------

    if (user.designation === "supervisor") {
      if (!user.ucmo || String(user.ucmo) !== String(approver._id)) {
        return NextResponse.json(
          {
            success: false,
            message: "You can only approve supervisors assigned to your UCMO.",
          },
          { status: 403 },
        );
      }
    }

    // ============================================================
    // Handle Approval
    // ============================================================

    if (approvalStatus === "rejected") {
      // Permanently delete rejected user from database
      await user.deleteOne();

      return NextResponse.json(
        {
          success: true,
          message: `${user.designation} rejected and deleted successfully.`,
          data: {
            id: user._id,
            designation: user.designation,
            approvalStatus: "rejected",
          },
        },
        {
          status: 200,
        },
      );
    }

    // ============================================================
    // Approve User
    // ============================================================

    user.approvalStatus = "approved";
    user.approvedBy = approver._id;
    user.approvedAt = new Date();
    user.isActive = true;

    await user.save();

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: `${user.designation} approved successfully.`,
        data: {
          id: user._id,
          designation: user.designation,
          approvalStatus: user.approvalStatus,
          approvedBy: user.approvedBy,
          approvedAt: user.approvedAt,
          isActive: user.isActive,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Pending user approval PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update pending user approval.",
      },
      {
        status: 500,
      },
    );
  }
}
