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

    // ============================================================
    // Validate Zerodose ID
    // ============================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Get logged-in worker
    //
    // Current application stores authUser in localStorage.
    // Therefore workerId should be sent from frontend.
    //
    // IMPORTANT:
    // If your backend later has JWT/session authentication,
    // replace this with server-side authenticated user.
    // ============================================================

    const body = await request.json();

    const workerId = body?.workerId;

    if (!workerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker ID is required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid worker ID.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Find worker
    // ============================================================

    const worker = await User.findOne({
      _id: workerId,
      designation: "worker",
      isActive: true,
    }).lean();

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          message: "Active worker not found.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Find Zerodose
    // ============================================================

    const zerodose = await Zerodose.findById(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Worker can only update his own Zerodose
    // ============================================================

    if (String(zerodose.user) !== String(workerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to update this Zerodose.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Supervisor must exist
    // ============================================================

    if (!zerodose.supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "This Zerodose has no supervisor assigned.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Get requested values
    // ============================================================

    const requestedData = {
      childName:
        typeof body.childName === "string"
          ? body.childName.trim()
          : zerodose.childName,

      fatherName:
        typeof body.fatherName === "string"
          ? body.fatherName.trim()
          : zerodose.fatherName,

      age:
        body.age !== undefined && body.age !== null
          ? Number(body.age)
          : zerodose.age,

      address:
        typeof body.address === "string"
          ? body.address.trim()
          : zerodose.address,

      contactNo:
        body.contactNo !== undefined
          ? body.contactNo || null
          : zerodose.contactNo,

      location:
        body.location &&
        body.location.latitude !== undefined &&
        body.location.longitude !== undefined
          ? {
              latitude: Number(body.location.latitude),
              longitude: Number(body.location.longitude),
            }
          : {
              latitude: zerodose.location?.latitude ?? null,
              longitude: zerodose.location?.longitude ?? null,
            },
    };

    // ============================================================
    // Validation
    // ============================================================

    if (!requestedData.childName) {
      return NextResponse.json(
        {
          success: false,
          message: "Child name is required.",
        },
        { status: 400 },
      );
    }

    if (!requestedData.fatherName) {
      return NextResponse.json(
        {
          success: false,
          message: "Father name is required.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(requestedData.age) ||
      requestedData.age < 0 ||
      requestedData.age > 59
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Age must be between 0 and 59.",
        },
        { status: 400 },
      );
    }

    if (!requestedData.address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is required.",
        },
        { status: 400 },
      );
    }

    if (
      requestedData.contactNo &&
      !/^03\d{9}$/.test(requestedData.contactNo)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Pakistani mobile number.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Compare OLD vs NEW
    // ============================================================

    const changedFields = [];

    if (zerodose.childName !== requestedData.childName) {
      changedFields.push("childName");
    }

    if (zerodose.fatherName !== requestedData.fatherName) {
      changedFields.push("fatherName");
    }

    if (Number(zerodose.age) !== Number(requestedData.age)) {
      changedFields.push("age");
    }

    if (zerodose.address !== requestedData.address) {
      changedFields.push("address");
    }

    if ((zerodose.contactNo || null) !== requestedData.contactNo) {
      changedFields.push("contactNo");
    }

    const oldLatitude = zerodose.location?.latitude ?? null;
    const oldLongitude = zerodose.location?.longitude ?? null;

    const newLatitude = requestedData.location?.latitude ?? null;
    const newLongitude = requestedData.location?.longitude ?? null;

    if (
      Number(oldLatitude) !== Number(newLatitude) ||
      Number(oldLongitude) !== Number(newLongitude)
    ) {
      changedFields.push("location");
    }

    // ============================================================
    // Nothing changed
    // ============================================================

    if (changedFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No changes were made.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Check existing pending request
    // ============================================================

    const existingPending = await PendingZerodose.findOne({
      zerodose: zerodose._id,
      status: "pending",
    });

    // ============================================================
    // If pending request already exists
    //
    // Replace it with latest worker changes.
    // ============================================================

    if (existingPending) {
      existingPending.requestedBy = workerId;
      existingPending.supervisor = zerodose.supervisor;

      existingPending.oldData = {
        childName: zerodose.childName,
        fatherName: zerodose.fatherName,
        age: zerodose.age,
        address: zerodose.address,
        contactNo: zerodose.contactNo,
        location: {
          latitude: zerodose.location?.latitude ?? null,
          longitude: zerodose.location?.longitude ?? null,
        },
      };

      existingPending.newData = requestedData;
      existingPending.changedFields = changedFields;
      existingPending.status = "pending";

      existingPending.approvedBy = null;
      existingPending.approvedAt = null;
      existingPending.rejectedBy = null;
      existingPending.rejectedAt = null;
      existingPending.rejectionReason = null;

      await existingPending.save();

      return NextResponse.json({
        success: true,
        message: "Update request submitted for supervisor approval.",
        data: existingPending,
      });
    }

    // ============================================================
    // Create NEW pending request
    // ============================================================

    const pending = await PendingZerodose.create({
      zerodose: zerodose._id,

      requestedBy: workerId,

      supervisor: zerodose.supervisor,

      oldData: {
        childName: zerodose.childName,
        fatherName: zerodose.fatherName,
        age: zerodose.age,
        address: zerodose.address,
        contactNo: zerodose.contactNo,
        location: {
          latitude: zerodose.location?.latitude ?? null,
          longitude: zerodose.location?.longitude ?? null,
        },
      },

      newData: requestedData,

      changedFields,

      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Update request submitted for supervisor approval.",
        data: pending,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Pending Zerodose update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to submit update request.",
      },
      { status: 500 },
    );
  }
}