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

    const { name, year, month, startDate, isActive = true } = body;

    // =====================================================
    // Required Fields
    // =====================================================

    if (!name || year === undefined || month === undefined || !startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, year, month and start date are required.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Calculate End Date
    // 8 calendar days total
    // Start Date + 7 days
    // =====================================================

    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid start date.",
        },
        { status: 400 },
      );
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    // =====================================================
    // Prevent Multiple Campaigns On Same Date
    // =====================================================

    const existingCampaign = await Campaign.findOne({
      startDate: {
        $gte: new Date(start.setHours(0, 0, 0, 0)),
        $lt: new Date(start.setHours(23, 59, 59, 999)),
      },
    });

    if (existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          message: `A campaign already exists on ${startDate}. Only one campaign can be created on the same date.`,
        },
        { status: 409 },
      );
    }

    // =====================================================
    // Create Campaign
    // =====================================================

    const campaign = await Campaign.create({
      name,
      year: Number(year),
      month: Number(month),
      startDate: new Date(startDate),
      endDate: end,
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

    // Duplicate index
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A campaign already exists for this date.",
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
