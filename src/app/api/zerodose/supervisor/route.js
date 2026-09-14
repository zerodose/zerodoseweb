import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";

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

    // --------------------------------------------------------
    // IMPORTANT
    // Only active users can authenticate as supervisor.
    // We also fetch supervisorCode because Zerodose ownership
    // is based on supervisorCode + unionCouncil.
    // --------------------------------------------------------

    const user = await User.findOne({
      _id: userId,
      isActive: true,
    })
      .select("_id name designation isActive unionCouncil supervisorCode")
      .lean();

    if (!user) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Authenticated user not found or inactive.",
          },
          { status: 401 },
        ),
      };
    }

    return { user };
  } catch (error) {
    console.error("Supervisor Authentication Error:", error);

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
          message: "Only supervisors can access this data.",
        },
        { status: 403 },
      );
    }

    // ========================================================
    // ACTIVE SUPERVISOR CHECK
    // ========================================================
    //
    // getAuthenticatedUser already checks isActive: true.
    // This additional check keeps the business rule explicit.
    //

    if (user.isActive !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor account is inactive.",
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

    const supervisorCode = Number(user.supervisorCode);

    if (
      user.supervisorCode === null ||
      user.supervisorCode === undefined ||
      user.supervisorCode === "" ||
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

    // ========================================================
    // BASE QUERY
    // ========================================================
    //
    // IMPORTANT:
    //
    // Supervisor can have multiple teams.
    //
    // Therefore:
    // NO teamNumber filter.
    //
    // Supervisor identity for historical Zerodose data:
    //
    //     unionCouncil + supervisorCode
    //
    // NOT:
    //
    //     supervisor._id
    //
    // This allows a new active supervisor to access old
    // supervisor data when the supervisorCode remains same
    // within the same Union Council.
    //
    // ========================================================

    const match = {
      campaign: new mongoose.Types.ObjectId(campaignId),

      unionCouncil: new mongoose.Types.ObjectId(user.unionCouncil),

      supervisorCode,
    };

    // ========================================================
    // RECORDED
    // ========================================================
    //
    // recordDate exists
    // visitDate is null
    // coveredDate is null
    //
    // ========================================================

    if (filter === "recorded") {
      match.recordDate = {
        $ne: null,
      };

      match.visitDate = null;

      match.coveredDate = null;
    }

    // ========================================================
    // VISITED
    // ========================================================
    //
    // recordDate exists
    // visitDate exists
    // coveredDate is null
    //
    // ========================================================

    if (filter === "visited") {
      match.recordDate = {
        $ne: null,
      };

      match.visitDate = {
        $ne: null,
      };

      match.coveredDate = null;
    }

    // ========================================================
    // COVERED
    // ========================================================
    //
    // recordDate exists
    // visitDate exists
    // coveredDate exists
    //
    // ========================================================

    if (filter === "covered") {
      match.recordDate = {
        $ne: null,
      };

      match.visitDate = {
        $ne: null,
      };

      match.coveredDate = {
        $ne: null,
      };
    }

    // ========================================================
    // GET ZERODOSE DATA
    // ========================================================

    const zerodose = await Zerodose.find(match)
      .sort({
        createdAt: -1,
      })
      .lean();

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      data: zerodose,

      meta: {
        filter,

        count: zerodose.length,

        campaignId,

        supervisorCode,

        unionCouncil: user.unionCouncil,

        supervisor: user._id,

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
