import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, contactNumber, teamNumber, workerRole } = body;

    // ============================================================
    // Authenticate Supervisor From JWT
    // ============================================================

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor authentication is required.",
        },
        { status: 401 },
      );
    }

    let payload;

    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication token.",
        },
        { status: 401 },
      );
    }

    const supervisor = payload.userId;
    const designation = payload.designation;

    if (!supervisor || !mongoose.Types.ObjectId.isValid(supervisor)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token.",
        },
        { status: 401 },
      );
    }

    if (designation !== "supervisor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only a supervisor can add workers.",
        },
        { status: 403 },
      );
    }

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
        { status: 404 },
      );
    }

    // ============================================================
    // Validate Supervisor Area
    // ============================================================

    if (!supervisorDoc.district) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor district is not assigned.",
        },
        { status: 400 },
      );
    }

    if (!supervisorDoc.town) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor town is not assigned.",
        },
        { status: 400 },
      );
    }

    if (!supervisorDoc.unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor Union Council is not assigned.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Get Active UCMO For Supervisor's Union Council
    // ============================================================

    const activeUcmo = await User.findOne({
      designation: "ucmo",
      unionCouncil: supervisorDoc.unionCouncil,
      isActive: true,
    })
      .select("_id name")
      .lean();

    if (!activeUcmo) {
      return NextResponse.json(
        {
          success: false,
          message: "No active UCMO found for this Union Council.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Normalize Data
    // ============================================================

    const normalizedName = name?.trim();

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

    if (teamNumber === undefined || teamNumber === null || teamNumber === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Team number is required.",
        },
        { status: 400 },
      );
    }

    if (!workerRole) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker role is required.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Validate Worker Role
    // ============================================================

    const allowedWorkerRoles = ["teamLeader", "teamMember"];

    if (!allowedWorkerRoles.includes(workerRole)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid worker role. Role must be teamLeader or teamMember.",
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
    // Validate Contact Number
    // ============================================================

    if (!/^03\d{9}$/.test(normalizedContactNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Pakistani mobile number.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Check Existing Team Workers
    // ============================================================

    const existingTeamWorkers = await User.find({
      unionCouncil: supervisorDoc.unionCouncil,
      teamNumber: parsedTeamNumber,
      designation: "worker",
      isActive: true,
    })
      .select("_id name workerRole teamNumber supervisor")
      .lean();

    // Same team number kisi doosre supervisor ko assigned nahi hona chahiye
    const existingOtherSupervisorWorker = existingTeamWorkers.find(
      (worker) =>
        worker.supervisor?.toString() !== supervisorDoc._id.toString(),
    );

    if (existingOtherSupervisorWorker) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This team number is already assigned to another supervisor in this Union Council.",
        },
        { status: 409 },
      );
    }

    // Maximum 2 active workers
    if (existingTeamWorkers.length >= 2) {
      return NextResponse.json(
        {
          success: false,
          message: "This team already has two active workers.",
        },
        { status: 409 },
      );
    }

    // Same role duplicate nahi hona chahiye
    const existingRole = existingTeamWorkers.find(
      (worker) => worker.workerRole === workerRole,
    );

    if (existingRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            workerRole === "teamLeader"
              ? "This team already has a Team Leader."
              : "This team already has a Team Member.",
        },
        { status: 409 },
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
    // Hash Password
    // ============================================================
    let hashedPassword = null;

    const password = "12345678";

    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // ============================================================
    // Create Worker
    // ============================================================

    const worker = await User.create({
      name: normalizedName,

      contactNumber: normalizedContactNumber,

      // Supervisor ki location automatically
      district: supervisorDoc.district,
      town: supervisorDoc.town,
      unionCouncil: supervisorDoc.unionCouncil,

      // Active UCMO automatically
      ucmo: activeUcmo._id,

      // Logged-in supervisor automatically
      supervisor: supervisorDoc._id,

      // Fixed designation
      designation: "worker",

      // Team information
      teamNumber: parsedTeamNumber,
      workerRole,

      // Worker ke liye email/password nahi chahiye
      emailVerified: true,

      password: hashedPassword,

      isActive: true,
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
      .populate("ucmo", "_id name contactNumber")
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
