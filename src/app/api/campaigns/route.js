import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";

// =====================================================
// GET ALL CAMPAIGNS
// =====================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const name = searchParams.get("name");
    const isActive = searchParams.get("isActive");

    const filter = {};

    if (year) {
      filter.year = Number(year);
    }

    if (month) {
      filter.month = Number(month);
    }

    if (name) {
      filter.name = name.toUpperCase();
    }

    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    const campaigns = await Campaign.find(filter).sort({
      year: -1,
      month: -1,
      startDate: -1,
    });

    return NextResponse.json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch campaigns.",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// ADD CAMPAIGN
// =====================================================

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, year, month, startDate, endDate, isActive } = body;

    if (
      !name ||
      year === undefined ||
      month === undefined ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, year, month, start date and end date are required.",
        },
        { status: 400 },
      );
    }

    const campaign = await Campaign.create({
      name,
      year,
      month,
      startDate,
      endDate,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully.",
        data: campaign,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create campaign error:", error);

    // Duplicate campaign
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "This campaign type already exists for this month and year.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create campaign.",
      },
      { status: 400 },
    );
  }
}
