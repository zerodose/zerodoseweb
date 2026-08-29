

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const scope = searchParams.get("scope")?.trim().toLowerCase() || "";
    const designation =
      searchParams.get("designation")?.trim().toLowerCase() || "";
    const scopeId = searchParams.get("scopeId")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

    const allowedScopes = ["ucmo", "supervisor"];

    const allowedDesignations = [
      "supervisor",
      "vaccinator",
      "otherstaff",
      "worker",
    ];

    if (!scope || !allowedScopes.includes(scope)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid scope. Use ucmo or supervisor.",
        },
        { status: 400 },
      );
    }

    if (!designation || !allowedDesignations.includes(designation)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid designation.",
        },
        { status: 400 },
      );
    }

    if (!scopeId || !mongoose.Types.ObjectId.isValid(scopeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid scope ID.",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------
    // Scope + Designation Validation
    // ------------------------------------------------------------

    // UCMO scope is used for Supervisor, Vaccinator and Other Staff
    if (
      scope === "ucmo" &&
      designation === "worker"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker must be fetched using supervisor scope.",
        },
        { status: 400 },
      );
    }

    // Supervisor scope is used only for Worker
    if (
      scope === "supervisor" &&
      designation !== "worker"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor scope is only valid for workers.",
        },
        { status: 400 },
      );
    }

    const filter = {
      designation,
      isActive: true,
    };

    // ------------------------------------------------------------
    // Apply Scope
    // ------------------------------------------------------------

    if (scope === "ucmo") {
      filter.ucmo = scopeId;
    }

    if (scope === "supervisor") {
      filter.supervisor = scopeId;
    }

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

    const users = await User.find(filter)
      .select("-password")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("ucmo", "_id name contactNumber")
      .populate("supervisor", "_id name contactNumber")
      .populate("approvedBy", "_id name designation")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: users,
        count: users.length,
        filters: {
          scope,
          designation,
          scopeId,
          search,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Staff scope API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch staff.",
      },
      { status: 500 },
    );
  }
}