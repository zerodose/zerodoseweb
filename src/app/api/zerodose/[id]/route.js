import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";

// =====================================================
// GET
// Get Single Zerodose
// =====================================================

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid zerodose ID",
        },
        {
          status: 400,
        },
      );
    }

    const zerodose = await Zerodose.findById(id)
      .populate("districtId", "name code")
      .populate("townId", "name code")
      .populate("unionCouncilId", "name code")
      .populate("ucmoId", "name contactNumber")
      .populate("supervisorId", "name contactNumber")
      .populate("teamId")
      .lean();

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: zerodose,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get single zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch zerodose",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// PUT
// Update Zerodose
// =====================================================

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid zerodose ID",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    // ===================================================
    // Allowed Fields
    // ===================================================

    const allowedFields = [
      "districtId",
      "townId",
      "unionCouncilId",
      "ucmoId",
      "supervisorId",
      "teamId",
      "childName",
      "fatherName",
      "age",
      "address",
      "contactNo",
      "recordDate",
      "visitDate",
      "coveredDate",
      "location",
      "clientStatus",
      "vaccinationStatus",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // ===================================================
    // ObjectId Validation
    // ===================================================

    const objectIdFields = [
      "districtId",
      "townId",
      "unionCouncilId",
      "ucmoId",
      "supervisorId",
      "teamId",
    ];

    for (const field of objectIdFields) {
      if (
        updateData[field] &&
        !mongoose.Types.ObjectId.isValid(updateData[field])
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field}`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ===================================================
    // Age Validation
    // ===================================================

    if (updateData.age !== undefined) {
      if (
        typeof updateData.age !== "number" ||
        updateData.age < 0 ||
        updateData.age > 10
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Age must be a number between 0 and 10",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ===================================================
    // Location Validation
    // ===================================================

    if (updateData.location !== undefined) {
      if (
        !updateData.location ||
        typeof updateData.location.latitude !== "number" ||
        typeof updateData.location.longitude !== "number"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid latitude and longitude are required",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ===================================================
    // Status Validation
    // ===================================================

    if (updateData.vaccinationStatus !== undefined) {
      const allowedStatuses = ["recorded", "visited", "covered"];

      if (!allowedStatuses.includes(updateData.vaccinationStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid vaccinationStatus",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (updateData.clientStatus !== undefined) {
      const allowedClientStatuses = [
        "refusal",
        "sick",
        "not_available",
        "deceased",
      ];

      if (!allowedClientStatuses.includes(updateData.clientStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid clientStatus",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ===================================================
    // Update
    // ===================================================

    const zerodose = await Zerodose.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("districtId", "name code")
      .populate("townId", "name code")
      .populate("unionCouncilId", "name code")
      .populate("ucmoId", "name contactNumber")
      .populate("supervisorId", "name contactNumber")
      .populate("teamId")
      .lean();

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose updated successfully",
        data: zerodose,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Update zerodose error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update zerodose",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// DELETE
// Delete Zerodose
// =====================================================

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid zerodose ID",
        },
        {
          status: 400,
        },
      );
    }

    const zerodose = await Zerodose.findByIdAndDelete(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose deleted successfully",
        data: {
          _id: zerodose._id,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Delete zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete zerodose",
      },
      {
        status: 500,
      },
    );
  }
}
