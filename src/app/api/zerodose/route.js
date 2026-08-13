import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Zerodose from "@/models/Zerodose";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      districtId,
      townId,
      unionCouncilId,
      ucmoId,
      supervisorId,
      teamId,
      childName,
      fatherName,
      age,
      address,
      contactNo,
      recordDate,
      visitDate,
      coveredDate,
      location,
      status,
    } = body;

    if (
      !districtId ||
      !townId ||
      !unionCouncilId ||
      !ucmoId ||
      !supervisorId ||
      !teamId ||
      !childName ||
      !fatherName ||
      age === undefined ||
      !address ||
      !location?.latitude ||
      !location?.longitude
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields are missing",
        },
        { status: 400 },
      );
    }

    const zerodose = await Zerodose.create({
      districtId,
      townId,
      unionCouncilId,
      ucmoId,
      supervisorId,
      teamId,
      childName,
      fatherName,
      age,
      address,
      contactNo,
      recordDate: recordDate || new Date(),
      visitDate,
      coveredDate,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      status: status || "recorded",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose recorded successfully",
        data: zerodose,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Zerodose POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to record Zerodose",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const districtId = searchParams.get("districtId");
    const townId = searchParams.get("townId");
    const unionCouncilId = searchParams.get("unionCouncilId");
    const ucmoId = searchParams.get("ucmoId");
    const supervisorId = searchParams.get("supervisorId");
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");

    const filter = {};

    if (districtId) filter.districtId = districtId;
    if (townId) filter.townId = townId;
    if (unionCouncilId) filter.unionCouncilId = unionCouncilId;
    if (ucmoId) filter.ucmoId = ucmoId;
    if (supervisorId) filter.supervisorId = supervisorId;
    if (teamId) filter.teamId = teamId;
    if (status) filter.status = status;

    const zerodose = await Zerodose.find(filter)
      .populate("districtId")
      .populate("townId")
      .populate("unionCouncilId")
      .populate("ucmoId", "name email")
      .populate("supervisorId", "name email")
      .populate("teamId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: zerodose.length,
      data: zerodose,
    });
  } catch (error) {
    console.error("Zerodose GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Zerodose records",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
