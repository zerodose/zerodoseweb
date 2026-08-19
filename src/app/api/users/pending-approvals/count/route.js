import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const count = await User.countDocuments({
      designation: "districtFP",
      approvalStatus: "pending",
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        count,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Pending District FP approval count error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch pending District FP approval count.",
      },
      {
        status: 500,
      },
    );
  }
}
