import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

import {
  getPendingRegistration,
  deletePendingRegistration,
} from "@/lib/pendingRegistrations";

function hashVerificationCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const email = body?.email?.trim().toLowerCase();
    const code = body?.code?.trim();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code is required.",
        },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code must be 6 digits.",
        },
        { status: 400 },
      );
    }

    const pendingRegistration = getPendingRegistration(email);

    if (!pendingRegistration) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No pending registration found for this email. Please register again.",
        },
        { status: 404 },
      );
    }

    if (!pendingRegistration.emailVerificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "No verification code found. Please request a new code.",
        },
        { status: 400 },
      );
    }

    if (
      !pendingRegistration.emailVerificationExpires ||
      new Date(pendingRegistration.emailVerificationExpires) < new Date()
    ) {
      deletePendingRegistration(email);

      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please register again.",
        },
        { status: 400 },
      );
    }

    const hashedCode = hashVerificationCode(code);

    if (hashedCode !== pendingRegistration.emailVerificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code.",
        },
        { status: 400 },
      );
    }

    const existingEmail = await User.findOne({
      email: pendingRegistration.email,
    })
      .select("_id")
      .lean();

    if (existingEmail) {
      deletePendingRegistration(email);

      return NextResponse.json(
        {
          success: false,
          message: "Email already exists.",
        },
        { status: 409 },
      );
    }

    const existingContact = await User.findOne({
      contactNumber: pendingRegistration.contactNumber,
    })
      .select("_id")
      .lean();

    if (existingContact) {
      deletePendingRegistration(email);

      return NextResponse.json(
        {
          success: false,
          message: "Contact number already exists.",
        },
        { status: 409 },
      );
    }

    const { designation, district, town, unionCouncil, ucmo } =
      pendingRegistration;

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

    const requirements = locationRequirements[designation];

    if (!requirements) {
      deletePendingRegistration(email);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid designation.",
        },
        { status: 400 },
      );
    }

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

    let currentUcmo = null;

    if (["supervisor", "vaccinator"].includes(designation)) {
      currentUcmo = await User.findOne({
        designation: "ucmo",
        isActive: true,
        district: normalizedDistrict,
        town: normalizedTown,
        unionCouncil: normalizedUnionCouncil,
      })
        .select("_id")
        .lean();

      if (!currentUcmo) {
        return NextResponse.json(
          {
            success: false,
            message: "No active UCMO found for the selected Union Council.",
          },
          { status: 400 },
        );
      }
    }

    const approvalRequiredDesignations = [
      "ucmo",
      "supervisor",
      "vaccinator",
      "otherstaff",
      "townFP",
      "districtfp",
    ];

    const approvalStatus = approvalRequiredDesignations.includes(designation)
      ? "pending"
      : null;

    const user = await User.create({
      name: pendingRegistration.name,

      email: pendingRegistration.email,

      emailVerified: true,

      emailVerificationCode: null,

      emailVerificationExpires: null,

      contactNumber: pendingRegistration.contactNumber,

      district: normalizedDistrict,

      town: normalizedTown,

      unionCouncil: normalizedUnionCouncil,

      designation,

      approvalStatus,

      approvedBy: null,

      approvedAt: null,

      supervisorCode: pendingRegistration.supervisorCode,

      supervisor: pendingRegistration.supervisor,

      ucmo: pendingRegistration.ucmo || null,

      teamNumber: pendingRegistration.teamNumber,

      password: pendingRegistration.password,

      isActive: pendingRegistration.isActive,
    });

    deletePendingRegistration(email);

    const verifiedUser = await User.findById(user._id)
      .select("-password -emailVerificationCode -emailVerificationExpires")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .populate("approvedBy", "_id name designation")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified and account created successfully.",
        data: {
          user: verifiedUser,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify email error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return NextResponse.json(
        {
          success: false,
          message: (duplicateField || "Field") + " already exists.",
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
        message: error?.message || "Failed to verify email.",
      },
      { status: 500 },
    );
  }
}

// import { NextResponse } from "next/server";
// import crypto from "crypto";

// import { connectDB } from "@/lib/db";
// import User from "@/models/User";

// import {
//   getPendingRegistration,
//   deletePendingRegistration,
// } from "@/lib/pendingRegistrations";

// // ============================================================
// // Hash Verification Code
// // ============================================================

// function hashVerificationCode(code) {
//   return crypto.createHash("sha256").update(code).digest("hex");
// }

// // ============================================================
// // POST /api/auth/verify-email
// //
// // Flow:
// //
// // PendingRegistration
// //       ↓
// // OTP verify
// //       ↓
// // User.create()
// //       ↓
// // PendingRegistration delete
// //
// // User DB mein OTP verification se pehle save nahi hota.
// // ============================================================

// export async function POST(request) {
//   try {
//     await connectDB();

//     const body = await request.json();

//     const email = body?.email?.trim().toLowerCase();
//     const code = body?.code?.trim();

//     // ============================================================
//     // Validation
//     // ============================================================

//     if (!email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (!code) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Verification code is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (!/^\d{6}$/.test(code)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Verification code must be 6 digits.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Get Pending Registration
//     // ============================================================

//     const pendingRegistration = getPendingRegistration(email);

//     if (!pendingRegistration) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "No pending registration found for this email. Please register again.",
//         },
//         { status: 404 },
//       );
//     }

//     // ============================================================
//     // Check Verification Code Exists
//     // ============================================================

//     if (!pendingRegistration.emailVerificationCode) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No verification code found. Please request a new code.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Check Expiry
//     // ============================================================

//     if (
//       !pendingRegistration.emailVerificationExpires ||
//       new Date(pendingRegistration.emailVerificationExpires) < new Date()
//     ) {
//       deletePendingRegistration(email);

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Verification code has expired. Please register again.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Hash Entered Code
//     // ============================================================

//     const hashedCode = hashVerificationCode(code);

//     // ============================================================
//     // Compare Code
//     // ============================================================

//     if (hashedCode !== pendingRegistration.emailVerificationCode) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid verification code.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // OTP CORRECT
//     //
//     // Ab final duplicate checks karenge.
//     // ============================================================

//     // ------------------------------------------------------------
//     // Final duplicate email check
//     // ------------------------------------------------------------

//     const existingEmail = await User.findOne({
//       email: pendingRegistration.email,
//     })
//       .select("_id")
//       .lean();

//     if (existingEmail) {
//       deletePendingRegistration(email);

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email already exists.",
//         },
//         { status: 409 },
//       );
//     }

//     // ------------------------------------------------------------
//     // Final duplicate contact check
//     // ------------------------------------------------------------

//     const existingContact = await User.findOne({
//       contactNumber: pendingRegistration.contactNumber,
//     })
//       .select("_id")
//       .lean();

//     if (existingContact) {
//       deletePendingRegistration(email);

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Contact number already exists.",
//         },
//         { status: 409 },
//       );
//     }

//     // ============================================================
//     // Create User
//     //
//     // OTP successfully verified hone ke baad hi
//     // User collection mein save hoga.
//     // ============================================================

//     const user = await User.create({
//       name: pendingRegistration.name,

//       email: pendingRegistration.email,

//       emailVerified: true,

//       emailVerificationCode: null,

//       emailVerificationExpires: null,

//       contactNumber: pendingRegistration.contactNumber,

//       district: pendingRegistration.district,

//       town: pendingRegistration.town,

//       unionCouncil: pendingRegistration.unionCouncil,

//       designation: pendingRegistration.designation,

//       approvalStatus: pendingRegistration.approvalStatus,

//       supervisorCode: pendingRegistration.supervisorCode,

//       supervisor: pendingRegistration.supervisor,

//       teamNumber: pendingRegistration.teamNumber,

//       password: pendingRegistration.password,

//       isActive: pendingRegistration.isActive,
//     });

//     // ============================================================
//     // Delete Pending Registration
//     // ============================================================

//     deletePendingRegistration(email);

//     // ============================================================
//     // Get Created User
//     // ============================================================

//     const verifiedUser = await User.findById(user._id)
//       .select("-password -emailVerificationCode -emailVerificationExpires")
//       .populate("district", "_id name code")
//       .populate("town", "_id name code")
//       .populate("unionCouncil", "_id name code")
//       .populate("supervisor", "_id name contactNumber")
//       .lean();

//     // ============================================================
//     // Success Response
//     // ============================================================

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Email verified and account created successfully.",
//         data: {
//           user: verifiedUser,
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Verify email error:", error);

//     // ============================================================
//     // Duplicate Key
//     // ============================================================

//     if (error?.code === 11000) {
//       const duplicateField = Object.keys(error.keyPattern || {})[0];

//       return NextResponse.json(
//         {
//           success: false,
//           message: (duplicateField || "Field") + " already exists.",
//         },
//         { status: 409 },
//       );
//     }

//     // ============================================================
//     // Mongoose Validation Error
//     // ============================================================

//     if (error?.name === "ValidationError") {
//       const messages = Object.values(error.errors || {}).map(
//         (item) => item.message,
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             messages.length > 0 ? messages.join(", ") : "Validation failed.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // General Error
//     // ============================================================

//     return NextResponse.json(
//       {
//         success: false,
//         message: error?.message || "Failed to verify email.",
//       },
//       { status: 500 },
//     );
//   }
// }
