import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";
import Zerodose from "@/models/Zerodose";
import Campaign from "@/models/Campaign";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const metricsParam = searchParams.get("metrics");
    const isActiveParam = searchParams.get("isActive");

    if (!metricsParam) {
      return NextResponse.json(
        {
          success: false,
          message: "metrics is required",
        },
        { status: 400 },
      );
    }

    const metrics = metricsParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const allowedMetrics = [
      "districts",
      "towns",
      "unionCouncils",
      "campaigns",
      "ucmos",
      "supervisors",
      "workers",
      "vaccinators",
      "otherStaff",
      "townFP",
      "districtFP",
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
    // isActive
    //
    // true  = active only
    // false = inactive only
    // all / missing = both
    // =====================================================

    // let activeFilter = {};

    // if (isActiveParam === "true") {
    //   activeFilter = {
    //     isActive: true,
    //   };
    // }

    // if (isActiveParam === "false") {
    //   activeFilter = {
    //     isActive: false,
    //   };
    // }

    // if (isActiveParam && !["true", "false", "all"].includes(isActiveParam)) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "isActive must be true, false or all",
    //     },
    //     { status: 400 },
    //   );
    // }

    let activeFilter = {};

    if (isActiveParam === "true") {
      activeFilter = {
        isActive: true,
      };
    } else if (isActiveParam === "false") {
      activeFilter = {
        isActive: false,
      };
    } else if (isActiveParam === "all" || !isActiveParam) {
      activeFilter = {};
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be true, false or all",
        },
        { status: 400 },
      );
    }

    const data = {};

    // =====================================================
    // Campaigns
    // =====================================================

    if (metrics.includes("campaigns")) {
      data.campaigns = await Campaign.countDocuments({
        ...activeFilter,
      });
    }
    // =====================================================
    // Locations
    // =====================================================

    if (metrics.includes("districts")) {
      data.districts = await District.countDocuments({
        ...activeFilter,
      });
    }

    if (metrics.includes("towns")) {
      data.towns = await Town.countDocuments({
        ...activeFilter,
      });
    }

    if (metrics.includes("unionCouncils")) {
      data.unionCouncils = await UnionCouncil.countDocuments({
        ...activeFilter,
      });
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
      townFP: "townFP",
      districtFP: "districtFP",
      admins: "admin",
    };

    for (const [metric, designation] of Object.entries(userMetrics)) {
      if (metrics.includes(metric)) {
        data[metric] = await User.countDocuments({
          designation,
          ...activeFilter,
        });
      }
    }

    // =====================================================
    // Teams
    //
    // Team = supervisor + teamNumber
    // =====================================================

    if (metrics.includes("teams")) {
      const workers = await User.find(
        {
          designation: "worker",
          teamNumber: {
            $ne: null,
          },
          supervisor: {
            $ne: null,
          },
        },
        {
          supervisor: 1,
          teamNumber: 1,
          isActive: 1,
        },
      ).lean();

      const teamsMap = new Map();

      for (const worker of workers) {
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

        // all / missing
        teamCount++;
      }

      data.teams = teamCount;
    }

    // =====================================================
    // Zerodose
    // Zerodose has no isActive
    // =====================================================

    if (metrics.includes("zerodose")) {
      data.zerodose = await Zerodose.countDocuments();
    }

    if (metrics.includes("recorded")) {
      data.recorded = await Zerodose.countDocuments({
        vaccinationStatus: "recorded",
      });
    }

    if (metrics.includes("visited")) {
      data.visited = await Zerodose.countDocuments({
        vaccinationStatus: "visited",
      });
    }

    if (metrics.includes("covered")) {
      data.covered = await Zerodose.countDocuments({
        vaccinationStatus: "covered",
      });
    }

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
    console.error("Global dashboard counts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch global dashboard counts",
      },
      {
        status: 500,
      },
    );
  }
}
