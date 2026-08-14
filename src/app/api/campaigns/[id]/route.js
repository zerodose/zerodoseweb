import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Campaign from "@/models/Campaign";

// =====================================================
// GET SINGLE CAMPAIGN
// =====================================================

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Get single campaign error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid campaign ID.",
      },
      { status: 400 },
    );
  }
}

// =====================================================
// UPDATE CAMPAIGN
// =====================================================

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await request.json();

    const { name, year, month, startDate, endDate, isActive } = body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign not found.",
        },
        { status: 404 },
      );
    }

    if (name !== undefined) {
      campaign.name = name;
    }

    if (year !== undefined) {
      campaign.year = year;
    }

    if (month !== undefined) {
      campaign.month = month;
    }

    if (startDate !== undefined) {
      campaign.startDate = startDate;
    }

    if (endDate !== undefined) {
      campaign.endDate = endDate;
    }

    if (isActive !== undefined) {
      campaign.isActive = isActive;
    }

    await campaign.save();

    return NextResponse.json({
      success: true,
      message: "Campaign updated successfully.",
      data: campaign,
    });
  } catch (error) {
    console.error("Update campaign error:", error);

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
        message: error.message || "Failed to update campaign.",
      },
      { status: 400 },
    );
  }
}

// =====================================================
// DELETE CAMPAIGN
// =====================================================

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully.",
      data: campaign,
    });
  } catch (error) {
    console.error("Delete campaign error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid campaign ID.",
      },
      { status: 400 },
    );
  }
}
