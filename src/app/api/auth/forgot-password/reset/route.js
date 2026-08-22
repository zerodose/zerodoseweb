import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import {
  findPendingPasswordResetByToken,
  deletePendingPasswordReset,
} from "@/lib/pendingPasswordResets";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const resetToken = body?.resetToken?.trim();
    const password = body?.password;
    
    // console.log("body for reset token=2=>", body)

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Password reset token is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "New password is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Find Pending Reset
    // ============================================================

    const pending = findPendingPasswordResetByToken(resetToken);

    if (!pending) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired password reset session.",
        },
        {
          status: 400,
        },
      );
    }

    const { identifier, data } = pending;

    // ============================================================
    // Reset Token Expiry
    // ============================================================

    if (
      !data?.resetTokenExpires ||
      new Date(data.resetTokenExpires).getTime() < Date.now()
    ) {
      deletePendingPasswordReset(identifier);

      return NextResponse.json(
        {
          success: false,
          message:
            "Password reset session has expired. Please request a new code.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Find User
    // ============================================================

    const user = await User.findById(data.userId);

    if (!user) {
      deletePendingPasswordReset(identifier);

      return NextResponse.json(
        {
          success: false,
          message: "User account was not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // Active User Check
    // ============================================================

    if (!user.isActive) {
      deletePendingPasswordReset(identifier);

      return NextResponse.json(
        {
          success: false,
          message: "This account is inactive. Please contact administrator.",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // Hash New Password
    // ============================================================

    const hashedPassword = await bcrypt.hash(password, 12);

    // ============================================================
    // Update Password
    // ============================================================

    user.password = hashedPassword;

    await user.save();

    // ============================================================
    // Delete Used Reset Session
    // ============================================================

    deletePendingPasswordReset(identifier);

    // ============================================================
    // Success
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Password has been changed successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to reset password.",
      },
      {
        status: 500,
      },
    );
  }
}
