import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Town from "@/models/Town";
import District from "@/models/District";

/*
|--------------------------------------------------------------------------
| GET /api/towns/:id
|--------------------------------------------------------------------------
| Get a single town
|--------------------------------------------------------------------------
*/

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 }
      );
    }

    const town = await Town.findById(id)
      .populate("district", "name code")
      .lean();

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: town,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get town error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch town",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/towns/:id
|--------------------------------------------------------------------------
| Update a single town
|
| Body:
|
| {
|   "name": "New Town Name",
|   "district": "DISTRICT_ID"
| }
|--------------------------------------------------------------------------
*/

export async function PUT(request, { params }) {
  try {
    console.log("PUT /api/towns/:id received");

    await connectDB();

    const { id } = await params;

    // Validate town ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { name, district } = body;

    /*
    |--------------------------------------------------------------------------
    | Validate name
    |--------------------------------------------------------------------------
    */

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name is required",
        },
        { status: 400 }
      );
    }

    const townName = name.trim();

    if (townName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    if (townName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Town name cannot exceed 100 characters",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate district
    |--------------------------------------------------------------------------
    */

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(district)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check town exists
    |--------------------------------------------------------------------------
    */

    const existingTown = await Town.findById(id);

    if (!existingTown) {
      return NextResponse.json(
        {
          success: false,
          message: "Town not found",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check district exists and is active
    |--------------------------------------------------------------------------
    */

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
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check duplicate town
    |--------------------------------------------------------------------------
    | Same town name is allowed in different districts.
    | Same town name is NOT allowed in the same district.
    |--------------------------------------------------------------------------
    */

    const duplicateTown = await Town.findOne({
      _id: {
        $ne: id,
      },
      district,
      name: townName,
    });

    if (duplicateTown) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A town with this name already exists in this district",
        },
        { status: 409 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update town
    |--------------------------------------------------------------------------
    */

    existingTown.name = townName;
    existingTown.district = district;

    await existingTown.save();

    /*
    |--------------------------------------------------------------------------
    | Return updated town with district
    |--------------------------------------------------------------------------
    */

    const updatedTown = await Town.findById(id)
      .populate("district", "name code")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Town updated successfully",
        data: updatedTown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update town error:", error);

    /*
    |--------------------------------------------------------------------------
    | Mongo duplicate key safety
    |--------------------------------------------------------------------------
    */

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A town with this name already exists in this district",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update town",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE /api/towns/:id
|--------------------------------------------------------------------------
| Default:
| Soft delete -> isActive = false
|
| Permanent:
| DELETE /api/towns/:id?permanent=true
|--------------------------------------------------------------------------
*/

export async function DELETE(request, { params }) {
  try {
    console.log("DELETE /api/towns/:id received");

    await connectDB();

    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check permanent delete
    |--------------------------------------------------------------------------
    */

    const { searchParams } = new URL(request.url);

    const permanent =
      searchParams.get("permanent") === "true";

    /*
    |--------------------------------------------------------------------------
    | Find town
    |--------------------------------------------------------------------------
    */

    const town = await Town.findById(id);

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town not found",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Permanent delete
    |--------------------------------------------------------------------------
    */

    if (permanent) {
      await Town.deleteOne({
        _id: id,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Town permanently deleted",
        },
        { status: 200 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Soft delete
    |--------------------------------------------------------------------------
    */

    if (!town.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Town is already inactive",
        },
        { status: 400 }
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
          district: town.district,
          isActive: town.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete town error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete town",
      },
      { status: 500 }
    );
  }
}
