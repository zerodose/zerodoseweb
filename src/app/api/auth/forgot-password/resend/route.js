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
    await connectDB();

    const body = await request.json();

    const identifier = body?.identifier?.trim().toLowerCase();

    if (!identifier) {
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
    // Find User By Mobile Number
    // ============================================================

    const user = await User.findOne({
      contactNumber: identifier,
    })
      .select("_id name email designation supervisor contactNumber isActive")
      .lean();

    // ============================================================
    // User Not Found
    // ============================================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with the provided mobile number.",
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
    // Determine Email
    // ============================================================

    let verificationEmail = user.email;
    let verificationName = user.name;

    // ============================================================
    // Worker
    //
    // Worker ka email nahi hota.
    // Supervisor ke email par OTP jayegi.
    // ============================================================

    if (user.designation === "worker") {
      if (!user.supervisor) {
        return NextResponse.json(
          {
            success: false,
            message: "No supervisor is assigned to this worker.",
          },
          {
            status: 400,
          },
        );
      }

      const supervisor = await User.findOne({
        _id: user.supervisor,
        designation: "supervisor",
        isActive: true,
      })
        .select("_id name email")
        .lean();

      if (!supervisor) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid active supervisor not found.",
          },
          {
            status: 400,
          },
        );
      }

      if (!supervisor.email) {
        return NextResponse.json(
          {
            success: false,
            message: "Supervisor does not have an email address.",
          },
          {
            status: 400,
          },
        );
      }

      verificationEmail = supervisor.email;
      verificationName = supervisor.name;
    }

    // ============================================================
    // Email Required
    // ============================================================

    if (!verificationEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "No email address is available for this account.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Generate New OTP
    // ============================================================

    const verificationCode = generateVerificationCode();

    // ============================================================
    // Hash OTP
    // ============================================================

    const hashedVerificationCode = hashVerificationCode(verificationCode);

    // ============================================================
    // OTP Expiry - 10 Minutes
    // ============================================================

    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    // ============================================================
    // Replace Existing Pending Reset
    // ============================================================

    setPendingPasswordReset(identifier, {
      userId: user._id.toString(),

      identifier,

      designation: user.designation,

      verificationCode: hashedVerificationCode,

      verificationExpires,

      verificationEmail,

      createdAt: Date.now(),
    });

    // ============================================================
    // Send New OTP
    // ============================================================

    try {
      await sendVerificationEmail({
        email: verificationEmail,
        name: verificationName,
        code: verificationCode,
      });
    } catch (emailError) {
      console.error("Forgot password resend email error:", emailError);

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
    // Success
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "A new verification code has been sent.",
        data: {
          identifier,

          email: verificationEmail.replace(/^(.{2}).*(@.*)$/, "$1****$2"),
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Forgot password resend error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to resend verification code.",
      },
      {
        status: 500,
      },
    );
  }
}
