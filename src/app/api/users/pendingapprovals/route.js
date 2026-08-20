import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // ============================================================
    // Pagination
    // ============================================================

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      100,
    );

    // ============================================================
    // Filters
    // ============================================================

    const search = searchParams.get("search")?.trim() || "";
    const designation = searchParams.get("designation")?.trim() || "";

    const district = searchParams.get("district")?.trim() || "";
    const town = searchParams.get("town")?.trim() || "";
    const unionCouncil = searchParams.get("unionCouncil")?.trim() || "";

    // ============================================================
    // Base Filter
    // ============================================================

    const filter = {
      approvalStatus: "pending",
      isActive: true,
    };

    // ============================================================
    // Designation Filter
    // ============================================================

    if (designation) {
      filter.designation = designation;
    }

    // ============================================================
    // Scope Filters
    // ============================================================

    if (district && district !== "all") {
      filter.district = district;
    }

    if (town && town !== "all") {
      filter.town = town;
    }

    if (unionCouncil && unionCouncil !== "all") {
      filter.unionCouncil = unionCouncil;
    }

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

    // ============================================================
    // Pagination Info
    // ============================================================

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
    console.error("Pending user approvals GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch pending user approvals.",
      },
      {
        status: 500,
      },
    );
  }
}
