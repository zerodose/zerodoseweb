import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const pageParam = Number(searchParams.get("page") || 1);
    const limitParam = Number(searchParams.get("limit") || 10);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const limit =
      Number.isInteger(limitParam) && limitParam > 0
        ? Math.min(limitParam, 100)
        : 10;

    const skip = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const scope = searchParams.get("scope");
    const status = searchParams.get("status");

    const allowedSortFields = [
      "name",
      "scope",
      "year",
      "month",
      "startDate",
      "endDate",
      "createdAt",
      "updatedAt",
    ];

    const requestedSort = searchParams.get("sortBy") || "startDate";

    const sortBy = allowedSortFields.includes(requestedSort)
      ? requestedSort
      : "startDate";

    const requestedOrder = searchParams.get("sortOrder") || "desc";

    const sortOrder = requestedOrder.toLowerCase() === "asc" ? 1 : -1;

    const query = {};

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          scope: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (year) {
      const numericYear = Number(year);

      if (Number.isInteger(numericYear)) {
        query.year = numericYear;
      }
    }

    if (month) {
      const numericMonth = Number(month);

      if (
        Number.isInteger(numericMonth) &&
        numericMonth >= 1 &&
        numericMonth <= 12
      ) {
        query.month = numericMonth;
      }
    }

    if (scope) {
      const allowedScopes = [
        "nationwide",
        "high_risk_districts",
        "sindh_karachi",
        "karachi",
      ];

      if (allowedScopes.includes(scope)) {
        query.scope = scope;
      }
    }

    const now = new Date();

    if (status === "current") {
      query.startDate = {
        $lte: now,
      };

      query.endDate = {
        $gte: now,
      };
    }

    if (status === "upcoming") {
      query.startDate = {
        $gt: now,
      };
    }

    if (status === "previous") {
      query.endDate = {
        $lt: now,
      };
    }

    const total = await Campaign.countDocuments(query);

    const campaigns = await Campaign.find(query)
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(skip)
      .limit(limit);

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
          scope: scope || null,
          status: status || null,
        },
        sorting: {
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get campaigns error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch campaigns.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, scope, year, month, startDate, endDate } = body;

    if (
      !name ||
      !scope ||
      year === undefined ||
      month === undefined ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, scope, year, month, start date and end date are required.",
        },
        {
          status: 400,
        },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid start date.",
        },
        {
          status: 400,
        },
      );
    }

    if (Number.isNaN(end.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid end date.",
        },
        {
          status: 400,
        },
      );
    }

    if (start > end) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign end date cannot be before start date.",
        },
        {
          status: 400,
        },
      );
    }

    const allowedScopes = [
      "nationwide",
      "high_risk_districts",
      "sindh_karachi",
      "karachi",
    ];

    if (!allowedScopes.includes(scope)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid campaign scope.",
        },
        {
          status: 400,
        },
      );
    }

    const existingCampaign = await Campaign.findOne({
      startDate: {
        $lte: end,
      },
      endDate: {
        $gte: start,
      },
    });

    if (existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Another campaign already exists during these dates.",
        },
        {
          status: 409,
        },
      );
    }

    const campaign = await Campaign.create({
      name,
      scope,
      year: Number(year),
      month: Number(month),
      startDate: start,
      endDate: end,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully.",
        data: campaign,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create campaign error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A campaign already exists.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create campaign.",
      },
      {
        status: 400,
      },
    );
  }
}
