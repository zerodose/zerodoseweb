import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import { getAuthenticatedUser } from "@/lib/auth";

// ============================================================
// GET SUPERVISOR TEAM SUMMARY
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
// ONLY SUPERVISOR
// ========================================================

if (user.designation !== "supervisor") {
  return NextResponse.json(
    {
      success: false,
      message: "Only supervisors can access team summary.",
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
      message: "Union Council is not assigned to this supervisor.",
    },
    { status: 400 },
  );
}

if (!mongoose.Types.ObjectId.isValid(user.unionCouncil)) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid Union Council assigned to this supervisor.",
    },
    { status: 400 },
  );
}

const unionCouncilObjectId = new mongoose.Types.ObjectId(
  user.unionCouncil,
);

// ========================================================
// SUPERVISOR CODE
// ========================================================

if (
  user.supervisorCode === null ||
  user.supervisorCode === undefined
) {
  return NextResponse.json(
    {
      success: false,
      message: "Supervisor code is not assigned.",
    },
    { status: 400 },
  );
}

const supervisorCode = Number(user.supervisorCode);

if (Number.isNaN(supervisorCode)) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid supervisor code.",
    },
    { status: 400 },
  );
}

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
// TEAM SUMMARY
//
// SCOPE:
// campaign
// + unionCouncil
// + supervisorCode
// + teamNumber
// ========================================================

const teamData = await Zerodose.aggregate([
  // ------------------------------------------------------
  // CAMPAIGN + UNION COUNCIL + SUPERVISOR
  // ------------------------------------------------------

  {
    $match: {
      campaign: campaignObjectId,

      unionCouncil: unionCouncilObjectId,

      supervisorCode,

      teamNumber: {
        $ne: null,
      },

      recordDate: {
        $ne: null,
      },
    },
  },

  // ------------------------------------------------------
  // GROUP BY TEAM NUMBER
  // ------------------------------------------------------

  {
    $group: {
      _id: "$teamNumber",

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
    },
  },

  // ------------------------------------------------------
  // FINAL TEAM DATA
  // ------------------------------------------------------

  {
    $project: {
      _id: 0,

      teamNumber: "$_id",

      recordCount: 1,

      visitCount: 1,

      coveredCount: 1,
    },
  },

  // ------------------------------------------------------
  // TEAM NUMBER ORDER
  // ------------------------------------------------------

  {
    $sort: {
      teamNumber: 1,
    },
  },
]);

// ========================================================
// TEAM NUMBERS
// ========================================================

const teamNumbers = teamData
  .map((item) => item.teamNumber)
  .filter(
    (teamNumber) =>
      teamNumber !== null &&
      teamNumber !== undefined,
  );

// ========================================================
// GET WORKER / TEAM MEMBER DATA
// ========================================================

let teams = [];

if (teamNumbers.length > 0) {
  const workers = await User.find({
    designation: "worker",

    unionCouncil: user.unionCouncil,

    teamNumber: {
      $in: teamNumbers,
    },
  })
    .select("_id name teamNumber workerRole")
    .lean();

  // ======================================================
  // MERGE TEAM + USER DATA
  // ======================================================

  teams = teamData.map((item) => {
    const teamWorkers = workers.filter(
      (worker) =>
        Number(worker.teamNumber) ===
        Number(item.teamNumber),
    );

    return {
      teamNumber: Number(item.teamNumber),

      workers: teamWorkers.map((worker) => ({
        id: worker._id,
        name: worker.name,
        workerRole: worker.workerRole,
      })),

      recordCount: Number(item.recordCount || 0),

      visitCount: Number(item.visitCount || 0),

      coveredCount: Number(item.coveredCount || 0),
    };
  });
}

// ========================================================
// TOTAL OF ALL TEAMS
// ========================================================

const total = teams.reduce(
  (accumulator, team) => {
    accumulator.recordCount += Number(
      team.recordCount || 0,
    );

    accumulator.visitCount += Number(
      team.visitCount || 0,
    );

    accumulator.coveredCount += Number(
      team.coveredCount || 0,
    );

    return accumulator;
  },
  {
    recordCount: 0,
    visitCount: 0,
    coveredCount: 0,
  },
);

// ========================================================
// RESPONSE
// ========================================================

return NextResponse.json({
  success: true,

  data: {
    campaignId,

    unionCouncil: user.unionCouncil,

    supervisorCode,

    total: {
      numberOfTeams: teams.length,

      recordCount: total.recordCount,

      visitCount: total.visitCount,

      coveredCount: total.coveredCount,
    },

    teams,
  },
});


} catch (error) {
console.error("Supervisor Team Summary Error:", error);


return NextResponse.json(
  {
    success: false,
    message:
      error?.message ||
      "Failed to get supervisor team summary.",
  },
  { status: 500 },
);


}
}
