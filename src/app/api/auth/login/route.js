import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UnionCouncil from "@/models/UnionCouncil";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const mobile = body.mobile?.trim() || "";
    const password = body.password || "";

    // ============================================================
    // Validation
    // ============================================================

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number is required.",
        },
        { status: 400 },
      );
    }

    if (!/^03\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Pakistani mobile number.",
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

    // ============================================================
    // Find User
    // ============================================================

    const user = await User.findOne({
      contactNumber: mobile,
      isActive: true,
    })
      .select("+password")
      .populate("unionCouncil", "_id name code");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile number or password.",
        },
        { status: 401 },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "This account cannot be used for login.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Verify Password
    // ============================================================

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile number or password.",
        },
        { status: 401 },
      );
    }

    if (
      user.designation === "supervisor" &&
      user.approvalStatus !== "approved"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is waiting for UCMO approval.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Create JWT
    // ============================================================

    const token = await new SignJWT({
      userId: user._id.toString(),
      designation: user.designation,
      district: user.district.toString(),
      town: user.town.toString(),
      unionCouncil: user.unionCouncil.toString(),
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // ============================================================
    // Safe User Data
    // ============================================================

    const safeUser = {
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

    // ============================================================
    // Response + HttpOnly Cookie
    // ============================================================

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        data: {
          user: safeUser,
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to login.",
      },
      { status: 500 },
    );
  }
}
