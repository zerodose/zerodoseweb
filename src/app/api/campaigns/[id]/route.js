import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";

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
        {
          status: 400,
        },
      );
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get campaign error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get campaign.",
      },
      {
        status: 500,
      },
    );
  }
}

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
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const { name, scope, year, month, startDate, endDate } = body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (name !== undefined) {
      campaign.name = name;
    }

    if (scope !== undefined) {
      const allowedScopes = [
        "nationwide",
        "high_risk_districts",
        "sindh_karachi",
        "karachi",
      ];

      if (!allowedScopes.includes(scope)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid campaign scope.",
          },
          {
            status: 400,
          },
        );
      }

      campaign.scope = scope;
    }

    if (year !== undefined) {
      campaign.year = Number(year);
    }

    if (month !== undefined) {
      campaign.month = Number(month);
    }

    let newStartDate = campaign.startDate;
    let newEndDate = campaign.endDate;

    if (startDate !== undefined) {
      newStartDate = new Date(startDate);

      if (Number.isNaN(newStartDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid start date.",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (endDate !== undefined) {
      newEndDate = new Date(endDate);

      if (Number.isNaN(newEndDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid end date.",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (newStartDate > newEndDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign end date cannot be before start date.",
        },
        {
          status: 400,
        },
      );
    }

    if (startDate !== undefined || endDate !== undefined) {
      const existingCampaign = await Campaign.findOne({
        _id: {
          $ne: id,
        },
        startDate: {
          $lte: newEndDate,
        },
        endDate: {
          $gte: newStartDate,
        },
      });

      if (existingCampaign) {
        return NextResponse.json(
          {
            success: false,
            message: "Another campaign already exists during these dates.",
          },
          {
            status: 409,
          },
        );
      }

      campaign.startDate = newStartDate;
      campaign.endDate = newEndDate;
    }

    await campaign.save();

    return NextResponse.json(
      {
        success: true,
        message: "Campaign updated successfully.",
        data: campaign,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Update campaign error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update campaign.",
      },
      {
        status: 400,
      },
    );
  }
}

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
        {
          status: 400,
        },
      );
    }

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Campaign deleted successfully.",
        data: campaign,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Delete campaign error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete campaign.",
      },
      {
        status: 400,
      },
    );
  }
}
