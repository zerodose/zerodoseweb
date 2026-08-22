import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import PendingZerodose from "@/models/PendingZerodose";
import User from "@/models/User";

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    // ============================================================
    // Get Pending Request ID
    // ============================================================

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pending update request ID.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Request Body
    // ============================================================

    const body = await request.json();

    const supervisorId = body?.supervisorId;

    if (!supervisorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor ID is required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid supervisor ID.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Verify Supervisor
    // ============================================================

    const supervisor = await User.findOne({
      _id: supervisorId,
      designation: "supervisor",
      isActive: true,
    }).lean();

    if (!supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Active supervisor not found.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Find Pending Request
    //
    // Only the supervisor assigned to this request can reject it.
    // ============================================================

    const pending = await PendingZerodose.findOne({
      _id: id,
      status: "pending",
      supervisor: supervisorId,
    });

    if (!pending) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pending update request not found or it does not belong to this supervisor.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Optional Rejection Reason
    // ============================================================

    const rejectionReason =
      typeof body?.rejectionReason === "string"
        ? body.rejectionReason.trim()
        : "";

    // ============================================================
    // Delete Temporary Request
    //
    // IMPORTANT:
    // Actual Zerodose is NOT updated.
    // ============================================================

    await PendingZerodose.deleteOne({
      _id: pending._id,
    });

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json({
      success: true,
      message: "Zerodose update request rejected successfully.",
      data: {
        zerodoseId: pending.zerodose,
        rejectedBy: supervisorId,
        rejectionReason: rejectionReason || null,
      },
    });
  } catch (error) {
    console.error("Reject Zerodose update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to reject Zerodose update request.",
      },
      { status: 500 },
    );
  }
}
