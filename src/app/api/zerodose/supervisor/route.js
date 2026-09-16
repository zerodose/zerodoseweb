import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import { getAuthenticatedUser } from "@/lib/auth";

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
    console.log(" User data", user)
    const supervisorUser = await User.findOne({
      _id: user._id,
      designation: "supervisor",
      isActive: true,
    })
      .select("_id name designation unionCouncil supervisorCode isActive")
      .lean();

    if (!supervisorUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Active supervisor not found.",
        },
        { status: 401 },
      );
    }

    // ========================================================
    // ONLY SUPERVISOR
    // ========================================================

    if (user.designation !== "supervisor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only supervisors can access this data.",
        },
        { status: 403 },
      );
    }

    // ========================================================
    // UNION COUNCIL VALIDATION
    // ========================================================

    if (
      !user.unionCouncil ||
      !mongoose.Types.ObjectId.isValid(user.unionCouncil)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor Union Council is missing or invalid.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // SUPERVISOR CODE VALIDATION
    // ========================================================

    const supervisorCode = Number(supervisorUser.supervisorCode);

    if (
      supervisorUser.supervisorCode === null ||
      supervisorUser.supervisorCode === undefined ||
      supervisorUser.supervisorCode === "" ||
      !Number.isFinite(supervisorCode)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor code is missing or invalid.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // QUERY PARAMETERS
    // ========================================================

    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");
    const filter = searchParams.get("filter");

    // ========================================================
    // CAMPAIGN VALIDATION
    // ========================================================

    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign ID is required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Campaign ID.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // FILTER VALIDATION
    // ========================================================

    const allowedFilters = ["recorded", "visited", "covered"];

    if (!filter || !allowedFilters.includes(filter)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid filter. Allowed filters are recorded, visited, and covered.",
        },
        { status: 400 },
      );
    }

    const unionCouncilObjectId = new mongoose.Types.ObjectId(user.unionCouncil);

    const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

    // ========================================================
    // BASE MATCH
    // ========================================================
    //
    // Supervisor scope:
    //
    //     campaign
    //     +
    //     unionCouncil
    //     +
    //     supervisorCode
    //
    // NO teamNumber filter.
    //
    // This allows the supervisor to see all teams assigned
    // to this supervisor.
    //
    // ========================================================

    const baseMatch = {
      campaign: campaignObjectId,
      unionCouncil: unionCouncilObjectId,
      supervisorCode,
    };


    // ========================================================
    // FILTERED MATCH
    // ========================================================

    const dataMatch = {
      ...baseMatch,
    };

    if (filter === "recorded") {
      dataMatch.recordDate = { $ne: null };
      dataMatch.visitDate = null;
      dataMatch.coveredDate = null;
    }

    if (filter === "visited") {
      dataMatch.recordDate = { $ne: null };
      dataMatch.visitDate = { $ne: null };
      dataMatch.coveredDate = null;
    }

    if (filter === "covered") {
      dataMatch.recordDate = { $ne: null };
      dataMatch.visitDate = { $ne: null };
      dataMatch.coveredDate = { $ne: null };
    }
    // ========================================================
    // GET FILTERED ZERODOSE DATA
    // ========================================================

    const zerodose = await Zerodose.find(dataMatch)
      .sort({
        createdAt: -1,
      })
      .populate("campaign", "name startDate endDate")
      .populate("district", "name")
      .populate("town", "name")
      .populate("unionCouncil", "name")
      .populate("ucmo", "name")
      .populate("supervisor", "name supervisorCode")
      .populate("user", "name designation")
      .populate("teamLeader", "name")
      .populate("teamMember", "name")
      .populate("vaccinator", "name")
      .lean();

    // ========================================================
    // SUMMARY
    // ========================================================
    //
    // Counts are based on actual dates and intentionally
    // overlap:
    //
    // recorded = recordDate exists
    // visited  = visitDate exists
    // covered  = coveredDate exists
    //
    // ========================================================

    const summaryResult = await Zerodose.aggregate([
      {
        $match: baseMatch,
      },

      {
        $group: {
          _id: null,

          recorded: {
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

          visited: {
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

          covered: {
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
    // TEAM-WISE VACCINATION STATUS
    // ========================================================
    //
    // This gives the supervisor's teams separately:
    //
    // [
    //   {
    //     teamNumber,
    //     recorded,
    //     visited,
    //     covered
    //   }
    // ]
    //
    // ========================================================

    const vaccinationStatusResult = await Zerodose.aggregate([
      {
        $match: baseMatch,
      },

      {
        $group: {
          _id: {
            teamNumber: "$teamNumber",
            vaccinationStatus: "$vaccinationStatus",
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $group: {
          _id: "$_id.teamNumber",

          statuses: {
            $push: {
              status: "$_id.vaccinationStatus",
              count: "$count",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          teamNumber: "$_id",

          recorded: {
            $let: {
              vars: {
                item: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$statuses",
                        as: "status",
                        cond: {
                          $eq: ["$$status.status", "recorded"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },

              in: {
                $ifNull: ["$$item.count", 0],
              },
            },
          },

          visited: {
            $let: {
              vars: {
                item: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$statuses",
                        as: "status",
                        cond: {
                          $eq: ["$$status.status", "visited"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },

              in: {
                $ifNull: ["$$item.count", 0],
              },
            },
          },

          covered: {
            $let: {
              vars: {
                item: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$statuses",
                        as: "status",
                        cond: {
                          $eq: ["$$status.status", "covered"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },

              in: {
                $ifNull: ["$$item.count", 0],
              },
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

    // ========================================================
    // SUMMARY OBJECT
    // ========================================================

    const summary = {
      recorded: Number(summaryResult[0]?.recorded || 0),

      visited: Number(summaryResult[0]?.visited || 0),

      covered: Number(summaryResult[0]?.covered || 0),
    };

    // ========================================================
    // VACCINATION STATUS OBJECT
    // ========================================================

    const vaccinationStatus = {
      total: {
        recorded: 0,
        visited: 0,
        covered: 0,
      },

      teams: vaccinationStatusResult.map((item) => ({
        teamNumber: item.teamNumber,

        recorded: Number(item.recorded || 0),

        visited: Number(item.visited || 0),

        covered: Number(item.covered || 0),
      })),
    };

    // ========================================================
    // CALCULATE TEAM TOTALS
    // ========================================================

    vaccinationStatus.teams.forEach((item) => {
      vaccinationStatus.total.recorded += item.recorded;

      vaccinationStatus.total.visited += item.visited;

      vaccinationStatus.total.covered += item.covered;
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      data: zerodose,

      summary,

      vaccinationStatus,

      meta: {
        filter,

        count: zerodose.length,

        campaignId,

        unionCouncil: user.unionCouncil,

        supervisor: user._id,

        supervisorCode,

        supervisorName: user.name || null,

        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Supervisor Zerodose Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get supervisor Zerodose data.",
      },
      { status: 500 },
    );
  }
}
