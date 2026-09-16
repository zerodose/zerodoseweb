import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";

// ============================================================
// GET ucmo SUMMARY
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
    // ONLY ucmo
    // ========================================================

    if (user.designation !== "ucmo") {
      return NextResponse.json(
        {
          success: false,
          message: "Only ucmo can access ucmo summary.",
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
          message: "Union Council is not assigned to this ucmo.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user.unionCouncil)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council assigned to this ucmo.",
        },
        { status: 400 },
      );
    }

    const unionCouncilObjectId = new mongoose.Types.ObjectId(user.unionCouncil);

    // ========================================================
    // ucmo SUMMARY
    //
    // All Zerodose records belonging to this
    // Union Council are counted.
    // ========================================================

    const result = await Zerodose.aggregate([
      // ------------------------------------------------------
      // UNION COUNCIL
      // ------------------------------------------------------

      {
        $match: {
          unionCouncil: unionCouncilObjectId,
        },
      },

      // ------------------------------------------------------
      // COUNT RECORD / VISIT / COVER
      // AND UNIQUE TEAM NUMBERS
      // ------------------------------------------------------

      {
        $group: {
          _id: null,

          recordCount: {
            $sum: {
              $cond: [
                {
                  $ne: ["$recordDate", null],
                },
                1,
                0,
              ],
            },
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
        },
      },
    ]);

    // ========================================================
    // DEFAULT COUNTS
    // ========================================================

    let recordCount = 0;
    let visitCount = 0;
    let coveredCount = 0;

    if (result.length > 0) {
      recordCount = Number(result[0].recordCount || 0);
      visitCount = Number(result[0].visitCount || 0);
      coveredCount = Number(result[0].coveredCount || 0);
    }

    // ========================================================
    // ALL TEAMS IN SAME UNION COUNCIL
    // ========================================================

    const teamNumbers = await User.distinct("teamNumber", {
      unionCouncil: unionCouncilObjectId,
      teamNumber: {
        $nin: [null, ""],
      },
    });

    const teamCount = teamNumbers.filter(
      (teamNumber) =>
        teamNumber !== null &&
        teamNumber !== undefined &&
        String(teamNumber).trim() !== "",
    ).length;

    // ========================================================
    // ACTIVE SUPERVISORS IN SAME UNION COUNCIL
    // ========================================================

    const supervisorCount = await User.countDocuments({
      unionCouncil: unionCouncilObjectId,
      designation: "supervisor",
      isActive: true,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      data: {
        supervisorCount,
        teamCount,
        recordCount,
        visitCount,
        coveredCount,
      },
    });
  } catch (error) {
    console.error("ucmo Summary Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get ucmo summary.",
      },
      { status: 500 },
    );
  }
}
