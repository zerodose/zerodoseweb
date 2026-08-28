import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import Campaign from "@/models/Campaign";

// ============================================================
// GET UCMO SUMMARY
// ============================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const ucmoId = searchParams.get("ucmoId");

    if (!ucmoId || !mongoose.Types.ObjectId.isValid(ucmoId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid UCMO ID is required.",
        },
        { status: 400 },
      );
    }

    const ucmoObjectId = new mongoose.Types.ObjectId(ucmoId);

    // ========================================================
    // ACTIVE APPROVED SUPERVISORS
    // ========================================================

    const supervisors = await User.find({
      designation: "supervisor",
      ucmo: ucmoObjectId,
      isActive: true,
      approvalStatus: "approved",
    })
      .select("_id")
      .lean();

    const supervisorIds = supervisors.map((supervisor) => supervisor._id);

    const totalSupervisors = supervisorIds.length;

    // ========================================================
    // ACTIVE TEAMS
    //
    // Team will ONLY count when:
    // 1. teamNumber exists
    // 2. teamLeader exists
    // 3. teamMember exists
    // 4. both users are active
    //
    // Team is identified by supervisor + teamNumber
    // ========================================================

    let activeTeams = 0;

    if (supervisorIds.length) {
      const activeWorkers = await User.find({
        designation: "worker",
        supervisor: { $in: supervisorIds },
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

    // ========================================================
    // CURRENT CAMPAIGN
    // ========================================================

    const now = new Date();

    const currentCampaign = await Campaign.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ startDate: -1 })
      .select("_id")
      .lean();

    // ========================================================
    // ZERODOSE SUMMARY
    // ========================================================

    let recordedZerodose = 0;
    let coveredZerodose = 0;

    if (currentCampaign && supervisorIds.length) {
      const zerodoseCounts = await Zerodose.aggregate([
        {
          $match: {
            campaign: currentCampaign._id,
            supervisor: {
              $in: supervisorIds,
            },
            vaccinationStatus: {
              $in: ["recorded", "covered"],
            },
          },
        },
        {
          $group: {
            _id: "$vaccinationStatus",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      zerodoseCounts.forEach((item) => {
        if (item._id === "recorded") {
          recordedZerodose = item.count;
        }

        if (item._id === "covered") {
          coveredZerodose = item.count;
        }
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,
      data: {
        totalSupervisors,
        activeTeams,
        recordedZerodose,
        coveredZerodose,
      },
    });
  } catch (error) {
    console.error("UCMO summary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch UCMO summary.",
      },
      { status: 500 },
    );
  }
}
