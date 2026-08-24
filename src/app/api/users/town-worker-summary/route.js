import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const townId = searchParams.get("town");
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
    // Validate Town
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

    const town = await Town.findById(townId).select("_id name district").lean();

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
    // Get Active + Approved UCMOs
    // ============================================================

    const ucmoFilter = {
      designation: "ucmo",
      town: townId,
      isActive: true,
      approvalStatus: "approved",
    };

    // ============================================================
    // Search
    // Search UCMO / UC / code
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
          town: townId,
          $or: [{ name: regex }, { code: regex }],
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
    // Fetch UCMOs
    // ============================================================

    const ucmos = await User.find(ucmoFilter)
      .select("_id name district town unionCouncil")
      .populate("district", "name")
      .populate("town", "name")
      .populate("unionCouncil", "name code")
      .sort({ name: 1 })
      .lean();

    // ============================================================
    // If no UCMOs
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
        {
          status: 200,
        },
      );
    }

    // ============================================================
    // Get UCMO IDs
    // ============================================================

    const ucmoIds = ucmos.map((ucmo) => ucmo._id);

    // ============================================================
    // Get Active + Approved Supervisors
    // belonging to these UCMOs
    // ============================================================

    const supervisors = await User.find({
      designation: "supervisor",
      town: townId,
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
    // Supervisor IDs
    // ============================================================

    const supervisorIds = supervisors.map((supervisor) => supervisor._id);

    // ============================================================
    // Count Active + Approved Workers
    // per Supervisor
    //
    // Also get unique teams per Supervisor.
    //
    // Team = supervisor + teamNumber
    // ============================================================

    const workerStats = supervisorIds.length
      ? await User.aggregate([
          {
            $match: {
              designation: "worker",

              town: town._id,

              supervisor: {
                $in: supervisorIds,
              },

              isActive: true,

              approvalStatus: "approved",

              teamNumber: {
                $ne: null,
              },
            },
          },

          {
            $group: {
              _id: "$supervisor",

              workersCount: {
                $sum: 1,
              },

              // Unique team numbers for this supervisor
              teamNumbers: {
                $addToSet: "$teamNumber",
              },
            },
          },

          {
            $project: {
              _id: 1,

              workersCount: 1,

              teamsCount: {
                $size: "$teamNumbers",
              },
            },
          },
        ])
      : [];

    // ============================================================
    // Worker Statistics Map
    // ============================================================

    const workerStatsMap = new Map(
      workerStats.map((item) => [
        String(item._id),

        {
          workersCount: Number(item.workersCount || 0),

          teamsCount: Number(item.teamsCount || 0),
        },
      ]),
    );

    // ============================================================
    // Supervisor Count Map
    // ============================================================

    const supervisorCountMap = new Map();

    for (const supervisor of supervisors) {
      const key = String(supervisor.ucmo);

      if (!supervisorCountMap.has(key)) {
        supervisorCountMap.set(key, 0);
      }

      supervisorCountMap.set(key, supervisorCountMap.get(key) + 1);
    }

    // ============================================================
    // Build Result
    //
    // One row per UCMO
    //
    // UCMO row contains:
    // District
    // Town
    // Union Council
    // UC Code
    // UCMO
    // Supervisor Count
    // Workers Count
    // Teams Count
    // ============================================================

    const summary = ucmos.map((ucmo) => {
      const ucmoSupervisorList = supervisors.filter(
        (supervisor) => String(supervisor.ucmo) === String(ucmo._id),
      );

      // ----------------------------------------------------------
      // Total workers under this UCMO
      // ----------------------------------------------------------

      const workersCount = ucmoSupervisorList.reduce((total, supervisor) => {
        const stats = workerStatsMap.get(String(supervisor._id));

        return total + (stats?.workersCount || 0);
      }, 0);

      // ----------------------------------------------------------
      // Total teams under this UCMO
      // ----------------------------------------------------------

      const teamsCount = ucmoSupervisorList.reduce((total, supervisor) => {
        const stats = workerStatsMap.get(String(supervisor._id));

        return total + (stats?.teamsCount || 0);
      }, 0);

      return {
        _id: ucmo._id,

        district: ucmo.district || null,

        town: ucmo.town || null,

        unionCouncil: ucmo.unionCouncil || null,

        ucmo: {
          _id: ucmo._id,
          name: ucmo.name,
        },

        supervisorsCount: supervisorCountMap.get(String(ucmo._id)) || 0,

        workersCount,

        teamsCount,
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
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get town worker summary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch town worker summary.",
      },
      {
        status: 500,
      },
    );
  }
}
