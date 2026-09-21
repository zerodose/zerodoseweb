
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
        { status: 400 },
      );
    }

    // ============================================================
    // Approval hierarchy
    // ============================================================

    const approvalMap = {
      admin: ["districtfp"],
      districtfp: ["townfp"],
      townfp: ["ucmo"],
      ucmo: ["supervisor", "vaccinator", "otherstaff", "otherStaff"],
    };

    const pendingDesignations = approvalMap[designation];

    // ============================================================
    // Not an approver
    // ============================================================

    if (!pendingDesignations) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
        },
        { status: 200 },
      );
    }

    // ============================================================
    // Get current approver
    // ============================================================

    const approver = await User.findById(userId)
      .select("designation district town unionCouncil")
      .lean();

    if (!approver) {
      return NextResponse.json(
        {
          success: false,
          message: "Approver not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Validate designation
    // ============================================================

    if (
      String(approver.designation || "").toLowerCase() !==
      String(designation || "").toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid designation for this user.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Base pending filter
    //
    // MUST remain consistent with:
    // /users/pendingapprovals
    //
    // Pending user:
    // approvalStatus = pending
    // isActive = false
    // ============================================================

    const baseFilter = {
      approvalStatus: "pending",
      isActive: false,
    };

    // ============================================================
    // ADMIN
    //
    // Admin can approve all pending District FP requests.
    // ============================================================

    if (designation === "admin") {
      const count = await User.countDocuments({
        ...baseFilter,
        designation: "districtfp",
      });

      return NextResponse.json(
        {
          success: true,
          count,
        },
        { status: 200 },
      );
    }

    // ============================================================
    // DISTRICT FP
    //
    // District FP can approve:
    // Town FP
    //
    // Only from the same district.
    // ============================================================

    if (designation === "districtfp") {
      if (!approver.district) {
        return NextResponse.json(
          {
            success: true,
            count: 0,
          },
          { status: 200 },
        );
      }

      const count = await User.countDocuments({
        ...baseFilter,
        designation: "townfp",
        district: approver.district,
      });

      return NextResponse.json(
        {
          success: true,
          count,
        },
        { status: 200 },
      );
    }

    // ============================================================
    // TOWN FP
    //
    // Town FP can approve:
    // UCMO
    //
    // Only from the same town.
    // ============================================================

    if (designation === "townfp") {
      if (!approver.town) {
        return NextResponse.json(
          {
            success: true,
            count: 0,
          },
          { status: 200 },
        );
      }

      const count = await User.countDocuments({
        ...baseFilter,
        designation: "ucmo",
        town: approver.town,
      });

      return NextResponse.json(
        {
          success: true,
          count,
        },
        { status: 200 },
      );
    }

    // ============================================================
    // UCMO
    //
    // UCMO can approve:
    //
    // 1. Supervisor
    //    Only supervisors specifically assigned to THIS UCMO.
    //
    //    user.ucmo === approver._id
    //
    // 2. Vaccinator
    //    All pending vaccinators from THIS UCMO's Union Council.
    //
    //    user.unionCouncil === approver.unionCouncil
    //
    // 3. Other Staff
    //    All pending other staff from THIS UCMO's Union Council.
    //
    //    Supports both:
    //    "otherstaff"
    //    "otherStaff"
    // ============================================================

    if (designation === "ucmo") {
      if (!approver.unionCouncil) {
        return NextResponse.json(
          {
            success: true,
            count: 0,
          },
          { status: 200 },
        );
      }

      const count = await User.countDocuments({
        ...baseFilter,

        $or: [
          // ------------------------------------------------------
          // Supervisor
          //
          // Only this UCMO's assigned supervisors
          // ------------------------------------------------------

          {
            designation: "supervisor",
            ucmo: approver._id,
          },

          // ------------------------------------------------------
          // Vaccinator
          //
          // All pending vaccinators from same Union Council
          // ------------------------------------------------------

          {
            designation: "vaccinator",
            unionCouncil: approver.unionCouncil,
          },

          // ------------------------------------------------------
          // Other Staff
          //
          // All pending other staff from same Union Council
          //
          // Both possible designation casing values supported.
          // ------------------------------------------------------

          {
            designation: {
              $in: ["otherstaff", "otherStaff"],
            },
            unionCouncil: approver.unionCouncil,
          },
        ],
      });

      return NextResponse.json(
        {
          success: true,
          count,
        },
        { status: 200 },
      );
    }

    if (designation === "supervisor") {
      const count = await User.countDocuments({
        ...baseFilter,
        designation: "worker",
        supervisor: approver._id,
      });

      return NextResponse.json(
        {
          success: true,
          count,
        },
        { status: 200 },
      );
    }
    // ============================================================
    // FALLBACK
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        count: 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Pending approval count error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch pending approval count.",
      },
      { status: 500 },
    );
  }
}
