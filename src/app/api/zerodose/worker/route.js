import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import PendingZerodose from "@/models/PendingZerodose";
import Zerodose from "@/models/Zerodose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const workerId = body?.workerId;
    const zerodoseId = body?.zerodoseId;

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

    if (!zerodoseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose ID is required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(zerodoseId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        { status: 400 },
      );
    }

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

    const zerodose = await Zerodose.findById(zerodoseId);

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
    // LOCK ZERODOSE AFTER COVERED
    // ============================================================

    if (zerodose.vaccinationStatus === "covered") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Zerodose is locked. Changes cannot be made after it is covered.",
        },
        { status: 400 },
      );
    }

    if (String(zerodose.user) !== String(workerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to update this Zerodose.",
        },
        { status: 403 },
      );
    }

    if (!zerodose.supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "This Zerodose has no supervisor assigned.",
        },
        { status: 400 },
      );
    }

    const supervisor = await User.findOne({
      _id: zerodose.supervisor,
      designation: "supervisor",
      isActive: true,
    }).lean();

    if (!supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Active supervisor not found.",
        },
        { status: 400 },
      );
    }

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

      houseNumber:
        body.houseNumber !== undefined && body.houseNumber !== null
          ? Number(body.houseNumber)
          : zerodose.houseNumber,

      gender:
        body.gender !== undefined && body.gender !== null
          ? body.gender
          : zerodose.gender,

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

    if (requestedData.contactNo && !/^03\d{9}$/.test(requestedData.contactNo)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Pakistani mobile number.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(requestedData.houseNumber) ||
      requestedData.houseNumber < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "House number must be a valid number.",
        },
        { status: 400 },
      );
    }

    if (!["male", "female"].includes(requestedData.gender)) {
      return NextResponse.json(
        {
          success: false,
          message: "Gender must be male or female.",
        },
        { status: 400 },
      );
    }

    if (
      requestedData.location.latitude === null ||
      requestedData.location.longitude === null ||
      !Number.isFinite(requestedData.location.latitude) ||
      !Number.isFinite(requestedData.location.longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid latitude and longitude are required.",
        },
        { status: 400 },
      );
    }

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

    if (Number(zerodose.houseNumber) !== Number(requestedData.houseNumber)) {
      changedFields.push("houseNumber");
    }

    if (zerodose.gender !== requestedData.gender) {
      changedFields.push("gender");
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

    if (changedFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No changes were made.",
        },
        { status: 400 },
      );
    }

    const existingPending = await PendingZerodose.findOne({
      zerodose: zerodose._id,
      status: "pending",
    });

    if (existingPending) {
      existingPending.requestedBy = workerId;
      existingPending.supervisor = zerodose.supervisor;

      existingPending.oldData = {
        childName: zerodose.childName,
        fatherName: zerodose.fatherName,
        age: zerodose.age,
        address: zerodose.address,
        contactNo: zerodose.contactNo,
        houseNumber: zerodose.houseNumber,
        gender: zerodose.gender,
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
        houseNumber: zerodose.houseNumber,
        gender: zerodose.gender,
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
    console.error("Pending Zerodose worker update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to submit update request.",
      },
      { status: 500 },
    );
  }
}
