import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import UnionCouncil from "@/models/UnionCouncil";
import Town from "@/models/Town";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Frontend sends only townId
    const townId = searchParams.get("townId")?.trim() || "";

    if (!townId) {
      return NextResponse.json(
        {
          success: false,
          message: "Town is required",
        },
        { status: 400 },
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(townId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 },
      );
    }

    // Make sure selected town exists and is active
    const town = await Town.findOne({
      _id: townId,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town not found or inactive",
        },
        { status: 404 },
      );
    }

    // Get ONLY Union Councils belonging to selected town
    const unionCouncils = await UnionCouncil.find({
      town: townId,
      isActive: true,
    })
      .select("_id name code town district")
      .sort({ name: 1 })
      .lean();

    console.log("Selected townId:", townId);
    console.log("Union Councils found:", unionCouncils);

    return NextResponse.json(
      {
        success: true,
        data: unionCouncils,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Union Council dropdown error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Union Councils",
      },
      { status: 500 },
    );
  }
}
