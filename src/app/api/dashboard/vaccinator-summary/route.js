import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import Campaign from "@/models/Campaign";

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

    const userId = payload?.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
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
      _id: userId,
      isActive: true,
    })
      .select("_id name designation unionCouncil")
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

    return {
      user,
    };
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

    // ========================================================
    // CURRENT CAMPAIGN SUMMARY
    //
    // IMPORTANT:
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
        // COUNT RECORD / VISIT / COVER
        // ----------------------------------------------------

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

      if (result.length > 0) {
        recordCount = result[0].recordCount || 0;
        visitCount = result[0].visitCount || 0;
        coveredCount = result[0].coveredCount || 0;
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
