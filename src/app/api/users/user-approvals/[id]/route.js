import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

const APPROVAL_HIERARCHY = {
  ucmo: "townFP",
  supervisor: "ucmo",
  vaccinator: "ucmo",
  otherStaff: "townFP",
  townFP: "districtFP",
  districtFP: "admin",
};

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { approvalStatus, approverId } = body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid approval status.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(approverId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid approver ID.",
        },
        { status: 400 },
      );
    }

    const approver = await User.findOne({
      _id: approverId,
      isActive: true,
    })
      .select("_id designation")
      .lean();

    if (!approver) {
      return NextResponse.json(
        {
          success: false,
          message: "Active approver not found.",
        },
        { status: 404 },
      );
    }

    const user = await User.findOne({
      _id: id,
      approvalStatus: "pending",
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending approval not found.",
        },
        { status: 404 },
      );
    }

    const requiredApprover = APPROVAL_HIERARCHY[user.designation];

    if (!requiredApprover) {
      return NextResponse.json(
        {
          success: false,
          message: `${user.designation} does not require approval.`,
        },
        { status: 400 },
      );
    }

    if (approver.designation !== requiredApprover) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${requiredApprover} can approve this account.`,
        },
        { status: 403 },
      );
    }

    user.approvalStatus = approvalStatus;

    user.approvedBy = approver._id;
    user.approvedAt = new Date();

    if (approvalStatus === "approved") {
      user.isActive = true;
    }

    if (approvalStatus === "rejected") {
      user.isActive = false;
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,

        message:
          approvalStatus === "approved"
            ? `${user.designation} approved successfully.`
            : `${user.designation} rejected successfully.`,

        data: {
          id: user._id,
          designation: user.designation,
          approvalStatus: user.approvalStatus,
          approvedBy: user.approvedBy,
          approvedAt: user.approvedAt,
          isActive: user.isActive,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Approval PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update approval.",
      },
      { status: 500 },
    );
  }
}
