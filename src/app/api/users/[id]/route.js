import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";

import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";

// =====================================================
// GET SINGLE USER
// GET /api/users/:id
// =====================================================

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 },
      );
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get single user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// UPDATE USER
// PUT /api/users/:id
// =====================================================

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 },
      );
    }

    const existingUser = await User.findById(id).select("+password");

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

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

    // =================================================
    // Basic validation
    // =================================================

    if (name !== undefined && !name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name cannot be empty",
        },
        { status: 400 },
      );
    }

    if (
      contactNumber !== undefined &&
      !/^03\d{9}$/.test(contactNumber.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Pakistani mobile number",
        },
        { status: 400 },
      );
    }

    // =================================================
    // Determine final values
    // =================================================

    const finalDesignation =
      designation !== undefined ? designation : existingUser.designation;

    const finalDistrict =
      district !== undefined
        ? district || null
        : existingUser.district?.toString() || null;

    const finalTown =
      town !== undefined
        ? town || null
        : existingUser.town?.toString() || null;

    const finalUnionCouncil =
      unionCouncil !== undefined
        ? unionCouncil || null
        : existingUser.unionCouncil?.toString() || null;

    // =================================================
    // Validate designation
    // =================================================

    const allowedDesignations = [
      "ucmo",
      "supervisor",
      "vaccinator",
      "otherStaff",
      "townFP",
      "districtFP",
      "worker",
      "admin",
    ];

    if (!allowedDesignations.includes(finalDesignation)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid designation",
        },
        { status: 400 },
      );
    }

    // =================================================
    // Location requirements based on designation
    //
    // districtFP:
    //   district required
    //   town null
    //   unionCouncil null
    //
    // townFP:
    //   district required
    //   town required
    //   unionCouncil null
    //
    // ucmo / supervisor / vaccinator / otherStaff / worker:
    //   district required
    //   town required
    //   unionCouncil required
    //
    // admin:
    //   district null
    //   town null
    //   unionCouncil null
    // =================================================

    const requiresDistrict = [
      "ucmo",
      "supervisor",
      "vaccinator",
      "otherStaff",
      "townFP",
      "districtFP",
      "worker",
    ].includes(finalDesignation);

    const requiresTown = [
      "ucmo",
      "supervisor",
      "vaccinator",
      "otherStaff",
      "townFP",
      "worker",
    ].includes(finalDesignation);

    const requiresUnionCouncil = [
      "ucmo",
      "supervisor",
      "vaccinator",
      "otherStaff",
      "worker",
    ].includes(finalDesignation);

    // =================================================
    // Validate required location IDs
    // =================================================

    if (requiresDistrict) {
      if (
        !finalDistrict ||
        !mongoose.Types.ObjectId.isValid(finalDistrict)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "District is required for this designation",
          },
          { status: 400 },
        );
      }
    }

    if (requiresTown) {
      if (!finalTown || !mongoose.Types.ObjectId.isValid(finalTown)) {
        return NextResponse.json(
          {
            success: false,
            message: "Town is required for this designation",
          },
          { status: 400 },
        );
      }
    }

    if (requiresUnionCouncil) {
      if (
        !finalUnionCouncil ||
        !mongoose.Types.ObjectId.isValid(finalUnionCouncil)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Union Council is required for this designation",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Validate that locations are null where not required
    // =================================================

    if (!requiresTown && finalTown !== null) {
      if (designation !== undefined || town !== undefined) {
        // For districtFP/admin, town must not be retained.
        // It will be cleared below.
      }
    }

    if (!requiresUnionCouncil && finalUnionCouncil !== null) {
      if (designation !== undefined || unionCouncil !== undefined) {
        // For townFP/districtFP/admin, UC must not be retained.
        // It will be cleared below.
      }
    }

    // =================================================
    // Validate location hierarchy
    // =================================================

    if (requiresDistrict) {
      const districtDoc = await District.findOne({
        _id: finalDistrict,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!districtDoc) {
        return NextResponse.json(
          {
            success: false,
            message: "District not found or inactive",
          },
          { status: 404 },
        );
      }
    }

    // =================================================
    // Town must belong to selected district
    //
    // Required for:
    // townFP
    // ucmo
    // supervisor
    // vaccinator
    // otherStaff
    // worker
    // =================================================

    if (requiresTown) {
      const townDoc = await Town.findOne({
        _id: finalTown,
        district: finalDistrict,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!townDoc) {
        return NextResponse.json(
          {
            success: false,
            message: "Town does not belong to selected district",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Union Council must belong to selected town
    //
    // Required for:
    // ucmo
    // supervisor
    // vaccinator
    // otherStaff
    // worker
    // =================================================

    if (requiresUnionCouncil) {
      const ucDoc = await UnionCouncil.findOne({
        _id: finalUnionCouncil,
        town: finalTown,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!ucDoc) {
        return NextResponse.json(
          {
            success: false,
            message: "Union Council does not belong to selected town",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Email
    // =================================================

    const finalEmail =
      email !== undefined
        ? email?.trim().toLowerCase()
        : existingUser.email;

    if (finalDesignation !== "worker" && !finalEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 },
      );
    }

    if (finalEmail) {
      const duplicateEmail = await User.findOne({
        email: finalEmail,
        _id: { $ne: id },
      })
        .select("_id")
        .lean();

      if (duplicateEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 409 },
        );
      }
    }

    // =================================================
    // Contact
    // =================================================

    if (contactNumber !== undefined) {
      const duplicateContact = await User.findOne({
        contactNumber: contactNumber.trim(),
        _id: { $ne: id },
      })
        .select("_id")
        .lean();

      if (duplicateContact) {
        return NextResponse.json(
          {
            success: false,
            message: "Contact number already exists",
          },
          { status: 409 },
        );
      }
    }

    // =================================================
    // Supervisor
    // =================================================

    if (finalDesignation === "worker") {
      const finalSupervisor =
        supervisor !== undefined
          ? supervisor
          : existingUser.supervisor?.toString();

      if (!finalSupervisor) {
        return NextResponse.json(
          {
            success: false,
            message: "Supervisor is required for workers",
          },
          { status: 400 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(finalSupervisor)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid supervisor ID",
          },
          { status: 400 },
        );
      }

      const supervisorDoc = await User.findOne({
        _id: finalSupervisor,
        designation: "supervisor",
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!supervisorDoc) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid active supervisor not found",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Supervisor Code
    // =================================================

    if (finalDesignation === "supervisor") {
      const finalSupervisorCode =
        supervisorCode !== undefined
          ? supervisorCode?.trim().toUpperCase()
          : existingUser.supervisorCode;

      if (!finalSupervisorCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Supervisor code is required",
          },
          { status: 400 },
        );
      }
    }

    // =================================================
    // Password
    // =================================================

    let hashedPassword;

    if (password !== undefined) {
      if (password && password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 8 characters",
          },
          { status: 400 },
        );
      }

      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }
    }

    // =================================================
    // Build update
    // =================================================

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      updateData.email = finalEmail || null;
    }

    if (contactNumber !== undefined) {
      updateData.contactNumber = contactNumber.trim();
    }

    // =================================================
    // Location
    //
    // Always save only the locations allowed for the
    // final designation.
    // =================================================

    if (requiresDistrict) {
      updateData.district = finalDistrict;
    } else {
      updateData.district = null;
    }

    if (requiresTown) {
      updateData.town = finalTown;
    } else {
      updateData.town = null;
    }

    if (requiresUnionCouncil) {
      updateData.unionCouncil = finalUnionCouncil;
    } else {
      updateData.unionCouncil = null;
    }

    if (designation !== undefined) {
      updateData.designation = designation;
    }

    // =================================================
    // Supervisor Code
    // =================================================

    if (finalDesignation === "supervisor") {
      updateData.supervisorCode =
        supervisorCode !== undefined
          ? supervisorCode.trim().toUpperCase()
          : existingUser.supervisorCode;

      updateData.supervisor = null;
      updateData.teamNumber = null;
    } else {
      updateData.supervisorCode = null;
    }

    // =================================================
    // Worker-specific fields
    // =================================================

    if (finalDesignation === "worker") {
      updateData.supervisor =
        supervisor !== undefined ? supervisor : existingUser.supervisor;

      updateData.teamNumber =
        teamNumber !== undefined
          ? Number(teamNumber)
          : existingUser.teamNumber;
    } else {
      updateData.supervisor = null;
      updateData.teamNumber = null;
    }

    // =================================================
    // Password
    // =================================================

    if (hashedPassword) {
      updateData.password = hashedPassword;
    }

    // =================================================
    // Active
    // =================================================

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    // =================================================
    // Update
    // =================================================

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-password")
      .populate("district", "_id name code")
      .populate("town", "_id name code")
      .populate("unionCouncil", "_id name code")
      .populate("supervisor", "_id name contactNumber")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update user error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return NextResponse.json(
        {
          success: false,
          message: `${duplicateField || "Field"} already exists`,
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
        message: error?.message || "Failed to update user",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// DELETE USER
// DELETE /api/users/:id
// =====================================================

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 },
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      { status: 500 },
    );
  }
}

// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import District from "@/models/District";
// import Town from "@/models/Town";
// import UnionCouncil from "@/models/UnionCouncil";

// // =====================================================
// // GET SINGLE USER
// // GET /api/users/:id
// // =====================================================

// export async function GET(request, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid user ID",
//         },
//         { status: 400 },
//       );
//     }

//     const user = await User.findById(id)
//       .select("-password")
//       .populate("district", "_id name code")
//       .populate("town", "_id name code")
//       .populate("unionCouncil", "_id name code")
//       .populate("supervisor", "_id name contactNumber")
//       .lean();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         data: user,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Get single user error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch user",
//       },
//       { status: 500 },
//     );
//   }
// }

// // =====================================================
// // UPDATE USER
// // PUT /api/users/:id
// // =====================================================

// export async function PUT(request, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid user ID",
//         },
//         { status: 400 },
//       );
//     }

//     const existingUser = await User.findById(id).select("+password");

//     if (!existingUser) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 },
//       );
//     }

//     const body = await request.json();

//     const {
//       name,
//       email,
//       contactNumber,
//       district,
//       town,
//       unionCouncil,
//       designation,
//       supervisorCode,
//       supervisor,
//       teamNumber,
//       password,
//       isActive,
//     } = body;

//     // =================================================
//     // Basic validation
//     // =================================================

//     if (name !== undefined && !name?.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Name cannot be empty",
//         },
//         { status: 400 },
//       );
//     }

//     if (
//       contactNumber !== undefined &&
//       !/^03\d{9}$/.test(contactNumber.trim())
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid Pakistani mobile number",
//         },
//         { status: 400 },
//       );
//     }

//     // =================================================
//     // Determine final values
//     // =================================================

//     const finalDesignation =
//       designation !== undefined ? designation : existingUser.designation;

//     const finalDistrict =
//       district !== undefined ? district : existingUser.district?.toString();

//     const finalTown = town !== undefined ? town : existingUser.town?.toString();

//     const finalUnionCouncil =
//       unionCouncil !== undefined
//         ? unionCouncil
//         : existingUser.unionCouncil?.toString();

//     // =================================================
//     // Validate designation
//     // =================================================

//     const allowedDesignations = [
//       "vaccinator",
//       "worker",
//       "supervisor",
//       "otherStaff",
//       "ucmo",
//       "townFP",
//       "districtFP",
//       "admin",
//     ];

//     if (!allowedDesignations.includes(finalDesignation)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid designation",
//         },
//         { status: 400 },
//       );
//     }

//     // =================================================
//     // Validate location if changed
//     // =================================================

//     if (
//       district !== undefined ||
//       town !== undefined ||
//       unionCouncil !== undefined
//     ) {
//       if (
//         !mongoose.Types.ObjectId.isValid(finalDistrict) ||
//         !mongoose.Types.ObjectId.isValid(finalTown) ||
//         !mongoose.Types.ObjectId.isValid(finalUnionCouncil)
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid location ID",
//           },
//           { status: 400 },
//         );
//       }

//       const districtDoc = await District.findOne({
//         _id: finalDistrict,
//         isActive: true,
//       })
//         .select("_id")
//         .lean();

//       if (!districtDoc) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "District not found or inactive",
//           },
//           { status: 404 },
//         );
//       }

//       const townDoc = await Town.findOne({
//         _id: finalTown,
//         district: finalDistrict,
//         isActive: true,
//       })
//         .select("_id")
//         .lean();

//       if (!townDoc) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Town does not belong to selected district",
//           },
//           { status: 400 },
//         );
//       }

//       const ucDoc = await UnionCouncil.findOne({
//         _id: finalUnionCouncil,
//         town: finalTown,
//         isActive: true,
//       })
//         .select("_id")
//         .lean();

//       if (!ucDoc) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Union Council does not belong to selected town",
//           },
//           { status: 400 },
//         );
//       }
//     }

//     // =================================================
//     // Email
//     // =================================================

//     const finalEmail =
//       email !== undefined ? email?.trim().toLowerCase() : existingUser.email;

//     if (finalDesignation !== "worker" && !finalEmail) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email is required",
//         },
//         { status: 400 },
//       );
//     }

//     if (finalEmail) {
//       const duplicateEmail = await User.findOne({
//         email: finalEmail,
//         _id: { $ne: id },
//       })
//         .select("_id")
//         .lean();

//       if (duplicateEmail) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Email already exists",
//           },
//           { status: 409 },
//         );
//       }
//     }

//     // =================================================
//     // Contact
//     // =================================================

//     if (contactNumber !== undefined) {
//       const duplicateContact = await User.findOne({
//         contactNumber: contactNumber.trim(),
//         _id: { $ne: id },
//       })
//         .select("_id")
//         .lean();

//       if (duplicateContact) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Contact number already exists",
//           },
//           { status: 409 },
//         );
//       }
//     }

//     // =================================================
//     // Supervisor
//     // =================================================

//     if (finalDesignation === "worker") {
//       const finalSupervisor =
//         supervisor !== undefined
//           ? supervisor
//           : existingUser.supervisor?.toString();

//       if (!finalSupervisor) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Supervisor is required for workers",
//           },
//           { status: 400 },
//         );
//       }

//       if (!mongoose.Types.ObjectId.isValid(finalSupervisor)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Invalid supervisor ID",
//           },
//           { status: 400 },
//         );
//       }

//       const supervisorDoc = await User.findOne({
//         _id: finalSupervisor,
//         designation: "supervisor",
//         isActive: true,
//       })
//         .select("_id")
//         .lean();

//       if (!supervisorDoc) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Valid active supervisor not found",
//           },
//           { status: 400 },
//         );
//       }
//     }

//     // =================================================
//     // Supervisor Code
//     // =================================================

//     if (finalDesignation === "supervisor") {
//       const finalSupervisorCode =
//         supervisorCode !== undefined
//           ? supervisorCode?.trim().toUpperCase()
//           : existingUser.supervisorCode;

//       if (!finalSupervisorCode) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Supervisor code is required",
//           },
//           { status: 400 },
//         );
//       }
//     }

//     // =================================================
//     // Password
//     // =================================================

//     let hashedPassword;

//     if (password !== undefined) {
//       if (password && password.length < 8) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Password must be at least 8 characters",
//           },
//           { status: 400 },
//         );
//       }

//       if (password) {
//         hashedPassword = await bcrypt.hash(password, 12);
//       }
//     }

//     // =================================================
//     // Build update
//     // =================================================

//     const updateData = {};

//     if (name !== undefined) {
//       updateData.name = name.trim();
//     }

//     if (email !== undefined) {
//       updateData.email = finalEmail || null;
//     }

//     if (contactNumber !== undefined) {
//       updateData.contactNumber = contactNumber.trim();
//     }

//     if (district !== undefined) {
//       updateData.district = district;
//     }

//     if (town !== undefined) {
//       updateData.town = town;
//     }

//     if (unionCouncil !== undefined) {
//       updateData.unionCouncil = unionCouncil;
//     }

//     if (designation !== undefined) {
//       updateData.designation = designation;
//     }

//     if (finalDesignation === "supervisor") {
//       updateData.supervisorCode =
//         supervisorCode !== undefined
//           ? supervisorCode.trim().toUpperCase()
//           : existingUser.supervisorCode;

//       updateData.supervisor = null;
//       updateData.teamNumber = null;
//     } else {
//       updateData.supervisorCode = null;
//     }

//     if (finalDesignation === "worker") {
//       updateData.supervisor =
//         supervisor !== undefined ? supervisor : existingUser.supervisor;

//       updateData.teamNumber =
//         teamNumber !== undefined ? Number(teamNumber) : existingUser.teamNumber;
//     } else {
//       updateData.supervisor = null;
//       updateData.teamNumber = null;
//     }

//     if (hashedPassword) {
//       updateData.password = hashedPassword;
//     }

//     if (typeof isActive === "boolean") {
//       updateData.isActive = isActive;
//     }

//     // =================================================
//     // Update
//     // =================================================

//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       {
//         new: true,
//         runValidators: true,
//       },
//     )
//       .select("-password")
//       .populate("district", "_id name code")
//       .populate("town", "_id name code")
//       .populate("unionCouncil", "_id name code")
//       .populate("supervisor", "_id name contactNumber")
//       .lean();

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User updated successfully",
//         data: updatedUser,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Update user error:", error);

//     if (error?.code === 11000) {
//       const duplicateField = Object.keys(error.keyPattern || {})[0];

//       return NextResponse.json(
//         {
//           success: false,
//           message: `${duplicateField || "Field"} already exists`,
//         },
//         { status: 409 },
//       );
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: error?.message || "Failed to update user",
//       },
//       { status: 500 },
//     );
//   }
// }

// // =====================================================
// // DELETE USER
// // DELETE /api/users/:id
// // =====================================================

// export async function DELETE(request, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid user ID",
//         },
//         { status: 400 },
//       );
//     }

//     const user = await User.findById(id);

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 },
//       );
//     }

//     await User.findByIdAndDelete(id);

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User deleted successfully",
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Delete user error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to delete user",
//       },
//       { status: 500 },
//     );
//   }
// }
