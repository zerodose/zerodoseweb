import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";

export async function GET() {
  try {
    await connectDB();

    const records = await Zerodose.find(
      {},
      {
        vaccinationStatus: 1,
        recordDate: 1,
        visitDate: 1,
        coveredDate: 1,
      },
    )
      .sort({ recordDate: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: records.map((item) => ({
        vaccinationStatus: item.vaccinationStatus,

        recordDate: item.recordDate,
        visitDate: item.visitDate,
        coveredDate: item.coveredDate,
      })),
    });
  } catch (error) {
    console.error("Campaign trend error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch campaign trend data.",
      },
      {
        status: 500,
      },
    );
  }
}
