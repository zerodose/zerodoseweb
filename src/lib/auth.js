import { NextResponse } from "next/server";

import { jwtVerify } from "jose";

import User from "@/models/User";

export async function getAuthenticatedUser(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Authentication required.",
          },
          { status: 401 },
        ),
      };
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Server authentication configuration error.",
          },
          { status: 500 },
        ),
      };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    if (!payload?.userId) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Invalid authentication token.",
          },
          { status: 401 },
        ),
      };
    }

    const user = await User.findOne({
      _id: payload.userId,
      isActive: true,
    })
      .select(
        "_id name designation district town unionCouncil teamNumber supervisorCode",
      )
      .lean();

    if (!user) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Authenticated user not found.",
          },
          { status: 401 },
        ),
      };
    }

    return {
      user,
    };
  } catch (error) {
    console.error("Authentication error:", error);

    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication token.",
        },
        { status: 401 },
      ),
    };
  }
}
