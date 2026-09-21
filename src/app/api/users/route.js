import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/auth/generateVerificationCode";

import { sendVerificationEmail } from "@/lib/mail/sendVerificationEmail";

import {
  setPendingRegistration,
  deletePendingRegistration,
} from "@/lib/pendingRegistrations";

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

    const authUser = authResult.user;

    // ============================================================
    // Search Params
    // ============================================================

    const { searchParams } = new URL(request.url);

    console.log("Search Params:", searchParams.toString());

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1,
    );

    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "10", 10), 1),
      100,
    );

    const search = searchParams.get("search")?.trim() || "";

    const designation = searchParams.get("designation")?.trim() || "";

    const district = searchParams.get("district")?.trim() || "";

    const town = searchParams.get("town")?.trim() || "";

    const unionCouncil = searchParams.get("unionCouncil")?.trim() || "";

    const ucmo = searchParams.get("ucmo")?.trim() || "";

    const supervisor = searchParams.get("supervisor")?.trim() || "";

    const isActiveParam = searchParams.get("isActive");

    const countOnly = searchParams.get("countOnly") === "true";

    const teamCount = searchParams.get("teamCount") === "true";

    // ============================================================
    // Base Filter
    // ============================================================

    const filter = {};

    // ============================================================
    // IMPORTANT:
    // Apply authenticated user's scope FIRST.
    //
    // Frontend query params can narrow the result,
    // but can NEVER expand the authenticated user's scope.
    // ============================================================

    const authDesignation = String(authUser.designation || "").toLowerCase();

    // ------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------

    if (authDesignation === "admin") {
      // Admin has no location restriction.
    }

    // ------------------------------------------------------------
    // District FP
    // ------------------------------------------------------------
    else if (authDesignation === "districtfp") {
      if (!authUser.district) {
        return NextResponse.json(
          {
            success: false,
            message: "Authenticated District FP has no district assigned",
          },
          { status: 403 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(authUser.district)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid authenticated district",
          },
          { status: 403 },
        );
      }

      filter.district = authUser.district;
    }

    // ------------------------------------------------------------
    // Town FP
    // ------------------------------------------------------------
    else if (authDesignation === "townfp") {
      if (!authUser.district || !authUser.town) {
        return NextResponse.json(
          {
            success: false,
            message: "Authenticated Town FP has no district or town assigned",
          },
          { status: 403 },
        );
      }

      if (
        !mongoose.Types.ObjectId.isValid(authUser.district) ||
        !mongoose.Types.ObjectId.isValid(authUser.town)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid authenticated district or town",
          },
          { status: 403 },
        );
      }

      filter.district = authUser.district;
      filter.town = authUser.town;
    }

    // ------------------------------------------------------------
    // UCMO
    // ------------------------------------------------------------
    else if (authDesignation === "ucmo") {
      if (!authUser.district || !authUser.town || !authUser.unionCouncil) {
        return NextResponse.json(
          {
            success: false,
            message: "Authenticated UCMO has incomplete location assignment",
          },
          { status: 403 },
        );
      }

      if (
        !mongoose.Types.ObjectId.isValid(authUser.district) ||
        !mongoose.Types.ObjectId.isValid(authUser.town) ||
        !mongoose.Types.ObjectId.isValid(authUser.unionCouncil)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid authenticated UCMO location",
          },
          { status: 403 },
        );
      }

      filter.district = authUser.district;
      filter.town = authUser.town;
      filter.unionCouncil = authUser.unionCouncil;
    }

    // ------------------------------------------------------------
    // Other Roles
    // ------------------------------------------------------------
    //
    // Do NOT give unrestricted access to other roles.
    //
    // They can only see records belonging to their
    // authenticated location.
    //
    // ------------------------------------------------------------
    else {
      if (authUser.district) {
        filter.district = authUser.district;
      }

      if (authUser.town) {
        filter.town = authUser.town;
      }

      if (authUser.unionCouncil) {
        filter.unionCouncil = authUser.unionCouncil;
      }

      // If a role has no location assigned, deny access
      // instead of accidentally returning all users.
      if (!filter.district && !filter.town && !filter.unionCouncil) {
        return NextResponse.json(
          {
            success: false,
            message: "Authenticated user has no valid data scope",
          },
          { status: 403 },
        );
      }
    }

    // ============================================================
    // User Supplied Filters
    //
    // These are ONLY additional/narrowing filters.
    // They cannot override the auth scope.
    // ============================================================

    // ------------------------------------------------------------
    // Search
    // ------------------------------------------------------------

    if (search) {
      filter.$or = [
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
      ];
    }

    // ------------------------------------------------------------
    // Designation
    // ------------------------------------------------------------

    if (designation) {
      filter.designation = designation;
    }

    // ------------------------------------------------------------
    // District
    // ------------------------------------------------------------

    if (district) {
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid district ID",
          },
          { status: 400 },
        );
      }

      // Auth scope cannot be overridden.
      if (filter.district && String(filter.district) !== String(district)) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to access this district",
          },
          { status: 403 },
        );
      }

      filter.district = district;
    }

    // ------------------------------------------------------------
    // Town
    // ------------------------------------------------------------

    if (town) {
      if (!mongoose.Types.ObjectId.isValid(town)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid town ID",
          },
          { status: 400 },
        );
      }

      // Auth scope cannot be overridden.
      if (filter.town && String(filter.town) !== String(town)) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to access this town",
          },
          { status: 403 },
        );
      }

      filter.town = town;
    }

    // ------------------------------------------------------------
    // Union Council
    // ------------------------------------------------------------

    if (unionCouncil) {
      if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Union Council ID",
          },
          { status: 400 },
        );
      }

      // Auth scope cannot be overridden.
      if (
        filter.unionCouncil &&
        String(filter.unionCouncil) !== String(unionCouncil)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to access this Union Council",
          },
          { status: 403 },
        );
      }

      filter.unionCouncil = unionCouncil;
    }

    // ------------------------------------------------------------
    // UCMO
    // ------------------------------------------------------------

    if (ucmo) {
      if (!mongoose.Types.ObjectId.isValid(ucmo)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid UCMO ID",
          },
          { status: 400 },
        );
      }

      filter.ucmo = ucmo;
    }

    // ------------------------------------------------------------
    // Supervisor
    // ------------------------------------------------------------

    if (supervisor) {
      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid supervisor ID",
          },
          { status: 400 },
        );
      }

      filter.supervisor = supervisor;
    }

    // ------------------------------------------------------------
    // Active Status
    // ------------------------------------------------------------

    if (isActiveParam === "true") {
      filter.isActive = true;
    }

    if (isActiveParam === "false") {
      filter.isActive = false;
    }

    // ============================================================
    // Team Count
    // ============================================================

    if (countOnly && teamCount) {
      const teams = await User.distinct("teamNumber", filter);

      const totalTeams = teams.filter(
        (teamNumber) =>
          teamNumber !== null &&
          teamNumber !== undefined &&
          String(teamNumber).trim() !== "",
      ).length;

      return NextResponse.json(
        {
          success: true,
          count: totalTeams,
        },
        { status: 200 },
      );
    }

    // ============================================================
    // Pagination
    // ============================================================

    const skip = (page - 1) * limit;

    // ============================================================
    // Query
    // ============================================================

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("district", "_id name code")
        .populate("town", "_id name code")
        .populate("unionCouncil", "_id name code")
        .populate("supervisor", "_id name contactNumber")
        .populate("ucmo", "_id name contactNumber")
        .populate("approvedBy", "_id name designation")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        data: users,

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
          designation,
          district: filter.district || null,
          town: filter.town || null,
          unionCouncil: filter.unionCouncil || null,
          ucmo,
          supervisor,
          isActive:
            isActiveParam === "true"
              ? true
              : isActiveParam === "false"
                ? false
                : null,
        },

        scope: {
          designation: authDesignation,
          district: authUser.district || null,
          town: authUser.town || null,
          unionCouncil: authUser.unionCouncil || null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     console.log("Search Params:", searchParams.toString());
//     const page = Math.max(
//       Number.parseInt(searchParams.get("page") || "1", 10),
//       1,
//     );

//     const limit = Math.min(
//       Math.max(Number.parseInt(searchParams.get("limit") || "10", 10), 1),
//       100,
//     );

//     const search = searchParams.get("search")?.trim() || "";

//     const designation = searchParams.get("designation")?.trim() || "";
//     const district = searchParams.get("district")?.trim() || "";
//     const town = searchParams.get("town")?.trim() || "";
//     const unionCouncil = searchParams.get("unionCouncil")?.trim() || "";
//     const ucmo = searchParams.get("ucmo")?.trim() || "";
//     const supervisor = searchParams.get("supervisor")?.trim() || "";
//     const isActiveParam = searchParams.get("isActive");
//     const countOnly = searchParams.get("countOnly") === "true";

//     const filter = {};

//     if (search) {
//       filter.$or = [
//         {
//           name: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//         {
//           email: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//         {
//           contactNumber: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     if (designation) {
//       filter.designation = designation;
//     }

//     if (district) {
//       if (!mongoose.Types.ObjectId.isValid(district)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid district ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.district = district;
//     }

//     if (town) {
//       if (!mongoose.Types.ObjectId.isValid(town)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid town ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.town = town;
//     }

//     if (unionCouncil) {
//       if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid Union Council ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.unionCouncil = unionCouncil;
//     }

//     if (ucmo) {
//       if (!mongoose.Types.ObjectId.isValid(ucmo)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid UCMO ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.ucmo = ucmo;
//     }

//     if (supervisor) {
//       if (!mongoose.Types.ObjectId.isValid(supervisor)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid supervisor ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.supervisor = supervisor;
//     }

//     if (isActiveParam === "true") {
//       filter.isActive = true;
//     }

//     if (isActiveParam === "false") {
//       filter.isActive = false;
//     }

//   if (countOnly && searchParams.get("teamCount") === "true") {
//   const teams = await User.distinct("teamNumber", filter);

//   const totalTeams = teams.filter(
//     (teamNumber) =>
//       teamNumber !== null &&
//       teamNumber !== undefined &&
//       String(teamNumber).trim() !== "",
//   ).length;

//   return NextResponse.json(
//     {
//       success: true,
//       count: totalTeams,
//     },
//     { status: 200 },
//   );
// }
//     const skip = (page - 1) * limit;

//     const [users, total] = await Promise.all([
//       User.find(filter)
//         .select("-password")
//         .populate("district", "_id name code")
//         .populate("town", "_id name code")
//         .populate("unionCouncil", "_id name code")
//         .populate("supervisor", "_id name contactNumber")
//         .populate("ucmo", "_id name contactNumber")
//         .populate("approvedBy", "_id name designation")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       User.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(total / limit);

//     return NextResponse.json(
//       {
//         success: true,
//         data: users,
//         pagination: {
//           page,
//           limit,
//           total,
//           totalPages,
//           hasNextPage: page < totalPages,
//           hasPreviousPage: page > 1,
//         },
//         filters: {
//           search,
//           designation,
//           district,
//           town,
//           unionCouncil,
//           ucmo,
//           supervisor,
//           isActive:
//             isActiveParam === "true"
//               ? true
//               : isActiveParam === "false"
//                 ? false
//                 : null,
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Get users error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch users",
//       },
//       { status: 500 },
//     );
//   }
// }

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      email,
      contactNumber,
      district,
      town,
      unionCouncil,
      ucmo,
      designation,
      supervisorCode,
      supervisor,
      teamNumber,
      password,
      isActive,
    } = body;

    const getInitialApprovalData = (designation) => {
      if (["worker", "admin"].includes(designation)) {
        return {
          approvalStatus: null,
          approvedBy: null,
          approvedAt: null,
        };
      }

      return {
        approvalStatus: "pending",
        approvedBy: null,
        approvedAt: null,
      };
    };

    const locationRequirements = {
      districtfp: {
        district: true,
        town: false,
        unionCouncil: false,
      },
      townfp: {
        district: true,
        town: true,
        unionCouncil: false,
      },
      ucmo: {
        district: true,
        town: true,
        unionCouncil: true,
      },
      supervisor: {
        district: true,
        town: true,
        unionCouncil: true,
      },
      vaccinator: {
        district: true,
        town: true,
        unionCouncil: true,
      },
      otherstaff: {
        district: true,
        town: true,
        unionCouncil: true,
      },
      worker: {
        district: true,
        town: true,
        unionCouncil: true,
      },
      admin: {
        district: false,
        town: false,
        unionCouncil: false,
      },
    };

    if (!locationRequirements[designation]) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid designation.",
        },
        { status: 400 },
      );
    }

    const requirements = locationRequirements[designation];

    if (requirements.district && !district) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required for this designation.",
        },
        { status: 400 },
      );
    }

    if (requirements.town && !town) {
      return NextResponse.json(
        {
          success: false,
          message: "Town is required for this designation.",
        },
        { status: 400 },
      );
    }

    if (requirements.unionCouncil && !unionCouncil) {
      return NextResponse.json(
        {
          success: false,
          message: "Union Council is required for this designation.",
        },
        { status: 400 },
      );
    }

    const normalizedDistrict = requirements.district ? district : null;
    const normalizedTown = requirements.town ? town : null;
    const normalizedUnionCouncil = requirements.unionCouncil
      ? unionCouncil
      : null;
    const normalizedUcmo = ucmo || null;
    if (
      normalizedDistrict &&
      !mongoose.Types.ObjectId.isValid(normalizedDistrict)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid district ID.",
        },
        { status: 400 },
      );
    }

    if (normalizedTown && !mongoose.Types.ObjectId.isValid(normalizedTown)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid town ID.",
        },
        { status: 400 },
      );
    }

    if (
      normalizedUnionCouncil &&
      !mongoose.Types.ObjectId.isValid(normalizedUnionCouncil)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid union council ID.",
        },
        { status: 400 },
      );
    }

    if (normalizedDistrict) {
      const districtDoc = await District.findById(normalizedDistrict)
        .select("_id")
        .lean();

      if (!districtDoc) {
        return NextResponse.json(
          {
            success: false,
            message: "District not found.",
          },
          { status: 400 },
        );
      }
    }

    if (normalizedTown) {
      const townDoc = await Town.findOne({
        _id: normalizedTown,
        district: normalizedDistrict,
      })
        .select("_id")
        .lean();

      if (!townDoc) {
        return NextResponse.json(
          {
            success: false,
            message: "Town does not belong to the selected district.",
          },
          { status: 400 },
        );
      }
    }

    if (normalizedUnionCouncil) {
      const unionCouncilDoc = await UnionCouncil.findOne({
        _id: normalizedUnionCouncil,
        town: normalizedTown,
        district: normalizedDistrict,
      })
        .select("_id")
        .lean();

      if (!unionCouncilDoc) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Union Council does not belong to the selected town and district.",
          },
          { status: 400 },
        );
      }
    }

    const normalizedName = name?.trim();

    const normalizedEmail = email?.trim().toLowerCase() || null;

    const normalizedContactNumber = contactNumber?.trim();

    const normalizedSupervisorCode = supervisorCode?.trim() || null;

    if (normalizedEmail) {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
      })
        .select("_id")
        .lean();

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists.",
          },
          { status: 409 },
        );
      }
    }

    const existingContact = await User.findOne({
      contactNumber: normalizedContactNumber,
    })
      .select("_id")
      .lean();

    if (existingContact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact number already exists.",
        },
        { status: 409 },
      );
    }

    if (designation === "worker") {
      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid supervisor ID.",
          },
          { status: 400 },
        );
      }

      const supervisorDoc = await User.findOne({
        _id: supervisor,
        designation: "supervisor",
        isActive: true,
        approvalStatus: "approved",
        unionCouncil: normalizedUnionCouncil,
      })
        .select("_id ucmo")
        .lean();

      if (!supervisorDoc) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Valid active approved supervisor not found in the selected Union Council.",
          },
          { status: 400 },
        );
      }
    }

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    if (designation === "worker") {
      const approvalData = getInitialApprovalData(designation);

      const user = await User.create({
        name: normalizedName,
        email: undefined,
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
        contactNumber: normalizedContactNumber,
        district: normalizedDistrict,
        town: normalizedTown,
        ucmo: supervisorDoc.ucmo || null,
        unionCouncil: normalizedUnionCouncil,
        designation,
        approvalStatus: approvalData.approvalStatus,
        approvedBy: approvalData.approvedBy,
        approvedAt: approvalData.approvedAt,
        supervisorCode: null,
        supervisor,
        teamNumber: null,
        password: hashedPassword,
        isActive: false,
      });

      const createdUser = await User.findById(user._id)
        .select("-password -emailVerificationCode -emailVerificationExpires")
        .populate("district", "_id name code")
        .populate("town", "_id name code")
        .populate("unionCouncil", "_id name code")
        .populate("supervisor", "_id name contactNumber")
        .lean();

      return NextResponse.json(
        {
          success: true,
          message: "Worker account created successfully.",
          data: createdUser,
        },
        { status: 201 },
      );
    }

    let currentUcmo = null;

    if (["supervisor", "vaccinator", "otherstaff"].includes(designation)) {
      if (!normalizedUcmo) {
        return NextResponse.json(
          {
            success: false,
            message: "Please select a UCMO.",
          },
          { status: 400 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(normalizedUcmo)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid UCMO ID.",
          },
          { status: 400 },
        );
      }

      currentUcmo = await User.findOne({
        _id: normalizedUcmo,
        designation: "ucmo",
        isActive: true,
        approvalStatus: "approved",
        unionCouncil: normalizedUnionCouncil,
      })
        .select("_id")
        .lean();

      if (!currentUcmo) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected UCMO is not active, approved, or does not belong to the selected Union Council.",
          },
          { status: 400 },
        );
      }
    }

    const verificationCode = generateVerificationCode();
    const hashedVerificationCode = hashVerificationCode(verificationCode);
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    const approvalData = getInitialApprovalData(designation);

    const pendingData = {
      name: normalizedName,
      email: normalizedEmail,
      contactNumber: normalizedContactNumber,
      district: normalizedDistrict,
      town: normalizedTown,
      unionCouncil: normalizedUnionCouncil,
      designation,
      approvalStatus: approvalData.approvalStatus,
      approvedBy: approvalData.approvedBy,
      approvedAt: approvalData.approvedAt,
      supervisorCode:
        designation === "supervisor" ? normalizedSupervisorCode : null,
      supervisor: null,
      ucmo: currentUcmo?._id || null,
      teamNumber: null,
      password: hashedPassword,
      isActive: false,
      emailVerificationCode: hashedVerificationCode,
      emailVerificationExpires: verificationExpires,
      createdAt: Date.now(),
    };
    setPendingRegistration(normalizedEmail, pendingData);

    try {
      await sendVerificationEmail({
        email: normalizedEmail,
        name: normalizedName,
        code: verificationCode,
      });
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      deletePendingRegistration(normalizedEmail);

      setPendingRegistration(normalizedEmail, pendingData);

      return NextResponse.json(
        {
          success: false,
          message: "Verification email could not be sent. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification code has been sent to your email.",
        data: {
          email: normalizedEmail,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return NextResponse.json(
        {
          success: false,
          message: `${duplicateField || "Field"} already exists.`,
        },
        { status: 409 },
      );
    }

    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map(
        (item) => item.message,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            messages.length > 0 ? messages.join(", ") : "Validation failed.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create user.",
      },
      { status: 500 },
    );
  }
}

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);

//     const page = Math.max(
//       Number.parseInt(searchParams.get("page") || "1", 10),
//       1,
//     );

//     const limit = Math.min(
//       Math.max(Number.parseInt(searchParams.get("limit") || "10", 10), 1),
//       100,
//     );

//     const search = searchParams.get("search")?.trim() || "";

//     const designation = searchParams.get("designation")?.trim() || "";
//     const district = searchParams.get("district")?.trim() || "";
//     const town = searchParams.get("town")?.trim() || "";
//     const unionCouncil = searchParams.get("unionCouncil")?.trim() || "";
//     const supervisor = searchParams.get("supervisor")?.trim() || "";
//     const isActiveParam = searchParams.get("isActive");

//     const filter = {};

//     if (search) {
//       filter.$or = [
//         {
//           name: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//         {
//           email: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//         {
//           contactNumber: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     if (designation) {
//       filter.designation = designation;
//     }

//     if (district) {
//       if (!mongoose.Types.ObjectId.isValid(district)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid district ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.district = district;
//     }

//     if (town) {
//       if (!mongoose.Types.ObjectId.isValid(town)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid town ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.town = town;
//     }

//     if (unionCouncil) {
//       if (!mongoose.Types.ObjectId.isValid(unionCouncil)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid Union Council ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.unionCouncil = unionCouncil;
//     }

//     if (supervisor) {
//       if (!mongoose.Types.ObjectId.isValid(supervisor)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid supervisor ID",
//           },
//           { status: 400 },
//         );
//       }

//       filter.supervisor = supervisor;
//     }

//     if (isActiveParam === "true") {
//       filter.isActive = true;
//     }

//     if (isActiveParam === "false") {
//       filter.isActive = false;
//     }

//     const skip = (page - 1) * limit;

//     const [users, total] = await Promise.all([
//       User.find(filter)
//         .select("-password")
//         .populate("district", "_id name code")
//         .populate("town", "_id name code")
//         .populate("unionCouncil", "_id name code")
//         .populate("supervisor", "_id name contactNumber")
//         .populate("ucmo", "_id name contactNumber")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       User.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(total / limit);

//     return NextResponse.json(
//       {
//         success: true,

//         data: users,

//         pagination: {
//           page,
//           limit,
//           total,
//           totalPages,
//           hasNextPage: page < totalPages,
//           hasPreviousPage: page > 1,
//         },

//         filters: {
//           search,
//           designation,
//           district,
//           town,
//           unionCouncil,
//           supervisor,
//           isActive:
//             isActiveParam === "true"
//               ? true
//               : isActiveParam === "false"
//                 ? false
//                 : null,
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Get users error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch users",
//       },
//       { status: 500 },
//     );
//   }
// }
