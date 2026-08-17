import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";

// =====================================================
// GET SINGLE CAMPAIGN
// =====================================================

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid campaign ID.",
        },
        { status: 400 },
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get campaign error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get campaign.",
      },
      { status: 500 },
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

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid campaign ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { name, year, month, startDate } = body;

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

    // =====================================================
    // Update Basic Fields
    // =====================================================

    if (name !== undefined) {
      campaign.name = name;
    }

    if (year !== undefined) {
      campaign.year = Number(year);
    }

    if (month !== undefined) {
      campaign.month = Number(month);
    }

    // =====================================================
    // Update Start Date
    // Automatically calculate End Date
    // =====================================================

    if (startDate !== undefined) {
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

      // Prevent overlap with other campaigns
      const existingCampaign = await Campaign.findOne({
        _id: { $ne: id },

        startDate: {
          $lte: end,
        },

        endDate: {
          $gte: start,
        },
      });

      if (existingCampaign) {
        return NextResponse.json(
          {
            success: false,
            message: "Another campaign already exists during these dates.",
          },
          { status: 409 },
        );
      }

      campaign.startDate = start;
      campaign.endDate = end;
    }

    await campaign.save();

    return NextResponse.json(
      {
        success: true,
        message: "Campaign updated successfully.",
        data: campaign,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update campaign error:", error);

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

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid campaign ID.",
        },
        { status: 400 },
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        message: "Campaign deleted successfully.",
        data: campaign,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete campaign error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete campaign.",
      },
      { status: 400 },
    );
  }
}
