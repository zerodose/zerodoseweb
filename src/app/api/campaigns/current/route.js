import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    const currentCampaign = await Campaign.findOne({
      startDate: {
        $lte: now,
      },
      endDate: {
        $gte: now,
      },
    }).lean({
      virtuals: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        currentCampaign: currentCampaign || null,
      },
    });
  } catch (error) {
    console.error("Get Current Campaign Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get current campaign.",
      },
      { status: 500 },
    );
  }
}
