import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import UnionCouncil from "@/models/UnionCouncil";

// ============================================================
// GET TOWNFP SUMMARY
// ============================================================
//
// GET /api/dashboard/townfp/summary
//
// Town ID is taken from the authenticated Town FP user.
//
// Returns:
// - Total Union Councils
// - Total UCMOs
// - Total Vaccinators
// - Total Supervisors
// - Total Teams
// - Total Recorded
// - Total Visited
// - Total Covered
//
// ============================================================

export async function GET(request) {
try {
await connectDB();


// ========================================================
// AUTHENTICATION
// ========================================================

const auth = await getAuthenticatedUser(request);

if (auth?.error) {
  return auth.error;
}

const user = auth?.user;

if (!user) {
  return NextResponse.json(
    {
      success: false,
      message: "Unauthorized",
    },
    { status: 401 },
  );
}

// ========================================================
// DESIGNATION CHECK
// ========================================================

if (user.designation !== "townfp") {
  return NextResponse.json(
    {
      success: false,
      message: "Forbidden",
    },
    { status: 403 },
  );
}

// ========================================================
// TOWN CHECK
// ========================================================

if (!user.town) {
  return NextResponse.json(
    {
      success: false,
      message: "Town not assigned.",
    },
    { status: 400 },
  );
}

// ========================================================
// VALIDATE TOWN ID
// ========================================================

if (!mongoose.Types.ObjectId.isValid(user.town)) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid Town ID.",
    },
    { status: 400 },
  );
}

const townObjectId = new mongoose.Types.ObjectId(user.town);

// ========================================================
// UNION COUNCIL COUNT
// ========================================================
//
// Only active Union Councils belonging to this Town.
//
// ========================================================

const unionCouncilCount = await UnionCouncil.countDocuments({
  town: townObjectId,
  isActive: true,
});

// ========================================================
// USER SUMMARY
// ========================================================
//
// Only ACTIVE users are included.
//
// UCMO:
// designation = "ucmo"
// isActive = true
//
// Vaccinator:
// designation = "vaccinator"
// isActive = true
//
// Supervisor:
// designation = "supervisor"
// isActive = true
//
// Team:
// Unique unionCouncil + teamNumber
// from ACTIVE users only.
//
// ========================================================

const userSummaryResult = await User.aggregate([
  {
    $match: {
      town: townObjectId,
      isActive: true,
    },
  },

  {
    $facet: {
      // ==================================================
      // UCMO + VACCINATOR + SUPERVISOR COUNTS
      // ==================================================

      roleCounts: [
        {
          $group: {
            _id: null,

            ucmoCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$designation", "ucmo"],
                  },
                  1,
                  0,
                ],
              },
            },

            vaccinatorCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$designation", "vaccinator"],
                  },
                  1,
                  0,
                ],
              },
            },

            supervisorCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$designation", "supervisor"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ],

      // ==================================================
      // TEAM COUNT
      // ==================================================
      //
      // Team is uniquely identified by:
      //
      // unionCouncil + teamNumber
      //
      // Since the parent $match already contains:
      //
      // isActive: true
      //
      // only active users contribute to team count.
      //
      // ==================================================

      teams: [
        {
          $match: {
            unionCouncil: {
              $ne: null,
            },

            teamNumber: {
              $nin: [null, ""],
            },
          },
        },

        {
          $group: {
            _id: {
              unionCouncil: "$unionCouncil",
              teamNumber: "$teamNumber",
            },
          },
        },

        {
          $count: "teamCount",
        },
      ],
    },
  },
]);

// ========================================================
// DEFAULT USER COUNTS
// ========================================================

let ucmoCount = 0;
let vaccinatorCount = 0;
let supervisorCount = 0;
let teamCount = 0;

// ========================================================
// READ USER SUMMARY
// ========================================================

if (userSummaryResult.length > 0) {
  const summary = userSummaryResult[0];

  if (summary.roleCounts?.length > 0) {
    ucmoCount = Number(summary.roleCounts[0].ucmoCount || 0);

    vaccinatorCount = Number(
      summary.roleCounts[0].vaccinatorCount || 0,
    );

    supervisorCount = Number(
      summary.roleCounts[0].supervisorCount || 0,
    );
  }

  if (summary.teams?.length > 0) {
    teamCount = Number(summary.teams[0].teamCount || 0);
  }
}

// ========================================================
// ZERODOSE SUMMARY
// ========================================================
//
// Count all Zerodose records belonging to this Town.
//
// recorded = recordDate exists
// visited  = visitDate exists
// covered  = coveredDate exists
//
// ========================================================

const zerodoseResult = await Zerodose.aggregate([
  {
    $match: {
      town: townObjectId,
    },
  },

  {
    $group: {
      _id: null,

      recordedCount: {
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

      visitedCount: {
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
// DEFAULT ZERODOSE COUNTS
// ========================================================

let recordedCount = 0;
let visitedCount = 0;
let coveredCount = 0;

// ========================================================
// READ ZERODOSE SUMMARY
// ========================================================

if (zerodoseResult.length > 0) {
  recordedCount = Number(
    zerodoseResult[0].recordedCount || 0,
  );

  visitedCount = Number(
    zerodoseResult[0].visitedCount || 0,
  );

  coveredCount = Number(
    zerodoseResult[0].coveredCount || 0,
  );
}

// ========================================================
// RESPONSE
// ========================================================

return NextResponse.json({
  success: true,

  data: {
    unionCouncilCount,
    ucmoCount,
    vaccinatorCount,
    supervisorCount,
    teamCount,
    recordedCount,
    visitedCount,
    coveredCount,
  },
});


} catch (error) {
console.error("TownFP Summary Error:", error);


return NextResponse.json(
  {
    success: false,
    message:
      error?.message || "Failed to get town summary.",
  },
  { status: 500 },
);


}
}
