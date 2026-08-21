import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";

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
      townFP: {
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
        isActive: typeof isActive === "boolean" ? isActive : true,
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
      currentUcmo = await User.findOne({
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
              "Active approved UCMO not found in the selected Union Council.",
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
      isActive: typeof isActive === "boolean" ? isActive : true,
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

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

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
    const supervisor = searchParams.get("supervisor")?.trim() || "";
    const isActiveParam = searchParams.get("isActive");

    const filter = {};

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

    if (designation) {
      filter.designation = designation;
    }

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

      filter.district = district;
    }

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

      filter.town = town;
    }

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

      filter.unionCouncil = unionCouncil;
    }

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

    if (isActiveParam === "true") {
      filter.isActive = true;
    }

    if (isActiveParam === "false") {
      filter.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("district", "_id name code")
        .populate("town", "_id name code")
        .populate("unionCouncil", "_id name code")
        .populate("supervisor", "_id name contactNumber")
        .populate("ucmo", "_id name contactNumber")
        .populate("approvedBy", "_id name designation")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

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
          district,
          town,
          unionCouncil,
          supervisor,
          isActive:
            isActiveParam === "true"
              ? true
              : isActiveParam === "false"
                ? false
                : null,
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
