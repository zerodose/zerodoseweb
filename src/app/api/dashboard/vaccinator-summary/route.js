
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import Campaign from "@/models/Campaign";
import { getAuthenticatedUser } from "@/lib/auth";

// ============================================================
// GET VACCINATOR SUMMARY
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
    // ONLY VACCINATOR
    // ========================================================

    if (user.designation !== "vaccinator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only vaccinators can access vaccinator summary.",
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
          message: "Union Council is not assigned to this vaccinator.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user.unionCouncil)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council assigned to this vaccinator.",
        },
        { status: 400 },
      );
    }

    const unionCouncilObjectId = new mongoose.Types.ObjectId(user.unionCouncil);

    // ========================================================
    // CURRENT CAMPAIGN
    // ========================================================

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

    // ========================================================
    // DEFAULT SUMMARY
    // ========================================================

    let recordCount = 0;
    let visitCount = 0;
    let coveredCount = 0;

    let supervisors = [];

    // ========================================================
    // CURRENT CAMPAIGN SUMMARY
    //
    // Vaccinator:
    //     Union Council based data
    //
    // Worker:
    //     Union Council + Team Number based data
    //
    // Vaccinator gets ALL teams inside this Union Council.
    // ========================================================

    if (currentCampaign) {
      const result = await Zerodose.aggregate([
        // ----------------------------------------------------
        // UNION COUNCIL + CURRENT CAMPAIGN
        // ----------------------------------------------------

        {
          $match: {
            campaign: currentCampaign._id,
            unionCouncil: unionCouncilObjectId,
          },
        },

        // ----------------------------------------------------
        // SUMMARY COUNTS + SUPERVISOR DATA
        // ----------------------------------------------------

        {
          $facet: {
            // ==================================================
            // EXISTING SUMMARY COUNTS
            //
            // KEEPING YOUR EXISTING FILTERING EXACTLY THE SAME
            // ==================================================

            summary: [
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
            ],

            // ==================================================
            // SUPERVISORS
            //
            // ONLY RECORDS WHERE recordDate EXISTS
            // ==================================================

            supervisors: [
              {
                $match: {
                  campaign: currentCampaign._id,

                  unionCouncil: unionCouncilObjectId,

                  recordDate: {
                    $ne: null,
                  },

                  supervisor: {
                    $ne: null,
                  },
                },
              },

              // ------------------------------------------------
              // GROUP BY CAMPAIGN + SUPERVISOR
              // ------------------------------------------------

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

              // ------------------------------------------------
              // FINAL SUPERVISOR DATA
              // ------------------------------------------------

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

              // ------------------------------------------------
              // MOST RECORDS FIRST
              // ------------------------------------------------

              {
                $sort: {
                  recordCount: -1,
                },
              },
            ],
          },
        },
      ]);

      // ========================================================
      // SUMMARY COUNTS
      // ========================================================

      if (result.length > 0 && result[0].summary?.length > 0) {
        const summaryData = result[0].summary[0];

        recordCount = summaryData.recordCount || 0;
        visitCount = summaryData.visitCount || 0;
        coveredCount = summaryData.coveredCount || 0;
      }

      // ========================================================
      // SUPERVISOR IDS
      // ========================================================

      const supervisorData =
        result.length > 0 ? result[0].supervisors || [] : [];

      const supervisorIds = supervisorData
        .map((item) => item.supervisorId)
        .filter(Boolean);

      // ========================================================
      // GET SUPERVISOR USERS
      // ========================================================

      if (supervisorIds.length > 0) {
        const supervisorUsers = await User.find({
          _id: {
            $in: supervisorIds,
          },
        })
          .select("_id name code")
          .lean();

        // ======================================================
        // MERGE USER DATA + TEAM COUNT
        // ======================================================

        supervisors = supervisorData.map((item) => {
          const supervisor = supervisorUsers.find(
            (user) => String(user._id) === String(item.supervisorId),
          );

          return {
            campaignId: item.campaignId,

            supervisorId: item.supervisorId,

            supervisorName: supervisor?.name || "-",

            supervisorCode: supervisor?.code || "-",

            numberOfTeams: Number(item.numberOfTeams || 0),

            recordCount: Number(item.recordCount || 0),

            visitCount: Number(item.visitCount || 0),

            coveredCount: Number(item.coveredCount || 0),
          };
        });
      }
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      data: {
        recordCount,
        visitCount,
        coveredCount,

        supervisors,

        currentCampaign: currentCampaign
          ? {
              _id: currentCampaign._id,
              name: currentCampaign.name,
              startDate: currentCampaign.startDate,
              endDate: currentCampaign.endDate,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Vaccinator Summary Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get vaccinator summary.",
      },
      { status: 500 },
    );
  }
}
