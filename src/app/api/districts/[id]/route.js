import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import District from "@/models/District";

// ============================================================
// GET /api/districts/:id
// Get single district
// ============================================================

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // --------------------------------------------------------
    // Validate MongoDB ObjectId
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // Find district
    // --------------------------------------------------------

    const district = await District.findById(id)
      .select("name code isActive createdAt updatedAt")
      .lean();

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: district,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get single district error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch district",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/districts/:id
// Update district
// ============================================================

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { name, code, isActive } = body;

    // --------------------------------------------------------
    // Check district exists
    // --------------------------------------------------------

    const district = await District.findById(id);

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------------
    // Build update object
    // --------------------------------------------------------

    const updateData = {};

    // --------------------------------------------------------
    // Update name
    // --------------------------------------------------------

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "District name must be a valid string",
          },
          { status: 400 },
        );
      }

      const cleanName = name.trim();

      if (cleanName.length < 2 || cleanName.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "District name must be between 2 and 100 characters",
          },
          { status: 400 },
        );
      }

      // Check duplicate name
      const existingName = await District.findOne({
        name: cleanName,
        _id: { $ne: id },
      });

      if (existingName) {
        return NextResponse.json(
          {
            success: false,
            message: "District with this name already exists",
          },
          { status: 409 },
        );
      }

      updateData.name = cleanName;
    }

    // --------------------------------------------------------
    // Update code
    // --------------------------------------------------------

    if (code !== undefined) {
      if (code === null || code === "") {
        return NextResponse.json(
          {
            success: false,
            message: "District code is required",
          },
          { status: 400 },
        );
      }

      const numericCode = Number(code);

      if (!Number.isInteger(numericCode)) {
        return NextResponse.json(
          {
            success: false,
            message: "District code must be a valid number",
          },
          { status: 400 },
        );
      }

      // Check duplicate code
      const existingCode = await District.findOne({
        code: numericCode,
        _id: { $ne: id },
      });

      if (existingCode) {
        return NextResponse.json(
          {
            success: false,
            message: "District with this code already exists",
          },
          { status: 409 },
        );
      }

      updateData.code = numericCode;
    }

    // --------------------------------------------------------
    // Update active status
    // --------------------------------------------------------

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "isActive must be a boolean",
          },
          { status: 400 },
        );
      }

      updateData.isActive = isActive;
    }

    // --------------------------------------------------------
    // Nothing to update
    // --------------------------------------------------------

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields provided for update",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------

    const updatedDistrict = await District.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("name code isActive createdAt updatedAt");

    return NextResponse.json(
      {
        success: true,
        message: "District updated successfully",
        data: updatedDistrict,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update district error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "District name or code already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update district",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/districts/:id
//
// Default:
// Soft delete → isActive = false
//
// Permanent:
// DELETE /api/districts/:id?permanent=true
// ============================================================

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // Check permanent delete
    // --------------------------------------------------------

    const { searchParams } = new URL(request.url);

    const permanent = searchParams.get("permanent") === "true";

    // --------------------------------------------------------
    // Find district
    // --------------------------------------------------------

    const district = await District.findById(id);

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------------
    // Permanent delete
    // --------------------------------------------------------

    if (permanent) {
      await District.findByIdAndDelete(id);

      return NextResponse.json(
        {
          success: true,
          message: "District permanently deleted",
        },
        { status: 200 },
      );
    }

    // --------------------------------------------------------
    // Soft delete
    // --------------------------------------------------------

    district.isActive = false;

    await district.save();

    return NextResponse.json(
      {
        success: true,
        message: "District deleted successfully",
        data: {
          id: district._id,
          name: district.name,
          code: district.code,
          isActive: district.isActive,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete district error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete district",
      },
      { status: 500 },
    );
  }
}
