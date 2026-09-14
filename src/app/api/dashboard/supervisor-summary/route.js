import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Zerodose from "@/models/Zerodose";

// ============================================================
// AUTHENTICATED USER
// ============================================================

async function getAuthenticatedUser(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Authentication required.",
          },
          { status: 401 },
        ),
      };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    if (!payload?.userId) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Invalid authentication token.",
          },
          { status: 401 },
        ),
      };
    }

    const user = await User.findOne({
      _id: payload.userId,
      isActive: true,
    })
      .select("_id name designation")
      .lean();

    if (!user) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Authenticated user not found.",
          },
          { status: 401 },
        ),
      };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);

    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication token.",
        },
        { status: 401 },
      ),
    };
  }
}

// ============================================================
// GET SUPERVISOR SUMMARY
// ============================================================

export async function GET(request) {
  try {

    await connectDB();


    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const authUser = auth.user;

    console.log("SUPERVISOR SUMMARY USER:", {
      id: String(authUser._id),
      name: authUser.name,
      designation: authUser.designation,
    });

    if (authUser.designation !== "supervisor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only supervisors can access supervisor summary.",
        },
        { status: 403 },
      );
    }

    // ========================================================
    // CURRENT CAMPAIGN
    // ========================================================

    const now = new Date();

    const currentCampaign = await Campaign.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select("_id name year month startDate endDate")
      .lean();

    const activeTeams = await User.aggregate([
      {
        $match: {
          designation: "worker",
          supervisor: authUser._id,
          isActive: true,
          teamNumber: { $ne: null },
          workerRole: {
            $in: ["teamLeader", "teamMember"],
          },
        },
      },

      {
        $group: {
          _id: "$teamNumber",

          members: {
            $push: {
              workerRole: "$workerRole",
              name: "$name",
              userId: "$_id",
            },
          },

          roles: {
            $addToSet: "$workerRole",
          },
        },
      },

      // Only complete teams
      {
        $match: {
          roles: {
            $all: ["teamLeader", "teamMember"],
          },
        },
      },

      {
        $project: {
          _id: 0,

          teamNumber: "$_id",

          teamLeader: {
            $let: {
              vars: {
                leader: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$members",
                        as: "member",
                        cond: {
                          $eq: ["$$member.workerRole", "teamLeader"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },

              in: "$$leader",
            },
          },

          teamMember: {
            $let: {
              vars: {
                member: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$members",
                        as: "member",
                        cond: {
                          $eq: ["$$member.workerRole", "teamMember"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },

              in: "$$member",
            },
          },
        },
      },

      {
        $sort: {
          teamNumber: 1,
        },
      },
    ]);

    const totalTeams = activeTeams.length;

    console.log("TOTAL ACTIVE COMPLETE TEAMS:", totalTeams);

    // ========================================================
    // NO CURRENT CAMPAIGN
    // ========================================================

    if (!currentCampaign) {
      console.log("NO CURRENT CAMPAIGN FOUND");

      return NextResponse.json(
        {
          success: true,

          data: {
            totalTeams,

            recordedZerodose: 0,
            visitedZerodose: 0,
            coveredZerodose: 0,

            currentCampaign: null,

            teams: [],
          },
        },
        { status: 200 },
      );
    }

    console.log("CURRENT CAMPAIGN:", {
      id: String(currentCampaign._id),
      name: currentCampaign.name,
      year: currentCampaign.year,
      month: currentCampaign.month,
    });

    // ========================================================
    // CURRENT CAMPAIGN ZERODOSE COUNTS
    // ========================================================
    //
    // IMPORTANT:
    //
    // recorded = recordDate exists
    // visited  = visitDate exists
    // covered  = coveredDate exists
    //
    // vaccinationStatus is NOT used here.
    //
    // null date = 0
    // existing date = 1
    //
    // ========================================================

    const currentTeamCounts = await Zerodose.aggregate([
      {
        $match: {
          campaign: currentCampaign._id,
          supervisor: authUser._id,
          teamNumber: { $ne: null },
        },
      },

      {
        $group: {
          _id: "$teamNumber",

          // recordDate exists
          recorded: {
            $sum: {
              $cond: [
                {
                  $ifNull: ["$recordDate", false],
                },
                1,
                0,
              ],
            },
          },

          // visitDate exists
          visited: {
            $sum: {
              $cond: [
                {
                  $ifNull: ["$visitDate", false],
                },
                1,
                0,
              ],
            },
          },

          // coveredDate exists
          covered: {
            $sum: {
              $cond: [
                {
                  $ifNull: ["$coveredDate", false],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    console.log(
      "CURRENT CAMPAIGN TEAM COUNTS:",
      JSON.stringify(currentTeamCounts, null, 2),
    );

    // ========================================================
    // OVERALL TOTALS
    // ========================================================

    const recordedZerodose = currentTeamCounts.reduce(
      (total, team) => total + Number(team.recorded || 0),
      0,
    );

    const visitedZerodose = currentTeamCounts.reduce(
      (total, team) => total + Number(team.visited || 0),
      0,
    );

    const coveredZerodose = currentTeamCounts.reduce(
      (total, team) => total + Number(team.covered || 0),
      0,
    );

    // ========================================================
    // MAP ZERODOSE COUNTS TO ACTIVE TEAMS
    // ========================================================

    const countMap = new Map();

    for (const team of currentTeamCounts) {
      countMap.set(Number(team._id), {
        recorded: Number(team.recorded || 0),
        visited: Number(team.visited || 0),
        covered: Number(team.covered || 0),
      });
    }

    // ========================================================
    // ONLY TEAMS HAVING ZERODOSE RECORDS
    // ========================================================

    const teams = activeTeams
      .map((team) => {
        const teamNumber = Number(team.teamNumber);

        const counts = countMap.get(teamNumber);

        // No Zerodose record for this team
        if (!counts) {
          return null;
        }

        return {
          teamNumber,

          teamLeader: team.teamLeader || "Not assigned",

          teamMember: team.teamMember || "Not assigned",

          recorded: counts.recorded,
          visited: counts.visited,
          covered: counts.covered,
        };
      })
      .filter(Boolean);

    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        data: {
          totalTeams,

          recordedZerodose,
          visitedZerodose,
          coveredZerodose,

          currentCampaign: {
            _id: currentCampaign._id,
            name: currentCampaign.name,
            year: currentCampaign.year,
            month: currentCampaign.month,
            startDate: currentCampaign.startDate,
            endDate: currentCampaign.endDate,
          },

          teams,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("==============================================");
    console.error("SUPERVISOR SUMMARY ERROR");
    console.error("==============================================");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load supervisor summary.",
        error:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 },
    );
  }
}
