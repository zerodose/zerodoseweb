import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
import { getAuthenticatedUser } from "@/lib/auth";

// ============================================================
// GET SUPERVISOR SUMMARY
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
      message: "Only supervisors can access supervisor summary.",
    },
    { status: 403 },
  );
}

// ========================================================
// VALIDATION
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

// ========================================================
// SUPERVISOR SUMMARY
// ========================================================

const result = await Zerodose.aggregate([
  {
    $match: {
      unionCouncil: new mongoose.Types.ObjectId(
        user.unionCouncil,
      ),
      supervisorCode: Number(user.supervisorCode),
    },
  },

  {
    $group: {
      _id: null,

      zerodoseCount: {
        $sum: 1,
      },

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
  zerodoseCount: 0,
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
    zerodoseCount: summary.zerodoseCount,
    recordCount: summary.recordCount,
    visitCount: summary.visitCount,
    coveredCount: summary.coveredCount,
  },
});


} catch (error) {
console.error("Supervisor Summary Error:", error);


return NextResponse.json(
  {
    success: false,
    message: "Failed to get supervisor summary.",
  },
  { status: 500 },
);


}
}
