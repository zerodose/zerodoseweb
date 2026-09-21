
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

// ============================================================
// JWT SECRET
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

// ============================================================
// GET AUTHENTICATED USER
// ============================================================

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

    const user = await User.findOne({
      _id: payload.userId,
      isActive: true,
    }).lean();

    return user || null;
  } catch (error) {
    console.error("GET AUTH USER ERROR:", error);
    return null;
  }
}

// ============================================================
// GET
// ============================================================

export async function GET(request) {
  try {
    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // AUTHENTICATED USER
    // ========================================================

    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // QUERY PARAMS
    // ========================================================

    const { searchParams } = new URL(request.url);

    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    // --------------------------------------------------------
    // GENERAL FILTERS
    // --------------------------------------------------------

    const search = searchParams.get("search")?.trim();

    const campaign = searchParams.get("campaign")?.trim();
    const district = searchParams.get("district")?.trim();
    const town = searchParams.get("town")?.trim();
    const unionCouncil = searchParams.get("unionCouncil")?.trim();

    const ucmo = searchParams.get("ucmo")?.trim();
    const supervisor = searchParams.get("supervisor")?.trim();
    const user = searchParams.get("user")?.trim();

    const teamLeader = searchParams.get("teamLeader")?.trim();
    const teamMember = searchParams.get("teamMember")?.trim();
    const vaccinator = searchParams.get("vaccinator")?.trim();

    const teamNumberParam = searchParams.get("teamNumber")?.trim();

    const vaccinationStatus = searchParams.get("vaccinationStatus")?.trim();

    const clientStatus = searchParams.get("clientStatus")?.trim();

    const gender = searchParams.get("gender")?.trim();

    // --------------------------------------------------------
    // DATE FILTERS
    // --------------------------------------------------------

    const recordDateFrom = searchParams.get("recordDateFrom")?.trim();

    const recordDateTo = searchParams.get("recordDateTo")?.trim();

    const visitDateFrom = searchParams.get("visitDateFrom")?.trim();

    const visitDateTo = searchParams.get("visitDateTo")?.trim();

    const coveredDateFrom = searchParams.get("coveredDateFrom")?.trim();

    const coveredDateTo = searchParams.get("coveredDateTo")?.trim();

    // --------------------------------------------------------
    // SORTING
    // --------------------------------------------------------

    const sortBy = searchParams.get("sortBy")?.trim() || "createdAt";

    const sortOrder =
      searchParams.get("sortOrder")?.trim()?.toLowerCase() === "asc" ? 1 : -1;

    // ========================================================
    // MAIN FILTER
    // ========================================================

    const filter = {};

    // ========================================================
    // AUTH USER DESIGNATION
    // ========================================================

    const designation = String(authUser.designation || "")
      .trim()
      .toLowerCase();

    // ========================================================
    // AUTH USER IDs / SCOPE VALUES
    // ========================================================

    /*
     * These helpers support both:
     *
     * authUser.unionCouncil = ObjectId
     *
     * OR
     *
     * authUser.unionCouncil = { _id: ObjectId }
     *
     * OR
     *
     * authUser.unionCouncilId = ObjectId
     */

    const ownSupervisorId =
      authUser.supervisor?._id ||
      authUser.supervisor ||
      authUser.supervisorId ||
      null;

    const ownUnionCouncilId =
      authUser.unionCouncil?._id ||
      authUser.unionCouncil ||
      authUser.unionCouncilId ||
      null;

    const ownTownId =
      authUser.town?._id || authUser.town || authUser.townId || null;

    // ========================================================
    // VALIDATE SCOPE IDS
    // ========================================================

    const hasValidSupervisorId =
      ownSupervisorId && mongoose.Types.ObjectId.isValid(ownSupervisorId);

    const hasValidUnionCouncilId =
      ownUnionCouncilId && mongoose.Types.ObjectId.isValid(ownUnionCouncilId);

    const hasValidTownId =
      ownTownId && mongoose.Types.ObjectId.isValid(ownTownId);

    // ========================================================
    // AUTHORIZATION / DATA SCOPE
    // ========================================================

    /*
     * IMPORTANT:
     *
     * Scope is applied FIRST and is NEVER allowed to be
     * overwritten by frontend query parameters.
     *
     * worker
     *   -> own supervisor + own team
     *
     * supervisor
     *   -> own supervisor ID
     *
     * vaccinator / otherStaff / ucmo
     *   -> own UC
     *
     * townfp
     *   -> own town
     */

    switch (designation) {
      // ======================================================
      // WORKER
      // ======================================================

      case "worker": {
        const workerTeamNumber = Number(authUser.teamNumber);

        if (
          !hasValidSupervisorId ||
          authUser.teamNumber === undefined ||
          authUser.teamNumber === null ||
          authUser.teamNumber === "" ||
          !Number.isFinite(workerTeamNumber)
        ) {
          filter._id = {
            $in: [],
          };

          break;
        }

        filter.supervisor = ownSupervisorId;
        filter.teamNumber = workerTeamNumber;

        break;
      }

      // ======================================================
      // SUPERVISOR
      // ======================================================

      case "supervisor": {
        if (!authUser._id || !mongoose.Types.ObjectId.isValid(authUser._id)) {
          filter._id = {
            $in: [],
          };

          break;
        }

        filter.supervisor = authUser._id;

        break;
      }

      // ======================================================
      // UCMO
      // VACCINATOR
      // OTHER STAFF
      // ======================================================

      case "ucmo":
      case "vaccinator":
      case "otherstaff": {
        if (!hasValidUnionCouncilId) {
          filter._id = {
            $in: [],
          };

          break;
        }

        filter.unionCouncil = ownUnionCouncilId;

        break;
      }

      // ======================================================
      // TOWN FP
      // ======================================================

      case "townfp": {
        if (!hasValidTownId) {
          filter._id = {
            $in: [],
          };

          break;
        }

        filter.town = ownTownId;

        break;
      }

      // ======================================================
      // ADMIN / SUPERADMIN / OTHER UNRESTRICTED ROLES
      // ======================================================

      default: {
        // Existing unrestricted behavior preserved.
        break;
      }
    }

    // ========================================================
    // CAMPAIGN FILTER
    // ========================================================

    if (campaign) {
      if (!mongoose.Types.ObjectId.isValid(campaign)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid campaign ID",
          },
          {
            status: 400,
          },
        );
      }

      filter.campaign = campaign;
    }

    // ========================================================
    // DISTRICT FILTER
    // ========================================================

    if (district) {
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid district ID",
          },
          {
            status: 400,
          },
        );
      }

      filter.district = district;
    }

    // ========================================================
    // TOWN FILTER
    // ========================================================

    if (town) {
      if (!mongoose.Types.ObjectId.isValid(town)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid town ID",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * townfp cannot switch to another town.
       */

      if (designation === "townfp") {
        if (!hasValidTownId || String(town) !== String(ownTownId)) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not authorized to access this town",
            },
            {
              status: 403,
            },
          );
        }

        // Keep server-side scope.
        filter.town = ownTownId;
      } else {
        filter.town = town;
      }
    }

    // ========================================================
    // UNION COUNCIL FILTER
    // ========================================================

    if (unionCouncil) {
      if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid union council ID",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * UC-scoped designations cannot switch UC.
       */

      if (
        designation === "ucmo" ||
        designation === "vaccinator" ||
        designation === "otherstaff"
      ) {
        if (
          !hasValidUnionCouncilId ||
          String(unionCouncil) !== String(ownUnionCouncilId)
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not authorized to access this union council",
            },
            {
              status: 403,
            },
          );
        }

        // Keep server-side scope.
        filter.unionCouncil = ownUnionCouncilId;
      } else {
        filter.unionCouncil = unionCouncil;
      }
    }

    // ========================================================
    // UCMO FILTER
    // ========================================================

    // ========================================================
    // UCMO FILTER
    // ========================================================

    if (ucmo) {
      if (!mongoose.Types.ObjectId.isValid(ucmo)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid UCMO ID",
          },
          {
            status: 400,
          },
        );
      }

      // --------------------------------------------------------
      // UC-scoped users must NEVER use UCMO as their data scope.
      //
      // Their data scope is always:
      //     unionCouncil = authUser.unionCouncil
      //
      // Therefore a Vaccinator/UCMO/OtherStaff request containing
      // ?ucmo=... is rejected instead of changing/narrowing scope.
      // --------------------------------------------------------

      if (
        designation === "ucmo" ||
        designation === "vaccinator" ||
        designation === "otherstaff"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "UCMO filter is not allowed for your designation",
          },
          {
            status: 403,
          },
        );
      }

      filter.ucmo = ucmo;
    }

    // ========================================================
    // SUPERVISOR FILTER
    // ========================================================

    if (supervisor) {
      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid supervisor ID",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * Worker:
       *   Cannot access another supervisor.
       *
       * Supervisor:
       *   Cannot access another supervisor.
       */

      if (designation === "worker" || designation === "supervisor") {
        if (!hasValidSupervisorId && designation === "worker") {
          return NextResponse.json(
            {
              success: false,
              message: "Supervisor scope is not configured",
            },
            {
              status: 403,
            },
          );
        }

        const expectedSupervisorId =
          designation === "supervisor" ? authUser._id : ownSupervisorId;

        if (
          !expectedSupervisorId ||
          !mongoose.Types.ObjectId.isValid(expectedSupervisorId) ||
          String(supervisor) !== String(expectedSupervisorId)
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not authorized to access this supervisor",
            },
            {
              status: 403,
            },
          );
        }

        // Keep server-side scope.
        filter.supervisor = expectedSupervisorId;
      } else {
        filter.supervisor = supervisor;
      }
    }

    // ========================================================
    // USER FILTER
    // ========================================================

    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid user ID",
          },
          {
            status: 400,
          },
        );
      }

      filter.user = user;
    }

    // ========================================================
    // TEAM LEADER FILTER
    // ========================================================

    if (teamLeader) {
      if (!mongoose.Types.ObjectId.isValid(teamLeader)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid team leader ID",
          },
          {
            status: 400,
          },
        );
      }

      filter.teamLeader = teamLeader;
    }

    // ========================================================
    // TEAM MEMBER FILTER
    // ========================================================

    if (teamMember) {
      if (!mongoose.Types.ObjectId.isValid(teamMember)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid team member ID",
          },
          {
            status: 400,
          },
        );
      }

      filter.teamMember = teamMember;
    }

    // ========================================================
    // VACCINATOR FILTER
    // ========================================================

    if (vaccinator) {
      if (!mongoose.Types.ObjectId.isValid(vaccinator)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid vaccinator ID",
          },
          {
            status: 400,
          },
        );
      }

      filter.vaccinator = vaccinator;
    }

    // ========================================================
    // TEAM NUMBER FILTER
    // ========================================================

    if (teamNumberParam) {
      const parsedTeamNumber = Number(teamNumberParam);

      if (!Number.isFinite(parsedTeamNumber)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid team number",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * Worker cannot switch to another team.
       */

      if (designation === "worker") {
        const ownTeamNumber = Number(authUser.teamNumber);

        if (
          !Number.isFinite(ownTeamNumber) ||
          parsedTeamNumber !== ownTeamNumber
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not authorized to access this team",
            },
            {
              status: 403,
            },
          );
        }

        // Keep server-side scope.
        filter.teamNumber = ownTeamNumber;
      } else {
        filter.teamNumber = parsedTeamNumber;
      }
    }

    // ========================================================
    // VACCINATION STATUS
    // ========================================================

    if (vaccinationStatus) {
      filter.vaccinationStatus = vaccinationStatus;
    }

    // ========================================================
    // CLIENT STATUS
    // ========================================================

    if (clientStatus) {
      filter.clientStatus = clientStatus;
    }

    // ========================================================
    // GENDER
    // ========================================================

    if (gender) {
      filter.gender = gender;
    }

    // ========================================================
    // RECORD DATE FILTER
    // ========================================================

    if (recordDateFrom || recordDateTo) {
      filter.recordDate = {};

      if (recordDateFrom) {
        const fromDate = new Date(recordDateFrom);

        if (Number.isNaN(fromDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid recordDateFrom",
            },
            {
              status: 400,
            },
          );
        }

        filter.recordDate.$gte = fromDate;
      }

      if (recordDateTo) {
        const toDate = new Date(recordDateTo);

        if (Number.isNaN(toDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid recordDateTo",
            },
            {
              status: 400,
            },
          );
        }

        // Include the complete selected day.
        toDate.setHours(23, 59, 59, 999);

        filter.recordDate.$lte = toDate;
      }
    }

    // ========================================================
    // VISIT DATE FILTER
    // ========================================================

    if (visitDateFrom || visitDateTo) {
      filter.visitDate = {};

      if (visitDateFrom) {
        const fromDate = new Date(visitDateFrom);

        if (Number.isNaN(fromDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid visitDateFrom",
            },
            {
              status: 400,
            },
          );
        }

        filter.visitDate.$gte = fromDate;
      }

      if (visitDateTo) {
        const toDate = new Date(visitDateTo);

        if (Number.isNaN(toDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid visitDateTo",
            },
            {
              status: 400,
            },
          );
        }

        // Include the complete selected day.
        toDate.setHours(23, 59, 59, 999);

        filter.visitDate.$lte = toDate;
      }
    }

    // ========================================================
    // COVERED DATE FILTER
    // ========================================================

    if (coveredDateFrom || coveredDateTo) {
      filter.coveredDate = {};

      if (coveredDateFrom) {
        const fromDate = new Date(coveredDateFrom);

        if (Number.isNaN(fromDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid coveredDateFrom",
            },
            {
              status: 400,
            },
          );
        }

        filter.coveredDate.$gte = fromDate;
      }

      if (coveredDateTo) {
        const toDate = new Date(coveredDateTo);

        if (Number.isNaN(toDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid coveredDateTo",
            },
            {
              status: 400,
            },
          );
        }

        // Include the complete selected day.
        toDate.setHours(23, 59, 59, 999);

        filter.coveredDate.$lte = toDate;
      }
    }

    // ========================================================
    // SEARCH
    // ========================================================

    if (search) {
      /*
       * Search User collection for names, emails, contact,
       * supervisor codes etc.
       */

      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

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

      const matchingUserIds = matchingUsers.map((item) => item._id);

      filter.$or = [
        { childName: searchRegex },
        { fatherName: searchRegex },
        { address: searchRegex },
        { contactNo: searchRegex },
        { qrCode: searchRegex },
      ];

      if (matchingUserIds.length > 0) {
        filter.$or.push(
          { user: { $in: matchingUserIds } },
          { ucmo: { $in: matchingUserIds } },
          { supervisor: { $in: matchingUserIds } },
          { teamLeader: { $in: matchingUserIds } },
          { teamMember: { $in: matchingUserIds } },
          { vaccinator: { $in: matchingUserIds } },
        );
      }
    }

    // ========================================================
    // SORT
    // ========================================================

    const sort = {
      [sortBy]: sortOrder,
    };

    // ========================================================
    // FETCH DATA
    // ========================================================

    const data = await Zerodose.find(filter)
      // ------------------------------------------------------
      // CAMPAIGN
      // ------------------------------------------------------
      .populate("campaign", "name year month startDate endDate")

      // ------------------------------------------------------
      // DISTRICT
      // ------------------------------------------------------
      .populate("district", "name code")

      // ------------------------------------------------------
      // TOWN
      // ------------------------------------------------------
      .populate("town", "name code")

      // ------------------------------------------------------
      // UNION COUNCIL
      // ------------------------------------------------------
      .populate("unionCouncil", "name code")

      // ------------------------------------------------------
      // UCMO
      // ------------------------------------------------------
      .populate("ucmo", "name email contactNumber designation")

      // ------------------------------------------------------
      // SUPERVISOR
      // ------------------------------------------------------
      .populate(
        "supervisor",
        "name email contactNumber designation supervisorCode",
      )

      // ------------------------------------------------------
      // USER
      // ------------------------------------------------------
      .populate("user", "name email contactNumber designation")

      // ------------------------------------------------------
      // TEAM LEADER
      // ------------------------------------------------------
      .populate("teamLeader", "name email contactNumber designation")

      // ------------------------------------------------------
      // TEAM MEMBER
      // ------------------------------------------------------
      .populate("teamMember", "name email contactNumber designation")

      // ------------------------------------------------------
      // VACCINATOR
      // ------------------------------------------------------
      .populate("vaccinator", "name email contactNumber designation")

      // ------------------------------------------------------
      // SORT / PAGINATION
      // ------------------------------------------------------

      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // ========================================================
    // TOTAL COUNT
    // ========================================================

    const total = await Zerodose.countDocuments(filter);

    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    // ========================================================
    // RESPONSE
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
    console.error("GET ZERODOSE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Zerodose records",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
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

    const supervisorCode = Number(supervisorUser.supervisorCode);

    if (
      supervisorUser.supervisorCode === undefined ||
      supervisorUser.supervisorCode === null ||
      supervisorUser.supervisorCode === "" ||
      !Number.isInteger(supervisorCode) ||
      supervisorCode < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Assigned supervisor has an invalid supervisor code",
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

    const currentWorker = teamWorkers.find(
      (worker) => worker._id.toString() === userId.toString(),
    );

    if (!currentWorker) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker does not belong to the assigned team",
        },
        { status: 400 },
      );
    }

    const teamLeaderUser =
      currentWorker.workerRole === "teamLeader"
        ? currentWorker
        : teamWorkers.find((worker) => worker.workerRole === "teamLeader");

    const teamMemberUser =
      currentWorker.workerRole === "teamMember"
        ? currentWorker
        : teamWorkers.find((worker) => worker.workerRole === "teamMember");

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
      supervisorCode: supervisorCode,
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
