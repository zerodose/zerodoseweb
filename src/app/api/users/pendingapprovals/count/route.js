import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const designation = searchParams.get("designation");

    if (!userId || !designation) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID and designation are required.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Approval hierarchy
    // ============================================================

    const approvalMap = {
      admin: ["districtFP"],
      districtFP: ["townFP"],
      townFP: ["ucmo"],
      ucmo: ["supervisor", "vaccinator", "otherStaff"],
    };

    const pendingDesignations = approvalMap[designation];

    // This designation is not an approver
    if (!pendingDesignations) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
        },
        {
          status: 200,
        },
      );
    }

    // ============================================================
    // Get current approver
    // ============================================================

    const approver = await User.findById(userId).lean();

    if (!approver) {
      return NextResponse.json(
        {
          success: false,
          message: "Approver not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (approver.designation !== designation) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid designation for this user.",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // Base pending request filter
    // ============================================================

    const filter = {
      designation: { $in: pendingDesignations },
      approvalStatus: "pending",
      isActive: true,
    };

    // ============================================================
    // Scope-wise filtering
    // ============================================================

    // Admin
    // ------------------------------------------------------------
    // Admin sees all pending DistrictFP requests.
    //
    // No additional scope filter required.
    //

    if (designation === "admin") {
      // Nothing extra
    }

    // DistrictFP
    // ------------------------------------------------------------
    // DistrictFP sees only TownFP requests from its district.
    //
    else if (designation === "districtFP") {
      if (!approver.district) {
        return NextResponse.json(
          {
            success: true,
            count: 0,
          },
          {
            status: 200,
          },
        );
      }

      filter.district = approver.district;
    }

    // TownFP
    // ------------------------------------------------------------
    // TownFP sees only UCMO requests from its town.
    //
    else if (designation === "townFP") {
      if (!approver.town) {
        return NextResponse.json(
          {
            success: true,
            count: 0,
          },
          {
            status: 200,
          },
        );
      }

      filter.town = approver.town;
    }

    // UCMO
    // ------------------------------------------------------------
    // UCMO sees Supervisor + Vaccinator requests
    // from its Union Council.
    //
    else if (designation === "ucmo") {
      if (!approver.unionCouncil) {
        return NextResponse.json(
          {
            success: true,
            count: 0,
          },
          {
            status: 200,
          },
        );
      }

      filter.unionCouncil = approver.unionCouncil;
    }

    // ============================================================
    // Count pending approvals
    // ============================================================

    const count = await User.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        count,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Pending approval count error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch pending approval count.",
      },
      {
        status: 500,
      },
    );
  }
}
