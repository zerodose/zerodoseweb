import { NextResponse } from "next/server"; import mongoose from "mongoose"; import bcrypt from "bcryptjs"; import { connectDB } from "@/lib/db"; import User from "@/models/User"; import District from "@/models/District"; import Town from "@/models/Town"; import UnionCouncil from "@/models/UnionCouncil"; import { sendVerificationEmail } from "@/lib/mail/sendVerificationEmail"; import { generateVerificationCode, hashVerificationCode, } from "@/lib/auth/generateVerificationCode";
// =====================================================
// GET ALL USERS
// GET /api/users
// =====================================================

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

// =====================================================
// CREATE USER
// POST /api/users
// =====================================================

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

    // =================================================
    // Required fields
    // =================================================

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required",
        },
        { status: 400 },
      );
    }

    if (!contactNumber?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact number is required",
        },
        { status: 400 },
      );
    }

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required",
        },
        { status: 400 },
      );
    }

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town is required",
        },
        { status: 400 },
      );
    }

    if (!unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is required",
        },
        { status: 400 },
      );
    }

    if (!designation) {
      return NextResponse.json(
        {
          success: false,
          message: "Designation is required",
        },
        { status: 400 },
      );
    }

    // =================================================
    // Validate ObjectIds
    // =================================================

    if (!mongoose.Types.ObjectId.isValid(district)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(town)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council ID",
        },
        { status: 400 },
      );
    }

    // =================================================
    // Validate location hierarchy
    // District -> Town -> Union Council
    // =================================================

    const districtDoc = await District.findOne({
      _id: district,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!districtDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found or inactive",
        },
        { status: 404 },
      );
    }

    const townDoc = await Town.findOne({
      _id: town,
      district: district,
      isActive: true,
    })
      .select("_id district")
      .lean();

    if (!townDoc) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Town does not belong to selected district or is inactive",
        },
        { status: 400 },
      );
    }

    const unionCouncilDoc = await UnionCouncil.findOne({
      _id: unionCouncil,
      town: town,
      isActive: true,
    })
      .select("_id town district")
      .lean();

    if (!unionCouncilDoc) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Union Council does not belong to selected town or is inactive",
        },
        { status: 400 },
      );
    }

    // =================================================
    // Email validation
    // =================================================

    const normalizedEmail = email?.trim().toLowerCase() || null;

    if (designation !== "worker" && !normalizedEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 },
      );
    }

    // =================================================
    // Password validation
    // =================================================

    if (designation !== "worker") {
      if (!password) {
        return NextResponse.json(
          {
            success: false,
            message: "Password is required",
          },
          { status: 400 },
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 8 characters",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Supervisor validation
    // =================================================

    if (designation === "supervisor") {
      if (!supervisorCode?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Supervisor code is required",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Worker validation
    // =================================================

    if (designation === "worker") {
      if (!supervisor) {
        return NextResponse.json(
          {
            success: false,
            message: "Supervisor is required for workers",
          },
          { status: 400 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid supervisor ID",
          },
          { status: 400 },
        );
      }

      if (
        teamNumber === null ||
        teamNumber === undefined ||
        teamNumber === ""
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Team number is required for workers",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Check duplicate email
    // =================================================

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
            message: "Email already exists",
          },
          { status: 409 },
        );
      }
    }

    // =================================================
    // Check duplicate contact
    // =================================================

    const normalizedContactNumber = contactNumber.trim();

    const existingContact = await User.findOne({
      contactNumber: normalizedContactNumber,
    })
      .select("_id")
      .lean();

    if (existingContact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact number already exists",
        },
        { status: 409 },
      );
    }

    // =================================================
    // Validate supervisor
    // =================================================

    if (designation === "worker") {
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
            message: "Valid active supervisor not found",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Hash password
    // =================================================

    let hashedPassword;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // =================================================
    // Email Verification
    // =================================================

    let verificationCode = null;
    let hashedVerificationCode = null;
    let verificationExpires = null;

    if (normalizedEmail) {
      verificationCode = generateVerificationCode();

      hashedVerificationCode =
        hashVerificationCode(verificationCode);

      verificationExpires = new Date(
        Date.now() + 10 * 60 * 1000,
      );
    }

    // =================================================
    // Create user
    // =================================================

    const user = await User.create({
      name: name.trim(),

      email: normalizedEmail || undefined,

      emailVerified: normalizedEmail ? false : false,

      emailVerificationCode: hashedVerificationCode,

      emailVerificationExpires: verificationExpires,

      contactNumber: normalizedContactNumber,

      district,
      town,
      unionCouncil,

      designation,

      supervisorCode:
        designation === "supervisor"
          ? supervisorCode.trim().toUpperCase()
          : null,

      supervisor:
        designation === "worker"
          ? supervisor
          : null,

      teamNumber:
        designation === "worker"
          ? Number(teamNumber)
          : null,

      password: hashedPassword,

      isActive:
        typeof isActive === "boolean"
          ? isActive
          : true,
    });

    // =================================================
    // Send Verification Email
    // =================================================

    if (normalizedEmail && verificationCode) {
      try {
        await sendVerificationEmail({
          email: normalizedEmail,
          name: name.trim(),
          code: verificationCode,
        });
      } catch (emailError) {
        console.error(
          "Verification email error:",
          emailError,
        );

        // User create ho chuka hai, lekin email send nahi hui.
        // Verification code database mein available hai.
        return NextResponse.json(
          {
            success: false,
            message:
              "Account was created, but verification email could not be sent. Please request a new verification code.",
          },
          { status: 500 },
        );
      }
    }

    // =================================================
    // Response without password / verification fields
    // =================================================

    const createdUser = await User.findById(user._id)
      .select(
        "-password -emailVerificationCode -emailVerificationExpires",
      )
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .lean();

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,
        message: normalizedEmail
          ? "User created successfully. A verification code has been sent to your email."
          : "User created successfully.",
        data: createdUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

    // =================================================
    // Duplicate key
    // =================================================

    if (error?.code === 11000) {
      const duplicateField =
        Object.keys(error.keyPattern || {})[0];

      return NextResponse.json(
        {
          success: false,
          message: `${duplicateField || "Field"} already exists`,
        },
        { status: 409 },
      );
    }

    // =================================================
    // Mongoose validation error
    // =================================================

    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map(
        (item) => item.message,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            messages.length > 0
              ? messages.join(", ")
              : "Validation failed",
        },
        { status: 400 },
      );
    }

    // =================================================
    // General error
    // =================================================

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to create user",
      },
      { status: 500 },
    );
  }
}
