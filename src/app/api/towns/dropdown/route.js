import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Town from "@/models/Town";
import District from "@/models/District";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Frontend sends districtId
    const districtId = searchParams.get("districtId")?.trim() || "";

    if (!districtId) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(districtId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    // Make sure district exists and is active
    const district = await District.findOne({
      _id: districtId,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found or inactive",
        },
        { status: 404 },
      );
    }

    // Only towns belonging to selected district
    const towns = await Town.find({
      district: districtId,
      isActive: true,
    })
      .select("_id name district")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: towns,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get town dropdown error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch towns",
      },
      { status: 500 },
    );
  }
}
