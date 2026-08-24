import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const townId = searchParams.get("town")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1,
    );

    const limit = Math.max(
      Number.parseInt(searchParams.get("limit") || "10", 10),
      1,
    );

    // ============================================================
    // Validate Town ID
    // ============================================================

    if (!townId) {
      return NextResponse.json(
        {
          success: false,
          message: "Town ID is required.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Find Town
    // ============================================================

    const town = await Town.findById(townId)
      .select("_id name district")
      .populate("district", "name")
      .lean();

    if (!town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Active + Approved UCMOs
    // ============================================================

    const ucmoFilter = {
      designation: "ucmo",
      town: town._id,
      isActive: true,
      approvalStatus: "approved",
    };

    // ============================================================
    // Search
    //
    // Search by:
    // UCMO name
    // UC name
    // UC code
    // ============================================================

    if (search) {
      const regex = new RegExp(search, "i");

      const [matchingUCMOs, matchingUCs] = await Promise.all([
        User.find({
          ...ucmoFilter,
          name: regex,
        })
          .select("_id")
          .lean(),

        UnionCouncil.find({
          town: town._id,
          $or: [
            {
              name: regex,
            },
            {
              code: regex,
            },
          ],
        })
          .select("_id")
          .lean(),
      ]);

      const ucmoIds = matchingUCMOs.map((item) => item._id);

      const ucIds = matchingUCs.map((item) => item._id);

      ucmoFilter.$or = [
        {
          _id: {
            $in: ucmoIds,
          },
        },
        {
          unionCouncil: {
            $in: ucIds,
          },
        },
      ];
    }

    // ============================================================
    // Get UCMOs
    // ============================================================

    const ucmos = await User.find(ucmoFilter)
      .select("_id name district town unionCouncil")
      .populate("district", "name")
      .populate("town", "name")
      .populate("unionCouncil", "name code")
      .sort({
        name: 1,
      })
      .lean();

    // ============================================================
    // No UCMOs
    // ============================================================

    if (!ucmos.length) {
      return NextResponse.json(
        {
          success: true,

          data: [],

          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
        { status: 200 },
      );
    }

    // ============================================================
    // UCMO IDs
    // ============================================================

    const ucmoIds = ucmos.map((ucmo) => ucmo._id);

    // ============================================================
    // Active + Approved Supervisors
    // ============================================================

    const supervisors = await User.find({
      designation: "supervisor",

      town: town._id,

      ucmo: {
        $in: ucmoIds,
      },

      isActive: true,

      approvalStatus: "approved",
    })
      .select("_id name supervisorCode ucmo district town unionCouncil")
      .populate("district", "name")
      .populate("town", "name")
      .populate("unionCouncil", "name code")
      .lean();

    // ============================================================
    // Supervisor Count Map
    // ============================================================

    const supervisorCountMap = new Map();

    for (const supervisor of supervisors) {
      if (!supervisor.ucmo) {
        continue;
      }

      const ucmoId = String(supervisor.ucmo);

      const currentCount = supervisorCountMap.get(ucmoId) || 0;

      supervisorCountMap.set(ucmoId, currentCount + 1);
    }

    // ============================================================
    // Build Summary
    // ============================================================

    const summary = ucmos.map((ucmo) => {
      const ucmoId = String(ucmo._id);

      return {
        _id: ucmo._id,

        district: ucmo.district || null,

        town: ucmo.town || null,

        unionCouncil: ucmo.unionCouncil || null,

        ucmo: {
          _id: ucmo._id,
          name: ucmo.name,
        },

        supervisorsCount: supervisorCountMap.get(ucmoId) || 0,
      };
    });

    // ============================================================
    // Pagination
    // ============================================================

    const total = summary.length;

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const safePage = Math.min(page, totalPages);

    const startIndex = (safePage - 1) * limit;

    const paginatedData = summary.slice(startIndex, startIndex + limit);

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        data: paginatedData,

        pagination: {
          page: safePage,
          limit,
          total,
          totalPages,
          hasNextPage: safePage < totalPages,
          hasPreviousPage: safePage > 1,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get town supervisor summary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch town supervisor summary.",
      },
      { status: 500 },
    );
  }
}
