import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function GET(request) {
  try {
    await connectDB();

    // ============================================================
    // AUTHENTICATE USER FROM JWT
    // ============================================================

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    let payload;

    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication token.",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // AUTHENTICATED USER ID
    // ============================================================

    const approverId = payload?.userId;

    if (!approverId || !mongoose.Types.ObjectId.isValid(approverId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authenticated user.",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // GET APPROVER FROM DATABASE
    // ============================================================

    const approver = await User.findById(approverId)
      .select("_id name designation district town unionCouncil isActive")
      .lean();

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

    // ============================================================
    // APPROVER MUST BE ACTIVE
    // ============================================================

    if (!approver.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is not active.",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // QUERY PARAMETERS
    // ============================================================

    const { searchParams } = new URL(request.url);

    // ============================================================
    // Pagination
    // ============================================================

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      100,
    );

    // ============================================================
    // Filters
    // ============================================================

    const search = searchParams.get("search")?.trim() || "";
    const designation = searchParams.get("designation")?.trim() || "";

    const district = searchParams.get("district")?.trim() || "";

    const town = searchParams.get("town")?.trim() || "";

    const unionCouncil = searchParams.get("unionCouncil")?.trim() || "";

    // ============================================================
    // BASE FILTER
    // ============================================================

    const filter = {
      approvalStatus: "pending",
      isActive: false,
    };

    // ============================================================
    // APPROVAL HIERARCHY
    // ============================================================

    switch (approver.designation) {
      // ==========================================================
      // ADMIN
      // ==========================================================

      case "admin": {
        // Admin can see all pending approval requests.

        if (designation) {
          filter.designation = designation;
        }

        break;
      }

      // ==========================================================
      // DISTRICT FP
      // ==========================================================

      case "districtfp": {
        // District FP can only approve Town FP.

        filter.designation = "townfp";

        if (!approver.district) {
          return NextResponse.json(
            {
              success: false,
              message: "District information not found for this District FP.",
            },
            {
              status: 403,
            },
          );
        }

        filter.district = approver.district;

        break;
      }

      // ==========================================================
      // TOWN FP
      // ==========================================================

      case "townfp": {
        // Town FP can only approve UCMO.

        filter.designation = "ucmo";

        if (!approver.town) {
          return NextResponse.json(
            {
              success: false,
              message: "Town information not found for this Town FP.",
            },
            {
              status: 403,
            },
          );
        }

        filter.town = approver.town;

        break;
      }

      // ==========================================================
      // UCMO
      // ==========================================================

      case "ucmo": {
        // ==========================================================
        // UCMO CAN APPROVE:
        // supervisor + vaccinator + otherstaff
        // ==========================================================

        const allowedDesignations = [
          "supervisor",
          "vaccinator",
          "otherstaff",
          "otherStaff",
        ];

        // If a designation was requested from frontend,
        // return only that designation.
        if (designation) {
          if (!allowedDesignations.includes(designation)) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid approval designation for UCMO.",
              },
              {
                status: 400,
              },
            );
          }

          // Supervisor must belong to this UCMO
          if (designation === "supervisor") {
            filter.designation = "supervisor";
            filter.ucmo = approver._id;
          } else {
            // Vaccinator / Other Staff
            filter.designation = designation;
          }
        } else {
          // No designation specified:
          // return all approval types for UCMO.
          filter.$or = [
            {
              designation: {
                $in: ["vaccinator", "otherstaff", "otherStaff"],
              },
            },
            {
              designation: "supervisor",
              ucmo: approver._id,
            },
          ];
        }

        break;
      }

      // ==========================================================
      // NOT AUTHORIZED
      // ==========================================================

      default: {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to view pending approvals.",
          },
          {
            status: 403,
          },
        );
      }
    }

    // ============================================================
    // OPTIONAL SCOPE FILTERS
    // ============================================================

    /*
     * Admin can additionally filter by:
     *
     * district
     * town
     * unionCouncil
     *
     * Other approvers remain restricted by their hierarchy.
     */

    if (district && district !== "all" && approver.designation === "admin") {
      filter.district = district;
    }

    if (town && town !== "all" && approver.designation === "admin") {
      filter.town = town;
    }

    if (
      unionCouncil &&
      unionCouncil !== "all" &&
      approver.designation === "admin"
    ) {
      filter.unionCouncil = unionCouncil;
    }

    // ============================================================
    // SEARCH
    // ============================================================

    /*
     * IMPORTANT:
     *
     * UCMO already uses $or for approval hierarchy.
     * Therefore search cannot simply assign filter.$or,
     * otherwise the UCMO hierarchy filter would be lost.
     *
     * $and keeps BOTH conditions active.
     */

    if (search) {
      const searchFilter = {
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            contactNumber: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      };

      if (filter.$or) {
        filter.$and = [
          {
            $or: filter.$or,
          },
          searchFilter,
        ];

        delete filter.$or;
      } else {
        filter.$or = searchFilter.$or;
      }
    }

    // ============================================================
    // PAGINATION
    // ============================================================

    const skip = (page - 1) * limit;

    // ============================================================
    // FETCH USERS + COUNT
    // ============================================================

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "_id name email contactNumber district town unionCouncil ucmo supervisorCode designation approvalStatus approvedBy approvedAt isActive createdAt",
        )
        .populate("district", "_id name code")
        .populate("town", "_id name code")
        .populate("unionCouncil", "_id name code")
        .populate("ucmo", "_id name email designation")
        .populate("approvedBy", "_id name designation")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    // ============================================================
    // PAGINATION INFO
    // ============================================================

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        data: users,

        approver: {
          id: approver._id,
          name: approver.name,
          designation: approver.designation,
        },

        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Pending user approvals GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch pending user approvals.",
      },
      {
        status: 500,
      },
    );
  }
}
