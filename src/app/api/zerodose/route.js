import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

// ============================================================
// Helper
// ============================================================

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

// ============================================================
// POST - Create Zerodose
// ============================================================

export async function POST(request) {
  try {
    // ========================================================
    // Authentication
    // ========================================================

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        {
          status: 401,
        },
      );
    }

    let payload;

    try {
      const result = await jwtVerify(token, secret);

      payload = result.payload;
    } catch (error) {
      console.error("JWT verification error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // Validate User ID
    // ========================================================

    if (!payload?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication payload.",
        },
        {
          status: 401,
        },
      );
    }

    if (!mongoose.isValidObjectId(payload.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user authentication.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // Database
    // ========================================================

    await connectDB();

    // ========================================================
    // Get Logged-in Worker
    // ========================================================

    const worker = await User.findOne({
      _id: payload.userId,
      designation: "worker",
      isActive: true,
    })
      .select(
        "_id name designation district town unionCouncil ucmo supervisor teamNumber workerRole",
      )
      .lean();

    // ========================================================
    // ONLY ACTIVE WORKER
    // ========================================================

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          message: "Only active workers can add Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // Worker Assignment
    // ========================================================

    const {
      district,
      town,
      unionCouncil,
      ucmo,
      supervisor,
      teamNumber,
      workerRole,
    } = worker;

    if (
      !district ||
      !town ||
      !unionCouncil ||
      !ucmo ||
      !supervisor ||
      teamNumber === null ||
      teamNumber === undefined ||
      !workerRole
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Worker is not properly assigned to district, town, union council, UCMO, supervisor or team.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Validate Assignment IDs
    // ========================================================

    const assignmentFields = [
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
        value: ucmo,
        name: "ucmo",
      },
      {
        value: supervisor,
        name: "supervisor",
      },
    ];

    for (const field of assignmentFields) {
      if (!mongoose.isValidObjectId(field.value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Worker has an invalid ${field.name}.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ========================================================
    // Validate Team Number
    // ========================================================

    if (!Number.isInteger(teamNumber) || teamNumber < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker has an invalid team number.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Validate Worker Role
    // ========================================================

    if (!["teamLeader", "teamMember"].includes(workerRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker has an invalid worker role.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Get Current Campaign
    // ========================================================

    const now = new Date();

    const currentCampaign = await Campaign.findOne({
      startDate: {
        $lte: now,
      },
      endDate: {
        $gte: now,
      },
    })
      .select("_id name year month startDate endDate")
      .sort({
        startDate: -1,
      })
      .lean();

    if (!currentCampaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose can only be added during an active campaign.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Get Team Leader + Team Member
    // ========================================================

    const teamWorkers = await User.find({
      designation: "worker",
      isActive: true,

      district: worker.district,
      town: worker.town,
      unionCouncil: worker.unionCouncil,
      ucmo: worker.ucmo,
      supervisor: worker.supervisor,

      teamNumber: worker.teamNumber,
    })
      .select("_id name designation workerRole teamNumber")
      .lean();

    // ========================================================
    // Find Team Leader
    // ========================================================

    const teamLeaderWorker = teamWorkers.find(
      (item) => item.workerRole === "teamLeader",
    );

    // ========================================================
    // Find Team Member
    // ========================================================

    const teamMemberWorker = teamWorkers.find(
      (item) => item.workerRole === "teamMember",
    );

    // ========================================================
    // Validate Team
    // ========================================================

    if (!teamLeaderWorker) {
      return NextResponse.json(
        {
          success: false,
          message: "Team leader is not assigned to this team.",
        },
        {
          status: 400,
        },
      );
    }

    if (!teamMemberWorker) {
      return NextResponse.json(
        {
          success: false,
          message: "Team member is not assigned to this team.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Request Body
    //
    // Client sends ONLY:
    // childName
    // fatherName
    // age
    // address
    // contactNo
    // location
    //
    // Backend generates:
    // campaign
    // user
    // teamLeader
    // teamMember
    // teamNumber
    // district
    // town
    // unionCouncil
    // ucmo
    // supervisor
    // day
    // recordDate
    // status
    // ========================================================

    const body = await request.json();

    const { childName, fatherName, age, address, contactNo, location } = body;

    // ========================================================
    // Required Fields
    // ========================================================

    const requiredFields = [
      "childName",
      "fatherName",
      "age",
      "address",
      "location",
    ];

    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ========================================================
    // Child Name
    // ========================================================

    if (typeof childName !== "string" || !childName.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid child name is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Father Name
    // ========================================================

    if (typeof fatherName !== "string" || !fatherName.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid father name is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Age
    // ========================================================

    if (
      typeof age !== "number" ||
      !Number.isInteger(age) ||
      age < 0 ||
      age > 59
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Age must be an integer between 0 and 59.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Address
    // ========================================================

    if (typeof address !== "string" || !address.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid address is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Contact Number
    // ========================================================

    let normalizedContactNo;

    if (contactNo !== undefined && contactNo !== null && contactNo !== "") {
      if (typeof contactNo !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid contact number.",
          },
          {
            status: 400,
          },
        );
      }

      normalizedContactNo = contactNo.trim();

      if (!/^03\d{9}$/.test(normalizedContactNo)) {
        return NextResponse.json(
          {
            success: false,
            message: "Please enter a valid Pakistani mobile number.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ========================================================
    // Location
    // ========================================================

    if (
      !location ||
      typeof location !== "object" ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid latitude and longitude are required.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // GPS Validation
    // ========================================================

    if (
      !Number.isFinite(location.latitude) ||
      location.latitude < -90 ||
      location.latitude > 90
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid latitude.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(location.longitude) ||
      location.longitude < -180 ||
      location.longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid longitude.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Calculate Campaign Day Automatically
    //
    // Campaign Start Date = Day 1
    // Next Date = Day 2
    // Next Date = Day 3
    // ========================================================

    const campaignStart = new Date(currentCampaign.startDate);
    const campaignEnd = new Date(currentCampaign.endDate);

    if (
      Number.isNaN(campaignStart.getTime()) ||
      Number.isNaN(campaignEnd.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid campaign dates.",
        },
        {
          status: 400,
        },
      );
    }

    campaignStart.setHours(0, 0, 0, 0);
    campaignEnd.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const day =
      Math.floor(
        (today.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    const campaignDays =
      Math.floor(
        (campaignEnd.getTime() - campaignStart.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    if (day < 1 || day > campaignDays) {
      return NextResponse.json(
        {
          success: false,
          message: "Today is outside the campaign period.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Create Zerodose
    // ========================================================

    const zerodose = await Zerodose.create({
      // ------------------------------------------------------
      // Campaign
      // ------------------------------------------------------

      campaign: currentCampaign._id,

      // ------------------------------------------------------
      // Exact Worker Who Recorded
      // ------------------------------------------------------

      user: worker._id,

      // ------------------------------------------------------
      // Team Snapshot
      // ------------------------------------------------------

      teamLeader: teamLeaderWorker._id,

      teamMember: teamMemberWorker._id,

      teamNumber: worker.teamNumber,

      // ------------------------------------------------------
      // Assignment Snapshot
      // ------------------------------------------------------

      district: worker.district,

      town: worker.town,

      unionCouncil: worker.unionCouncil,

      ucmo: worker.ucmo,

      supervisor: worker.supervisor,

      // ------------------------------------------------------
      // Child Information
      // ------------------------------------------------------

      childName: childName.trim(),

      fatherName: fatherName.trim(),

      age,

      address: address.trim(),

      contactNo: normalizedContactNo || undefined,

      // ------------------------------------------------------
      // Campaign Day
      // ------------------------------------------------------

      day,

      // ------------------------------------------------------
      // Dates
      // ------------------------------------------------------

      recordDate: new Date(),

      visitDate: null,

      coveredDate: null,

      // ------------------------------------------------------
      // GPS
      // ------------------------------------------------------

      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },

      // ------------------------------------------------------
      // Initial Status
      // ------------------------------------------------------

      clientStatus: null,

      vaccinationStatus: "recorded",
    });

    // ========================================================
    // Populate Created Document
    // ========================================================

    await zerodose.populate([
      {
        path: "campaign",
        select: "name year month startDate endDate",
      },
      {
        path: "district",
        select: "name code",
      },
      {
        path: "town",
        select: "name code",
      },
      {
        path: "unionCouncil",
        select: "name code",
      },
      {
        path: "ucmo",
        select: "name contactNumber",
      },
      {
        path: "supervisor",
        select: "name contactNumber supervisorCode",
      },
      {
        path: "user",
        select: "name contactNumber designation workerRole teamNumber",
      },
      {
        path: "teamLeader",
        select: "name contactNumber designation workerRole teamNumber",
      },
      {
        path: "teamMember",
        select: "name contactNumber designation workerRole teamNumber",
      },
    ]);

    // ========================================================
    // Response
    // ========================================================

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose recorded successfully.",
        data: zerodose,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create zerodose error:", error);

    // ========================================================
    // Mongoose Validation Error
    // ========================================================

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Duplicate Key
    // ========================================================

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate Zerodose record.",
        },
        {
          status: 409,
        },
      );
    }

    // ========================================================
    // Invalid ObjectId
    // ========================================================

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data provided.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // Server Error
    // ========================================================

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}
// ============================================================
// Authentication Helper
// ============================================================

// async function getAuthenticatedUser(request) {
//   const token = request.cookies.get("auth_token")?.value;

//   if (!token) {
//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Not authenticated.",
//         },
//         {
//           status: 401,
//         },
//       ),
//     };
//   }

//   let payload;

//   try {
//     const result = await jwtVerify(token, secret);

//     payload = result.payload;
//   } catch (error) {
//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Invalid or expired authentication.",
//         },
//         {
//           status: 401,
//         },
//       ),
//     };
//   }

//   if (!payload.userId || !isValidObjectId(payload.userId)) {
//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Invalid authenticated user.",
//         },
//         {
//           status: 401,
//         },
//       ),
//     };
//   }

//   const user = await User.findOne({
//     _id: payload.userId,
//     isActive: true,
//   })
//     .select(
//       "_id name designation district town unionCouncil ucmo supervisor teamNumber",
//     )
//     .lean();

//   if (!user) {
//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Active user not found.",
//         },
//         {
//           status: 401,
//         },
//       ),
//     };
//   }

//   return {
//     user,
//   };
// }

// ============================================================
// GET ACCESS SCOPE
// ============================================================
//
// IMPORTANT:
// Client filters can ONLY narrow the result.
// They can NEVER expand the user's permission scope.
//
// worker      -> own user ID
// supervisor  -> supervisor ID
// ucmo        -> UCMO ID
// vaccinator  -> own UC
// townFP      -> own Town
// districtfp  -> own District
// admin       -> all
//
// ============================================================

// function applyUserAccessScope(query, user) {
//   switch (user.designation) {
//     // ========================================================
//     // Worker
//     // ========================================================
//     //
//     // Worker only sees Zerodose records created by himself.
//     //
//     case "worker":
//       query.user = user._id;
//       break;

//     // ========================================================
//     // Supervisor
//     // ========================================================
//     //
//     // Supervisor sees all Zerodose records belonging to him.
//     //
//     case "supervisor":
//       query.supervisor = user._id;
//       break;

//     // ========================================================
//     // UCMO
//     // ========================================================
//     //
//     // UCMO sees all Zerodose records belonging to his UCMO ID.
//     //
//     case "ucmo":
//       query.ucmo = user._id;
//       break;

//     // ========================================================
//     // Vaccinator
//     // ========================================================
//     //
//     // Vaccinator sees Zerodose of his own UC.
//     //
//     case "vaccinator":
//       if (!user.unionCouncil) {
//         return {
//           error: "Vaccinator is not assigned to a Union Council.",
//         };
//       }

//       query.unionCouncil = user.unionCouncil;
//       break;

//     // ========================================================
//     // Town FP
//     // ========================================================
//     //
//     // Future town-level designation.
//     //
//     case "townFP":
//       if (!user.town) {
//         return {
//           error: "Town FP is not assigned to a Town.",
//         };
//       }

//       query.town = user.town;
//       break;

//     // ========================================================
//     // District FP
//     // ========================================================
//     //
//     // Future district-level designation.
//     //
//     case "districtfp":
//       if (!user.district) {
//         return {
//           error: "District FP is not assigned to a District.",
//         };
//       }

//       query.district = user.district;
//       break;

//     // ========================================================
//     // Admin
//     // ========================================================
//     //
//     // Admin can see all records.
//     //
//     case "admin":
//       break;

//     // ========================================================
//     // Anything else
//     // ========================================================
//     //
//     // Do not accidentally expose Zerodose data to other roles.
//     //
//     default:
//       return {
//         error: "You are not authorized to view Zerodose records.",
//       };
//   }

//   return {
//     success: true,
//   };
// }

// ============================================================
// GET
// Get Zerodose List
// ============================================================

export async function GET(request) {
  try {
    // ========================================================
    // Authentication
    // ========================================================

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        {
          status: 401,
        },
      );
    }

    let payload;

    try {
      const result = await jwtVerify(token, secret);

      payload = result.payload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // Database
    // ========================================================

    await connectDB();

    // ========================================================
    // Get Logged-in User
    //
    // IMPORTANT:
    // Access scope is ALWAYS calculated from MongoDB.
    // Client cannot decide its own scope.
    // ========================================================

    const loggedInUser = await User.findOne({
      _id: payload.userId,
      isActive: true,
    })
      .select(
        "_id name designation district town unionCouncil ucmo supervisor teamNumber",
      )
      .lean();

    if (!loggedInUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Active user not found.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // Pagination
    // ========================================================

    const { searchParams } = new URL(request.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50,
    );

    const skip = (page - 1) * limit;

    // ========================================================
    // Search
    // ========================================================

    const search = searchParams.get("search")?.trim() || "";

    // ========================================================
    // Client Filters
    //
    // These filters are only additional filters.
    // They NEVER define the user's access scope.
    // ========================================================

    const campaign = searchParams.get("campaign");

    const district = searchParams.get("district");

    const town = searchParams.get("town");

    const unionCouncil = searchParams.get("unionCouncil");

    const ucmo = searchParams.get("ucmo");

    const supervisor = searchParams.get("supervisor");

    const teamNumberParam = searchParams.get("teamNumber");

    const vaccinationStatus = searchParams.get("vaccinationStatus");

    const clientStatus = searchParams.get("clientStatus");

    // ========================================================
    // Date Filters
    // ========================================================

    const recordDateFrom = searchParams.get("recordDateFrom");

    const recordDateTo = searchParams.get("recordDateTo");

    const visitDateFrom = searchParams.get("visitDateFrom");

    const visitDateTo = searchParams.get("visitDateTo");

    const coveredDateFrom = searchParams.get("coveredDateFrom");

    const coveredDateTo = searchParams.get("coveredDateTo");

    // ========================================================
    // Sorting
    // ========================================================

    const allowedSortFields = [
      "createdAt",
      "recordDate",
      "visitDate",
      "coveredDate",
      "childName",
      "fatherName",
      "age",
      "teamNumber",
    ];

    const requestedSortBy = searchParams.get("sortBy") || "createdAt";

    const sortBy = allowedSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : "createdAt";

    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // ========================================================
    // Base Query
    // ========================================================

    const query = {};

    // ========================================================
    // IMPORTANT:
    // ACCESS CONTROL
    //
    // Client filters can NEVER expand this scope.
    // ========================================================

    switch (loggedInUser.designation) {
      // ======================================================
      // WORKER
      //
      // Worker can see:
      // Team Leader + Team Member
      // of his own team.
      //
      // Scope is determined by:
      // supervisor + teamNumber
      //
      // We additionally use user IDs from DB so the access
      // remains tied to actual workers of that team.
      // ======================================================

      case "worker": {
        if (
          !loggedInUser.supervisor ||
          loggedInUser.teamNumber === null ||
          loggedInUser.teamNumber === undefined
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Worker is not properly assigned to a supervisor or team.",
            },
            {
              status: 400,
            },
          );
        }

        if (!isValidObjectId(loggedInUser.supervisor)) {
          return NextResponse.json(
            {
              success: false,
              message: "Worker has an invalid supervisor.",
            },
            {
              status: 400,
            },
          );
        }

        if (
          !Number.isInteger(loggedInUser.teamNumber) ||
          loggedInUser.teamNumber < 1
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Worker has an invalid teamNumber.",
            },
            {
              status: 400,
            },
          );
        }

        // ========================================================
        // HISTORICAL TEAM MEMBERS
        //
        // user       = worker who actually recorded Zerodose
        // teamLeader = Team Leader of this team at record time
        // teamMember = Team Member of this team at record time
        //
        // Both are resolved from MongoDB.
        // Client cannot send/change these values.
        // ========================================================

        // const teamWorkers = await User.find({
        //   designation: "worker",
        //   isActive: true,
        //   supervisor: supervisor,
        //   teamNumber: teamNumber,
        //   workerRole: {
        //     $in: ["teamLeader", "teamMember"],
        //   },
        // })
        //   .select("_id name workerRole")
        //   .lean();

        const teamWorkers = await User.find({
          designation: "worker",
          isActive: true,
          supervisor: loggedInUser.supervisor,
          teamNumber: loggedInUser.teamNumber,
          workerRole: {
            $in: ["teamLeader", "teamMember"],
          },
        })
          .select("_id name workerRole")
          .lean();

        const teamLeaderWorker = teamWorkers.find(
          (item) => item.workerRole === "teamLeader",
        );

        const teamMemberWorker = teamWorkers.find(
          (item) => item.workerRole === "teamMember",
        );

        // ========================================================
        // Validate Team Assignment
        // ========================================================

        if (!teamLeaderWorker) {
          return NextResponse.json(
            {
              success: false,
              message: "No active Team Leader found for this team.",
            },
            {
              status: 400,
            },
          );
        }

        if (!teamMemberWorker) {
          return NextResponse.json(
            {
              success: false,
              message: "No active Team Member found for this team.",
            },
            {
              status: 400,
            },
          );
        }

        // ========================================================
        // Safety Check
        // ========================================================
        //
        // Logged-in worker must actually belong to this team.
        // ========================================================

        const belongsToTeam =
          teamLeaderWorker._id.toString() === loggedInUser._id.toString() ||
          teamMemberWorker._id.toString() === loggedInUser._id.toString();

        if (!belongsToTeam) {
          return NextResponse.json(
            {
              success: false,
              message: "Worker does not belong to the assigned team.",
            },
            {
              status: 403,
            },
          );
        }

        const teamWorkerIds = teamWorkers.map((worker) => worker._id);

        // Include the logged-in user even if another worker
        // record has temporary assignment inconsistency.
        if (
          !teamWorkerIds.some(
            (id) => id.toString() === loggedInUser._id.toString(),
          )
        ) {
          teamWorkerIds.push(loggedInUser._id);
        }

        query.user = {
          $in: teamWorkerIds,
        };

        break;
      }

      // ======================================================
      // SUPERVISOR
      //
      // Supervisor sees Zerodose recorded by workers
      // belonging to this supervisor.
      // ======================================================

      case "supervisor": {
        query.supervisor = loggedInUser._id;

        break;
      }

      // ======================================================
      // UCMO
      //
      // UCMO sees Zerodose belonging to this UCMO.
      // ======================================================

      case "ucmo": {
        query.ucmo = loggedInUser._id;

        break;
      }

      // ======================================================
      // VACCINATOR
      //
      // Vaccinator gets all Zerodose of its own UC.
      //
      // Vaccinator will later have UPDATE access.
      // ======================================================

      case "vaccinator": {
        if (!loggedInUser.unionCouncil) {
          return NextResponse.json(
            {
              success: false,
              message: "Vaccinator is not assigned to a union council.",
            },
            {
              status: 400,
            },
          );
        }

        if (!isValidObjectId(loggedInUser.unionCouncil)) {
          return NextResponse.json(
            {
              success: false,
              message: "Vaccinator has an invalid union council.",
            },
            {
              status: 400,
            },
          );
        }

        query.unionCouncil = loggedInUser.unionCouncil;

        break;
      }

      // ======================================================
      // TOWN FP
      //
      // Future town-level designation.
      // ======================================================

      case "townFP": {
        if (!loggedInUser.town) {
          return NextResponse.json(
            {
              success: false,
              message: "Town FP is not assigned to a town.",
            },
            {
              status: 400,
            },
          );
        }

        if (!isValidObjectId(loggedInUser.town)) {
          return NextResponse.json(
            {
              success: false,
              message: "Town FP has an invalid town.",
            },
            {
              status: 400,
            },
          );
        }

        query.town = loggedInUser.town;

        break;
      }

      // ======================================================
      // DISTRICT FP
      //
      // Future district-level designation.
      // ======================================================

      case "districtfp": {
        if (!loggedInUser.district) {
          return NextResponse.json(
            {
              success: false,
              message: "District FP is not assigned to a district.",
            },
            {
              status: 400,
            },
          );
        }

        if (!isValidObjectId(loggedInUser.district)) {
          return NextResponse.json(
            {
              success: false,
              message: "District FP has an invalid district.",
            },
            {
              status: 400,
            },
          );
        }

        query.district = loggedInUser.district;

        break;
      }

      // ======================================================
      // ADMIN
      //
      // Admin can see everything.
      // ======================================================

      case "admin": {
        break;
      }

      // ======================================================
      // Other designations
      // ======================================================

      default: {
        return NextResponse.json(
          {
            success: false,
            message: "You do not have permission to view Zerodose records.",
          },
          {
            status: 403,
          },
        );
      }
    }

    // ========================================================
    // Validate Client ObjectId Filters
    // ========================================================

    const objectIdFields = [
      {
        value: campaign,
        name: "campaign",
      },
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
        value: ucmo,
        name: "ucmo",
      },
      {
        value: supervisor,
        name: "supervisor",
      },
    ];

    for (const field of objectIdFields) {
      if (field.value && !isValidObjectId(field.value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field.name}`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ========================================================
    // Additional Filters
    //
    // IMPORTANT:
    // These are AND filters.
    // They cannot expand the access scope created above.
    // ========================================================

    if (campaign) {
      query.campaign = campaign;
    }

    // --------------------------------------------------------
    // Location filters
    // --------------------------------------------------------

    if (district) {
      query.district = district;
    }

    if (town) {
      query.town = town;
    }

    if (unionCouncil) {
      query.unionCouncil = unionCouncil;
    }

    // --------------------------------------------------------
    // User filters
    // --------------------------------------------------------

    if (ucmo) {
      query.ucmo = ucmo;
    }

    if (supervisor) {
      query.supervisor = supervisor;
    }

    // --------------------------------------------------------
    // Team Number
    // --------------------------------------------------------

    if (teamNumberParam) {
      const teamNumber = Number(teamNumberParam);

      if (!Number.isInteger(teamNumber) || teamNumber < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid teamNumber",
          },
          {
            status: 400,
          },
        );
      }

      query.teamNumber = teamNumber;
    }

    // --------------------------------------------------------
    // Vaccination Status
    // --------------------------------------------------------

    if (vaccinationStatus) {
      const allowedStatuses = ["recorded", "visited", "covered"];

      if (!allowedStatuses.includes(vaccinationStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid vaccinationStatus",
          },
          {
            status: 400,
          },
        );
      }

      query.vaccinationStatus = vaccinationStatus;
    }

    // --------------------------------------------------------
    // Client Status
    // --------------------------------------------------------

    if (clientStatus) {
      const allowedClientStatuses = [
        "available",
        "refusal",
        "sick",
        "not_available",
        "deceased",
      ];

      if (!allowedClientStatuses.includes(clientStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid clientStatus",
          },
          {
            status: 400,
          },
        );
      }

      query.clientStatus = clientStatus;
    }

    // ========================================================
    // Search
    // ========================================================

    if (search) {
      const searchRegex = {
        $regex: search,
        $options: "i",
      };

      const [matchingUCMOs, matchingSupervisors] = await Promise.all([
        User.find({
          designation: "ucmo",
          isActive: true,
          name: searchRegex,
        })
          .select("_id")
          .lean(),

        User.find({
          designation: "supervisor",
          isActive: true,
          name: searchRegex,
        })
          .select("_id")
          .lean(),
      ]);

      const ucmoIds = matchingUCMOs.map((user) => user._id);
      const supervisorIds = matchingSupervisors.map((user) => user._id);

      query.$or = [
        {
          childName: searchRegex,
        },
        {
          fatherName: searchRegex,
        },
        {
          address: searchRegex,
        },
        {
          contactNo: searchRegex,
        },
        {
          ucmo: {
            $in: ucmoIds,
          },
        },
        {
          supervisor: {
            $in: supervisorIds,
          },
        },
      ];
    }

    // ========================================================
    // Date Range Helper
    // ========================================================

    const addDateRange = (field, from, to) => {
      if (!from && !to) {
        return;
      }

      const range = {};

      if (from) {
        const start = new Date(`${from}T00:00:00`);

        if (Number.isNaN(start.getTime())) {
          throw new Error(`Invalid ${field} from date`);
        }

        range.$gte = start;
      }

      if (to) {
        const end = new Date(`${to}T23:59:59.999`);

        if (Number.isNaN(end.getTime())) {
          throw new Error(`Invalid ${field} to date`);
        }

        range.$lte = end;
      }

      query[field] = range;
    };

    addDateRange("recordDate", recordDateFrom, recordDateTo);

    addDateRange("visitDate", visitDateFrom, visitDateTo);

    addDateRange("coveredDate", coveredDateFrom, coveredDateTo);

    // ========================================================
    // Count + Data
    // ========================================================

    const [total, data] = await Promise.all([
      Zerodose.countDocuments(query),

      Zerodose.find(query)
        .populate("campaign", "name year month startDate endDate isActive")
        .populate("district", "name code")
        .populate("town", "name code")
        .populate("unionCouncil", "name code")
        .populate("ucmo", "name contactNumber")
        .populate("supervisor", "name contactNumber supervisorCode")
        .populate(
          "user",
          "name contactNumber designation workerRole teamNumber",
        )
        .populate(
          "teamLeader",
          "name contactNumber designation workerRole teamNumber",
        )
        .populate(
          "teamMember",
          "name contactNumber designation workerRole teamNumber",
        )
        .sort({
          [sortBy]: sortOrder,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // ========================================================
    // Pagination
    // ========================================================

    const totalPages = Math.max(1, Math.ceil(total / limit));

    // ========================================================
    // Response
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        data,

        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch zerodose records",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST
// Create Zerodose
//
// ONLY WORKER CAN CREATE
// ============================================================

// export async function POST(request) {
//   try {
//     // ========================================================
//     // Authentication
//     // ========================================================

//     const token = request.cookies.get("auth_token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Not authenticated.",
//         },
//         {
//           status: 401,
//         },
//       );
//     }

//     let payload;

//     try {
//       const result = await jwtVerify(token, secret);

//       payload = result.payload;
//     } catch (error) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid or expired authentication.",
//         },
//         {
//           status: 401,
//         },
//       );
//     }

//     // ========================================================
//     // Database
//     // ========================================================

//     await connectDB();

//     // ========================================================
//     // Get Logged-in User
//     // ========================================================

//     const worker = await User.findOne({
//       _id: payload.userId,
//       designation: "worker",
//       isActive: true,
//     })
//       .select(
//         "_id name designation district town unionCouncil ucmo supervisor teamNumber workerRole",
//       )
//       .lean();

//     // ========================================================
//     // ONLY WORKER
//     // ========================================================

//     if (!worker) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only active workers can add Zerodose.",
//         },
//         {
//           status: 403,
//         },
//       );
//     }

//     // ========================================================
//     // Worker Assignment
//     // ========================================================

//     const { district, town, unionCouncil, ucmo, supervisor, teamNumber } =
//       worker;

//     if (
//       !district ||
//       !town ||
//       !unionCouncil ||
//       !ucmo ||
//       !supervisor ||
//       teamNumber === null ||
//       teamNumber === undefined
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Worker is not properly assigned to district, town, union council, UCMO, supervisor or team.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Validate Assignment IDs
//     // ========================================================

//     const workerIds = [
//       {
//         value: district,
//         name: "district",
//       },
//       {
//         value: town,
//         name: "town",
//       },
//       {
//         value: unionCouncil,
//         name: "unionCouncil",
//       },
//       {
//         value: ucmo,
//         name: "ucmo",
//       },
//       {
//         value: supervisor,
//         name: "supervisor",
//       },
//     ];

//     for (const field of workerIds) {
//       if (!isValidObjectId(field.value)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Worker has an invalid ${field.name}.`,
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ========================================================
//     // Validate Team Number
//     // ========================================================

//     if (!Number.isInteger(teamNumber) || teamNumber < 1) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Worker has an invalid teamNumber.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Current Campaign
//     // ========================================================

//     const now = new Date();

//     const currentCampaign = await Campaign.findOne({
//       startDate: {
//         $lte: now,
//       },
//       endDate: {
//         $gte: now,
//       },
//     })
//       .select("_id name year month startDate endDate")
//       .sort({
//         startDate: -1,
//       })
//       .lean();

//     if (!currentCampaign) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Zerodose can only be added during an active campaign.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Request Body
//     //
//     // Client ONLY sends:
//     // childName
//     // fatherName
//     // age
//     // address
//     // contactNo
//     // day
//     // location
//     //
//     // Assignment information comes from MongoDB.
//     // ========================================================

//     const body = await request.json();

//     const { childName, fatherName, age, address, contactNo, day, location } =
//       body;

//     // ========================================================
//     // Required Fields
//     // ========================================================

//     const requiredFields = [
//       "childName",
//       "fatherName",
//       "age",
//       "address",
//       "day",
//       "location",
//     ];

//     for (const field of requiredFields) {
//       if (
//         body[field] === undefined ||
//         body[field] === null ||
//         body[field] === ""
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `${field} is required.`,
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ========================================================
//     // Child Name
//     // ========================================================

//     if (typeof childName !== "string" || !childName.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid child name is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Father Name
//     // ========================================================

//     if (typeof fatherName !== "string" || !fatherName.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid father name is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Age
//     // ========================================================

//     if (typeof age !== "number" || age < 0 || age > 59) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Age must be a number between 0 and 59.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Address
//     // ========================================================

//     if (typeof address !== "string" || !address.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid address is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Day
//     // ========================================================

//     const campaignDays =
//       Math.floor((campaignEnd - campaignStart) / (1000 * 60 * 60 * 24)) + 1;

//     if (!Number.isInteger(day) || day < 1 || day > campaignDays) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Invalid campaign day. Valid days are 1 to ${campaignDays}.`,
//         },
//         { status: 400 },
//       );
//     }

//     // ========================================================
//     // Contact Number
//     // ========================================================

//     if (contactNo !== undefined && contactNo !== "") {
//       if (
//         typeof contactNo !== "string" ||
//         !/^03\d{9}$/.test(contactNo.trim())
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Please enter a valid Pakistani mobile number.",
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ========================================================
//     // Location
//     // ========================================================

//     if (
//       !location ||
//       typeof location.latitude !== "number" ||
//       typeof location.longitude !== "number"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid latitude and longitude are required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // GPS Validation
//     // ========================================================

//     if (location.latitude < -90 || location.latitude > 90) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid latitude.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (location.longitude < -180 || location.longitude > 180) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid longitude.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Create Zerodose
//     //
//     // EVERYTHING related to assignment comes from DB.
//     //
//     // user = exact worker who recorded it.
//     // ========================================================

//     const zerodose = await Zerodose.create({
//       // ------------------------------------------------------
//       // Campaign
//       // ------------------------------------------------------

//       campaign: currentCampaign._id,

//       // ------------------------------------------------------
//       // Exact Worker Who Recorded Zerodose
//       // ------------------------------------------------------

//       user: worker._id,

//       // ------------------------------------------------------
//       // Team Snapshot
//       // ------------------------------------------------------

//       teamLeader: teamLeaderWorker._id,

//       teamMember: teamMemberWorker._id,

//       teamNumber,

//       // ------------------------------------------------------
//       // Assignment Snapshot
//       // ------------------------------------------------------

//       district,

//       town,

//       unionCouncil,

//       ucmo,

//       supervisor,

//       // ------------------------------------------------------
//       // Child Information
//       // ------------------------------------------------------

//       childName: childName.trim(),

//       fatherName: fatherName.trim(),

//       age,

//       address: address.trim(),

//       contactNo: contactNo?.trim() || undefined,

//       // ------------------------------------------------------
//       // Campaign Day
//       // ------------------------------------------------------

//       day,

//       // ------------------------------------------------------
//       // Dates
//       // ------------------------------------------------------

//       recordDate: new Date(),

//       visitDate: null,

//       coveredDate: null,

//       // ------------------------------------------------------
//       // GPS
//       // ------------------------------------------------------

//       location: {
//         latitude: location.latitude,
//         longitude: location.longitude,
//       },

//       // ------------------------------------------------------
//       // Initial Status
//       // ------------------------------------------------------

//       clientStatus: null,

//       vaccinationStatus: "recorded",
//     });

//     // ========================================================
//     // Populate Created Document
//     // ========================================================

//     await zerodose.populate([
//       {
//         path: "campaign",
//         select: "name year month startDate endDate isActive",
//       },
//       {
//         path: "district",
//         select: "name code",
//       },
//       {
//         path: "town",
//         select: "name code",
//       },
//       {
//         path: "unionCouncil",
//         select: "name code",
//       },
//       {
//         path: "ucmo",
//         select: "name contactNumber",
//       },
//       {
//         path: "supervisor",
//         select: "name contactNumber supervisorCode",
//       },
//       {
//         path: "user",
//         select: "name contactNumber designation workerRole teamNumber",
//       },
//       {
//         path: "teamLeader",
//         select: "name contactNumber designation workerRole teamNumber",
//       },
//       {
//         path: "teamMember",
//         select: "name contactNumber designation workerRole teamNumber",
//       },
//     ]);

//     // ========================================================
//     // Response
//     // ========================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message: "Zerodose recorded successfully.",

//         data: zerodose,
//       },
//       {
//         status: 201,
//       },
//     );
//   } catch (error) {
//     console.error("Create zerodose error:", error);

//     // ========================================================
//     // Mongoose Validation Error
//     // ========================================================

//     if (error?.name === "ValidationError") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: Object.values(error.errors)
//             .map((item) => item.message)
//             .join(", "),
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Duplicate Key
//     // ========================================================

//     if (error?.code === 11000) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Duplicate Zerodose record.",
//         },
//         {
//           status: 409,
//         },
//       );
//     }

//     // ========================================================
//     // Invalid ObjectId
//     // ========================================================

//     if (error instanceof mongoose.Error.CastError) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid data provided.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Server Error
//     // ========================================================

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to create Zerodose.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// ============================================================
// POST
// Create Zerodose
//
// ONLY WORKER
// ============================================================

// export async function POST(request) {
//   try {
//     // ========================================================
//     // Database
//     // ========================================================

//     await connectDB();

//     // ========================================================
//     // Authentication
//     // ========================================================

//     const auth = await getAuthenticatedUser(request);

//     if (auth.error) {
//       return auth.error;
//     }

//     const user = auth.user;

//     // ========================================================
//     // ONLY WORKER CAN CREATE
//     // ========================================================

//     if (user.designation !== "worker") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only workers can add Zerodose.",
//         },
//         {
//           status: 403,
//         },
//       );
//     }

//     // ========================================================
//     // Worker Assignment
//     // ========================================================

//     const { district, town, unionCouncil, ucmo, supervisor, teamNumber } = user;

//     if (
//       !district ||
//       !town ||
//       !unionCouncil ||
//       !ucmo ||
//       !supervisor ||
//       teamNumber === null ||
//       teamNumber === undefined
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Worker is not properly assigned to district, town, union council, UCMO, supervisor or team.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Validate Assignment IDs
//     // ========================================================

//     const workerIds = [
//       {
//         value: district,
//         name: "district",
//       },
//       {
//         value: town,
//         name: "town",
//       },
//       {
//         value: unionCouncil,
//         name: "unionCouncil",
//       },
//       {
//         value: ucmo,
//         name: "ucmo",
//       },
//       {
//         value: supervisor,
//         name: "supervisor",
//       },
//     ];

//     for (const field of workerIds) {
//       if (!isValidObjectId(field.value)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Worker has an invalid ${field.name}.`,
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ========================================================
//     // Validate Team Number
//     // ========================================================

//     if (!Number.isInteger(teamNumber) || teamNumber < 1) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Worker has an invalid teamNumber.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Current Campaign
//     // ========================================================

//     const now = new Date();

//     const currentCampaign = await Campaign.findOne({
//       isActive: true,
//       startDate: {
//         $lte: now,
//       },
//       endDate: {
//         $gte: now,
//       },
//     })
//       .select("_id name year month startDate endDate isActive")
//       .sort({
//         startDate: -1,
//       })
//       .lean();

//     if (!currentCampaign) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Zerodose can only be added during an active campaign.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Campaign Day
//     // ========================================================
//     //
//     // Day 1 = campaign start date
//     // Day 2 = next day
//     // etc.
//     //
//     // ========================================================

//     const campaignStart = new Date(currentCampaign.startDate);

//     campaignStart.setHours(0, 0, 0, 0);

//     const recordDay = new Date(now);

//     recordDay.setHours(0, 0, 0, 0);

//     const day =
//       Math.floor(
//         (recordDay.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24),
//       ) + 1;

//     if (day < 1) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid campaign day.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Request Body
//     // ========================================================

//     const body = await request.json();

//     const { childName, fatherName, age, address, contactNo, location } = body;

//     // ========================================================
//     // Required Fields
//     // ========================================================

//     const requiredFields = [
//       "childName",
//       "fatherName",
//       "age",
//       "address",
//       "location",
//     ];

//     for (const field of requiredFields) {
//       if (
//         body[field] === undefined ||
//         body[field] === null ||
//         body[field] === ""
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `${field} is required.`,
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ========================================================
//     // Child Name
//     // ========================================================

//     if (typeof childName !== "string" || !childName.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid child name is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Father Name
//     // ========================================================

//     if (typeof fatherName !== "string" || !fatherName.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid father name is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Age
//     // ========================================================

//     if (
//       typeof age !== "number" ||
//       !Number.isInteger(age) ||
//       age < 0 ||
//       age > 59
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Age must be an integer between 0 and 59.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Address
//     // ========================================================

//     if (typeof address !== "string" || !address.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid address is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Contact Number
//     // ========================================================

//     if (contactNo !== undefined && contactNo !== null && contactNo !== "") {
//       if (
//         typeof contactNo !== "string" ||
//         !/^03\d{9}$/.test(contactNo.trim())
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Please enter a valid Pakistani mobile number.",
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ========================================================
//     // Location
//     // ========================================================

//     if (
//       !location ||
//       typeof location.latitude !== "number" ||
//       typeof location.longitude !== "number"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid latitude and longitude are required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // GPS Validation
//     // ========================================================

//     if (location.latitude < -90 || location.latitude > 90) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid latitude.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (location.longitude < -180 || location.longitude > 180) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid longitude.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // CREATE ZEROdose
//     // ========================================================
//     //
//     // IMPORTANT:
//     // user = logged-in worker ID
//     //
//     // Client cannot send/override:
//     //
//     // campaign
//     // district
//     // town
//     // unionCouncil
//     // ucmo
//     // supervisor
//     // teamNumber
//     // user
//     // day
//     //
//     // ========================================================

//     const zerodose = await Zerodose.create({
//       // Campaign
//       campaign: currentCampaign._id,

//       // Worker
//       user: user._id,

//       // Worker assignment snapshot
//       district: district,
//       town: town,
//       unionCouncil: unionCouncil,

//       ucmo,
//       supervisor,
//       teamNumber,

//       // Campaign day
//       day,

//       // Child information
//       childName: childName.trim(),

//       fatherName: fatherName.trim(),

//       age,

//       address: address.trim(),

//       contactNo: contactNo?.trim() || undefined,

//       // Dates
//       recordDate: new Date(),

//       visitDate: null,

//       coveredDate: null,

//       // GPS
//       location: {
//         latitude: location.latitude,

//         longitude: location.longitude,
//       },

//       // Initial status
//       clientStatus: null,

//       vaccinationStatus: "recorded",
//     });

//     // ========================================================
//     // Populate
//     // ========================================================

//     await zerodose.populate([
//       {
//         path: "campaign",
//         select: "name year month startDate endDate isActive",
//       },
//       {
//         path: "district",
//         select: "name code",
//       },
//       {
//         path: "town",
//         select: "name code",
//       },
//       {
//         path: "unionCouncil",
//         select: "name code",
//       },
//       {
//         path: "ucmo",
//         select: "name contactNumber",
//       },
//       {
//         path: "supervisor",
//         select: "name contactNumber supervisorCode",
//       },
//       {
//         path: "user",
//         select: "name contactNumber designation",
//       },
//     ]);

//     // ========================================================
//     // Response
//     // ========================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message: "Zerodose recorded successfully.",

//         data: zerodose,
//       },
//       {
//         status: 201,
//       },
//     );
//   } catch (error) {
//     console.error("Create zerodose error:", error);

//     // ========================================================
//     // Mongoose Validation Error
//     // ========================================================

//     if (error?.name === "ValidationError") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: Object.values(error.errors)
//             .map((item) => item.message)
//             .join(", "),
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Duplicate Key
//     // ========================================================

//     if (error?.code === 11000) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Duplicate Zerodose record.",
//         },
//         {
//           status: 409,
//         },
//       );
//     }

//     // ========================================================
//     // Invalid ObjectId
//     // ========================================================

//     if (error instanceof mongoose.Error.CastError) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid data provided.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ========================================================
//     // Server Error
//     // ========================================================

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to create zerodose.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }
