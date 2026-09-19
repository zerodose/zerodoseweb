
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";


// ============================================================
// GET WORKER SUMMARY
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
    // ONLY WORKER
    // ========================================================

    if (user.designation !== "worker") {
      return NextResponse.json(
        {
          success: false,
          message: "Only workers can access worker summary.",
        },
        { status: 403 },
      );
    }

    // ========================================================
    // WORKER HIERARCHY
    // ========================================================

    if (!user.unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is not assigned to this worker.",
        },
        { status: 400 },
      );
    }

    if (user.teamNumber === null || user.teamNumber === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Team Number is not assigned to this worker.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // GET SUMMARY
    // ========================================================

    const result = await Zerodose.aggregate([
      {
        $match: {
          unionCouncil: new mongoose.Types.ObjectId(user.unionCouncil),
          teamNumber: Number(user.teamNumber),
        },
      },

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
    // DEFAULT SUMMARY
    // ========================================================

    const summary = result[0] || {
      recordCount: 0,
      visitCount: 0,
      coveredCount: 0,
    };

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,
      data: {
        recordCount: summary.recordCount,
        visitCount: summary.visitCount,
        coveredCount: summary.coveredCount,
      },
    });
  } catch (error) {
    console.error("Worker Summary Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get worker summary",
      },
      { status: 500 },
    );
  }
}
