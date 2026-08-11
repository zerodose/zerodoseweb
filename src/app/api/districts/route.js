import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import District from "@/models/District";

// ============================================================
// POST /api/districts
// Create District
// ============================================================

export async function POST(request) {
  try {
    console.log("POST /api/districts received");

    await connectDB();

    const body = await request.json();

    const { name, code } = body;

    // --------------------------------------------------------
    // Validate name
    // --------------------------------------------------------

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "District name is required",
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

    // --------------------------------------------------------
    // Validate code
    // --------------------------------------------------------

    if (code === undefined || code === null || code === "") {
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

    // --------------------------------------------------------
    // Check duplicate name
    // --------------------------------------------------------

    const existingName = await District.findOne({
      name: cleanName,
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

    // --------------------------------------------------------
    // Check duplicate code
    // --------------------------------------------------------

    const existingCode = await District.findOne({
      code: numericCode,
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

    // --------------------------------------------------------
    // Create district
    // --------------------------------------------------------

    const district = await District.create({
      name: cleanName,
      code: numericCode,
    });

    return NextResponse.json(
      {
        success: true,
        message: "District created successfully",
        data: district,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create district error:", error);

    // Mongo duplicate key
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
        message: "Failed to create district",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// GET /api/districts
//
// Examples:
//
// /api/districts
// /api/districts?page=1&limit=10
// /api/districts?search=lahore
// /api/districts?sortBy=name&sortOrder=asc
// /api/districts?sortBy=createdAt&sortOrder=desc
// /api/districts?status=active
// /api/districts?status=inactive
// /api/districts?status=all
// ============================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------

    const pageParam = Number(searchParams.get("page") || 1);
    const limitParam = Number(searchParams.get("limit") || 10);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const limit =
      Number.isInteger(limitParam) && limitParam > 0
        ? Math.min(limitParam, 100)
        : 10;

    const skip = (page - 1) * limit;

    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------

    const search = searchParams.get("search")?.trim() || "";

    // --------------------------------------------------------
    // Status
    //
    // active   = only active
    // inactive = only inactive
    // all      = both
    // default  = active
    // --------------------------------------------------------

    const status = searchParams.get("status") || "active";

    // --------------------------------------------------------
    // Sorting
    // --------------------------------------------------------

    const allowedSortFields = [
      "name",
      "code",
      "createdAt",
      "updatedAt",
      "isActive",
    ];

    const requestedSort = searchParams.get("sortBy") || "name";

    const sortBy = allowedSortFields.includes(requestedSort)
      ? requestedSort
      : "name";

    const requestedOrder = searchParams.get("sortOrder") || "asc";

    const sortOrder = requestedOrder.toLowerCase() === "desc" ? -1 : 1;

    // --------------------------------------------------------
    // Build query
    // --------------------------------------------------------

    const query = {};

    // Status filter
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }
    // status=all => no isActive filter

    // Search name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // --------------------------------------------------------
    // Total count
    // --------------------------------------------------------

    const total = await District.countDocuments(query);

    // --------------------------------------------------------
    // Fetch districts
    // --------------------------------------------------------

    const districts = await District.find(query)
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(skip)
      .limit(limit)
      .select("name code isActive createdAt updatedAt")
      .lean();

    // --------------------------------------------------------
    // Pagination information
    // --------------------------------------------------------

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,

        data: districts,

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
          status,
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get districts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch districts",
      },
      { status: 500 },
    );
  }
}
