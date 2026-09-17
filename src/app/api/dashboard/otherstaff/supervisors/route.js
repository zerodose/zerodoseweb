import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import { getAuthenticatedUser } from "@/lib/auth";

// ============================================================
// GET otherstaff SUPERVISOR SUMMARY
// ============================================================

export async function GET(request) {
  try {
    await connectDB();

    // ========================================================
    // AUTHENTICATION
    // ========================================================

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const { user } = auth;

    // ========================================================
    // ONLY otherstaff
    // ========================================================

    if (user.designation !== "otherstaff") {
      return NextResponse.json(
        {
          success: false,
          message: "Only otherstaffs can access supervisor summary.",
        },
        { status: 403 },
      );
    }

    // ========================================================
    // UNION COUNCIL
    // ========================================================

    if (!user.unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is not assigned to this otherstaff.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user.unionCouncil)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council assigned to this otherstaff.",
        },
        { status: 400 },
      );
    }

    const unionCouncilObjectId = new mongoose.Types.ObjectId(user.unionCouncil);

    // ========================================================
    // CAMPAIGN ID
    // ========================================================

    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          message: "campaignId is required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid campaignId.",
        },
        { status: 400 },
      );
    }

    const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

    // ========================================================
    // SUPERVISOR SUMMARY
    //
    // Campaign + Union Council
    //
    // ONLY records where recordDate exists
    // ========================================================

    const supervisorData = await Zerodose.aggregate([
      // ------------------------------------------------------
      // CAMPAIGN + UNION COUNCIL + RECORDED
      // ------------------------------------------------------

      {
        $match: {
          campaign: campaignObjectId,

          unionCouncil: unionCouncilObjectId,

          recordDate: {
            $ne: null,
          },

          supervisor: {
            $ne: null,
          },
        },
      },

      // ------------------------------------------------------
      // GROUP BY CAMPAIGN + SUPERVISOR
      // ------------------------------------------------------

      {
        $group: {
          _id: {
            campaignId: "$campaign",
            supervisorId: "$supervisor",
          },

          recordCount: {
            $sum: 1,
          },

          visitCount: {
            $sum: {
              $cond: [
                {
                  $ne: ["$visitDate", null],
                },
                1,
                0,
              ],
            },
          },

          coveredCount: {
            $sum: {
              $cond: [
                {
                  $ne: ["$coveredDate", null],
                },
                1,
                0,
              ],
            },
          },

          teams: {
            $addToSet: "$teamNumber",
          },
        },
      },

      // ------------------------------------------------------
      // FINAL SUPERVISOR DATA
      // ------------------------------------------------------

      {
        $project: {
          _id: 0,

          campaignId: "$_id.campaignId",

          supervisorId: "$_id.supervisorId",

          recordCount: 1,

          visitCount: 1,

          coveredCount: 1,

          numberOfTeams: {
            $size: {
              $filter: {
                input: "$teams",
                as: "team",

                cond: {
                  $ne: ["$$team", null],
                },
              },
            },
          },
        },
      },

      // ------------------------------------------------------
      // MOST RECORDS FIRST
      // ------------------------------------------------------

      {
        $sort: {
          recordCount: -1,
        },
      },
    ]);

    // ========================================================
    // SUPERVISOR IDS
    // ========================================================

    const supervisorIds = supervisorData
      .map((item) => item.supervisorId)
      .filter(Boolean);

    // ========================================================
    // DEFAULT SUPERVISORS
    // ========================================================

    let supervisors = [];

    // ========================================================
    // GET SUPERVISOR USERS
    // ========================================================

    if (supervisorIds.length > 0) {
      const supervisorUsers = await User.find({
        _id: {
          $in: supervisorIds,
        },
      })
        .select("_id name supervisorCode")
        .lean();

      // ======================================================
      // MERGE USER DATA + ZERODOSE DATA
      // ======================================================

      supervisors = supervisorData.map((item) => {
        const supervisor = supervisorUsers.find(
          (user) => String(user._id) === String(item.supervisorId),
        );

        return {
          campaignId: item.campaignId,

          supervisorId: item.supervisorId,

          supervisorName: supervisor?.name || "-",

          supervisorCode: supervisor?.supervisorCode || "-",

          numberOfTeams: Number(item.numberOfTeams || 0),

          recordCount: Number(item.recordCount || 0),

          visitCount: Number(item.visitCount || 0),

          coveredCount: Number(item.coveredCount || 0),
        };
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      data: {
        campaignId,

        supervisors,
      },
    });
  } catch (error) {
    console.error("otherstaff Supervisor Summary Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to get otherstaff supervisor summary.",
      },
      { status: 500 },
    );
  }
}
