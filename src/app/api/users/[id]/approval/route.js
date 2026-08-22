import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function PUT(request, { params }) {
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

    const body = await request.json();

    const approvalStatus = body?.approvalStatus;

    // ============================================================
    // Validate Status
    // ============================================================

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Approval status must be approved or rejected.",
        },
        {
          status: 400,
        },
      );
    }

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    let payload;

    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication token.",
        },
        { status: 401 },
      );
    }

    const authUserId = payload.userId;
    const designation = payload.designation;

    if (!authUserId || designation !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only an admin can approve District Focal Persons.",
        },
        { status: 403 },
      );
    }

    const adminUser = await User.findOne({
      _id: authUserId,
      designation: "admin",
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Authenticated admin account was not found or is inactive.",
        },
        { status: 403 },
      );
    }

    const approvedBy = adminUser._id;

    // ============================================================
    // Find Pending District FP
    // ============================================================

    const user = await User.findOne({
      _id: id,
      designation: "districtfp",
      approvalStatus: "pending",
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending District Focal Person approval not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // Update Approval
    // ============================================================

    user.approvalStatus = approvalStatus;

    user.approvedBy = approvedBy;
    user.approvedAt = new Date();

    await user.save();

    // ============================================================
    // Return Updated User
    // ============================================================

    const updatedUser = await User.findById(user._id)
      .select("-password -emailVerificationCode -emailVerificationExpires")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .populate("approvedBy", "_id name designation")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message:
          approvalStatus === "approved"
            ? "District Focal Person approved successfully."
            : "District Focal Person rejected successfully.",
        data: updatedUser,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Update approval error:", error);

    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map(
        (item) => item.message,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            messages.length > 0 ? messages.join(", ") : "Validation failed.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update approval status.",
      },
      {
        status: 500,
      },
    );
  }
}
