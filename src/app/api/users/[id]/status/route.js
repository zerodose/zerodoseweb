import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function PUT(request, { params }) {
  try {
    await connectDB();

    
const { id } = await params;

// ============================================================
// VALIDATE USER ID
// ============================================================

if (!mongoose.Types.ObjectId.isValid(id)) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid user ID.",
    },
    {
      status: 400,
    },
  );
}

// ============================================================
// AUTHENTICATE UCMO
// ============================================================

const token = request.cookies.get("auth_token")?.value;

if (!token) {
  return NextResponse.json(
    {
      success: false,
      message: "Authentication required.",
    },
    {
      status: 401,
    },
  );
}

let payload;

try {
  const verified = await jwtVerify(token, secret);
  payload = verified.payload;
} catch (error) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid or expired authentication token.",
    },
    {
      status: 401,
    },
  );
}

// ============================================================
// AUTHENTICATED USER
// ============================================================

const authUserId = payload?.userId;
const authDesignation = payload?.designation;

if (
  !authUserId ||
  !mongoose.Types.ObjectId.isValid(authUserId)
) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid authenticated user.",
    },
    {
      status: 401,
    },
  );
}

if (authDesignation !== "ucmo") {
  return NextResponse.json(
    {
      success: false,
      message: "Only a UCMO can update staff status.",
    },
    {
      status: 403,
    },
  );
}

// ============================================================
// GET ACTIVE UCMO
// ============================================================

const ucmo = await User.findOne({
  _id: authUserId,
  designation: "ucmo",
  isActive: true,
})
  .select("_id unionCouncil")
  .lean();

if (!ucmo) {
  return NextResponse.json(
    {
      success: false,
      message: "Your UCMO account is not active.",
    },
    {
      status: 403,
    },
  );
}

// ============================================================
// REQUEST BODY
// ============================================================

const body = await request.json();

const { isActive, approvalStatus } = body;

// ============================================================
// VALIDATE STATUS DATA
// ============================================================

if (typeof isActive !== "boolean") {
  return NextResponse.json(
    {
      success: false,
      message: "isActive must be a boolean.",
    },
    {
      status: 400,
    },
  );
}

if (!["pending", "approved"].includes(approvalStatus)) {
  return NextResponse.json(
    {
      success: false,
      message:
        "approvalStatus must be either pending or approved.",
    },
    {
      status: 400,
    },
  );
}

// ============================================================
// FIND TARGET USER
// ============================================================

const user = await User.findById(id);

if (!user) {
  return NextResponse.json(
    {
      success: false,
      message: "User not found.",
    },
    {
      status: 404,
    },
  );
}

// ============================================================
// ALLOWED STAFF
// ============================================================

const allowedDesignations = [
  "supervisor",
  "vaccinator",
  "otherstaff",
  "worker",
];

if (!allowedDesignations.includes(user.designation)) {
  return NextResponse.json(
    {
      success: false,
      message: "This user cannot be managed by a UCMO.",
    },
    {
      status: 403,
    },
  );
}

// ============================================================
// UCMO SCOPE CHECK
// ============================================================

if (
  !ucmo.unionCouncil ||
  !user.unionCouncil ||
  String(ucmo.unionCouncil) !== String(user.unionCouncil)
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You are not authorized to manage this user's status.",
    },
    {
      status: 403,
    },
  );
}

// ============================================================
// UPDATE ONLY STATUS FIELDS
// ============================================================

user.isActive = isActive;
user.approvalStatus = approvalStatus;

await user.save();

// ============================================================
// GET UPDATED USER
// ============================================================

const updatedUser = await User.findById(user._id)
  .select(
    "-password -emailVerificationCode -emailVerificationExpires",
  )
  .populate("district", "_id name code")
  .populate("town", "_id name code")
  .populate("unionCouncil", "_id name code")
  .populate("ucmo", "_id name email designation")
  .populate("supervisor", "_id name contactNumber")
  .populate("approvedBy", "_id name designation")
  .lean();

// ============================================================
// RESPONSE
// ============================================================

return NextResponse.json(
  {
    success: true,
    message: isActive
      ? "User activated and approved successfully."
      : "User deactivated and moved to pending.",
    data: updatedUser,
  },
  {
    status: 200,
  },
);
;
  } catch (error) {
    console.error("Update user status error:", error);

    
return NextResponse.json(
  {
    success: false,
    message:
      error?.message || "Failed to update user status.",
  },
  {
    status: 500,
  },
);
;
  }
}
