import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const unionCouncil = searchParams.get("unionCouncil");

    if (!unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is required.",
        },
        { status: 400 },
      );
    }

    const ucmos = await User.find({
      designation: "ucmo",
      unionCouncil,
      isActive: true,
      approvalStatus: "approved",
    })
      .select("_id name contactNumber")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: ucmos,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UCMO dropdown error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load UCMOs.",
      },
      { status: 500 },
    );
  }
}
