import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

// ============================================================
// Change Password
// ============================================================

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await request.json();

    const password = body?.password;
    const confirmPassword = body?.confirmPassword;

    // ==========================================================
    // Validation
    // ==========================================================

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 },
      );
    }

    if (!confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Confirm password is required.",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match.",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // Find User
    // ==========================================================

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    // ==========================================================
    // Hash Password
    // ==========================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================================
    // Update Password
    // ==========================================================

    user.password = hashedPassword;

    await user.save();

    // ==========================================================
    // Response
    // ==========================================================

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Change password API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to change password.",
      },
      { status: 500 },
    );
  }
}
