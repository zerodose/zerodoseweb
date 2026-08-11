import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import District from "@/models/District";
export async function GET() {
  try {
    await connectDB();
    const districts = await District.find({ isActive: true })
      .select("_id name")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(
      { success: true, data: districts },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get district dropdown error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch districts" },
      { status: 500 },
    );
  }
}
