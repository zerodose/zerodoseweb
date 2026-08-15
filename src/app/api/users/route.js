import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";

import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/auth/generateVerificationCode";

import { sendVerificationEmail } from "@/lib/mail/sendVerificationEmail";

import {
  setPendingRegistration,
  deletePendingRegistration,
} from "@/lib/pendingRegistrations";

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
      designation,
      supervisorCode,
      supervisor,
      teamNumber,
      password,
      isActive,
    } = body;

    // ============================================================
    // Normalize Data
    // ============================================================

    const normalizedName = name?.trim();

    const normalizedEmail = email?.trim().toLowerCase() || null;

    const normalizedContactNumber = contactNumber?.trim();

    const normalizedSupervisorCode = supervisorCode?.trim() || null;

    // ============================================================
    // Duplicate Email Check
    //
    // User collection mein email already exist karta hai ya nahi.
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
    // Worker Supervisor Check
    //
    // Worker ke liye supervisor User collection se verify hoga.
    // ============================================================

    if (designation === "worker") {
      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid supervisor ID.",
          },
          { status: 400 },
        );
      }

      const supervisorDoc = await User.findOne({
        _id: supervisor,
        designation: "supervisor",
        isActive: true,
      })
        .select("_id")
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
    }

    // ============================================================
    // Hash Password
    // ============================================================

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // ============================================================
    // WORKER
    //
    // Worker email verification ke baghair
    // direct User collection mein create hoga.
    // ============================================================

    if (designation === "worker") {
      const user = await User.create({
        name: normalizedName,

        email: undefined,

        emailVerified: true,

        emailVerificationCode: null,

        emailVerificationExpires: null,

        contactNumber: normalizedContactNumber,

        // ObjectId
        district,

        // ObjectId
        town,

        // ObjectId
        unionCouncil,

        designation,

        supervisor,

        supervisorCode: null,

        teamNumber: Number(teamNumber),

        password: hashedPassword,

        isActive: typeof isActive === "boolean" ? isActive : true,
      });

      // ==========================================================
      // Get Created Worker
      // ==========================================================

      const createdUser = await User.findById(user._id)
        .select("-password -emailVerificationCode -emailVerificationExpires")
        .populate("district", "_id name code")
        .populate("town", "_id name code")
        .populate("unionCouncil", "_id name code")
        .populate("supervisor", "_id name contactNumber")
        .lean();

      return NextResponse.json(
        {
          success: true,

          message: "Worker account created successfully.",

          data: createdUser,
        },
        { status: 201 },
      );
    }

    // ============================================================
    // NON-WORKER
    //
    // IMPORTANT:
    //
    // Yahan User.create() nahi hoga.
    //
    // Pehle temporary registration save hogi.
    // Phir OTP email jayegi.
    // OTP verify hone ke baad /api/auth/verify-email
    // User.create() karega.
    // ============================================================

    // ============================================================
    // Generate Verification Code
    // ============================================================

    const verificationCode = generateVerificationCode();

    // ============================================================
    // Hash Verification Code
    // ============================================================

    const hashedVerificationCode = hashVerificationCode(verificationCode);

    // ============================================================
    // Verification Expiry
    //
    // OTP 10 minutes valid hai.
    // ============================================================

    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    // ============================================================
    // Temporary Registration Data
    //
    // District, Town aur Union Council ki IDs
    // yahan directly save hongi.
    // ============================================================

    const pendingData = {
      name: normalizedName,

      email: normalizedEmail,

      contactNumber: normalizedContactNumber,

      // ObjectId
      district,

      // ObjectId
      town,

      // ObjectId
      unionCouncil,

      designation,

      supervisorCode:
        designation === "supervisor" ? normalizedSupervisorCode : null,

      supervisor: null,

      teamNumber: null,

      password: hashedPassword,

      isActive: typeof isActive === "boolean" ? isActive : true,

      emailVerificationCode: hashedVerificationCode,

      emailVerificationExpires: verificationExpires,

      createdAt: Date.now(),
    };

    // ============================================================
    // Store Pending Registration
    //
    // User abhi MongoDB User collection mein nahi jayega.
    // ============================================================

    setPendingRegistration(normalizedEmail, pendingData);

    // ============================================================
    // Send Verification Email
    //
    // Backend se email jayegi.
    // ============================================================

    try {
      await sendVerificationEmail({
        email: normalizedEmail,
        name: normalizedName,
        code: verificationCode,
      });
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      // Email send fail ho gayi,
      // temporary registration remove kar dein.

      deletePendingRegistration(normalizedEmail);

      setPendingRegistration(normalizedEmail, pendingData);

      return NextResponse.json(
        {
          success: false,
          message: "Verification email could not be sent. Please try again.",
        },
        { status: 500 },
      );
    }

    // ============================================================
    // SUCCESS
    //
    // User abhi User collection mein create nahi hua.
    //
    // Frontend is response ke baad
    // VerifyEmailModal open karega.
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        message: "Verification code has been sent to your email.",

        data: {
          email: normalizedEmail,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

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
        message: error?.message || "Failed to create user.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const designation = searchParams.get("designation")?.trim() || "";
    const district = searchParams.get("district")?.trim() || "";
    const town = searchParams.get("town")?.trim() || "";
    const unionCouncil = searchParams.get("unionCouncil")?.trim() || "";
    const isActiveParam = searchParams.get("isActive");

    const filter = {};

    // -------------------------------------------------
    // Designation filter
    // -------------------------------------------------

    if (designation) {
      filter.designation = designation;
    }

    // -------------------------------------------------
    // District filter
    // -------------------------------------------------

    if (district) {
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid district ID",
          },
          { status: 400 },
        );
      }

      filter.district = district;
    }

    // -------------------------------------------------
    // Town filter
    // -------------------------------------------------

    if (town) {
      if (!mongoose.Types.ObjectId.isValid(town)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid town ID",
          },
          { status: 400 },
        );
      }

      filter.town = town;
    }

    // -------------------------------------------------
    // Union Council filter
    // -------------------------------------------------

    if (unionCouncil) {
      if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Union Council ID",
          },
          { status: 400 },
        );
      }

      filter.unionCouncil = unionCouncil;
    }

    // -------------------------------------------------
    // Active filter
    // -------------------------------------------------

    if (isActiveParam !== null && isActiveParam !== "") {
      if (isActiveParam === "true") {
        filter.isActive = true;
      }

      if (isActiveParam === "false") {
        filter.isActive = false;
      }
    }

    // -------------------------------------------------
    // Fetch users
    // -------------------------------------------------

    const users = await User.find(filter)
      .select("-password")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .populate("ucmo", "_id name contactNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        data: users,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}
