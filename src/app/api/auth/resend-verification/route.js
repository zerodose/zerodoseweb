import { NextResponse } from "next/server";

import {
    generateVerificationCode,
    hashVerificationCode,
} from "@/lib/auth/generateVerificationCode";

import { sendVerificationEmail } from "@/lib/mail/sendVerificationEmail";

import {
    getPendingRegistration,
    setPendingRegistration,
} from "@/lib/pendingRegistrations";

export async function POST(request) {
    try {
        const body = await request.json();

        const email =
            body?.email?.trim().toLowerCase();

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email is required.",
                },
                { status: 400 },
            );
        }

        const pendingRegistration =
            getPendingRegistration(email);

        if (!pendingRegistration) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No pending registration found for this email. Please register again.",
                },
                { status: 404 },
            );
        }

        const verificationCode =
            generateVerificationCode();

        const hashedVerificationCode =
            hashVerificationCode(
                verificationCode,
            );

        const verificationExpires =
            new Date(
                Date.now() +
                10 * 60 * 1000,
            );

        const updatedPendingRegistration = {
            ...pendingRegistration,

            emailVerificationCode:
                hashedVerificationCode,

            emailVerificationExpires:
                verificationExpires,

            createdAt: Date.now(),
        };

        setPendingRegistration(
            email,
            updatedPendingRegistration,
        );

        try {
            await sendVerificationEmail({
                email,
                name:
                    pendingRegistration.name,
                code: verificationCode,
            });
        } catch (emailError) {
            console.error(
                "Resend verification email error:",
                emailError,
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Verification email could not be sent. Please try again.",
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    "A new verification code has been sent to your email.",
                data: {
                    email,
                    expiresAt:
                        verificationExpires,
                },
            },
            { status: 200 },
        );

    } catch (error) {
        console.error(
            "Resend verification error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to resend verification code.",
            },
            { status: 500 },
        );
    }
}