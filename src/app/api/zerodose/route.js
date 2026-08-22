import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

async function getAuthUser(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );

    if (!payload?.userId) {
      return null;
    }

    if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
      return null;
    }

    const user = await User.findById(payload.userId).lean();

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("JWT auth error:", error);
    return null;
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (authUser.designation !== "worker") {
      return NextResponse.json(
        {
          success: false,
          message: "Only workers can create Zerodose records",
        },
        { status: 403 },
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 },
      );
    }

    const {
      childName,
      fatherName,
      age,
      gender,
      houseNumber,
      address,
      contactNo,
      location,
    } = body;

    if (
      childName === undefined ||
      childName === null ||
      fatherName === undefined ||
      fatherName === null ||
      age === undefined ||
      age === null ||
      gender === undefined ||
      gender === null ||
      houseNumber === undefined ||
      houseNumber === null ||
      address === undefined ||
      address === null ||
      location === undefined ||
      location === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields are missing",
        },
        { status: 400 },
      );
    }

    if (
      typeof location !== "object" ||
      location.latitude === undefined ||
      location.latitude === null ||
      location.longitude === undefined ||
      location.longitude === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Location latitude and longitude are required",
        },
        { status: 400 },
      );
    }

    const workerUser = await User.findById(authUser._id)
      .select(
        "_id name designation isActive district town unionCouncil ucmo supervisor teamNumber workerRole",
      )
      .lean();

    if (
      !workerUser ||
      workerUser.designation !== "worker" ||
      !workerUser.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or inactive worker",
        },
        { status: 400 },
      );
    }

    const userId = workerUser._id;
    const districtId = workerUser.district;
    const townId = workerUser.town;
    const unionCouncilId = workerUser.unionCouncil;
    const ucmoId = workerUser.ucmo;
    const supervisorId = workerUser.supervisor;
    const teamNumber = workerUser.teamNumber;

    if (!districtId) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a district",
        },
        { status: 400 },
      );
    }

    if (!townId) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a town",
        },
        { status: 400 },
      );
    }

    if (!unionCouncilId) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a union council",
        },
        { status: 400 },
      );
    }

    if (!ucmoId) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a UCMO",
        },
        { status: 400 },
      );
    }

    if (!supervisorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a supervisor",
        },
        { status: 400 },
      );
    }

    if (teamNumber === undefined || teamNumber === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker is not assigned to a team",
        },
        { status: 400 },
      );
    }

    const objectIdFields = {
      worker: userId,
      district: districtId,
      town: townId,
      unionCouncil: unionCouncilId,
      ucmo: ucmoId,
      supervisor: supervisorId,
    };

    for (const [field, value] of Object.entries(objectIdFields)) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field} assignment`,
          },
          { status: 400 },
        );
      }
    }

    const now = new Date();

    const activeCampaign = await Campaign.findOne({
      startDate: {
        $lte: now,
      },
      endDate: {
        $gte: now,
      },
    })
      .sort({ startDate: 1 })
      .lean();

    if (!activeCampaign) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no active campaign at this time",
        },
        { status: 400 },
      );
    }

    const campaignId = activeCampaign._id;

    const campaignStart = new Date(activeCampaign.startDate);
    const campaignEnd = new Date(activeCampaign.endDate);

    if (
      Number.isNaN(campaignStart.getTime()) ||
      Number.isNaN(campaignEnd.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign has invalid start or end date",
        },
        { status: 400 },
      );
    }

    if (now < campaignStart || now > campaignEnd) {
      return NextResponse.json(
        {
          success: false,
          message: "Today is outside the current campaign period",
        },
        { status: 400 },
      );
    }

    const campaignStartDay = new Date(campaignStart);
    campaignStartDay.setHours(0, 0, 0, 0);

    const currentDay = new Date(now);
    currentDay.setHours(0, 0, 0, 0);

    const campaignEndDay = new Date(campaignEnd);
    campaignEndDay.setHours(0, 0, 0, 0);

    const day =
      Math.floor(
        (currentDay.getTime() - campaignStartDay.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    const campaignDays =
      Math.floor(
        (campaignEndDay.getTime() - campaignStartDay.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    if (day < 1 || day > campaignDays) {
      return NextResponse.json(
        {
          success: false,
          message: "Today is outside the current campaign period",
        },
        { status: 400 },
      );
    }

    const parsedTeamNumber = Number(teamNumber);

    if (!Number.isInteger(parsedTeamNumber) || parsedTeamNumber < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid worker team number",
        },
        { status: 400 },
      );
    }

    const teamWorkers = await User.find({
      designation: "worker",
      isActive: true,
      supervisor: supervisorId,
      unionCouncil: unionCouncilId,
      teamNumber: parsedTeamNumber,
    })
      .select(
        "_id name designation supervisor teamNumber workerRole unionCouncil",
      )
      .lean();

    const teamLeaderUser = teamWorkers.find(
      (worker) => worker.workerRole === "teamLeader",
    );

    const teamMemberUser = teamWorkers.find(
      (worker) => worker.workerRole === "teamMember",
    );

    if (!teamLeaderUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Team leader not found for this worker's team",
        },
        { status: 400 },
      );
    }

    if (!teamMemberUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Team member not found for this worker's team",
        },
        { status: 400 },
      );
    }

    const isWorkerInTeam = teamWorkers.some(
      (worker) => worker._id.toString() === userId.toString(),
    );

    if (!isWorkerInTeam) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker does not belong to the assigned team",
        },
        { status: 400 },
      );
    }

    const [ucmoUser, supervisorUser] = await Promise.all([
      User.findById(ucmoId)
        .select(
          "_id name email contactNumber designation isActive district town unionCouncil",
        )
        .lean(),

      User.findById(supervisorId)
        .select(
          "_id name email contactNumber designation supervisorCode isActive district town unionCouncil",
        )
        .lean(),
    ]);

    if (!ucmoUser || ucmoUser.designation !== "ucmo" || !ucmoUser.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or inactive UCMO assigned to worker",
        },
        { status: 400 },
      );
    }

    if (
      !supervisorUser ||
      supervisorUser.designation !== "supervisor" ||
      !supervisorUser.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or inactive supervisor assigned to worker",
        },
        { status: 400 },
      );
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid latitude or longitude",
        },
        { status: 400 },
      );
    }

    if (!["male", "female"].includes(String(gender).toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          message: "Gender must be male or female",
        },
        { status: 400 },
      );
    }

    const cleanGender = String(gender).trim().toLowerCase();

    const parsedAge = Number(age);

    if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 59) {
      return NextResponse.json(
        {
          success: false,
          message: "Age must be between 0 and 59",
        },
        { status: 400 },
      );
    }

    const parsedHouseNumber = Number(houseNumber);

    if (
      !Number.isInteger(parsedHouseNumber) ||
      parsedHouseNumber < 0 ||
      parsedHouseNumber > 999
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "House number must be between 0 and 999",
        },
        { status: 400 },
      );
    }

    const cleanChildName = String(childName).trim();
    const cleanFatherName = String(fatherName).trim();
    const cleanAddress = String(address).trim();

    if (!cleanChildName) {
      return NextResponse.json(
        {
          success: false,
          message: "Child name is required",
        },
        { status: 400 },
      );
    }

    if (!cleanFatherName) {
      return NextResponse.json(
        {
          success: false,
          message: "Father name is required",
        },
        { status: 400 },
      );
    }

    if (!cleanAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is required",
        },
        { status: 400 },
      );
    }

    const cleanContactNo =
      contactNo !== undefined &&
      contactNo !== null &&
      String(contactNo).trim() !== ""
        ? String(contactNo).trim()
        : null;

    if (cleanContactNo && !/^03\d{9}$/.test(cleanContactNo)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Pakistani mobile number",
        },
        { status: 400 },
      );
    }

    const existingZerodose = await Zerodose.findOne({
      campaign: campaignId,
      user: userId,
      childName: cleanChildName,
      fatherName: cleanFatherName,
      houseNumber: parsedHouseNumber,
    }).lean();

    if (existingZerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "This Zerodose record already exists",
        },
        { status: 409 },
      );
    }

    const zerodoseData = {
      campaign: campaignId,

      district: districtId,
      town: townId,
      unionCouncil: unionCouncilId,
      ucmo: ucmoId,
      supervisor: supervisorId,
      user: userId,

      teamLeader: teamLeaderUser._id,
      teamMember: teamMemberUser._id,
      teamNumber: parsedTeamNumber,

      houseNumber: parsedHouseNumber,
      childName: cleanChildName,
      fatherName: cleanFatherName,
      gender: cleanGender,
      age: parsedAge,
      address: cleanAddress,
      contactNo: cleanContactNo,

      day,

      recordDate: new Date(),

      visitDate: null,
      coveredDate: null,

      location: {
        latitude,
        longitude,
      },

      qrCode: null,
      vaccinator: null,
      clientStatus: null,
      vaccinationStatus: "recorded",
    };

    let zerodose;

    try {
      zerodose = await Zerodose.create(zerodoseData);
    } catch (error) {
      console.error("Zerodose.create error:", error);

      if (error?.name === "ValidationError") {
        return NextResponse.json(
          {
            success: false,
            message: "Zerodose validation failed",
            errors: Object.values(error.errors || {}).map((err) => ({
              field: err.path,
              message: err.message,
              value: err.value,
            })),
          },
          { status: 400 },
        );
      }

      if (error?.code === 11000) {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate Zerodose record",
            error: error.keyValue || null,
          },
          { status: 409 },
        );
      }

      throw error;
    }

    const populatedZerodose = await Zerodose.findById(zerodose._id)
      .populate("campaign", "name scope year month startDate endDate")
      .populate("district", "name code")
      .populate("town", "name code")
      .populate("unionCouncil", "name code")
      .populate("ucmo", "name email contactNumber designation")
      .populate(
        "supervisor",
        "name email contactNumber designation supervisorCode",
      )
      .populate("user", "name email contactNumber designation")
      .populate(
        "teamLeader",
        "name email contactNumber designation workerRole teamNumber",
      )
      .populate(
        "teamMember",
        "name email contactNumber designation workerRole teamNumber",
      )
      .populate("vaccinator", "name email contactNumber designation")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose created successfully",
        data: populatedZerodose,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/zerodose error:", error);

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: Object.values(error.errors || {}).map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
          })),
        },
        { status: 400 },
      );
    }

    if (error?.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid database value",
          field: error.path,
          value: error.value,
        },
        { status: 400 },
      );
    }

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate Zerodose record",
          error: error.keyValue || null,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create Zerodose record",
        errorName: error?.name || "UnknownError",
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100,
    );

    const search = searchParams.get("search")?.trim() || "";

    const campaign = searchParams.get("campaign");
    const district = searchParams.get("district");
    const town = searchParams.get("town");
    const unionCouncil = searchParams.get("unionCouncil");
    const ucmo = searchParams.get("ucmo");
    const supervisor = searchParams.get("supervisor");
    const user = searchParams.get("user");
    const teamLeader = searchParams.get("teamLeader");
    const teamMember = searchParams.get("teamMember");
    const vaccinator = searchParams.get("vaccinator");
    const teamNumber = searchParams.get("teamNumber");

    const vaccinationStatus = searchParams.get("vaccinationStatus");
    const clientStatus = searchParams.get("clientStatus");
    const gender = searchParams.get("gender");

    const recordDateFrom = searchParams.get("recordDateFrom");
    const recordDateTo = searchParams.get("recordDateTo");

    const visitDateFrom = searchParams.get("visitDateFrom");
    const visitDateTo = searchParams.get("visitDateTo");

    const coveredDateFrom = searchParams.get("coveredDateFrom");
    const coveredDateTo = searchParams.get("coveredDateTo");

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter = {};

    if (campaign) {
      if (!mongoose.Types.ObjectId.isValid(campaign)) {
        return NextResponse.json(
          { success: false, message: "Invalid campaign ID" },
          { status: 400 },
        );
      }

      filter.campaign = campaign;
    }

    if (district) {
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return NextResponse.json(
          { success: false, message: "Invalid district ID" },
          { status: 400 },
        );
      }

      filter.district = district;
    }

    if (town) {
      if (!mongoose.Types.ObjectId.isValid(town)) {
        return NextResponse.json(
          { success: false, message: "Invalid town ID" },
          { status: 400 },
        );
      }

      filter.town = town;
    }

    if (unionCouncil) {
      if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
        return NextResponse.json(
          { success: false, message: "Invalid union council ID" },
          { status: 400 },
        );
      }

      filter.unionCouncil = unionCouncil;
    }

    if (ucmo) {
      if (!mongoose.Types.ObjectId.isValid(ucmo)) {
        return NextResponse.json(
          { success: false, message: "Invalid UCMO ID" },
          { status: 400 },
        );
      }

      filter.ucmo = ucmo;
    }

    if (supervisor) {
      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        return NextResponse.json(
          { success: false, message: "Invalid supervisor ID" },
          { status: 400 },
        );
      }

      filter.supervisor = supervisor;
    }

    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return NextResponse.json(
          { success: false, message: "Invalid user ID" },
          { status: 400 },
        );
      }

      filter.user = user;
    }

    if (teamLeader) {
      if (!mongoose.Types.ObjectId.isValid(teamLeader)) {
        return NextResponse.json(
          { success: false, message: "Invalid team leader ID" },
          { status: 400 },
        );
      }

      filter.teamLeader = teamLeader;
    }

    if (teamMember) {
      if (!mongoose.Types.ObjectId.isValid(teamMember)) {
        return NextResponse.json(
          { success: false, message: "Invalid team member ID" },
          { status: 400 },
        );
      }

      filter.teamMember = teamMember;
    }

    if (vaccinator) {
      if (!mongoose.Types.ObjectId.isValid(vaccinator)) {
        return NextResponse.json(
          { success: false, message: "Invalid vaccinator ID" },
          { status: 400 },
        );
      }

      filter.vaccinator = vaccinator;
    }

    if (teamNumber) {
      const parsedTeamNumber = Number(teamNumber);

      if (!Number.isFinite(parsedTeamNumber)) {
        return NextResponse.json(
          { success: false, message: "Invalid team number" },
          { status: 400 },
        );
      }

      filter.teamNumber = parsedTeamNumber;
    }

    if (vaccinationStatus) {
      if (!["recorded", "visited", "covered"].includes(vaccinationStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid vaccination status" },
          { status: 400 },
        );
      }

      filter.vaccinationStatus = vaccinationStatus;
    }

    if (clientStatus) {
      if (
        !["available", "refusal", "sick", "not_available", "deceased"].includes(
          clientStatus,
        )
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid client status" },
          { status: 400 },
        );
      }

      filter.clientStatus = clientStatus;
    }

    if (gender) {
      if (!["male", "female"].includes(gender)) {
        return NextResponse.json(
          { success: false, message: "Invalid gender" },
          { status: 400 },
        );
      }

      filter.gender = gender;
    }

    if (recordDateFrom || recordDateTo) {
      filter.recordDate = {};

      if (recordDateFrom) {
        const date = new Date(recordDateFrom);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid recordDateFrom" },
            { status: 400 },
          );
        }

        filter.recordDate.$gte = date;
      }

      if (recordDateTo) {
        const date = new Date(recordDateTo);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid recordDateTo" },
            { status: 400 },
          );
        }

        filter.recordDate.$lte = date;
      }
    }

    if (visitDateFrom || visitDateTo) {
      filter.visitDate = {};

      if (visitDateFrom) {
        const date = new Date(visitDateFrom);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid visitDateFrom" },
            { status: 400 },
          );
        }

        filter.visitDate.$gte = date;
      }

      if (visitDateTo) {
        const date = new Date(visitDateTo);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid visitDateTo" },
            { status: 400 },
          );
        }

        filter.visitDate.$lte = date;
      }
    }

    if (coveredDateFrom || coveredDateTo) {
      filter.coveredDate = {};

      if (coveredDateFrom) {
        const date = new Date(coveredDateFrom);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid coveredDateFrom" },
            { status: 400 },
          );
        }

        filter.coveredDate.$gte = date;
      }

      if (coveredDateTo) {
        const date = new Date(coveredDateTo);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid coveredDateTo" },
            { status: 400 },
          );
        }

        filter.coveredDate.$lte = date;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");

      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { contactNumber: searchRegex },
          { supervisorCode: searchRegex },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchingUsers.map((item) => item._id);

      const searchConditions = [
        { childName: searchRegex },
        { fatherName: searchRegex },
        { address: searchRegex },
        { contactNo: searchRegex },
        { qrCode: searchRegex },
      ];

      if (userIds.length > 0) {
        searchConditions.push(
          { user: { $in: userIds } },
          { ucmo: { $in: userIds } },
          { supervisor: { $in: userIds } },
          { teamLeader: { $in: userIds } },
          { teamMember: { $in: userIds } },
          { vaccinator: { $in: userIds } },
        );
      }

      filter.$or = searchConditions;
    }

    const skip = (page - 1) * limit;

    const [zerodoses, total] = await Promise.all([
      Zerodose.find(filter)
        .populate("campaign", "name year month startDate endDate")
        .populate("district", "name code")
        .populate("town", "name code")
        .populate("unionCouncil", "name code")
        .populate("ucmo", "name email contactNumber designation")
        .populate(
          "supervisor",
          "name email contactNumber designation supervisorCode",
        )
        .populate("user", "name email contactNumber designation")
        .populate("teamLeader", "name email contactNumber designation")
        .populate("teamMember", "name email contactNumber designation")
        .populate("vaccinator", "name email contactNumber designation")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      Zerodose.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: zerodoses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Zerodose records",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
