import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

import { hashVerificationCode } from "@/lib/auth/generateVerificationCode";

import { getPendingPasswordReset } from "@/lib/pendingPasswordResets";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    console.log("Body of Verify route==>", body);
    const mobile = body?.mobile?.trim();
    const code = body?.code?.trim();

    // ============================================================
    // Validation
    // ============================================================

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code must be 6 digits.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Get Pending Password Reset
    // ============================================================

    const pendingReset = getPendingPasswordReset(mobile);

    if (!pendingReset) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No password reset request found. Please request a new verification code.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Check OTP Expiry
    // ============================================================

    if (
      !pendingReset.verificationExpires ||
      new Date(pendingReset.verificationExpires).getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new code.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Hash Entered Code
    // ============================================================

    const hashedCode = hashVerificationCode(code);

    // ============================================================
    // Compare OTP
    // ============================================================

    if (hashedCode !== pendingReset.verificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Verify User Still Exists
    // ============================================================

    const user = await User.findById(pendingReset.userId)
      .select("_id name contactNumber email designation isActive")
      .lean();

    if (!user) {
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
    // Mark OTP as Verified
    // ============================================================

    // ============================================================
    // Generate Reset Token
    // ============================================================

    const resetToken = crypto.randomBytes(32).toString("hex");

    // ============================================================
    // Mark OTP as Verified
    // ============================================================

    pendingReset.verified = true;
    pendingReset.verifiedAt = Date.now();
    pendingReset.resetToken = resetToken;
    pendingReset.resetTokenExpires = Date.now() + 10 * 60 * 1000;

    // ============================================================
    // Success
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Verification code verified successfully.",
        data: {
          mobile,
          verified: true,
          resetToken,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Forgot password verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to verify password reset code.",
      },
      {
        status: 500,
      },
    );
  }
}
