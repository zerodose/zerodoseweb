import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        {
          status: 400,
        },
      );
    }

    const user = await User.findOne({
      _id: id,
      designation: "districtFP",
      approvalStatus: "pending",
    })
      .select(
        "-password -emailVerificationCode -emailVerificationExpires",
      )
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .populate("approvedBy", "_id name designation")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending approval not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get pending approval error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to load pending approval.",
      },
      {
        status: 500,
      },
    );
  }
}
