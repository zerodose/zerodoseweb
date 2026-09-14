// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { jwtVerify } from "jose";

// import { connectDB } from "@/lib/db";

// import Zerodose from "@/models/Zerodose";
// import User from "@/models/User";

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
//           message: "Only vaccinator can cover Zerodose.",
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

//     const qrCode = body?.qrCode;

//     // ==========================================================
//     // QR CODE VALIDATION
//     // ==========================================================

//     if (!qrCode || typeof qrCode !== "string") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "QR code is required.",
//         },
//         { status: 400 },
//       );
//     }

//     const scannedQrCode = qrCode.trim();

//     if (!scannedQrCode) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid QR code.",
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
//     // Only the vaccinator assigned to this Zerodose can cover it.
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
//     // RECORD QR VALIDATION
//     // ==========================================================

//     if (!zerodose.qrCode) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "QR code is not assigned to this Zerodose record.",
//         },
//         { status: 400 },
//       );
//     }

//     // ==========================================================
//     // SCANNED QR VS DATABASE QR
//     // ==========================================================

//     const recordQrCode = zerodose.qrCode.trim();

//     if (recordQrCode !== scannedQrCode) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid QR code for this child.",
//         },
//         { status: 400 },
//       );
//     }

//     // ==========================================================
//     // COVER CHILD
//     // ==========================================================

//     const now = new Date();

//     zerodose.vaccinator = user._id;

//     zerodose.coveredDate = now;

//     zerodose.vaccinationStatus = "covered";

//     // ==========================================================
//     // DIRECT COVER
//     // ==========================================================
//     // If no previous visit exists, covering the child also
//     // records the visit date.
//     // ==========================================================

//     if (!zerodose.visitDate) {
//       zerodose.visitDate = now;
//     }

//     // ==========================================================
//     // SAVE
//     // ==========================================================

//     await zerodose.save();

//     // ==========================================================
//     // SUCCESS RESPONSE
//     // ==========================================================

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Child covered successfully.",
//         data: {
//           _id: zerodose._id,
//           qrCode: zerodose.qrCode,
//           vaccinator: zerodose.vaccinator,
//           visitDate: zerodose.visitDate,
//           coveredDate: zerodose.coveredDate,
//           vaccinationStatus: zerodose.vaccinationStatus,
//           clientStatus: zerodose.clientStatus,
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     // ==========================================================
//     // ERROR
//     // ==========================================================

//     console.error("Vaccinator cover API error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to cover child.",
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
  if (!a || !b) {
    return false;
  }

  return a.toString() === b.toString();
}

// ============================================================
// AUTHENTICATED USER
// ============================================================

async function getAuthenticatedUser(request) {
  const token = request.cookies.get("auth_token")?.value;

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

  let payload;

  try {
    const result = await jwtVerify(token, secret);

    
payload = result.payload;
;
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
;
  }

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
        { status: 401 },
      ),
    };
  }

  return {
    user,
  };
}

// ============================================================
// PATCH /api/zerodose/vaccinator/[id]/cover
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
      message: "Only vaccinator can cover Zerodose.",
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

// ==========================================================
// QR CODE FROM REQUEST
// ==========================================================

const qrCode = body?.qrCode;

// ==========================================================
// QR CODE VALIDATION
// ==========================================================

if (qrCode === null || qrCode === undefined) {
  return NextResponse.json(
    {
      success: false,
      message: "QR code is required.",
    },
    { status: 400 },
  );
}

if (typeof qrCode !== "string") {
  return NextResponse.json(
    {
      success: false,
      message: "QR code must be a string.",
    },
    { status: 400 },
  );
}

// ==========================================================
// NORMALIZE QR
// ==========================================================

const scannedQrCode = qrCode.trim();

// ==========================================================
// EXACT 14 DIGIT VALIDATION
// ==========================================================

if (!/^\d{14}$/.test(scannedQrCode)) {
  return NextResponse.json(
    {
      success: false,
      message: "QR code must be exactly 14 digits.",
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
// VACCINATOR UNION COUNCIL SCOPE
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
// COVER CHILD
// ==========================================================

const now = new Date();

// ==========================================================
// SAVE SCANNED QR CODE
// ==========================================================

zerodose.qrCode = scannedQrCode;

// ==========================================================
// SAVE VACCINATOR
// ==========================================================

zerodose.vaccinator = user._id;

// ==========================================================
// SAVE COVER DATE
// ==========================================================

zerodose.coveredDate = now;

// ==========================================================
// SAVE VISIT DATE IF NOT ALREADY SET
// ==========================================================

if (!zerodose.visitDate) {
  zerodose.visitDate = now;
}

// ==========================================================
// SAVE VACCINATION STATUS
// ==========================================================

zerodose.vaccinationStatus = "covered";

// ==========================================================
// SAVE DATABASE
// ==========================================================

await zerodose.save();

// ==========================================================
// SUCCESS RESPONSE
// ==========================================================

return NextResponse.json(
  {
    success: true,
    message: "Child covered successfully.",
    data: {
      _id: zerodose._id,
      qrCode: zerodose.qrCode,
      vaccinator: zerodose.vaccinator,
      visitDate: zerodose.visitDate,
      coveredDate: zerodose.coveredDate,
      vaccinationStatus: zerodose.vaccinationStatus,
      clientStatus: zerodose.clientStatus,
    },
  },
  { status: 200 },
);
;
  } catch (error) {
    console.error("Vaccinator cover API error:", error);

    
return NextResponse.json(
  {
    success: false,
    message: "Failed to cover child.",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
  },
  { status: 500 },
);
;
  }
}
