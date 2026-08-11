import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

// ============================================================
// Hash Verification Code
// ============================================================

function hashVerificationCode(code) {
    return crypto
        .createHash("sha256")
        .update(code)
        .digest("hex");
}

// ============================================================
// POST /api/auth/verify-email
// ============================================================

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const email = body?.email?.trim().toLowerCase();
        const code = body?.code?.trim();

        // ============================================================
        // Validation
        // ============================================================

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email is required.",
                },
                { status: 400 },
            );
        }

        if (!code) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code is required.",
                },
                { status: 400 },
            );
        }

        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code must be 6 digits.",
                },
                { status: 400 },
            );
        }

        // ============================================================
        // Find User
        // ============================================================

        const user = await User.findOne({
            email,
        }).select(
            "+emailVerificationCode +emailVerificationExpires",
        );

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 },
            );
        }

        // ============================================================
        // Already Verified
        // ============================================================

        if (user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email is already verified.",
                },
                { status: 400 },
            );
        }

        // ============================================================
        // Check Verification Code
        // ============================================================

        if (!user.emailVerificationCode) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No verification code found. Please request a new code.",
                },
                { status: 400 },
            );
        }

        // ============================================================
        // Check Expiry
        // ============================================================

        if (
            !user.emailVerificationExpires ||
            user.emailVerificationExpires < new Date()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Verification code has expired. Please request a new code.",
                },
                { status: 400 },
            );
        }

        // ============================================================
        // Hash Entered Code
        // ============================================================

        const hashedCode = hashVerificationCode(code);

        // ============================================================
        // Compare Code
        // ============================================================

        if (hashedCode !== user.emailVerificationCode) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid verification code.",
                },
                { status: 400 },
            );
        }

        // ============================================================
        // Verify Email
        // ============================================================

        user.emailVerified = true;

        user.emailVerificationCode = null;
        user.emailVerificationExpires = null;

        await user.save();

        // ============================================================
        // Response
        // ============================================================
        const verifiedUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email || null,
            contactNumber: user.contactNumber,
            district: user.district,
            town: user.town,
            unionCouncil: user.unionCouncil,
            designation: user.designation,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
        };

        return NextResponse.json(
            {
                success: true,
                message: "Email verified successfully.",
                data: {
                    user: verifiedUser,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Verify email error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message || "Failed to verify email.",
            },
            { status: 500 },
        );
    }
}
