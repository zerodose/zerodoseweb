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
import { jwtVerify } from "jose";
import { getAuthenticatedUser } from "@/lib/auth";

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

export async function GET(request) {
  try {
    await connectDB();

    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const { user } = auth;

    // ============================================================
    // ONLY WORKER
    // ============================================================

    if (user.designation !== "worker") {
      return NextResponse.json(
        {
          success: false,
          message: "Only workers can access this data.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // WORKER UNION COUNCIL
    // ============================================================

    if (!user.unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is not assigned to this worker.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user.unionCouncil)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council assigned to this worker.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // WORKER TEAM
    // ============================================================

    if (user.teamNumber === null || user.teamNumber === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Team Number is not assigned to this worker.",
        },
        { status: 400 },
      );
    }

    const teamNumber = Number(user.teamNumber);

    if (!Number.isFinite(teamNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Team Number assigned to this worker.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // QUERY PARAMETERS
    // ============================================================

    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");
    const filter = searchParams.get("filter") || "recorded";

    // ============================================================
    // CAMPAIGN VALIDATION
    // ============================================================

    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign ID is required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Campaign ID.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // FILTER VALIDATION
    // ============================================================

    const allowedFilters = ["recorded", "visited", "covered"];

    if (!allowedFilters.includes(filter)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid filter. Allowed filters are recorded, visited, and covered.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // OBJECT IDS
    // ============================================================

    const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

    const unionCouncilObjectId = new mongoose.Types.ObjectId(user.unionCouncil);

    // ============================================================
    // BASE SCOPE
    //
    // Worker can only access:
    // campaign + worker's UC + worker's team
    //
    // UC and team are taken from authenticated user.
    // ============================================================

    const baseMatch = {
      campaign: campaignObjectId,
      unionCouncil: unionCouncilObjectId,
      teamNumber,
    };

    // ============================================================
    // FILTERED DATA MATCH
    // ============================================================

    const dataMatch = {
      ...baseMatch,
    };

    if (filter === "recorded") {
      dataMatch.recordDate = { $ne: null };
      dataMatch.visitDate = null;
      dataMatch.coveredDate = null;
    }

    if (filter === "visited") {
      dataMatch.recordDate = { $ne: null };
      dataMatch.visitDate = { $ne: null };
      dataMatch.coveredDate = null;
    }

    if (filter === "covered") {
      dataMatch.recordDate = { $ne: null };
      dataMatch.visitDate = { $ne: null };
      dataMatch.coveredDate = { $ne: null };
    }

    // ============================================================
    // GET FILTERED DATA
    // ============================================================

    const zerodose = await Zerodose.find(dataMatch)
      .sort({ createdAt: -1 })
      .populate("campaign", "name startDate endDate")
      .populate("district", "name")
      .populate("town", "name")
      .populate("unionCouncil", "name")
      .populate("ucmo", "name")
      .populate("supervisor", "name supervisorCode")
      .populate("user", "name designation")
      .populate("teamLeader", "name")
      .populate("teamMember", "name")
      .populate("vaccinator", "name")
      .lean();

    // ============================================================
    // SUMMARY
    //
    // All three statuses for:
    // campaign + worker UC + worker team
    // ============================================================

    const [recordedCount, visitedCount, coveredCount] = await Promise.all([
      Zerodose.countDocuments({
        ...baseMatch,
        recordDate: { $ne: null },
        visitDate: null,
        coveredDate: null,
      }),

      Zerodose.countDocuments({
        ...baseMatch,
        recordDate: { $ne: null },
        visitDate: { $ne: null },
        coveredDate: null,
      }),

      Zerodose.countDocuments({
        ...baseMatch,
        recordDate: { $ne: null },
        visitDate: { $ne: null },
        coveredDate: { $ne: null },
      }),
    ]);

    const summary = {
      recorded: recordedCount,
      visited: visitedCount,
      covered: coveredCount,
    };

    // ============================================================
    // VACCINATION STATUS
    //
    // Worker belongs to one team only.
    // ============================================================

    const vaccinationStatus = {
      total: {
        recorded: recordedCount,
        visited: visitedCount,
        covered: coveredCount,
      },
    };

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      data: zerodose,

      summary,

      vaccinationStatus,

      meta: {
        filter,
        count: zerodose.length,
        campaignId,
        unionCouncil: user.unionCouncil,
        teamNumber,
      },
    });
  } catch (error) {
    console.error("Worker Zerodose Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get worker Zerodose data.",
      },
      { status: 500 },
    );
  }
}
