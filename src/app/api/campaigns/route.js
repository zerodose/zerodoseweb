import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";

// =====================================================
// GET ALL CAMPAIGNS
// =====================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // =====================================================
    // Pagination
    // =====================================================

    const pageParam = Number(searchParams.get("page") || 1);
    const limitParam = Number(searchParams.get("limit") || 10);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const limit =
      Number.isInteger(limitParam) && limitParam > 0
        ? Math.min(limitParam, 100)
        : 10;

    const skip = (page - 1) * limit;

    // =====================================================
    // Search
    // =====================================================

    const search = searchParams.get("search")?.trim() || "";

    // =====================================================
    // Filters
    // =====================================================

    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const isActive = searchParams.get("isActive");

    // =====================================================
    // Sorting
    // =====================================================

    const allowedSortFields = [
      "name",
      "year",
      "month",
      "startDate",
      "endDate",
      "createdAt",
      "updatedAt",
      "isActive",
    ];

    const requestedSort = searchParams.get("sortBy") || "startDate";

    const sortBy = allowedSortFields.includes(requestedSort)
      ? requestedSort
      : "startDate";

    const requestedOrder = searchParams.get("sortOrder") || "desc";

    const sortOrder = requestedOrder.toLowerCase() === "asc" ? 1 : -1;

    // =====================================================
    // Build Query
    // =====================================================

    const query = {};

    // Search campaign name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Year filter
    if (year) {
      const numericYear = Number(year);

      if (Number.isInteger(numericYear)) {
        query.year = numericYear;
      }
    }

    // Month filter
    if (month) {
      const numericMonth = Number(month);

      if (Number.isInteger(numericMonth)) {
        query.month = numericMonth;
      }
    }

    // Active filter
    if (isActive === "true") {
      query.isActive = true;
    } else if (isActive === "false") {
      query.isActive = false;
    }

    // =====================================================
    // Count
    // =====================================================

    const total = await Campaign.countDocuments(query);

    // =====================================================
    // Fetch
    // =====================================================

    const campaigns = await Campaign.find(query)
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // =====================================================
    // Pagination
    // =====================================================

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,

        data: campaigns,

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
          year: year || null,
          month: month || null,
          isActive: isActive === null ? null : isActive === "true",
        },

        sorting: {
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get campaigns error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch campaigns.",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// ADD CAMPAIGN
// =====================================================

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, year, month, startDate, isActive = true } = body;

    // =====================================================
    // Required Fields
    // =====================================================

    if (!name || year === undefined || month === undefined || !startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, year, month and start date are required.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Calculate End Date
    // 8 calendar days total
    // Start Date + 7 days
    // =====================================================

    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid start date.",
        },
        { status: 400 },
      );
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    // =====================================================
    // Prevent Multiple Campaigns On Same Date
    // =====================================================

    const existingCampaign = await Campaign.findOne({
      startDate: {
        $gte: new Date(start.setHours(0, 0, 0, 0)),
        $lt: new Date(start.setHours(23, 59, 59, 999)),
      },
    });

    if (existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          message: `A campaign already exists on ${startDate}. Only one campaign can be created on the same date.`,
        },
        { status: 409 },
      );
    }

    // =====================================================
    // Create Campaign
    // =====================================================

    const campaign = await Campaign.create({
      name,
      year: Number(year),
      month: Number(month),
      startDate: new Date(startDate),
      endDate: end,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully.",
        data: campaign,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create campaign error:", error);

    // Duplicate index
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A campaign already exists for this date.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create campaign.",
      },
      { status: 400 },
    );
  }
}
