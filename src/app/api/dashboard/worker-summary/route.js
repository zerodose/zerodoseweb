import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import User from "@/models/User";
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
      .select(
        "_id name designation unionCouncil teamNumber",
      )
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
// GET WORKER SUMMARY
// ============================================================

export async function GET(request) {
  try {
    console.log("==============================================");
    console.log("WORKER SUMMARY ROUTE HIT");
    console.log("==============================================");

    await connectDB();

    // ========================================================
    // AUTH
    // ========================================================

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const authUser = auth.user;

    console.log("WORKER SUMMARY USER:", {
      id: String(authUser._id),
      name: authUser.name,
      designation: authUser.designation,
      unionCouncil: authUser.unionCouncil,
      teamNumber: authUser.teamNumber,
      workerRole: authUser.workerRole,
    });

    // ========================================================
    // ONLY WORKER
    // ========================================================

    if (authUser.designation !== "worker") {
      return NextResponse.json(
        {
          success: false,
          message: "Only workers can access worker summary.",
        },
        { status: 403 },
      );
    }

    // ========================================================
    // VALIDATE WORKER SCOPE
    // ========================================================

    if (!authUser.unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker Union Council is not assigned.",
        },
        { status: 400 },
      );
    }

    if (authUser.teamNumber === null || authUser.teamNumber === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker team number is not assigned.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // WORKER ZERODOSE FILTER
    // ========================================================
    //
    // IMPORTANT:
    //
    // No campaign filter.
    //
    // Worker can only access:
    //
    // unionCouncil= authenticated worker's UC
    // teamNumber     = authenticated worker's team
    //
    // ========================================================

    const baseFilter = {
      unionCouncil: authUser.unionCouncil,
      teamNumber: authUser.teamNumber,
      isActive: true,
      recordDate: { $ne: null },
    };

    console.log("WORKER SUMMARY FILTER:", {
      unionCouncil: authUser.unionCouncil,
      teamNumber: authUser.teamNumber,
      isActive: true,
    });

    // ========================================================
    // COUNT RECORDED / VISITED / COVERED
    // ========================================================
    //
    // Exactly three mutually-exclusive states:
    //
    // RECORDED
    // recordDate exists
    // visitDate is null
    // coverDate is null
    //
    // VISITED
    // recordDate exists
    // visitDate exists
    // coverDate is null
    //
    // COVERED
    // recordDate exists
    // visitDate exists
    // coverDate exists
    //
    // ========================================================

    const [recorded, visited, covered] = await Promise.all([
      // ======================================================
      // RECORDED
      // ======================================================

      Zerodose.countDocuments({
        ...baseFilter,
        visitDate: null,
        coverDate: null,
      }),

      // ======================================================
      // VISITED
      // ======================================================

      Zerodose.countDocuments({
        ...baseFilter,
        visitDate: { $ne: null },
        coverDate: null,
      }),

      // ======================================================
      // COVERED
      // ======================================================

      Zerodose.countDocuments({
        ...baseFilter,
        visitDate: { $ne: null },
        coverDate: { $ne: null },
      }),
    ]);

    // ========================================================
    // TOTAL
    // ========================================================

    const total = recorded + visited + covered;

    console.log("WORKER SUMMARY COUNTS:", {
      total,
      recorded,
      visited,
      covered,
    });

    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        data: {
          total,
          recorded,
          visited,
          covered,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("==============================================");
    console.error("WORKER SUMMARY ERROR");
    console.error("==============================================");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load worker summary.",
        error:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 },
    );
  }
}
