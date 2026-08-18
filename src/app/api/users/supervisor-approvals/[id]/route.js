import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // ------------------------------------------------------------
    // VALIDATE USER ID
    // ------------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid supervisor ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { approvalStatus } = body;

    // ------------------------------------------------------------
    // VALIDATE APPROVAL STATUS
    // ------------------------------------------------------------

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid approval status.",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------
    // FIND PENDING SUPERVISOR
    // ------------------------------------------------------------

    const supervisor = await User.findOne({
      _id: id,
      designation: "supervisor",
      approvalStatus: "pending",
    });

    if (!supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending supervisor approval not found.",
        },
        { status: 404 },
      );
    }

    // ------------------------------------------------------------
    // UPDATE APPROVAL
    // ------------------------------------------------------------

    supervisor.approvalStatus = approvalStatus;

    if (approvalStatus === "approved") {
      supervisor.isActive = true;
    }

    if (approvalStatus === "rejected") {
      supervisor.isActive = false;
    }

    await supervisor.save();

    // ------------------------------------------------------------
    // RESPONSE
    // ------------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          approvalStatus === "approved"
            ? "Supervisor approved successfully."
            : "Supervisor rejected successfully.",
        data: {
          id: supervisor._id,
          approvalStatus: supervisor.approvalStatus,
          isActive: supervisor.isActive,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Supervisor approval PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update supervisor approval.",
      },
      { status: 500 },
    );
  }
}
