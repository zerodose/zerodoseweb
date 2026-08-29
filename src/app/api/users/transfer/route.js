// import { NextResponse } from "next/server";
// import mongoose from "mongoose";

// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import District from "@/models/District";
// import Town from "@/models/Town";
// import UnionCouncil from "@/models/UnionCouncil";
// import Zerodose from "@/models/Zerodose";

// // ============================================================
// // PATCH - Transfer Supervisor / Vaccinator / OtherStaff
// // ============================================================

// export async function PUT(request) {
//   try {
//     await connectDB();

//     // ============================================================
//     // Request Body
//     // ============================================================

//     const body = await request.json();

//     const { userId, currentUcmoId, district, town, unionCouncil, ucmo } = body;

//     // ============================================================
//     // Validate IDs
//     // ============================================================

//     const ids = [
//       ["User", userId],
//       ["Current UCMO", currentUcmoId],
//       ["District", district],
//       ["Town", town],
//       ["Union Council", unionCouncil],
//       ["Target UCMO", ucmo],
//     ];

//     for (const [label, value] of ids) {
//       if (!value || !mongoose.Types.ObjectId.isValid(value)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Invalid ${label} ID.`,
//           },
//           { status: 400 },
//         );
//       }
//     }

//     // ============================================================
//     // Get Current UCMO
//     // ============================================================

//     const currentUcmo = await User.findOne({
//       _id: currentUcmoId,
//       designation: "ucmo",
//       isActive: true,
//       approvalStatus: "approved",
//     })
//       .select("_id name designation unionCouncil")
//       .lean();

//     if (!currentUcmo) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Active approved current UCMO not found.",
//         },
//         { status: 404 },
//       );
//     }

//     // ============================================================
//     // Get User To Transfer
//     // ============================================================

//     const user = await User.findOne({
//       _id: userId,
//       designation: {
//        $in: ["supervisor", "vaccinator", "otherstaff", "worker"],
//       },
//       isActive: true,
//       approvalStatus: "approved",
//     });

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Only active approved Supervisor, Vaccinator or Other Staff can be transferred.",
//         },
//         { status: 404 },
//       );
//     }

//     // ============================================================
//     // Prevent Supervisor Transfer If Active Teams Exist
//     // ============================================================

//     if (user.designation === "supervisor") {
//       const activeWorkers = await User.find({
//         supervisor: user._id,
//         designation: "worker",
//         isActive: true,
//       })
//         .select("_id name teamNumber workerRole")
//         .lean();

//       if (activeWorkers.length > 0) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "This supervisor cannot be transferred because active teams are assigned to this supervisor. Transfer all active teams to another supervisor first.",
//             data: {
//               activeWorkers: activeWorkers.length,
//             },
//           },
//           { status: 400 },
//         );
//       }

//       // ============================================================
//       // Prevent Supervisor Transfer If Zerodose Records Exist
//       // ============================================================

//       const zerodoseCount = await Zerodose.countDocuments({
//         supervisor: user._id,
//       });

//       if (zerodoseCount > 0) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "This supervisor cannot be transferred because Zerodose records are already associated with this supervisor.",
//             data: {
//               zerodoseCount,
//             },
//           },
//           { status: 400 },
//         );
//       }
//     }

//     // ============================================================
//     // Verify User Belongs To Current UCMO
//     // ============================================================

//     if (!user.ucmo || String(user.ucmo) !== String(currentUcmo._id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "You can only transfer users assigned to your UCMO.",
//         },
//         { status: 403 },
//       );
//     }

//     // ============================================================
//     // Verify District
//     // ============================================================

//     const districtDoc = await District.findById(district)
//       .select("_id name code")
//       .lean();

//     if (!districtDoc) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Target district not found.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Verify Town Belongs To District
//     // ============================================================

//     const townDoc = await Town.findOne({
//       _id: town,
//       district: district,
//     })
//       .select("_id name code district")
//       .lean();

//     if (!townDoc) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Target town does not belong to the selected district.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Verify Union Council Belongs To Town + District
//     // ============================================================

//     const unionCouncilDoc = await UnionCouncil.findOne({
//       _id: unionCouncil,
//       town: town,
//       district: district,
//     })
//       .select("_id name code town district")
//       .lean();

//     if (!unionCouncilDoc) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Target Union Council does not belong to the selected town and district.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Get Target UCMO
//     // ============================================================

//     const targetUcmo = await User.findOne({
//       _id: ucmo,
//       designation: "ucmo",
//       isActive: true,
//       approvalStatus: "approved",
//       unionCouncil: unionCouncil,
//       town: town,
//       district: district,
//     })
//       .select("_id name designation district town unionCouncil")
//       .lean();

//     if (!targetUcmo) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Active approved target UCMO not found in the selected district, town and Union Council.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Prevent Same UCMO Transfer
//     // ============================================================

//     if (
//       String(currentUcmo._id) === String(targetUcmo._id) &&
//       String(user.unionCouncil) === String(unionCouncil)
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User is already assigned to this UCMO and Union Council.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Transfer User
//     // ============================================================

//     user.district = district;
//     user.town = town;
//     user.unionCouncil = unionCouncil;
//     user.ucmo = targetUcmo._id;

//     // New UCMO must approve again
//     user.approvalStatus = "pending";
//     user.isActive = false;

//     // Previous approval becomes invalid
//     user.approvedBy = null;
//     user.approvedAt = null;

//     await user.save();

//     // ============================================================
//     // Get Updated User
//     // ============================================================

//     const updatedUser = await User.findById(user._id)
//       .select("-password -emailVerificationCode -emailVerificationExpires")
//       .populate("district", "_id name code")
//       .populate("town", "_id name code")
//       .populate("unionCouncil", "_id name code")
//       .populate("ucmo", "_id name designation")
//       .lean();

//     // ============================================================
//     // Response
//     // ============================================================

//     return NextResponse.json(
//       {
//         success: true,
//         message:
//           `${user.designation} transferred successfully. ` +
//           `Approval from the new UCMO is now required.`,
//         data: updatedUser,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     // console.error("Transfer user error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error?.message || "Failed to transfer user.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";
import Zerodose from "@/models/Zerodose";

// ============================================================
// PUT - Transfer Supervisor / Vaccinator / OtherStaff / Worker
// ============================================================

export async function PUT(request) {
  try {
    await connectDB();

    // ============================================================
    // Request Body
    // ============================================================

    const body = await request.json();

    const {
      userId,
      currentUcmoId,
      district,
      town,
      unionCouncil,
      ucmo,
      supervisor, // Required only for Worker
    } = body;

    // ============================================================
    // Validate Required IDs
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
        $in: ["supervisor", "vaccinator", "otherstaff", "worker"],
      },
      isActive: true,
      approvalStatus: "approved",
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only active approved Supervisor, Vaccinator, Other Staff or Worker can be transferred.",
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
    // Prevent Supervisor Transfer If Active Teams Exist
    // ============================================================

    if (user.designation === "supervisor") {
      const activeWorkers = await User.find({
        supervisor: user._id,
        designation: "worker",
        isActive: true,
      })
        .select("_id name teamNumber workerRole")
        .lean();

      if (activeWorkers.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This supervisor cannot be transferred because active teams are assigned to this supervisor. Transfer all active teams to another supervisor first.",
            data: {
              activeWorkers: activeWorkers.length,
            },
          },
          { status: 400 },
        );
      }

      // ============================================================
      // Prevent Supervisor Transfer If Zerodose Records Exist
      // ============================================================

      const zerodoseCount = await Zerodose.countDocuments({
        supervisor: user._id,
      });

      if (zerodoseCount > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This supervisor cannot be transferred because Zerodose records are already associated with this supervisor.",
            data: {
              zerodoseCount,
            },
          },
          { status: 400 },
        );
      }
    }

    // ============================================================
    // Verify Target District
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
    // Verify Target Town Belongs To District
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
    // Verify Target Union Council
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
    // Get Target Supervisor
    //
    // Required only when transferring a Worker.
    //
    // Target Supervisor must:
    // - be active
    // - be approved
    // - belong to target UCMO
    // - belong to target District
    // - belong to target Town
    // - belong to target Union Council
    // ============================================================

    let targetSupervisor = null;

    if (user.designation === "worker") {
      if (!supervisor) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Target Supervisor is required when transferring a worker.",
          },
          { status: 400 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Target Supervisor ID.",
          },
          { status: 400 },
        );
      }

      targetSupervisor = await User.findOne({
        _id: supervisor,
        designation: "supervisor",
        isActive: true,
        approvalStatus: "approved",
        ucmo: targetUcmo._id,
        district: district,
        town: town,
        unionCouncil: unionCouncil,
      })
        .select(
          "_id name designation district town unionCouncil ucmo isActive approvalStatus",
        )
        .lean();

      if (!targetSupervisor) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Active approved target Supervisor not found under the selected UCMO, District, Town and Union Council.",
          },
          { status: 400 },
        );
      }

      // ============================================================
      // Prevent Same Supervisor Transfer
      // ============================================================

      if (
        user.supervisor &&
        String(user.supervisor) === String(targetSupervisor._id)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Worker is already assigned to this Supervisor.",
          },
          { status: 400 },
        );
      }
    }

    // ============================================================
    // Prevent Same UCMO Transfer
    //
    // For Worker, if target supervisor is also different, transfer
    // is allowed even when UCMO/UC remains the same.
    // ============================================================

    if (
      user.designation !== "worker" &&
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
    // Worker Same Location Validation
    //
    // If Worker remains in same UCMO/UC but Supervisor changes,
    // transfer is allowed.
    // ============================================================

    if (user.designation === "worker") {
      const sameLocation =
        String(user.ucmo) === String(targetUcmo._id) &&
        String(user.unionCouncil) === String(unionCouncil) &&
        String(user.district) === String(district) &&
        String(user.town) === String(town);

      const sameSupervisor =
        user.supervisor &&
        targetSupervisor &&
        String(user.supervisor) === String(targetSupervisor._id);

      if (sameLocation && sameSupervisor) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Worker is already assigned to this location and Supervisor.",
          },
          { status: 400 },
        );
      }
    }

    // ============================================================
    // Transfer User
    // ============================================================

    user.district = district;
    user.town = town;
    user.unionCouncil = unionCouncil;
    user.ucmo = targetUcmo._id;

    // ============================================================
    // Worker:
    // Assign to Target Supervisor
    //
    // Existing teamNumber and workerRole remain unchanged.
    // Existing Zerodose records are NOT modified.
    // ============================================================

    if (user.designation === "worker") {
      user.supervisor = targetSupervisor._id;
    }

    // ============================================================
    // New Approval Required
    //
    // Worker:
    // New Supervisor approval required.
    //
    // Supervisor / Vaccinator / Other Staff:
    // New UCMO approval required.
    // ============================================================

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
      .populate("supervisor", "_id name designation")
      .lean();

    // ============================================================
    // SUCCESS
    // ============================================================

    const approvalMessage =
      user.designation === "worker"
        ? "Approval from the new Supervisor is now required."
        : "Approval from the new UCMO is now required.";

    return NextResponse.json(
      {
        success: true,
        message: `${user.designation} transferred successfully. ${approvalMessage}`,
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
