import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      email,
      contactNumber,
      district,
      town,
      unionCouncil,
      supervisor,
      teamNumber,
      isActive,
    } = body;

    // ============================================================
    // Normalize Data
    // ============================================================

    const normalizedName = name?.trim();

    const normalizedEmail = email?.trim().toLowerCase() || null;

    const normalizedContactNumber = contactNumber?.trim();

    // ============================================================
    // Required Fields
    // ============================================================

    if (!normalizedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker name is required.",
        },
        { status: 400 },
      );
    }

    if (!normalizedContactNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact number is required.",
        },
        { status: 400 },
      );
    }

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required.",
        },
        { status: 400 },
      );
    }

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town is required.",
        },
        { status: 400 },
      );
    }

    if (!unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is required.",
        },
        { status: 400 },
      );
    }

    if (!supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor is required.",
        },
        { status: 400 },
      );
    }

    if (teamNumber === undefined || teamNumber === null || teamNumber === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Team number is required.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Validate ObjectIds
    // ============================================================

    const objectIdFields = [
      {
        value: district,
        name: "district",
      },
      {
        value: town,
        name: "town",
      },
      {
        value: unionCouncil,
        name: "unionCouncil",
      },
      {
        value: supervisor,
        name: "supervisor",
      },
    ];

    for (const field of objectIdFields) {
      if (!mongoose.Types.ObjectId.isValid(field.value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field.name} ID.`,
          },
          { status: 400 },
        );
      }
    }

    // ============================================================
    // Validate Supervisor
    // ============================================================

    const supervisorDoc = await User.findOne({
      _id: supervisor,
      designation: "supervisor",
      isActive: true,
    })
      .select("_id name district town unionCouncil")
      .lean();

    if (!supervisorDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid active supervisor not found.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Make Sure Worker Belongs To Supervisor's Area
    // ============================================================

    if (supervisorDoc.district.toString() !== district.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker district does not match supervisor district.",
        },
        { status: 400 },
      );
    }

    if (supervisorDoc.town.toString() !== town.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker town does not match supervisor town.",
        },
        { status: 400 },
      );
    }

    if (supervisorDoc.unionCouncil.toString() !== unionCouncil.toString()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Worker Union Council does not match supervisor Union Council.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Validate Team Number
    // ============================================================

    const parsedTeamNumber = Number(teamNumber);

    if (!Number.isInteger(parsedTeamNumber) || parsedTeamNumber <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Team number must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Duplicate Contact Number
    // ============================================================

    const existingContact = await User.findOne({
      contactNumber: normalizedContactNumber,
    })
      .select("_id")
      .lean();

    if (existingContact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact number already exists.",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // Duplicate Email
    // Email is OPTIONAL for worker
    // ============================================================

    if (normalizedEmail) {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
      })
        .select("_id")
        .lean();

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists.",
          },
          { status: 409 },
        );
      }
    }

    // ============================================================
    // Create Worker
    // ============================================================

    const worker = await User.create({
      name: normalizedName,

      // Worker email optional hai.
      email: normalizedEmail || undefined,

      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,

      contactNumber: normalizedContactNumber,

      district,
      town,
      unionCouncil,

      designation: "worker",

      supervisor,

      supervisorCode: null,

      teamNumber: parsedTeamNumber,

      // Worker ke liye password required nahi hai.
      password: undefined,

      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    // ============================================================
    // Return Created Worker
    // ============================================================

    const createdWorker = await User.findById(worker._id)
      .select("-password -emailVerificationCode -emailVerificationExpires")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Worker added successfully.",
        data: createdWorker,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Supervisor add worker error:", error);

    // ============================================================
    // Duplicate Key
    // ============================================================

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return NextResponse.json(
        {
          success: false,
          message: `${duplicateField || "Field"} already exists.`,
        },
        { status: 409 },
      );
    }

    // ============================================================
    // Mongoose Validation Error
    // ============================================================

    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map(
        (item) => item.message,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            messages.length > 0 ? messages.join(", ") : "Validation failed.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // General Error
    // ============================================================

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to add worker.",
      },
      { status: 500 },
    );
  }
}
