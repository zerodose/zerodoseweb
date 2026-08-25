import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

// ============================================================
// PATCH - Transfer Supervisor / Vaccinator / OtherStaff
// ============================================================

export async function PATCH(request) {
  try {
    await connectDB();

    // ============================================================
    // Request Body
    // ============================================================

    const body = await request.json();

    const { userId, currentUcmoId, district, town, unionCouncil, ucmo } = body;

    // ============================================================
    // Validate IDs
    // ============================================================

    const ids = [
      ["User", userId],
      ["Current UCMO", currentUcmoId],
      ["District", district],
      ["Town", town],
      ["Union Council", unionCouncil],
      ["Target UCMO", ucmo],
    ];

    for (const [label, value] of ids) {
      if (!value || !mongoose.Types.ObjectId.isValid(value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${label} ID.`,
          },
          { status: 400 },
        );
      }
    }

    // ============================================================
    // Get Current UCMO
    // ============================================================

    const currentUcmo = await User.findOne({
      _id: currentUcmoId,
      designation: "ucmo",
      isActive: true,
      approvalStatus: "approved",
    })
      .select("_id name designation unionCouncil")
      .lean();

    if (!currentUcmo) {
      return NextResponse.json(
        {
          success: false,
          message: "Active approved current UCMO not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Get User To Transfer
    // ============================================================

    const user = await User.findOne({
      _id: userId,
      designation: {
        $in: ["supervisor", "vaccinator", "otherstaff"],
      },
      isActive: true,
      approvalStatus: "approved",
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only active approved Supervisor, Vaccinator or Other Staff can be transferred.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Verify User Belongs To Current UCMO
    // ============================================================

    if (!user.ucmo || String(user.ucmo) !== String(currentUcmo._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only transfer users assigned to your UCMO.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // Verify District
    // ============================================================

    const districtDoc = await District.findById(district)
      .select("_id name code")
      .lean();

    if (!districtDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "Target district not found.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Verify Town Belongs To District
    // ============================================================

    const townDoc = await Town.findOne({
      _id: town,
      district: district,
    })
      .select("_id name code district")
      .lean();

    if (!townDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "Target town does not belong to the selected district.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Verify Union Council Belongs To Town + District
    // ============================================================

    const unionCouncilDoc = await UnionCouncil.findOne({
      _id: unionCouncil,
      town: town,
      district: district,
    })
      .select("_id name code town district")
      .lean();

    if (!unionCouncilDoc) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Target Union Council does not belong to the selected town and district.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Get Target UCMO
    // ============================================================

    const targetUcmo = await User.findOne({
      _id: ucmo,
      designation: "ucmo",
      isActive: true,
      approvalStatus: "approved",
      unionCouncil: unionCouncil,
      town: town,
      district: district,
    })
      .select("_id name designation district town unionCouncil")
      .lean();

    if (!targetUcmo) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Active approved target UCMO not found in the selected district, town and Union Council.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Prevent Same UCMO Transfer
    // ============================================================

    if (
      String(currentUcmo._id) === String(targetUcmo._id) &&
      String(user.unionCouncil) === String(unionCouncil)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "User is already assigned to this UCMO and Union Council.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Transfer User
    // ============================================================

    user.district = district;
    user.town = town;
    user.unionCouncil = unionCouncil;
    user.ucmo = targetUcmo._id;

    // New UCMO must approve again
    user.approvalStatus = "pending";
    user.isActive = false;

    // Previous approval becomes invalid
    user.approvedBy = null;
    user.approvedAt = null;

    await user.save();

    // ============================================================
    // Get Updated User
    // ============================================================

    const updatedUser = await User.findById(user._id)
      .select("-password -emailVerificationCode -emailVerificationExpires")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("ucmo", "_id name designation")
      .lean();

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message:
          `${user.designation} transferred successfully. ` +
          `Approval from the new UCMO is now required.`,
        data: updatedUser,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Transfer user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to transfer user.",
      },
      {
        status: 500,
      },
    );
  }
}
