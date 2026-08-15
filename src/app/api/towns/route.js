import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Town from "@/models/Town";
import District from "@/models/District";

/*
|--------------------------------------------------------------------------
| GET /api/towns
|--------------------------------------------------------------------------
| Supports:
|
| ?page=1
| ?limit=10
| ?search=rawalpindi
| ?district=<districtId>
| ?isActive=true
| ?sortBy=name
| ?sortOrder=asc
|
| Examples:
|
| /api/towns
| /api/towns?page=2&limit=20
| /api/towns?search=lahore
| /api/towns?district=65abc123...
| /api/towns?sortBy=name&sortOrder=desc
| /api/towns?isActive=false
|--------------------------------------------------------------------------
*/

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1,
    );

    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "10", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    // Search
    const search = searchParams.get("search")?.trim() || "";

    // Filters
    const districtId = searchParams.get("district")?.trim() || "";

    const isActiveParam = searchParams.get("isActive");

    // Sorting
    const allowedSortFields = ["name", "createdAt", "updatedAt"];

    const requestedSortBy = searchParams.get("sortBy") || "name";

    const sortBy = allowedSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : "name";

    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;

    // Build query
    const query = {};

    // Active filter
    if (isActiveParam === "true") {
      query.isActive = true;
    } else if (isActiveParam === "false") {
      query.isActive = false;
    } else {
      // Default: active only
      query.isActive = true;
    }

    // Search by town name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // District filter
    if (districtId) {
      if (!mongoose.Types.ObjectId.isValid(districtId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid district ID",
          },
          { status: 400 },
        );
      }

      query.district = districtId;
    }

    // Count
    const total = await Town.countDocuments(query);

    // Fetch
    const towns = await Town.find(query)
      .populate("district", "name")
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedTowns = towns.map((town) => ({
      ...town,
      districtName: town.district?.name || "-",
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: formattedTowns,

        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },

        filters: {
          search,
          district: districtId || null,
          isActive: isActiveParam === null ? true : isActiveParam === "true",
        },

        sorting: {
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get towns error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch towns",
      },
      { status: 500 },
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/towns
|--------------------------------------------------------------------------
| Body:
|
| {
|   "name": "Rawalpindi",
|   "district": "DISTRICT_ID"
| }
|--------------------------------------------------------------------------
*/

export async function POST(request) {
  try {
    console.log("POST /api/towns received");

    await connectDB();

    const body = await request.json();

    const { name, district } = body;

    // Validate name
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name is required",
        },
        { status: 400 },
      );
    }

    const townName = name.trim();

    if (townName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    if (townName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name cannot exceed 100 characters",
        },
        { status: 400 },
      );
    }

    // Validate district
    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(district)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    // Check district exists and is active
    const existingDistrict = await District.findOne({
      _id: district,
      isActive: true,
    });

    if (!existingDistrict) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found or inactive",
        },
        { status: 404 },
      );
    }

    // Check duplicate town within same district
    const existingTown = await Town.findOne({
      district,
      name: townName,
    });

    if (existingTown) {
      return NextResponse.json(
        {
          success: false,
          message: "A town with this name already exists in this district",
        },
        { status: 409 },
      );
    }

    // Create town
    const town = await Town.create({
      name: townName,
      district,
    });

    // Return populated district
    const createdTown = await Town.findById(town._id)
      .populate("district", "name")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Town created successfully",
        data: createdTown,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create town error:", error);

    // Mongo duplicate key safety
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A town with this name already exists in this district",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create town",
      },
      { status: 500 },
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/towns
|--------------------------------------------------------------------------
| Body:
|
| {
|   "_id": "TOWN_ID",
|   "name": "New Town Name",
|   "district": "DISTRICT_ID"
| }
|--------------------------------------------------------------------------
*/

export async function PUT(request) {
  try {
    console.log("PUT /api/towns received");

    await connectDB();

    const body = await request.json();

    const { _id, name, district } = body;

    // Validate town ID
    if (!_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Town ID is required",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 },
      );
    }

    // Validate name
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name is required",
        },
        { status: 400 },
      );
    }

    const townName = name.trim();

    if (townName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    if (townName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name cannot exceed 100 characters",
        },
        { status: 400 },
      );
    }

    // Validate district
    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(district)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 },
      );
    }

    // Check town exists
    const existingTown = await Town.findById(_id);

    if (!existingTown) {
      return NextResponse.json(
        {
          success: false,
          message: "Town not found",
        },
        { status: 404 },
      );
    }

    // Check district exists and active
    const existingDistrict = await District.findOne({
      _id: district,
      isActive: true,
    });

    if (!existingDistrict) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found or inactive",
        },
        { status: 404 },
      );
    }

    // Check duplicate name in same district
    const duplicateTown = await Town.findOne({
      _id: { $ne: _id },
      district,
      name: townName,
    });

    if (duplicateTown) {
      return NextResponse.json(
        {
          success: false,
          message: "A town with this name already exists in this district",
        },
        { status: 409 },
      );
    }

    // Update
    existingTown.name = townName;
    existingTown.district = district;

    await existingTown.save();

    const updatedTown = await Town.findById(_id)
      .populate("district", "name")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Town updated successfully",
        data: updatedTown,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update town error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A town with this name already exists in this district",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update town",
      },
      { status: 500 },
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE /api/towns
|--------------------------------------------------------------------------
| Soft delete:
|
| {
|   "_id": "TOWN_ID"
| }
|
| Default behaviour:
| isActive = false
|
| To permanently delete:
|
| ?permanent=true
|--------------------------------------------------------------------------
*/

export async function DELETE(request) {
  try {
    console.log("DELETE /api/towns received");

    await connectDB();

    const { searchParams } = new URL(request.url);

    const permanent = searchParams.get("permanent") === "true";

    const body = await request.json().catch(() => ({}));

    const _id = body?._id || searchParams.get("id");

    // Validate ID
    if (!_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Town ID is required",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 },
      );
    }

    const town = await Town.findById(_id);

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town not found",
        },
        { status: 404 },
      );
    }

    // Permanent delete
    if (permanent) {
      await Town.deleteOne({
        _id,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Town permanently deleted",
        },
        { status: 200 },
      );
    }

    // Soft delete
    if (!town.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Town is already inactive",
        },
        { status: 400 },
      );
    }

    town.isActive = false;

    await town.save();

    return NextResponse.json(
      {
        success: true,
        message: "Town deleted successfully",
        data: {
          _id: town._id,
          name: town.name,
          isActive: town.isActive,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete town error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete town",
      },
      { status: 500 },
    );
  }
}
