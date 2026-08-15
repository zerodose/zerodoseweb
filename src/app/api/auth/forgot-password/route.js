import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/User";

import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/auth/generateVerificationCode";

import { sendVerificationEmail } from "@/lib/mail/sendVerificationEmail";

import { setPendingPasswordReset } from "@/lib/pendingPasswordResets";

export async function POST(request) {
  try {
    // ============================================================
    // Connect Database
    // ============================================================

    await connectDB();

    // ============================================================
    // Get Request Body
    // ============================================================

    const body = await request.json();

    const mobile = body?.mobile?.trim();

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

    // ============================================================
    // Validate Pakistani Mobile Number
    // ============================================================

    if (!/^03\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Pakistani mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Find User By Mobile Number
    //
    // Email user khud enter nahi karega.
    // Database mein mobile se user find hoga.
    // User ki existing email par OTP jayega.
    // ============================================================

    const user = await User.findOne({
      contactNumber: mobile,
    })
      .select("_id name email designation contactNumber isActive")
      .lean();

    // ============================================================
    // User Not Found
    // ============================================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this mobile number.",
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
    // Check User Email
    //
    // Email database mein already honi chahiye.
    // User email provide nahi karega.
    // ============================================================

    if (!user.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No email address is associated with this account. Please contact administrator.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // OTP Email
    // ============================================================

    const verificationEmail = user.email;
    const verificationName = user.name;

    // ============================================================
    // Generate OTP
    // ============================================================

    const verificationCode = generateVerificationCode();

    // ============================================================
    // Hash OTP
    // ============================================================

    const hashedVerificationCode = hashVerificationCode(verificationCode);

    // ============================================================
    // OTP Expiry
    //
    // 10 minutes
    // ============================================================

    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    // ============================================================
    // Save Pending Password Reset
    // ============================================================

    setPendingPasswordReset(mobile, {
      userId: user._id.toString(),

      identifier: mobile,

      designation: user.designation,

      verificationCode: hashedVerificationCode,

      verificationExpires,

      verificationEmail,

      createdAt: Date.now(),
    });

    // ============================================================
    // Send OTP Email
    // ============================================================

    try {
      await sendVerificationEmail({
        email: verificationEmail,
        name: verificationName,
        code: verificationCode,
      });
    } catch (emailError) {
      console.error("Forgot password email error:", emailError);

      return NextResponse.json(
        {
          success: false,
          message: "Verification email could not be sent. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    // ============================================================
    // Mask Email
    // ============================================================

    const maskedEmail = verificationEmail.replace(
      /^(.{2}).*(@.*)$/,
      "$1****$2",
    );

    // ============================================================
    // Success
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        message: "Verification code has been sent.",

        data: {
          mobile,

          email: maskedEmail,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to process forgot password request.",
      },
      {
        status: 500,
      },
    );
  }
}
