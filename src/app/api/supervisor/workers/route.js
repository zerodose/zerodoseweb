import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, contactNumber, teamNumber, workerRole } = body;

    // ============================================================
    // Get Logged-in Supervisor ID
    // ============================================================
    //
    // IMPORTANT:
    // Yahan apne project ke actual authentication method ke
    // mutabiq supervisor ID lena hoga.
    //
    // Filhal frontend se supervisorId nahi li ja rahi.
    // Header se example ke taur par li ja rahi hai.
    //
    // ============================================================

    const supervisorId = request.headers.get("x-user-id");

    const authUser = JSON.parse(localStorage.getItem("authUser"));

    const response = await api.post(
      "/supervisor/workers",
      {
        name: data.name.trim(),
        contactNumber: data.contactNumber.trim(),
        teamNumber: Number(data.teamNumber),
        workerRole: data.workerRole,
      },
      {
        headers: {
          "x-user-id": authUser.id,
        },
      },
    );

    if (!supervisorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor authentication is required.",
        },
        { status: 401 },
      );
    }

    // ============================================================
    // Validate Supervisor ID
    // ============================================================

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
    // Find Active UCMO For Supervisor's Union Council
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
    // Get Logged-in Supervisor
    // ============================================================

    const supervisorDoc = await User.findOne({
      _id: supervisorId,
      designation: "supervisor",
      isActive: true,
    })
      .select("_id name contactNumber district town unionCouncil")
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
    // Supervisor Area
    // ============================================================
    //
    // Worker ko ye values frontend se nahi milengi.
    // Supervisor ke account se automatically aayengi.
    //
    // ============================================================

    const district = supervisorDoc.district;

    const town = supervisorDoc.town;

    const unionCouncil = supervisorDoc.unionCouncil;

    const supervisor = supervisorDoc._id;

    // ============================================================
    // Make Sure Supervisor Has Complete Area
    // ============================================================

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor district is not assigned.",
        },
        { status: 400 },
      );
    }

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor town is not assigned.",
        },
        { status: 400 },
      );
    }

    if (!unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor Union Council is not assigned.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Check Team Role
    // ============================================================
    //
    // 1 Team = maximum 2 workers
    // 1 Team Leader
    // 1 Team Member
    //
    // ============================================================

    const existingTeamWorkers = await User.find({
      supervisor: supervisor,
      teamNumber: parsedTeamNumber,
      designation: "worker",
      isActive: true,
    })
      .select("_id name workerRole teamNumber")
      .lean();

    // ============================================================
    // Maximum 2 Workers Per Team
    // ============================================================

    if (existingTeamWorkers.length >= 2) {
      return NextResponse.json(
        {
          success: false,
          message: "This team already has two workers.",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // Prevent Duplicate Team Role
    // ============================================================

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
    // Create Worker
    // ============================================================

    const worker = await User.create({
      name: normalizedName,

      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,

      contactNumber: normalizedContactNumber,

      // ========================================================
      // Automatically From Supervisor
      // ========================================================

      district: supervisorDoc.district,
      town: supervisorDoc.town,
      unionCouncil: supervisorDoc.unionCouncil,

      // ========================================================
      // Automatically Active UCMO Of This UC
      // ========================================================

      ucmo: activeUcmo._id,

      // ========================================================
      // Worker
      // ========================================================

      designation: "worker",

      supervisor: supervisorDoc._id,

      // ========================================================
      // Team
      // ========================================================

      teamNumber: parsedTeamNumber,
      workerRole,

      // ========================================================
      // Worker Status
      // ========================================================

      isActive: true,

      password: undefined,
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
