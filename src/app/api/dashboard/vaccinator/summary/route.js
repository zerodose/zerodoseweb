import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
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

const unionCouncilObjectId = new mongoose.Types.ObjectId(
  user.unionCouncil,
);

// ========================================================
// TOTAL SUMMARY
//
// IMPORTANT:
// No campaign filtering.
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

// ========================================================
// RESULT
// ========================================================

if (result.length > 0) {
  recordCount = Number(result[0].recordCount || 0);
  visitCount = Number(result[0].visitCount || 0);
  coveredCount = Number(result[0].coveredCount || 0);
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
  },
});


} catch (error) {
console.error("Vaccinator Summary Error:", error);


return NextResponse.json(
  {
    success: false,
    message:
      error?.message || "Failed to get vaccinator summary.",
  },
  { status: 500 },
);


}
}
