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

export async function GET(request) {
  try {
    await connectDB();

    // --------------------------------------------------
    // 1. Get JWT from auth cookie
    // --------------------------------------------------
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------
    // 2. Verify JWT
    // --------------------------------------------------
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
    );

    const userId = payload?.userId || payload?.id || payload?._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------
    // 3. Get authenticated worker
    // --------------------------------------------------
    const user = await User.findOne({
      _id: userId,
      designation: "worker",
      isActive: true,
    })
      .select(
        "_id name designation unionCouncil teamNumber supervisor workerRole",
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Active worker not found",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // 4. Validate worker assignment
    // --------------------------------------------------
    if (!user.unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a Union Council",
        },
        { status: 400 },
      );
    }

    if (user.teamNumber === undefined || user.teamNumber === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a team",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 5. Optional campaignId
    // --------------------------------------------------
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    let selectedCampaign;

    // --------------------------------------------------
    // 6. Specific campaign
    // --------------------------------------------------
    if (campaignId) {
      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid campaign ID",
          },
          { status: 400 },
        );
      }

      selectedCampaign = await Campaign.findById(campaignId)
        .select("_id name year month startDate endDate")
        .lean();

      if (!selectedCampaign) {
        return NextResponse.json(
          {
            success: false,
            message: "Campaign not found",
          },
          { status: 404 },
        );
      }
    }

    // --------------------------------------------------
    // 7. Current active campaign
    // --------------------------------------------------
    else {
      const now = new Date();

      selectedCampaign = await Campaign.findOne({
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .select("_id name year month startDate endDate")
        .sort({ startDate: -1 })
        .lean();

      if (!selectedCampaign) {
        return NextResponse.json(
          {
            success: false,
            message: "No current campaign found",
          },
          { status: 404 },
        );
      }
    }

    // --------------------------------------------------
    // 8. Build worker scope
    //
    // IMPORTANT:
    // unionCouncil + teamNumber come from authenticated user.
    // Nothing comes from frontend.
    // --------------------------------------------------
    const filter = {
      unionCouncil: user.unionCouncil,
      teamNumber: Number(user.teamNumber),
      campaign: selectedCampaign._id,
      recordDate: { $ne: null },
    };

    // Optional extra safety:
    // If you want to ensure the records also belong to
    // this exact worker's supervisor, uncomment this:
    //
    // filter.supervisor = user.supervisor;

    // --------------------------------------------------
    // 9. Get Zerodose records
    // --------------------------------------------------
    const records = await Zerodose.find(filter).sort({ recordDate: -1 }).lean();

    // --------------------------------------------------
    // 10. Calculate statuses
    //
    // recorded:
    // recordDate exists
    // visitDate null
    // coveredDate null
    //
    // visited:
    // recordDate exists
    // visitDate exists
    // coveredDate null
    //
    // covered:
    // recordDate exists
    // visitDate exists
    // coveredDate exists
    // --------------------------------------------------
    const recorded = records.filter(
      (item) =>
        item.recordDate !== null &&
        item.visitDate === null &&
        item.coveredDate === null,
    ).length;

    const visited = records.filter(
      (item) =>
        item.recordDate !== null &&
        item.visitDate !== null &&
        item.coveredDate === null,
    ).length;

    const covered = records.filter(
      (item) =>
        item.recordDate !== null &&
        item.visitDate !== null &&
        item.coveredDate !== null,
    ).length;

    // --------------------------------------------------
    // 11. Response
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        unionCouncilId: user.unionCouncil,
        teamNumber: user.teamNumber,

        worker: {
          id: user._id,
          name: user.name,
          designation: user.designation,
          workerRole: user.workerRole,
        },

        campaign: {
          id: selectedCampaign._id,
          name: selectedCampaign.name,
          year: selectedCampaign.year,
          month: selectedCampaign.month,
          startDate: selectedCampaign.startDate,
          endDate: selectedCampaign.endDate,
        },

        recorded,
        visited,
        covered,
        total: recorded + visited + covered,

        records,
      },
    });
  } catch (error) {
    console.error("GET ZERODOSE WORKER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch worker Zerodose data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
