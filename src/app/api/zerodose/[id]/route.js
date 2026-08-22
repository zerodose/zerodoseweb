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
    .populate(
      "user",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "teamLeader",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "teamMember",
      "name contactNumber designation workerRole teamNumber",
    )
    .populate(
      "vaccinator",
      "name contactNumber designation",
    );
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

    const sameSupervisor = objectIdEquals(
      user.supervisor,
      zerodose.supervisor,
    );

    const sameTeam =
      Number(user.teamNumber) === Number(zerodose.teamNumber);

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

  if (user.designation === "townFP") {
    return objectIdEquals(user.town, zerodose.town);
  }

  if (user.designation === "districtFP") {
    return objectIdEquals(user.district, zerodose.district);
  }

  return false;
}

async function getZerodose(id) {
  return populateZerodose(Zerodose.findById(id)).lean();
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

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

    const zerodose = await getZerodose(id);

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

    if (!canAccessZerodose(user, zerodose)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view this Zerodose.",
        },
        {
          status: 403,
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
        message: "Failed to fetch Zerodose.",
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
          message: "Only supervisors can update Zerodose.",
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

    if (!objectIdEquals(user._id, zerodose.supervisor)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to update this Zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const allowedFields = [
      "childName",
      "fatherName",
      "age",
      "address",
      "contactNo",
      "houseNumber",
      "gender",
      "location",
    ];

    const receivedFields = Object.keys(body);

    if (receivedFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No update data provided.",
        },
        {
          status: 400,
        },
      );
    }

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Supervisor cannot update: ${invalidFields.join(", ")}.`,
        },
        {
          status: 403,
        },
      );
    }

    if (body.childName !== undefined) {
      if (
        typeof body.childName !== "string" ||
        !body.childName.trim()
      ) {
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

      zerodose.childName = body.childName.trim();
    }

    if (body.fatherName !== undefined) {
      if (
        typeof body.fatherName !== "string" ||
        !body.fatherName.trim()
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

      zerodose.fatherName = body.fatherName.trim();
    }

    if (body.age !== undefined) {
      if (
        typeof body.age !== "number" ||
        !Number.isInteger(body.age) ||
        body.age < 0 ||
        body.age > 59
      ) {
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

      zerodose.age = body.age;
    }

    if (body.address !== undefined) {
      if (
        typeof body.address !== "string" ||
        !body.address.trim()
      ) {
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

      zerodose.address = body.address.trim();
    }

    if (body.contactNo !== undefined) {
      if (
        body.contactNo !== null &&
        body.contactNo !== "" &&
        (typeof body.contactNo !== "string" ||
          !/^03\d{9}$/.test(body.contactNo.trim()))
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
        body.contactNo?.trim() || null;
    }

    if (body.houseNumber !== undefined) {
      if (
        typeof body.houseNumber !== "number" ||
        !Number.isInteger(body.houseNumber) ||
        body.houseNumber < 0
      ) {
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

      zerodose.houseNumber = body.houseNumber;
    }

    if (body.gender !== undefined) {
      if (!["male", "female"].includes(body.gender)) {
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

      zerodose.gender = body.gender;
    }

    if (body.location !== undefined) {
      if (
        !body.location ||
        typeof body.location.latitude !== "number" ||
        typeof body.location.longitude !== "number"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid latitude and longitude are required.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        body.location.latitude < -90 ||
        body.location.latitude > 90
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid latitude.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        body.location.longitude < -180 ||
        body.location.longitude > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid longitude.",
          },
          {
            status: 400,
          },
        );
      }

      zerodose.location = {
        latitude: body.location.latitude,
        longitude: body.location.longitude,
      };
    }

    await zerodose.save();

    const populated = await getZerodose(id);

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose updated successfully.",
        data: populated,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Update Zerodose error:", error);

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
        message: "Failed to update Zerodose.",
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