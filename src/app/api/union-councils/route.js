import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UnionCouncil from "@/models/UnionCouncil";
import District from "@/models/District";
import Town from "@/models/Town";

// =====================================================
// POST - Create Union Council
// =====================================================

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, code, district, town } = body;

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council name is required",
        },
        { status: 400 },
      );
    }

    if (code === undefined || code === null || code === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council code is required",
        },
        { status: 400 },
      );
    }

    const numericCode = Number(code);

    if (!Number.isInteger(numericCode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council code must be a valid number",
        },
        { status: 400 },
      );
    }

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required",
        },
        { status: 400 },
      );
    }

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town is required",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Verify District
    // -----------------------------

    const districtExists = await District.findOne({
      _id: district,
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
      _id: town,
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
    // Verify Town belongs to District
    // -----------------------------

    if (townExists.district.toString() !== district.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected town does not belong to selected district",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Duplicate name in same town
    // -----------------------------

    const existingName = await UnionCouncil.findOne({
      town,
      name: name.trim(),
    });

    if (existingName) {
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

    const existingCode = await UnionCouncil.findOne({
      code: numericCode,
    });

    if (existingCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council with this code already exists",
        },
        { status: 409 },
      );
    }

    // -----------------------------
    // Create
    // -----------------------------

    const unionCouncil = await UnionCouncil.create({
      name: name.trim(),
      code: numericCode,
      district,
      town,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Union Council created successfully",
        data: unionCouncil,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Union Council error:", error);

    // Invalid ObjectId
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district, town, or union council ID",
        },
        { status: 400 },
      );
    }

    // Mongo duplicate key
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
        message: "Failed to create Union Council",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// GET - List Union Councils
//
// Supports:
//
// ?page=1
// ?limit=10
// ?search=abc
// ?sortBy=name
// ?sortOrder=asc
// ?districtId=...
// ?townId=...
// ?includeInactive=true
// =====================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1,
    );

    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "10", 10), 1),
      100,
    );

    const search = searchParams.get("search")?.trim() || "";

    const sortByParam = searchParams.get("sortBy") || "name";

    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;

    const districtId = searchParams.get("districtId")?.trim() || "";

    const townId = searchParams.get("townId")?.trim() || "";

    const includeInactive = searchParams.get("includeInactive") === "true";

    // -----------------------------
    // Allowed sorting fields
    // -----------------------------

    const allowedSortFields = ["name", "code", "createdAt", "updatedAt"];

    const sortBy = allowedSortFields.includes(sortByParam)
      ? sortByParam
      : "name";

    // -----------------------------
    // Build filter
    // -----------------------------

    const filter = {};

    if (!includeInactive) {
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          code: Number.isNaN(Number(search)) ? -999999999 : Number(search),
        },
      ];
    }

    // -----------------------------
    // District filter
    // -----------------------------

    if (districtId) {
      filter.district = districtId;
    }

    // -----------------------------
    // Town filter
    // -----------------------------

    if (townId) {
      filter.town = townId;
    }

    // -----------------------------
    // Pagination
    // -----------------------------

    const skip = (page - 1) * limit;

    const [unionCouncils, total] = await Promise.all([
      UnionCouncil.find(filter)
        .populate("district", "name code")
        .populate("town", "name")
        .sort({
          [sortBy]: sortOrder,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      UnionCouncil.countDocuments(filter),
    ]);

    const formattedUnionCouncils = unionCouncils.map((uc) => ({
      ...uc,
      districtName: uc.district?.name || "-",
      townName: uc.town?.name || "-",
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: formattedUnionCouncils,

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
          districtId,
          townId,
          includeInactive,
        },

        sorting: {
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Union Councils error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Union Councils",
      },
      { status: 500 },
    );
  }
}
