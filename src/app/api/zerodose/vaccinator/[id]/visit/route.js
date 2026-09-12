// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { jwtVerify } from "jose";

// import { connectDB } from "@/lib/db";

// import Zerodose from "@/models/Zerodose";
// import User from "@/models/User";

// const VISIT_STATUSES = [
//   "available",
//   "refusal",
//   "sick",
//   "not_available",
//   "deceased",
// ];

// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is not configured");
// }

// const secret = new TextEncoder().encode(JWT_SECRET);

// // ============================================================
// // OBJECT ID VALIDATION
// // ============================================================

// function isValidObjectId(value) {
//   return mongoose.Types.ObjectId.isValid(value);
// }

// // ============================================================
// // AUTHENTICATED USER
// // ============================================================

// async function getAuthenticatedUser(request) {
//   const token = request.cookies.get("auth_token")?.value;

//   // ----------------------------------------------------------
//   // NO TOKEN
//   // ----------------------------------------------------------

//   if (!token) {
//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Not authenticated.",
//         },
//         { status: 401 },
//       ),
//     };
//   }

//   // ----------------------------------------------------------
//   // VERIFY JWT
//   // ----------------------------------------------------------

//   let payload;

//   try {
//     const result = await jwtVerify(token, secret);
//     payload = result.payload;
//   } catch (error) {
//     console.error("JWT verification error:", error);

//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Invalid or expired authentication.",
//         },
//         { status: 401 },
//       ),
//     };
//   }

//   // ----------------------------------------------------------
//   // VALIDATE USER ID
//   // ----------------------------------------------------------

//   if (!payload?.userId || !isValidObjectId(payload.userId)) {
//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Invalid authenticated user.",
//         },
//         { status: 401 },
//       ),
//     };
//   }

//   // ----------------------------------------------------------
//   // DATABASE
//   // ----------------------------------------------------------

//   await connectDB();

//   // ----------------------------------------------------------
//   // GET ACTIVE USER
//   // ----------------------------------------------------------

//   const user = await User.findOne({
//     _id: payload.userId,
//     isActive: true,
//   })
//     .select(
//       "_id name designation district town unionCouncil ucmo supervisor teamNumber workerRole",
//     )
//     .lean();

//   if (!user) {
//     return {
//       error: NextResponse.json(
//         {
//           success: false,
//           message: "Active user not found.",
//         },
//         { status: 401 },
//       ),
//     };
//   }

//   return {
//     user,
//   };
// }

// // ============================================================
// // PATCH
// // ============================================================

// export async function PATCH(request, { params }) {
//   try {
//     // ==========================================================
//     // DATABASE
//     // ==========================================================

//     await connectDB();

//     // ==========================================================
//     // PARAMS
//     // ==========================================================

//     const { id } = await params;

//     // ==========================================================
//     // VALIDATE ZERODOSE ID
//     // ==========================================================

//     if (!isValidObjectId(id)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid Zerodose ID",
//         },
//         { status: 400 },
//       );
//     }

//     // ==========================================================
//     // AUTHENTICATION
//     // ==========================================================

//     const auth = await getAuthenticatedUser(request);

//     if (auth.error) {
//       return auth.error;
//     }

//     const user = auth.user;

//     // ==========================================================
//     // ONLY VACCINATOR
//     // ==========================================================

//     if (user.designation !== "vaccinator") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only vaccinator can update visit status.",
//         },
//         { status: 403 },
//       );
//     }

//     // ==========================================================
//     // REQUEST BODY
//     // ==========================================================

//     let body;

//     try {
//       body = await request.json();
//     } catch (error) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid request body.",
//         },
//         { status: 400 },
//       );
//     }

//     const clientStatus = body?.clientStatus;

//     // ==========================================================
//     // VALIDATE CLIENT STATUS
//     // ==========================================================

//     if (!VISIT_STATUSES.includes(clientStatus)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid visit status.",
//           allowedStatuses: VISIT_STATUSES,
//         },
//         { status: 400 },
//       );
//     }

//     // ==========================================================
//     // FIND ZERODOSE
//     // ==========================================================

//     const zerodose = await Zerodose.findById(id);

//     if (!zerodose) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Zerodose record not found.",
//         },
//         { status: 404 },
//       );
//     }

//     // ==========================================================
//     // VACCINATOR ASSIGNMENT CHECK
//     // ==========================================================
//     // Only the vaccinator assigned to this Zerodose can
//     // update its visit status.
//     // ==========================================================

//     if (
//       !zerodose.vaccinator ||
//       zerodose.vaccinator.toString() !== user._id.toString()
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This Zerodose record is not assigned to you.",
//         },
//         { status: 403 },
//       );
//     }

//     // ==========================================================
//     // ALREADY COVERED CHECK
//     // ==========================================================
//     // A covered child should not go backwards to visited.
//     // ==========================================================

//     if (zerodose.vaccinationStatus === "covered") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This child has already been covered.",
//         },
//         { status: 409 },
//       );
//     }

//     // ==========================================================
//     // UPDATE VISIT
//     // ==========================================================

//     const now = new Date();

//     zerodose.vaccinator = user._id;
//     zerodose.visitDate = now;
//     zerodose.clientStatus = clientStatus;
//     zerodose.vaccinationStatus = "visited";

//     await zerodose.save();

//     // ==========================================================
//     // SUCCESS RESPONSE
//     // ==========================================================

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Visit recorded successfully.",
//         data: {
//           _id: zerodose._id,
//           clientStatus: zerodose.clientStatus,
//           visitDate: zerodose.visitDate,
//           vaccinationStatus: zerodose.vaccinationStatus,
//           vaccinator: zerodose.vaccinator,
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     // ==========================================================
//     // ERROR
//     // ==========================================================

//     console.error("Vaccinator visit API error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to record visit.",
//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";

import Zerodose from "@/models/Zerodose";
import User from "@/models/User";

const VISIT_STATUSES = [
  "available",
  "refusal",
  "sick",
  "not_available",
  "deceased",
];

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

// ============================================================
// OBJECT ID VALIDATION
// ============================================================

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

// ============================================================
// OBJECT ID COMPARISON
// ============================================================

function objectIdEquals(a, b) {
  if (!a || !b) return false;

  return a.toString() === b.toString();
}

// ============================================================
// AUTHENTICATED USER
// ============================================================

async function getAuthenticatedUser(request) {
  const token = request.cookies.get("auth_token")?.value;

  // ----------------------------------------------------------
  // NO TOKEN
  // ----------------------------------------------------------

  if (!token) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 },
      ),
    };
  }

  // ----------------------------------------------------------
  // VERIFY JWT
  // ----------------------------------------------------------

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
        { status: 401 },
      ),
    };
  }

  // ----------------------------------------------------------
  // VALIDATE USER ID
  // ----------------------------------------------------------

  if (!payload?.userId || !isValidObjectId(payload.userId)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid authenticated user.",
        },
        { status: 401 },
      ),
    };
  }

  // ----------------------------------------------------------
  // DATABASE
  // ----------------------------------------------------------

  await connectDB();

  // ----------------------------------------------------------
  // GET ACTIVE USER
  // ----------------------------------------------------------

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
        { status: 401 },
      ),
    };
  }

  return {
    user,
  };
}

// ============================================================
// PATCH
// ============================================================

export async function PATCH(request, { params }) {
  try {
    // ==========================================================
    // DATABASE
    // ==========================================================

    await connectDB();

    // ==========================================================
    // PARAMS
    // ==========================================================

    const { id } = await params;

    // ==========================================================
    // VALIDATE ZERODOSE ID
    // ==========================================================

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Zerodose ID.",
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // AUTHENTICATION
    // ==========================================================

    const auth = await getAuthenticatedUser(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

    // ==========================================================
    // ONLY VACCINATOR
    // ==========================================================

    if (user.designation !== "vaccinator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only vaccinator can update visit status.",
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // REQUEST BODY
    // ==========================================================

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const clientStatus = body?.clientStatus;

    // ==========================================================
    // VALIDATE CLIENT STATUS
    // ==========================================================

    if (!VISIT_STATUSES.includes(clientStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid visit status.",
          allowedStatuses: VISIT_STATUSES,
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // FIND ZERODOSE
    // ==========================================================

    const zerodose = await Zerodose.findById(id);

    if (!zerodose) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose record not found.",
        },
        { status: 404 },
      );
    }

    // ==========================================================
    // VACCINATOR UC SCOPE CHECK
    // ==========================================================
    // Vaccinator can only update Zerodose records belonging
    // to their own Union Council.
    // ==========================================================

    if (!objectIdEquals(user.unionCouncil, zerodose.unionCouncil)) {
      return NextResponse.json(
        {
          success: false,
          message: "This Zerodose record is outside your Union Council.",
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // ALREADY COVERED CHECK
    // ==========================================================
    // A covered child cannot go backwards to visited.
    // ==========================================================

    if (zerodose.vaccinationStatus === "covered") {
      return NextResponse.json(
        {
          success: false,
          message: "This child has already been covered.",
        },
        { status: 409 },
      );
    }

    // ==========================================================
    // UPDATE VISIT
    // ==========================================================

    const now = new Date();

    // IMPORTANT:
    // The vaccinator who performs this action becomes the
    // vaccinator saved against this Zerodose record.
    zerodose.vaccinator = user._id;

    zerodose.visitDate = now;

    zerodose.clientStatus = clientStatus;

    zerodose.vaccinationStatus = "visited";

    await zerodose.save();

    // ==========================================================
    // SUCCESS RESPONSE
    // ==========================================================

    return NextResponse.json(
      {
        success: true,
        message: "Visit recorded successfully.",
        data: {
          _id: zerodose._id,
          clientStatus: zerodose.clientStatus,
          visitDate: zerodose.visitDate,
          vaccinationStatus: zerodose.vaccinationStatus,

          // The logged-in vaccinator's ID is returned here.
          vaccinator: zerodose.vaccinator,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    // ==========================================================
    // ERROR
    // ==========================================================

    console.error("Vaccinator visit API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to record visit.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
