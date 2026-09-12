import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import Campaign from "@/models/Campaign";

// ============================================================
// GET UCMO SUMMARY
//
// Backend automatically identifies authenticated UCMO
// from auth_token.
//
// No ucmoId is accepted from frontend.
// ============================================================

export async function GET(request) {
  try {
    await connectDB();

    // ==========================================================
    // AUTHENTICATED USER
    // ==========================================================

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    let decoded;

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      const verified = await jwtVerify(token, secret);

      decoded = verified.payload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication token.",
        },
        { status: 401 },
      );
    }

    const userId =
      decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authenticated user.",
        },
        { status: 401 },
      );
    }

    const authUser = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      isActive: true,
    })
      .select("_id name designation unionCouncil district town")
      .lean();

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Authenticated user not found or inactive.",
        },
        { status: 401 },
      );
    }

    // ==========================================================
    // ONLY UCMO CAN ACCESS THIS SUMMARY
    // ==========================================================

    const designation = String(authUser.designation || "").toLowerCase();

    if (designation !== "vaccinator" && designation !== "ucmo") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only UCMO, Vaccinators, and Other Staff users can access this summary.",
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // AUTHENTICATED UCMO'S UNION COUNCIL
    // ==========================================================

    const unionCouncilId = authUser.unionCouncil?._id || authUser.unionCouncil;

    if (!unionCouncilId || !mongoose.Types.ObjectId.isValid(unionCouncilId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authenticated UCMO is not assigned to a valid Union Council.",
        },
        { status: 400 },
      );
    }

    const unionCouncilObjectId = new mongoose.Types.ObjectId(unionCouncilId);

    // ==========================================================
    // ACTIVE APPROVED SUPERVISORS
    //
    // IMPORTANT:
    // Supervisors are restricted to this authenticated UCMO.
    // ==========================================================

    const supervisors = await User.find({
      designation: "supervisor",
      unionCouncil: authUser.unionCouncil._id || authUser.unionCouncil,
      isActive: true,
      approvalStatus: "approved",
    })
      .select("_id name supervisorCode code")
      .sort({ name: 1 })
      .lean();

    const supervisorIds = supervisors.map((supervisor) => supervisor._id);

    const totalSupervisors = supervisors.length;

    // ==========================================================
    // ACTIVE TEAMS
    //
    // A team is counted only when:
    // 1. teamNumber exists
    // 2. teamLeader exists
    // 3. teamMember exists
    // 4. users are active
    //
    // Team identity:
    // supervisor + teamNumber
    // ==========================================================

    let activeTeams = 0;

    if (supervisorIds.length) {
      const activeWorkers = await User.find({
        designation: "worker",
        supervisor: {
          $in: supervisorIds,
        },
        isActive: true,
        teamNumber: {
          $exists: true,
          $nin: [null, ""],
        },
        workerRole: {
          $in: ["teamLeader", "teamMember"],
        },
      })
        .select("supervisor teamNumber workerRole")
        .lean();

      const teamMap = new Map();

      activeWorkers.forEach((worker) => {
        const supervisorId = String(worker.supervisor);

        const teamNumber = String(worker.teamNumber).trim();

        if (!teamNumber) {
          return;
        }

        const teamKey = `${supervisorId}_${teamNumber}`;

        if (!teamMap.has(teamKey)) {
          teamMap.set(teamKey, {
            teamLeader: false,
            teamMember: false,
          });
        }

        const team = teamMap.get(teamKey);

        if (worker.workerRole === "teamLeader") {
          team.teamLeader = true;
        }

        if (worker.workerRole === "teamMember") {
          team.teamMember = true;
        }
      });

      for (const team of teamMap.values()) {
        if (team.teamLeader && team.teamMember) {
          activeTeams += 1;
        }
      }
    }

    // ==========================================================
    // CURRENT CAMPAIGN
    // ==========================================================

    const now = new Date();

    const currentCampaign = await Campaign.findOne({
      startDate: {
        $lte: now,
      },
      endDate: {
        $gte: now,
      },
    })
      .sort({
        startDate: -1,
      })
      .select("_id name startDate endDate")
      .lean();

    // ==========================================================
    // DEFAULT SUPERVISOR SUMMARY
    //
    // Even if there is no current campaign, supervisors
    // are still returned with zero counts.
    // ==========================================================

    const supervisorSummary = supervisors.map((supervisor) => ({
      supervisorId: supervisor._id,
      supervisorName: supervisor.name || "-",
      supervisorCode: supervisor.supervisorCode || supervisor.code || "-",
      totalTeams: 0,
      recorded: 0,
      visited: 0,
      covered: 0,
    }));

    // ==========================================================
    // SUPERVISOR TEAM COUNTS
    // ==========================================================

    if (supervisorIds.length) {
      const activeWorkers = await User.find({
        designation: "worker",
        supervisor: {
          $in: supervisorIds,
        },
        isActive: true,
        teamNumber: {
          $exists: true,
          $nin: [null, ""],
        },
        workerRole: {
          $in: ["teamLeader", "teamMember"],
        },
      })
        .select("supervisor teamNumber workerRole")
        .lean();

      const supervisorTeamMap = new Map();

      activeWorkers.forEach((worker) => {
        const supervisorId = String(worker.supervisor);

        const teamNumber = String(worker.teamNumber).trim();

        if (!teamNumber) {
          return;
        }

        const teamKey = `${supervisorId}_${teamNumber}`;

        if (!supervisorTeamMap.has(teamKey)) {
          supervisorTeamMap.set(teamKey, {
            supervisorId,
            teamLeader: false,
            teamMember: false,
          });
        }

        const team = supervisorTeamMap.get(teamKey);

        if (worker.workerRole === "teamLeader") {
          team.teamLeader = true;
        }

        if (worker.workerRole === "teamMember") {
          team.teamMember = true;
        }
      });

      supervisorTeamMap.forEach((team) => {
        if (!team.teamLeader || !team.teamMember) {
          return;
        }

        const supervisor = supervisorSummary.find(
          (item) => String(item.supervisorId) === String(team.supervisorId),
        );

        if (supervisor) {
          supervisor.totalTeams += 1;
        }
      });
    }

    // ==========================================================
    // CURRENT CAMPAIGN SUPERVISOR-WISE ZERODOSE COUNTS
    //
    // IMPORTANT:
    // Only COUNT is returned.
    //
    // No Zerodose records are returned to frontend.
    // ==========================================================

    if (currentCampaign && supervisorIds.length) {
      const zerodoseCounts = await Zerodose.aggregate([
        // ------------------------------------------------------
        // CURRENT CAMPAIGN
        // ------------------------------------------------------

        {
          $match: {
            campaign: currentCampaign._id,

            unionCouncil: unionCouncilObjectId,

            supervisor: {
              $in: supervisorIds,
            },

            vaccinationStatus: {
              $in: ["recorded", "visited", "covered"],
            },
          },
        },

        // ------------------------------------------------------
        // GROUP BY SUPERVISOR + STATUS
        // ------------------------------------------------------

        {
          $group: {
            _id: {
              supervisor: "$supervisor",
              status: "$vaccinationStatus",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      // --------------------------------------------------------
      // PUT COUNTS INTO CORRECT SUPERVISOR
      // --------------------------------------------------------

      zerodoseCounts.forEach((item) => {
        const supervisorId = item?._id?.supervisor;

        const status = item?._id?.status;

        if (!supervisorId || !status) {
          return;
        }

        const supervisor = supervisorSummary.find(
          (item) => String(item.supervisorId) === String(supervisorId),
        );

        if (!supervisor) {
          return;
        }

        if (status === "recorded") {
          supervisor.recorded = item.count;
        }

        if (status === "visited") {
          supervisor.visited = item.count;
        }

        if (status === "covered") {
          supervisor.covered = item.count;
        }
      });
    }

    // ==========================================================
    // TOTAL ZERODOSE COUNTS
    // ==========================================================

    const recordedZerodose = supervisorSummary.reduce(
      (total, supervisor) => total + supervisor.recorded,
      0,
    );

    const visitedZerodose = supervisorSummary.reduce(
      (total, supervisor) => total + supervisor.visited,
      0,
    );

    const coveredZerodose = supervisorSummary.reduce(
      (total, supervisor) => total + supervisor.covered,
      0,
    );

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return NextResponse.json({
      success: true,

      data: {
        totalSupervisors,
        activeTeams,

        recordedZerodose,
        visitedZerodose,
        coveredZerodose,

        currentCampaign: currentCampaign
          ? {
              _id: currentCampaign._id,
              name: currentCampaign.name,
              startDate: currentCampaign.startDate,
              endDate: currentCampaign.endDate,
            }
          : null,

        supervisors: supervisorSummary,
      },
    });
  } catch (error) {
    console.error("UCMO supervisor summary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch UCMO summary.",
      },
      { status: 500 },
    );
  }
}
