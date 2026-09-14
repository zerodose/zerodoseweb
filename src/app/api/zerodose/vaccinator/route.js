import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
import { getAuthenticatedUser } from "@/lib/auth";


export async function GET(request) {
  try {
    await connectDB();

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const { user } = auth;

    // --------------------------------------------------------
    // ONLY WORKER
    // --------------------------------------------------------

    if (user.designation !== "worker") {
      return NextResponse.json(
        {
          success: false,
          message: "Only workers can access this data.",
        },
        { status: 403 },
      );
    }

    // --------------------------------------------------------
    // UNION COUNCIL VALIDATION
    // --------------------------------------------------------

    if (!user.unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is not assigned to this worker.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // QUERY PARAMETERS
    // --------------------------------------------------------

    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");
    const filter = searchParams.get("filter");

    // --------------------------------------------------------
    // CAMPAIGN VALIDATION
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // FILTER VALIDATION
    // --------------------------------------------------------

    const allowedFilters = ["all", "recorded", "visited", "covered"];

    if (!filter || !allowedFilters.includes(filter)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid filter. Allowed filters are all, recorded, visited, and covered.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // BASE QUERY
    //
    // ONLY:
    // 1. Selected campaign
    // 2. Authenticated user's Union Council
    // --------------------------------------------------------

    const unionCouncilId = user.unionCouncil?._id || user.unionCouncil;

    const match = {
      campaign: new mongoose.Types.ObjectId(campaignId),
      unionCouncil: new mongoose.Types.ObjectId(unionCouncilId),
    };

    // --------------------------------------------------------
    // RECORDED
    //
    // recordDate exists
    // visitDate is null
    // coverDate is null
    // --------------------------------------------------------

    if (filter === "recorded") {
      match.recordDate = { $ne: null };
      match.visitDate = null;
      match.coverDate = null;
    }

    // --------------------------------------------------------
    // VISITED
    //
    // recordDate exists
    // visitDate exists
    // coverDate is null
    // --------------------------------------------------------

    if (filter === "visited") {
      match.recordDate = { $ne: null };
      match.visitDate = { $ne: null };
      match.coverDate = null;
    }

    // --------------------------------------------------------
    // COVERED
    //
    // recordDate exists
    // visitDate exists
    // coverDate exists
    // --------------------------------------------------------

    if (filter === "covered") {
      match.recordDate = { $ne: null };
      match.visitDate = { $ne: null };
      match.coverDate = { $ne: null };
    }

    // --------------------------------------------------------
    // ALL
    //
    // No additional date conditions.
    // Returns all records belonging to:
    // selected campaign + user's Union Council
    // --------------------------------------------------------

    const zerodose = await Zerodose.find(match).sort({ createdAt: -1 }).lean();

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,
      data: zerodose,
      meta: {
        filter,
        count: zerodose.length,
        campaignId,
        unionCouncil: unionCouncilId,
      },
    });
  } catch (error) {
    console.error("Worker Zerodose Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get worker Zerodose data.",
      },
      { status: 500 },
    );
  }
}
