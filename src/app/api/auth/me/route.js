import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

const secret = new TextEncoder().encode(JWT_SECRET);

export async function GET(request) {
    try {
        const token = request.cookies.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Not authenticated.",
                },
                { status: 401 },
            );
        }

        const { payload } = await jwtVerify(token, secret);

        await connectDB();

        const user = await User.findOne({
            _id: payload.userId,
            isActive: true,
        })
            .select("-password")
            .lean();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User account not found or inactive.",
                },
                { status: 401 },
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                user,
            },
        });
    } catch (error) {
        console.error("Auth verification error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Invalid or expired authentication.",
            },
            { status: 401 },
        );
    }
}