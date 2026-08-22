import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
import PendingZerodose from "@/models/PendingZerodose";
import User from "@/models/User";

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pending request ID.",
        },
        { status: 400 },
      );
    }

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

    // ============================================================
    // Verify supervisor
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
    // Find pending request
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
          message: "Pending update request not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Find actual Zerodose
    // ============================================================

    const zerodose = await Zerodose.findById(pending.zerodose);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Original Zerodose not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Apply NEW data
    // ============================================================

    const newData = pending.newData;

    zerodose.childName = newData.childName;
    zerodose.fatherName = newData.fatherName;
    zerodose.age = newData.age;
    zerodose.address = newData.address;
    zerodose.contactNo = newData.contactNo;

    if (newData.location) {
      zerodose.location = {
        latitude: newData.location.latitude,
        longitude: newData.location.longitude,
      };
    }

    await zerodose.save();

    // ============================================================
    // Mark approved
    // ============================================================

    pending.status = "approved";
    pending.approvedBy = supervisorId;
    pending.approvedAt = new Date();

    await pending.save();

    // ============================================================
    // Delete temporary record
    // ============================================================

    await PendingZerodose.deleteOne({
      _id: pending._id,
    });

    return NextResponse.json({
      success: true,
      message: "Zerodose update approved successfully.",
    });
  } catch (error) {
    console.error("Approve Zerodose update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to approve update.",
      },
      { status: 500 },
    );
  }
}
