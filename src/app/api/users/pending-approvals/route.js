import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      100,
    );

    const search = searchParams.get("search")?.trim() || "";

    const filter = {
      designation: "districtFP",
      approvalStatus: "pending",
      isActive: true,
    };

    // ============================================================
    // Search
    // ============================================================

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          contactNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ============================================================
    // Pagination
    // ============================================================

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "_id name email contactNumber district town unionCouncil supervisorCode designation approvalStatus approvedBy approvedAt isActive createdAt",
        )
        .populate("district", "_id name code")
        .populate("town", "_id name code")
        .populate("unionCouncil", "_id name code")
        .populate("approvedBy", "_id name designation")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json(
      {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Pending District FP approvals GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to fetch pending District FP approvals.",
      },
      {
        status: 500,
      },
    );
  }
}
