import { NextResponse } from "next/server";
import mongoose from "mongoose";

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

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const { user } = auth;

    if (user.designation !== "otherstaff") {
      return NextResponse.json(
        {
          success: false,
          message: "Only otherstaffs can access this data.",
        },
        { status: 403 },
      );
    }

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

    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");
    const filter = searchParams.get("filter");

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

    /*
     * Base match:
     * Only selected campaign + authenticated otherstaff's
     * Union Council.
     */
    const baseMatch = {
      campaign: campaignObjectId,
      unionCouncil: unionCouncilObjectId,
    };

    /*
     * Filtered match for data[].
     */
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

    /*
     * Fetch filtered Zerodose records.
     */
    const zerodose = await Zerodose.find(dataMatch)
      .sort({ createdAt: -1 })
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

    /*
     * Campaign summary:
     *
     * recorded = recordDate exists
     * visited  = visitDate exists
     * covered  = coveredDate exists
     *
     * These counts intentionally overlap.
     */
    const summaryResult = await Zerodose.aggregate([
      {
        $match: baseMatch,
      },
      {
        $group: {
          _id: null,

          recorded: {
            $sum: {
              $cond: [{ $ne: ["$recordDate", null] }, 1, 0],
            },
          },

          visited: {
            $sum: {
              $cond: [{ $ne: ["$visitDate", null] }, 1, 0],
            },
          },

          covered: {
            $sum: {
              $cond: [{ $ne: ["$coveredDate", null] }, 1, 0],
            },
          },
        },
      },
    ]);

    /*
     * vaccinationStatus counts:
     *
     * This counts the actual vaccinationStatus field
     * for the selected campaign.
     */
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

    const summary = {
      recorded: Number(summaryResult[0]?.recorded || 0),
      visited: Number(summaryResult[0]?.visited || 0),
      covered: Number(summaryResult[0]?.covered || 0),
    };

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

    vaccinationStatus.teams.forEach((item) => {
      vaccinationStatus.total.recorded += item.recorded;
      vaccinationStatus.total.visited += item.visited;
      vaccinationStatus.total.covered += item.covered;
    });

   

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
      },
    });
  } catch (error) {
    console.error("otherstaff Zerodose Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get otherstaff Zerodose data.",
      },
      { status: 500 },
    );
  }
}
