import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const unionCouncil = searchParams.get("unionCouncil");

    const filter = {
      designation: "supervisor",
      approvalStatus: "pending",
      isActive: true,
    };

    // ------------------------------------------------------------
    // UNION COUNCIL FILTER
    // ------------------------------------------------------------

    if (unionCouncil) {
      if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid union council ID.",
          },
          { status: 400 },
        );
      }

      filter.unionCouncil = new mongoose.Types.ObjectId(unionCouncil);
    }

    // ------------------------------------------------------------
    // FETCH PENDING SUPERVISORS
    // ------------------------------------------------------------

    const supervisors = await User.find(filter)
      .select(
        "_id name email contactNumber district town unionCouncil supervisorCode designation approvalStatus isActive createdAt",
      )
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: supervisors,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Supervisor approvals GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to fetch pending supervisor approvals.",
      },
      { status: 500 },
    );
  }
}
