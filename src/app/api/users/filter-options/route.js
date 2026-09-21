import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/User";

import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();

    // ============================================================
    // Authentication
    // ============================================================

    const authResult = await getAuthenticatedUser(request);

    if (authResult?.error) {
      return authResult.error;
    }

    const authUser = authResult?.user;

    if (!authUser?._id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // ============================================================
    // Authenticated User Designation
    // ============================================================

    const designation = authUser.designation;

    const allowedDesignations = ["ucmo", "townfp", "districtfp", "admin"];

    if (!allowedDesignations.includes(designation)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to access user filter options.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Build Backend Scope
    // ============================================================

    const scope = {};

    // ============================================================
    // UCMO Scope
    // ============================================================

    if (designation === "ucmo") {
      /*
       * UCMO gets ALL users from its own
       * District + Town + Union Council.
       *
       * We intentionally do NOT use:
       *
       * scope.ucmo = authUser._id;
       *
       * because the requirement is to get all users
       * belonging to this Union Council.
       */

      if (!authUser.district || !authUser.town || !authUser.unionCouncil) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Authenticated UCMO does not have a valid district/town/union council assignment.",
          },
          { status: 400 },
        );
      }

      scope.district = authUser.district;
      scope.town = authUser.town;
      scope.unionCouncil = authUser.unionCouncil;
    }

    // ============================================================
    // Town FP Scope
    // ============================================================

    if (designation === "townfp") {
      if (!authUser.district || !authUser.town) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Authenticated Town FP does not have a valid district/town assignment.",
          },
          { status: 400 },
        );
      }

      scope.district = authUser.district;
      scope.town = authUser.town;
    }

    // ============================================================
    // District FP Scope
    // ============================================================

    if (designation === "districtfp") {
      if (!authUser.district) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Authenticated District FP does not have a valid district assignment.",
          },
          { status: 400 },
        );
      }

      scope.district = authUser.district;
    }

    // ============================================================
    // Admin Scope
    // ============================================================

    /*
     * Admin:
     *
     * Empty scope means all users.
     */

    // ============================================================
    // Get Users Inside Authenticated Scope
    // ============================================================

    const users = await User.find(scope)
      .select(
        "_id designation district town unionCouncil supervisorCode workerRole isActive approvalStatus",
      )
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .lean();

    // ============================================================
    // Helper: Create Unique Options
    // ============================================================

    const createOptions = (values) => {
      const map = new Map();

      values.forEach((item) => {
        if (item === null || item === undefined || item === "") {
          return;
        }

        const value = String(item);

        if (!map.has(value)) {
          map.set(value, {
            value,
            label: value,
          });
        }
      });

      return Array.from(map.values()).sort((a, b) =>
        String(a.label).localeCompare(String(b.label), undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );
    };

    // ============================================================
    // Designation Options
    // ============================================================

    const designationLabels = {
      admin: "Admin",
      districtfp: "District FP",
      townfp: "Town FP",
      ucmo: "UCMO",
      supervisor: "Supervisor",
      vaccinator: "Vaccinator",
      otherstaff: "Other Staff",
      worker: "Worker",
    };

    const designationMap = new Map();

    users.forEach((user) => {
      if (!user.designation) return;

      designationMap.set(user.designation, {
        value: user.designation,
        label: designationLabels[user.designation] || user.designation,
      });
    });

    // ============================================================
    // District Options
    // ============================================================

    const districtMap = new Map();

    users.forEach((user) => {
      if (!user.district?._id) return;

      const id = String(user.district._id);

      districtMap.set(id, {
        value: id,
        label: user.district.name || "-",
      });
    });

    // ============================================================
    // Town Options
    // ============================================================

    const townMap = new Map();

    users.forEach((user) => {
      if (!user.town?._id) return;

      const id = String(user.town._id);

      townMap.set(id, {
        value: id,
        label: user.town.name || "-",
      });
    });

    // ============================================================
    // Union Council Options
    // ============================================================

    const unionCouncilMap = new Map();

    users.forEach((user) => {
      if (!user.unionCouncil?._id) return;

      const id = String(user.unionCouncil._id);

      unionCouncilMap.set(id, {
        value: id,
        label: user.unionCouncil.name || "-",
      });
    });

    // ============================================================
    // Supervisor Code Options
    // ============================================================

    const supervisorCodeOptions = createOptions(
      users.map((user) => user.supervisorCode),
    );

    // ============================================================
    // Worker Role Options
    // ============================================================

    const workerRoleLabels = {
      teamLeader: "Team Leader",
      teamMember: "Team Member",
    };

    const workerRoleMap = new Map();

    users.forEach((user) => {
      if (!user.workerRole) return;

      workerRoleMap.set(user.workerRole, {
        value: user.workerRole,
        label: workerRoleLabels[user.workerRole] || user.workerRole,
      });
    });

    // ============================================================
    // Approval Status Options
    // ============================================================

    const approvalStatusLabels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };

    const approvalStatusMap = new Map();

    users.forEach((user) => {
      if (!user.approvalStatus) return;

      approvalStatusMap.set(user.approvalStatus, {
        value: user.approvalStatus,
        label: approvalStatusLabels[user.approvalStatus] || user.approvalStatus,
      });
    });

    // ============================================================
    // Active Options
    // ============================================================

    const activeOptions = [
      {
        value: "true",
        label: "Yes",
      },
      {
        value: "false",
        label: "No",
      },
    ];

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        /*
         * Informational only.
         *
         * Actual scope is controlled by the backend.
         */
        scope: {
          designation,
        },

        filters: {
          designation: Array.from(designationMap.values()).sort((a, b) =>
            String(a.label).localeCompare(String(b.label), undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          ),

          district: Array.from(districtMap.values()).sort((a, b) =>
            String(a.label).localeCompare(String(b.label), undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          ),

          town: Array.from(townMap.values()).sort((a, b) =>
            String(a.label).localeCompare(String(b.label), undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          ),

          unionCouncil: Array.from(unionCouncilMap.values()).sort((a, b) =>
            String(a.label).localeCompare(String(b.label), undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          ),

          supervisorCode: supervisorCodeOptions,

          workerRole: Array.from(workerRoleMap.values()).sort((a, b) =>
            String(a.label).localeCompare(String(b.label), undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          ),

          approvalStatus: Array.from(approvalStatusMap.values()).sort((a, b) =>
            String(a.label).localeCompare(String(b.label), undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          ),

          isActive: activeOptions,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user filter options error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user filter options",
      },
      { status: 500 },
    );
  }
}
