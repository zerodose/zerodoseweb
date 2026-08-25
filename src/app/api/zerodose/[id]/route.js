import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function objectIdEquals(first, second) {
  if (!first || !second) {
    return false;
  }

  const firstId = first?._id || first;
  const secondId = second?._id || second;

  return firstId.toString() === secondId.toString();
}

async function getAuthenticatedUser(request) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  let payload;

  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch (error) {
    console.error("JWT verification error:", error);

    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (!payload.userId || !isValidObjectId(payload.userId)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid authenticated user.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  await connectDB();

  const user = await User.findOne({
    _id: payload.userId,
    isActive: true,
  })
    .select(
      "_id name designation district town unionCouncil ucmo supervisor teamNumber workerRole",
    )
    .lean();

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Active user not found.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  return {
    user,
  };
}

function populateZerodose(query) {
  return query
    .populate("campaign", "name year month startDate endDate isActive")
    .populate("district", "name code")
    .populate("town", "name code")
    .populate("unionCouncil", "name code")
    .populate("ucmo", "name contactNumber")
    .populate("supervisor", "name contactNumber supervisorCode")
    .populate("user", "name contactNumber designation workerRole teamNumber")
    .populate(
      "teamLeader",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "teamMember",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate("vaccinator", "name contactNumber designation");
}

function canAccessZerodose(user, zerodose) {
  if (!user || !zerodose) {
    return false;
  }

  if (user.designation === "admin") {
    return true;
  }

  if (user.designation === "worker") {
    if (
      !user.supervisor ||
      user.teamNumber === null ||
      user.teamNumber === undefined
    ) {
      return false;
    }

    const sameSupervisor = objectIdEquals(user.supervisor, zerodose.supervisor);

    const sameTeam = Number(user.teamNumber) === Number(zerodose.teamNumber);

    return sameSupervisor && sameTeam;
  }

  if (user.designation === "supervisor") {
    return objectIdEquals(user._id, zerodose.supervisor);
  }

  if (user.designation === "ucmo") {
    return objectIdEquals(user._id, zerodose.ucmo);
  }

  if (user.designation === "vaccinator") {
    return objectIdEquals(user.unionCouncil, zerodose.unionCouncil);
  }

  if (user.designation === "townfp") {
    return objectIdEquals(user.town, zerodose.town);
  }

  if (user.designation === "districtfp") {
    return objectIdEquals(user.district, zerodose.district);
  }

  return false;
}

// async function getZerodose(id) {
//   return populateZerodose(Zerodose.findById(id)).lean();
// }

export async function GET(request, { params }) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        {
          status: 400,
        },
      );
    }

    const zerodose = await Zerodose.findById(id)
      .populate("campaign", "name year month startDate endDate isActive")
      .populate("district", "name code")
      .populate("town", "name code")
      .populate("unionCouncil", "name code")
      .populate("ucmo", "name contactNumber")
      .populate("supervisor", "name contactNumber supervisorCode")
      .populate("user", "name contactNumber designation workerRole teamNumber")
      .populate(
        "teamLeader",
        "name contactNumber designation workerRole teamNumber",
      )
      .populate(
        "teamMember",
        "name contactNumber designation workerRole teamNumber",
      )
      .populate("vaccinator", "name contactNumber designation")
      .lean();

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: zerodose,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get single Zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch Zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

    if (user.designation !== "supervisor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only supervisors can approve Zerodose updates.",
        },
        {
          status: 403,
        },
      );
    }

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const action = body?.action;

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid action is required: approve or reject.",
        },
        {
          status: 400,
        },
      );
    }

    const zerodose = await Zerodose.findById(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        {
          status: 404,
        },
      );
    }

    // Only the supervisor assigned to this Zerodose can approve/reject it.
    if (!objectIdEquals(user._id, zerodose.supervisor)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to approve this Zerodose update.",
        },
        {
          status: 403,
        },
      );
    }

    const PendingZerodose = (await import("@/models/PendingZerodose")).default;

    const pendingZerodose = await PendingZerodose.findOne({
      zerodose: zerodose._id,
      supervisor: user._id,
      status: "pending",
    });

    if (!pendingZerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "No pending update request found for this Zerodose.",
        },
        {
          status: 404,
        },
      );
    }

    // ---------------------------------------------------------
    // REJECT
    // ---------------------------------------------------------
    if (action === "reject") {
      pendingZerodose.status = "rejected";
      pendingZerodose.rejectedBy = user._id;
      pendingZerodose.rejectedAt = new Date();

      await pendingZerodose.save();

      return NextResponse.json(
        {
          success: true,
          message: "Zerodose update request rejected successfully.",
          data: {
            zerodoseId: zerodose._id,
            pendingZerodoseId: pendingZerodose._id,
            status: pendingZerodose.status,
          },
        },
        {
          status: 200,
        },
      );
    }

    // ---------------------------------------------------------
    // APPROVE
    // ---------------------------------------------------------

    const allowedFields = [
      "childName",
      "fatherName",
      "age",
      "address",
      "contactNo",
      "houseNumber",
      "gender",
    ];

    const changedFields = Array.isArray(pendingZerodose.changedFields)
      ? pendingZerodose.changedFields
      : [];

    const newData = pendingZerodose.newData || {};

    // Safety check:
    // Pending request itself must never contain a field
    // outside the fields workers are allowed to edit.
    const invalidChangedFields = changedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidChangedFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid update fields: ${invalidChangedFields.join(", ")}.`,
        },
        {
          status: 400,
        },
      );
    }

    // ---------------------------------------------------------
    // Apply ONLY changed fields
    // Everything else in actual Zerodose remains untouched.
    // ---------------------------------------------------------

    if (changedFields.includes("childName")) {
      if (typeof newData.childName !== "string" || !newData.childName.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid child name is required.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.childName = newData.childName.trim();
    }

    if (changedFields.includes("fatherName")) {
      if (
        typeof newData.fatherName !== "string" ||
        !newData.fatherName.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid father name is required.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.fatherName = newData.fatherName.trim();
    }

    if (changedFields.includes("age")) {
      const age = Number(newData.age);

      if (!Number.isInteger(age) || age < 0 || age > 59) {
        return NextResponse.json(
          {
            success: false,
            message: "Age must be an integer between 0 and 59.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.age = age;
    }

    if (changedFields.includes("address")) {
      if (typeof newData.address !== "string" || !newData.address.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid address is required.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.address = newData.address.trim();
    }

    if (changedFields.includes("contactNo")) {
      const contactNo = newData.contactNo;

      if (
        contactNo !== null &&
        contactNo !== "" &&
        (typeof contactNo !== "string" || !/^03\d{9}$/.test(contactNo.trim()))
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please enter a valid Pakistani mobile number.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.contactNo =
        typeof contactNo === "string" ? contactNo.trim() : null;
    }

    if (changedFields.includes("houseNumber")) {
      const houseNumber = Number(newData.houseNumber);

      if (!Number.isInteger(houseNumber) || houseNumber < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "House number must be a valid number.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.houseNumber = houseNumber;
    }

    if (changedFields.includes("gender")) {
      if (!["male", "female"].includes(newData.gender)) {
        return NextResponse.json(
          {
            success: false,
            message: "Gender must be male or female.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.gender = newData.gender;
    }

    // Save actual Zerodose FIRST.
    await zerodose.save();

    // Mark pending request approved.
    pendingZerodose.status = "approved";
    pendingZerodose.approvedBy = user._id;
    pendingZerodose.approvedAt = new Date();

    await pendingZerodose.save();

    const populated = await populateZerodose(
      Zerodose.findById(zerodose._id),
    ).lean();

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose update approved successfully.",
        data: populated,
        pendingZerodoseId: pendingZerodose._id,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Zerodose approval error:", error);

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data provided.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to process Zerodose approval.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

    if (user.designation !== "ucmo") {
      return NextResponse.json(
        {
          success: false,
          message: "Only UCMO can delete Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        {
          status: 400,
        },
      );
    }

    const zerodose = await Zerodose.findById(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (!objectIdEquals(user._id, zerodose.ucmo)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to delete this Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    const deletedZerodose = await Zerodose.findByIdAndDelete(id);

    if (!deletedZerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose deleted successfully.",
        data: {
          _id: deletedZerodose._id,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Delete Zerodose error:", error);

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data provided.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete Zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}
