import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import UnionCouncil from "@/models/UnionCouncil";
import District from "@/models/District";
import Town from "@/models/Town";

// =====================================================
// GET - Single Union Council
// =====================================================

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council ID",
        },
        { status: 400 },
      );
    }

    const unionCouncil = await UnionCouncil.findById(id)
      .populate("district", "name code")
      .populate("town", "name")
      .lean();

    if (!unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: unionCouncil,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Union Council error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Union Council",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// PUT - Update Union Council
// =====================================================

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council ID",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { name, code, district, town, isActive } = body;

    // -----------------------------
    // Find existing
    // -----------------------------

    const existing = await UnionCouncil.findById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council not found",
        },
        { status: 404 },
      );
    }

    // -----------------------------
    // Prepare values
    // -----------------------------

    const newName = name !== undefined ? name.trim() : existing.name;

    const newCode = code !== undefined ? Number(code) : existing.code;

    const newDistrict = district !== undefined ? district : existing.district;

    const newTown = town !== undefined ? town : existing.town;

    // -----------------------------
    // Validate name
    // -----------------------------

    if (!newName) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council name is required",
        },
        { status: 400 },
      );
    }

    if (newName.length < 2 || newName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council name must be between 2 and 100 characters",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Validate code
    // -----------------------------

    if (!Number.isInteger(newCode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council code must be a valid number",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Validate IDs
    // -----------------------------

    if (!mongoose.Types.ObjectId.isValid(newDistrict)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(newTown)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Verify District
    // -----------------------------

    const districtExists = await District.findOne({
      _id: newDistrict,
      isActive: true,
    });

    if (!districtExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or inactive district",
        },
        { status: 404 },
      );
    }

    // -----------------------------
    // Verify Town
    // -----------------------------

    const townExists = await Town.findOne({
      _id: newTown,
      isActive: true,
    });

    if (!townExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or inactive town",
        },
        { status: 404 },
      );
    }

    // -----------------------------
    // Verify Town -> District
    // -----------------------------

    if (townExists.district.toString() !== newDistrict.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected town does not belong to selected district",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Duplicate name
    // -----------------------------

    const duplicateName = await UnionCouncil.findOne({
      _id: { $ne: id },
      town: newTown,
      name: newName,
    });

    if (duplicateName) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council with this name already exists in this town",
        },
        { status: 409 },
      );
    }

    // -----------------------------
    // Duplicate code
    // -----------------------------

    const duplicateCode = await UnionCouncil.findOne({
      _id: { $ne: id },
      code: newCode,
    });

    if (duplicateCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council with this code already exists",
        },
        { status: 409 },
      );
    }

    // -----------------------------
    // Update
    // -----------------------------

    existing.name = newName;
    existing.code = newCode;
    existing.district = newDistrict;
    existing.town = newTown;

    if (isActive !== undefined) {
      existing.isActive = Boolean(isActive);
    }

    await existing.save();

    return NextResponse.json(
      {
        success: true,
        message: "Union Council updated successfully",
        data: existing,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update Union Council error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Union Council name already exists in this town or code already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update Union Council",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// DELETE - Soft Delete
// =====================================================

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Union Council ID",
        },
        { status: 400 },
      );
    }

    const unionCouncil = await UnionCouncil.findById(id);

    if (!unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council not found",
        },
        { status: 404 },
      );
    }

    if (!unionCouncil.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is already inactive",
        },
        { status: 400 },
      );
    }

    unionCouncil.isActive = false;

    await unionCouncil.save();

    return NextResponse.json(
      {
        success: true,
        message: "Union Council deleted successfully",
        data: {
          _id: unionCouncil._id,
          isActive: unionCouncil.isActive,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Union Council error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete Union Council",
      },
      { status: 500 },
    );
  }
}
