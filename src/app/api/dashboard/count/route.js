import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";
import Zerodose from "@/models/Zerodose";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const metricsParam = searchParams.get("metrics");
    const isActiveParam = searchParams.get("isActive");

    // =====================================================
    // Required parameters
    // =====================================================

    if (!type || !id || !metricsParam) {
      return NextResponse.json(
        {
          success: false,
          message: "type, id and metrics are required",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Metrics
    // =====================================================

    const metrics = metricsParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const allowedMetrics = [
      "towns",
      "unionCouncils",

      "ucmos",
      "supervisors",
      "workers",
      "vaccinators",
      "otherStaff",
      "admins",

      "teams",

      "zerodose",
      "recorded",
      "visited",
      "covered",
    ];

    const invalidMetrics = metrics.filter(
      (metric) => !allowedMetrics.includes(metric),
    );

    if (invalidMetrics.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid metrics: ${invalidMetrics.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Type
    // =====================================================

    const allowedTypes = ["district", "town", "unionCouncil"];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid type. Allowed values: district, town, unionCouncil",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // isActive
    //
    // true  = active only
    // false = inactive only
    // all   = both
    // missing = both
    // =====================================================

    let activeFilter = {};

    if (isActiveParam === "true") {
      activeFilter = {
        isActive: true,
      };
    }

    if (isActiveParam === "false") {
      activeFilter = {
        isActive: false,
      };
    }

    if (isActiveParam && !["true", "false", "all"].includes(isActiveParam)) {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be true, false or all",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Verify location
    // =====================================================

    if (type === "district") {
      const district = await District.exists({
        _id: id,
      });

      if (!district) {
        return NextResponse.json(
          {
            success: false,
            message: "District not found",
          },
          { status: 404 },
        );
      }
    }

    if (type === "town") {
      const town = await Town.exists({
        _id: id,
      });

      if (!town) {
        return NextResponse.json(
          {
            success: false,
            message: "Town not found",
          },
          { status: 404 },
        );
      }
    }

    if (type === "unionCouncil") {
      const unionCouncil = await UnionCouncil.exists({
        _id: id,
      });

      if (!unionCouncil) {
        return NextResponse.json(
          {
            success: false,
            message: "Union Council not found",
          },
          { status: 404 },
        );
      }
    }

    // =====================================================
    // Location filters
    // =====================================================

    const userLocationFilter = {};
    const townFilter = {};
    const unionCouncilFilter = {};
    const zerodoseLocationFilter = {};

    if (type === "district") {
      userLocationFilter.district = id;

      townFilter.district = id;

      unionCouncilFilter.district = id;

      zerodoseLocationFilter.districtId = id;
    }

    if (type === "town") {
      userLocationFilter.town = id;

      unionCouncilFilter.town = id;

      zerodoseLocationFilter.townId = id;
    }

    if (type === "unionCouncil") {
      userLocationFilter.unionCouncil = id;

      zerodoseLocationFilter.unionCouncilId = id;
    }

    // =====================================================
    // Result
    // =====================================================

    const data = {};

    // =====================================================
    // Towns
    // Only district can request towns
    // =====================================================

    if (metrics.includes("towns")) {
      if (type !== "district") {
        return NextResponse.json(
          {
            success: false,
            message: "towns count can only be requested for a district",
          },
          { status: 400 },
        );
      }

      data.towns = await Town.countDocuments({
        ...townFilter,
        ...activeFilter,
      });
    }

    // =====================================================
    // Union Councils
    // =====================================================

    if (metrics.includes("unionCouncils")) {
      if (type === "district") {
        data.unionCouncils = await UnionCouncil.countDocuments({
          ...unionCouncilFilter,
          ...activeFilter,
        });
      }

      if (type === "town") {
        data.unionCouncils = await UnionCouncil.countDocuments({
          ...unionCouncilFilter,
          ...activeFilter,
        });
      }

      if (type === "unionCouncil") {
        const unionCouncil = await UnionCouncil.findOne({
          _id: id,
          ...activeFilter,
        }).select("_id");

        data.unionCouncils = unionCouncil ? 1 : 0;
      }
    }

    // =====================================================
    // Users
    // =====================================================

    const userMetrics = {
      ucmos: "ucmo",
      supervisors: "supervisor",
      workers: "worker",
      vaccinators: "vaccinator",
      otherStaff: "otherStaff",
      admins: "admin",
    };

    for (const [metric, designation] of Object.entries(userMetrics)) {
      if (metrics.includes(metric)) {
        data[metric] = await User.countDocuments({
          ...userLocationFilter,
          designation,
          ...activeFilter,
        });
      }
    }

    // =====================================================
    // Teams
    //
    // Team = supervisor + teamNumber
    //
    // Active:
    // At least one active worker belongs to that team.
    //
    // Inactive:
    // Team has workers but none of its workers are active.
    //
    // All:
    // Unique supervisor + teamNumber combinations.
    // =====================================================

    if (metrics.includes("teams")) {
      const teamUsers = await User.find(
        {
          ...userLocationFilter,
          designation: "worker",
          teamNumber: {
            $ne: null,
          },
          supervisor: {
            $ne: null,
          },
        },
        {
          teamNumber: 1,
          supervisor: 1,
          isActive: 1,
        },
      ).lean();

      const teamsMap = new Map();

      for (const worker of teamUsers) {
        const key = `${worker.supervisor.toString()}_${worker.teamNumber}`;

        if (!teamsMap.has(key)) {
          teamsMap.set(key, {
            hasActiveWorker: false,
            hasInactiveWorker: false,
          });
        }

        const team = teamsMap.get(key);

        if (worker.isActive) {
          team.hasActiveWorker = true;
        } else {
          team.hasInactiveWorker = true;
        }
      }

      let teamCount = 0;

      for (const team of teamsMap.values()) {
        if (isActiveParam === "true") {
          if (team.hasActiveWorker) {
            teamCount++;
          }

          continue;
        }

        if (isActiveParam === "false") {
          if (!team.hasActiveWorker && team.hasInactiveWorker) {
            teamCount++;
          }

          continue;
        }

        // all / no parameter
        teamCount++;
      }

      data.teams = teamCount;
    }

    // =====================================================
    // Zerodose
    //
    // Zerodose has no isActive field.
    // =====================================================

    if (metrics.includes("zerodose")) {
      data.zerodose = await Zerodose.countDocuments(zerodoseLocationFilter);
    }

    if (metrics.includes("recorded")) {
      data.recorded = await Zerodose.countDocuments({
        ...zerodoseLocationFilter,
        status: "recorded",
      });
    }

    if (metrics.includes("visited")) {
      data.visited = await Zerodose.countDocuments({
        ...zerodoseLocationFilter,
        status: "visited",
      });
    }

    if (metrics.includes("covered")) {
      data.covered = await Zerodose.countDocuments({
        ...zerodoseLocationFilter,
        status: "covered",
      });
    }

    // =====================================================
    // Response
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Dashboard counts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard counts",
      },
      {
        status: 500,
      },
    );
  }
}
