import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const district = searchParams.get("district");
    const town = searchParams.get("town");
    const unionCouncil = searchParams.get("unionCouncil");
    const designation = searchParams.get("designation");

    const approvalRequiredDesignations = [
      "ucmo",
      "supervisor",
      "vaccinator",
      "otherStaff",
      "townFP",
      "districtFP",
    ];

    const filter = {
      designation: {
        $in: approvalRequiredDesignations,
      },
      approvalStatus: "pending",
      isActive: true,
    };

    if (designation) {
      if (!approvalRequiredDesignations.includes(designation)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid approval designation.",
          },
          { status: 400 },
        );
      }

      filter.designation = designation;
    }

    if (district) {
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid district ID.",
          },
          { status: 400 },
        );
      }

      filter.district = new mongoose.Types.ObjectId(district);
    }

    if (town) {
      if (!mongoose.Types.ObjectId.isValid(town)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid town ID.",
          },
          { status: 400 },
        );
      }

      filter.town = new mongoose.Types.ObjectId(town);
    }

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

    const [users, count] = await Promise.all([
      User.find(filter)
        .select(
          "_id name email contactNumber district town unionCouncil supervisorCode designation approvalStatus approvedBy approvedAt isActive createdAt",
        )
        .populate("district", "_id name code")
        .populate("town", "_id name code")
        .populate("unionCouncil", "_id name code")
        .populate("approvedBy", "_id name designation")
        .sort({ createdAt: -1 })
        .lean(),

      User.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: users,
        count,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("User approvals GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch pending user approvals.",
      },
      { status: 500 },
    );
  }
}
