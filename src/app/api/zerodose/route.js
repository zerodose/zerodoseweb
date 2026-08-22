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

    const body = await request.json();

    const {
      campaign,
      district,
      town,
      unionCouncil,
      ucmo,
      supervisor,
      user,
      teamLeader,
      teamMember,
      teamNumber,
      houseNumber,
      childName,
      fatherName,
      gender,
      age,
      address,
      contactNo,
      day,
      recordDate,
      location,
      clientStatus,
      vaccinationStatus,
    } = body;

    if (
      !campaign ||
      !district ||
      !town ||
      !unionCouncil ||
      !ucmo ||
      !supervisor ||
      !user ||
      !teamLeader ||
      !teamMember ||
      teamNumber === undefined ||
      houseNumber === undefined ||
      !childName ||
      !fatherName ||
      !gender ||
      age === undefined ||
      !address ||
      day === undefined ||
      !location ||
      location.latitude === undefined ||
      location.longitude === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields are missing",
        },
        { status: 400 },
      );
    }

    const objectIdFields = {
      campaign,
      district,
      town,
      unionCouncil,
      ucmo,
      supervisor,
      user,
      teamLeader,
      teamMember,
    };

    for (const [field, value] of Object.entries(objectIdFields)) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field} ID`,
          },
          { status: 400 },
        );
      }
    }

    if (!["male", "female"].includes(gender)) {
      return NextResponse.json(
        {
          success: false,
          message: "Gender must be male or female",
        },
        { status: 400 },
      );
    }

    const parsedAge = Number(age);
    const parsedTeamNumber = Number(teamNumber);
    const parsedHouseNumber = Number(houseNumber);
    const parsedDay = Number(day);

    if (!Number.isFinite(parsedAge) || parsedAge < 0 || parsedAge > 59) {
      return NextResponse.json(
        {
          success: false,
          message: "Age must be between 0 and 59",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(parsedTeamNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid team number",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(parsedHouseNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid house number",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(parsedDay)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid day",
        },
        { status: 400 },
      );
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid location",
        },
        { status: 400 },
      );
    }

    const [campaignDoc, users] = await Promise.all([
      Campaign.findById(campaign).lean(),
      User.find({
        _id: {
          $in: [ucmo, supervisor, user, teamLeader, teamMember],
        },
      })
        .select(
          "_id designation isActive supervisor teamNumber workerRole unionCouncil",
        )
        .lean(),
    ]);

    if (!campaignDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign not found",
        },
        { status: 404 },
      );
    }

    if (!campaignDoc.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign is not active",
        },
        { status: 400 },
      );
    }

    const userMap = new Map(users.map((item) => [item._id.toString(), item]));

    const ucmoUser = userMap.get(ucmo);
    const supervisorUser = userMap.get(supervisor);
    const workerUser = userMap.get(user);
    const teamLeaderUser = userMap.get(teamLeader);
    const teamMemberUser = userMap.get(teamMember);

    if (!ucmoUser || ucmoUser.designation !== "ucmo" || !ucmoUser.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid UCMO",
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
          message: "Invalid supervisor",
        },
        { status: 400 },
      );
    }

    if (
      !workerUser ||
      workerUser.designation !== "worker" ||
      !workerUser.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid worker",
        },
        { status: 400 },
      );
    }

    if (
      !teamLeaderUser ||
      teamLeaderUser.designation !== "worker" ||
      !teamLeaderUser.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid team leader",
        },
        { status: 400 },
      );
    }

    if (
      !teamMemberUser ||
      teamMemberUser.designation !== "worker" ||
      !teamMemberUser.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid team member",
        },
        { status: 400 },
      );
    }

    if (workerUser.supervisor?.toString() !== supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker does not belong to this supervisor",
        },
        { status: 400 },
      );
    }

    if (teamLeaderUser.supervisor?.toString() !== supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Team leader does not belong to this supervisor",
        },
        { status: 400 },
      );
    }

    if (teamMemberUser.supervisor?.toString() !== supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Team member does not belong to this supervisor",
        },
        { status: 400 },
      );
    }

    if (
      workerUser.unionCouncil?.toString() !== unionCouncil ||
      supervisorUser.unionCouncil?.toString() !== unionCouncil ||
      ucmoUser.unionCouncil?.toString() !== unionCouncil
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Users do not belong to the specified union council",
        },
        { status: 400 },
      );
    }

    const existingZerodose = await Zerodose.findOne({
      campaign,
      user,
      childName,
      fatherName,
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

    const zerodose = await Zerodose.create({
      campaign,
      district,
      town,
      unionCouncil,
      ucmo,
      supervisor,
      user,
      teamLeader,
      teamMember,
      teamNumber: parsedTeamNumber,
      houseNumber: parsedHouseNumber,
      childName,
      fatherName,
      gender,
      age: parsedAge,
      address,
      contactNo: contactNo || null,
      day: parsedDay,
      recordDate: recordDate ? new Date(recordDate) : new Date(),
      visitDate: null,
      coveredDate: null,
      location: {
        latitude,
        longitude,
      },
      qrCode: null,
      vaccinator: null,
      clientStatus: clientStatus || null,
      vaccinationStatus: vaccinationStatus || "recorded",
    });

    const populatedZerodose = await Zerodose.findById(zerodose._id)
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

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: Object.values(error.errors).map((err) => err.message),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Zerodose record",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
