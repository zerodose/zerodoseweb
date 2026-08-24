import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Town from "@/models/Town";
import Campaign from "@/models/Campaign";
import Zerodose from "@/models/Zerodose";
import District from "@/models/District";
import UnionCouncil from "@/models/UnionCouncil";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const ucmoId = searchParams.get("ucmo")?.trim() || "";
    const campaignId = searchParams.get("campaign")?.trim() || "";
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
    // Validate UCMO ID
    // ============================================================

    if (!ucmoId || !mongoose.Types.ObjectId.isValid(ucmoId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid UCMO ID.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Get UCMO
    // ============================================================

    const ucmo = await User.findOne({
      _id: ucmoId,
      designation: "ucmo",
      isActive: true,
      approvalStatus: "approved",
    })
      .select("_id name district town unionCouncil")
      .populate("district", "name")
      .populate("town", "name district")
      .populate("unionCouncil", "name code")
      .lean();

    if (!ucmo) {
      return NextResponse.json(
        {
          success: false,
          message: "UCMO not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Validate Town
    // ============================================================

    if (!ucmo.town?._id) {
      return NextResponse.json(
        {
          success: false,
          message: "UCMO town not found.",
        },
        { status: 404 },
      );
    }

    const town = await Town.findById(ucmo.town._id)
      .select("_id name district")
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
    // Get Campaigns
    //
    // All campaigns are returned so frontend can show:
    // Current Campaign
    // Previous Campaigns
    // ============================================================

    const campaigns = await Campaign.find({})
      .select("_id name scope year month startDate endDate")
      .sort({
        startDate: -1,
      })
      .lean();

    // ============================================================
    // Calculate Campaign Status
    // ============================================================

    const now = new Date();

    const normalizedCampaigns = campaigns.map((campaign) => {
      const startDate = new Date(campaign.startDate);

      const endDate = new Date(campaign.endDate);
      endDate.setHours(23, 59, 59, 999);

      let campaignStatus = "previous";

      if (now < startDate) {
        campaignStatus = "upcoming";
      } else if (now <= endDate) {
        campaignStatus = "current";
      }

      return {
        ...campaign,
        campaignStatus,
      };
    });

    // ============================================================
    // Current Campaign
    // ============================================================

    const currentCampaign =
      normalizedCampaigns.find(
        (campaign) => campaign.campaignStatus === "current",
      ) || null;

    // ============================================================
    // Previous Campaigns
    // ============================================================

    const previousCampaigns = normalizedCampaigns.filter(
      (campaign) => campaign.campaignStatus === "previous",
    );

    // ============================================================
    // Select Campaign
    //
    // Priority:
    //
    // 1. Explicit campaign from frontend
    // 2. Current campaign
    // 3. Latest previous campaign
    // ============================================================

    let selectedCampaign = null;

    if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) {
      selectedCampaign =
        normalizedCampaigns.find(
          (campaign) => String(campaign._id) === String(campaignId),
        ) || null;
    }

    if (!selectedCampaign) {
      selectedCampaign = currentCampaign || previousCampaigns[0] || null;
    }

    // ============================================================
    // Get Active + Approved Supervisors
    // belonging to this UCMO
    // ============================================================

    const supervisorFilter = {
      designation: "supervisor",
      ucmo: ucmo._id,
      town: town._id,
      isActive: true,
      approvalStatus: "approved",
    };

    // ============================================================
    // Search
    //
    // Supervisor name
    // Supervisor code
    // UCMO name
    // UC name
    // UC code
    // ============================================================

    if (search) {
      const regex = new RegExp(search, "i");

      const matchingUCs = await UnionCouncil.find({
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
        .lean();

      const matchingUCIds = matchingUCs.map((item) => item._id);

      supervisorFilter.$or = [
        {
          name: regex,
        },
        {
          supervisorCode: regex,
        },
        {
          unionCouncil: {
            $in: matchingUCIds,
          },
        },
      ];
    }

    const supervisors = await User.find(supervisorFilter)
      .select("_id name supervisorCode district town unionCouncil ucmo")
      .populate("district", "name")
      .populate("town", "name")
      .populate("unionCouncil", "name code")
      .lean();

    // ============================================================
    // No Supervisors
    // ============================================================

    if (!supervisors.length) {
      return NextResponse.json(
        {
          success: true,

          data: [],

          ucmo: {
            _id: ucmo._id,
            name: ucmo.name,
          },

          town: {
            _id: town._id,
            name: town.name,
          },

          campaigns: normalizedCampaigns,

          currentCampaign,

          previousCampaigns,

          selectedCampaign,

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
    // Zerodose Filter
    // ============================================================

    const supervisorIds = supervisors.map((supervisor) => supervisor._id);

    const zerodoseFilter = {
      town: town._id,
      ucmo: ucmo._id,
      supervisor: {
        $in: supervisorIds,
      },
    };

    // ============================================================
    // Campaign Filter
    // ============================================================

    if (selectedCampaign?._id) {
      zerodoseFilter.campaign = selectedCampaign._id;
    }

    // ============================================================
    // Aggregate Zerodose
    //
    // One supervisor:
    //
    // recorded
    // visited
    // covered
    // ============================================================

    const zerodoseCounts = await Zerodose.aggregate([
      {
        $match: zerodoseFilter,
      },

      {
        $group: {
          _id: "$supervisor",

          recorded: {
            $sum: 1,
          },

          visited: {
            $sum: {
              $cond: [
                {
                  $eq: ["$vaccinationStatus", "visited"],
                },
                1,
                0,
              ],
            },
          },

          covered: {
            $sum: {
              $cond: [
                {
                  $eq: ["$vaccinationStatus", "covered"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // ============================================================
    // Count Map
    // ============================================================

    const zerodoseCountMap = new Map(
      zerodoseCounts.map((item) => [
        String(item._id),
        {
          recorded: Number(item.recorded || 0),
          visited: Number(item.visited || 0),
          covered: Number(item.covered || 0),
        },
      ]),
    );

    // ============================================================
    // Build Summary
    // ============================================================

    const summary = supervisors
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
      .map((supervisor) => {
        const counts = zerodoseCountMap.get(String(supervisor._id)) || {
          recorded: 0,
          visited: 0,
          covered: 0,
        };

        return {
          _id: supervisor._id,

          district: supervisor.district || ucmo.district || null,

          town: supervisor.town || ucmo.town || null,

          unionCouncil: supervisor.unionCouncil || ucmo.unionCouncil || null,

          ucmo: {
            _id: ucmo._id,
            name: ucmo.name,
          },

          supervisor: {
            _id: supervisor._id,
            name: supervisor.name,
            supervisorCode: supervisor.supervisorCode || "-",
          },

          recordedCount: counts.recorded,

          visitedCount: counts.visited,

          coveredCount: counts.covered,
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

        ucmo: {
          _id: ucmo._id,
          name: ucmo.name,
        },

        town: {
          _id: town._id,
          name: town.name,
        },

        campaigns: normalizedCampaigns,

        currentCampaign,

        previousCampaigns,

        selectedCampaign,

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
    console.error("Get town zerodose summary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch town zerodose summary.",
      },
      {
        status: 500,
      },
    );
  }
}
