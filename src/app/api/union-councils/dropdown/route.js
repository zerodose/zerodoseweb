import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import UnionCouncil from "@/models/UnionCouncil";

// =====================================================
// GET - Union Council Dropdown
//
// Returns only:
//
// _id
// name
//
// Optional:
//
// ?districtId=...
// ?townId=...
// ?search=...
// =====================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const districtId = searchParams.get("districtId")?.trim() || "";

    const townId = searchParams.get("townId")?.trim() || "";

    const search = searchParams.get("search")?.trim() || "";

    const filter = {
      isActive: true,
    };

    // -----------------------------
    // District filter
    // -----------------------------

    if (districtId) {
      filter.district = districtId;
    }

    // -----------------------------
    // Town filter
    // -----------------------------

    if (townId) {
      filter.town = townId;
    }

    // -----------------------------
    // Search
    // -----------------------------

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const unionCouncils = await UnionCouncil.find(filter)
      .select("_id name")
      .sort({ name: 1 })
      .lean();

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
        message: "Failed to fetch Union Council dropdown",
      },
      { status: 500 },
    );
  }
}
