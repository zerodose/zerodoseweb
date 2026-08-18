import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { fromSupervisorId, toSupervisorId, workerIds } = body;

    // ============================================================
    // Basic Validation
    // ============================================================

    if (!fromSupervisorId) {
      return NextResponse.json(
        {
          success: false,
          message: "From supervisor is required.",
        },
        { status: 400 },
      );
    }

    if (!toSupervisorId) {
      return NextResponse.json(
        {
          success: false,
          message: "To supervisor is required.",
        },
        { status: 400 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(fromSupervisorId) ||
      !mongoose.Types.ObjectId.isValid(toSupervisorId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid supervisor ID.",
        },
        { status: 400 },
      );
    }

    if (String(fromSupervisorId) === String(toSupervisorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "From and To supervisor cannot be the same.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(workerIds) || workerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one worker to transfer.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Validate Worker IDs
    // ============================================================

    const invalidWorkerId = workerIds.find(
      (workerId) => !mongoose.Types.ObjectId.isValid(workerId),
    );

    if (invalidWorkerId) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more worker IDs are invalid.",
        },
        { status: 400 },
      );
    }

    // Remove duplicate worker IDs
    const uniqueWorkerIds = [...new Set(workerIds.map((id) => String(id)))];

    // ============================================================
    // Validate From Supervisor
    // ============================================================

    const fromSupervisor = await User.findOne({
      _id: fromSupervisorId,
      designation: "supervisor",
      isActive: true,
    })
      .select("_id name")
      .lean();

    if (!fromSupervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Active From Supervisor not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Validate To Supervisor
    // ============================================================

    const toSupervisor = await User.findOne({
      _id: toSupervisorId,
      designation: "supervisor",
      isActive: true,
    })
      .select("_id name")
      .lean();

    if (!toSupervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Active To Supervisor not found.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // Find Selected Workers
    //
    // IMPORTANT:
    // Workers must currently belong to From Supervisor.
    // ============================================================

    const workers = await User.find({
      _id: {
        $in: uniqueWorkerIds,
      },
      designation: "worker",
      isActive: true,
      supervisor: fromSupervisorId,
    })
      .select("_id name teamNumber workerRole supervisor")
      .lean();

    // ============================================================
    // Make Sure All Selected Workers Belong To From Supervisor
    // ============================================================

    if (workers.length !== uniqueWorkerIds.length) {
      const foundWorkerIds = new Set(
        workers.map((worker) => String(worker._id)),
      );

      const invalidWorkers = uniqueWorkerIds.filter(
        (workerId) => !foundWorkerIds.has(String(workerId)),
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected workers do not belong to the selected From Supervisor.",
          invalidWorkerIds: invalidWorkers,
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Transfer Workers
    //
    // ONLY supervisor field is changed.
    //
    // approvalStatus, teamNumber, workerRole, UCMO,
    // district, town and unionCouncil remain unchanged.
    // ============================================================

    const result = await User.updateMany(
      {
        _id: {
          $in: uniqueWorkerIds,
        },
        designation: "worker",
        isActive: true,
        supervisor: fromSupervisorId,
      },
      {
        $set: {
          supervisor: toSupervisorId,
        },
      },
    );

    // ============================================================
    // Verify Update
    // ============================================================

    if (result.modifiedCount !== uniqueWorkerIds.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Worker transfer could not be completed for all selected workers.",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // Get Updated Workers
    // ============================================================

    const updatedWorkers = await User.find({
      _id: {
        $in: uniqueWorkerIds,
      },
    })
      .select("_id name designation supervisor teamNumber workerRole isActive")
      .populate("supervisor", "_id name contactNumber")
      .lean();

    // ============================================================
    // SUCCESS
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: `${uniqueWorkerIds.length} worker${
          uniqueWorkerIds.length !== 1 ? "s" : ""
        } transferred successfully.`,
        data: {
          fromSupervisor: {
            _id: fromSupervisor._id,
            name: fromSupervisor.name,
          },
          toSupervisor: {
            _id: toSupervisor._id,
            name: toSupervisor.name,
          },
          workers: updatedWorkers,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Worker transfer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to transfer workers.",
      },
      { status: 500 },
    );
  }
}
