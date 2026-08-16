import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import Zerodose from "@/models/Zerodose";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";
import User from "@/models/User";
import Campaign from "@/models/Campaign";

// ===import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

// ==================================================
// GET
// Get Zerodose List
// =====================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // ===================================================
    // Pagination
    // ===================================================

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50,
    );

    const skip = (page - 1) * limit;

    // ===================================================
    // Search
    // ===================================================

    const search = searchParams.get("search")?.trim() || "";

    // ===================================================
    // Filters
    // ===================================================

    const campaignId = searchParams.get("campaignId");

    const districtId = searchParams.get("districtId");
    const townId = searchParams.get("townId");
    const unionCouncilId = searchParams.get("unionCouncilId");

    const ucmo = searchParams.get("ucmo");
    const supervisor = searchParams.get("supervisor");

    const teamNumberParam = searchParams.get("teamNumber");

    const vaccinationStatus = searchParams.get("vaccinationStatus");

    const clientStatus = searchParams.get("clientStatus");

    // ===================================================
    // Date Filters
    // ===================================================

    const recordDateFrom = searchParams.get("recordDateFrom");

    const recordDateTo = searchParams.get("recordDateTo");

    const visitDateFrom = searchParams.get("visitDateFrom");

    const visitDateTo = searchParams.get("visitDateTo");

    const coveredDateFrom = searchParams.get("coveredDateFrom");

    const coveredDateTo = searchParams.get("coveredDateTo");

    // ===================================================
    // Sorting
    // ===================================================

    const allowedSortFields = [
      "createdAt",
      "recordDate",
      "visitDate",
      "coveredDate",
      "childName",
      "fatherName",
      "age",
      "teamNumber",
    ];

    const requestedSortBy = searchParams.get("sortBy") || "createdAt";

    const sortBy = allowedSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : "createdAt";

    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // ===================================================
    // Query
    // ===================================================

    const query = {};

    // ===================================================
    // Validate ObjectIds
    // ===================================================

    const objectIdFields = [
      {
        value: campaignId,
        name: "campaignId",
      },
      {
        value: districtId,
        name: "districtId",
      },
      {
        value: townId,
        name: "townId",
      },
      {
        value: unionCouncilId,
        name: "unionCouncilId",
      },
      {
        value: ucmo,
        name: "ucmo",
      },
      {
        value: supervisor,
        name: "supervisor",
      },
    ];

    for (const field of objectIdFields) {
      if (field.value && !mongoose.Types.ObjectId.isValid(field.value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field.name}`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ===================================================
    // Campaign Filter
    // ===================================================

    if (campaignId) {
      query.campaignId = campaignId;
    }

    // ===================================================
    // Location Filters
    // ===================================================

    if (districtId) {
      query.districtId = districtId;
    }

    if (townId) {
      query.townId = townId;
    }

    if (unionCouncilId) {
      query.unionCouncilId = unionCouncilId;
    }

    // ===================================================
    // User Filters
    // ===================================================

    if (ucmo) {
      query.ucmo = ucmo;
    }

    if (supervisor) {
      query.supervisor = supervisor;
    }

    // ===================================================
    // Team Number
    // ===================================================

    if (teamNumberParam) {
      const teamNumber = Number(teamNumberParam);

      if (!Number.isInteger(teamNumber) || teamNumber < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid teamNumber",
          },
          {
            status: 400,
          },
        );
      }

      query.teamNumber = teamNumber;
    }

    // ===================================================
    // Vaccination Status
    // ===================================================

    if (vaccinationStatus) {
      const allowedStatuses = ["recorded", "visited", "covered"];

      if (!allowedStatuses.includes(vaccinationStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid vaccinationStatus",
          },
          {
            status: 400,
          },
        );
      }

      query.vaccinationStatus = vaccinationStatus;
    }

    // ===================================================
    // Client Status
    // ===================================================

    if (clientStatus) {
      const allowedClientStatuses = [
        "available",
        "refusal",
        "sick",
        "not_available",
        "deceased",
      ];

      if (!allowedClientStatuses.includes(clientStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid clientStatus",
          },
          {
            status: 400,
          },
        );
      }

      query.clientStatus = clientStatus;
    }

    // ===================================================
    // Search
    // ===================================================

    if (search) {
      query.$or = [
        {
          childName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          fatherName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          address: {
            $regex: search,
            $options: "i",
          },
        },
        {
          contactNo: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ===================================================
    // Date Range Helper
    // ===================================================

    const addDateRange = (field, from, to) => {
      if (!from && !to) {
        return;
      }

      const range = {};

      if (from) {
        const start = new Date(`${from}T00:00:00`);

        if (Number.isNaN(start.getTime())) {
          throw new Error(`Invalid ${field} from date`);
        }

        range.$gte = start;
      }

      if (to) {
        const end = new Date(`${to}T23:59:59.999`);

        if (Number.isNaN(end.getTime())) {
          throw new Error(`Invalid ${field} to date`);
        }

        range.$lte = end;
      }

      query[field] = range;
    };

    addDateRange("recordDate", recordDateFrom, recordDateTo);

    addDateRange("visitDate", visitDateFrom, visitDateTo);

    addDateRange("coveredDate", coveredDateFrom, coveredDateTo);

    // ===================================================
    // Count
    // ===================================================

    const total = await Zerodose.countDocuments(query);

    // ===================================================
    // Data
    // ===================================================

    const data = await Zerodose.find(query)
      .populate("campaignId", "name year month startDate endDate isActive")
      .populate("districtId", "name code")
      .populate("townId", "name code")
      .populate("unionCouncilId", "name code")
      .populate("ucmo", "name contactNumber")
      .populate("supervisor", "name contactNumber supervisorCode")
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // ===================================================
    // Pagination
    // ===================================================

    const totalPages = Math.max(1, Math.ceil(total / limit));

    // ===================================================
    // Response
    // ===================================================

    return NextResponse.json(
      {
        success: true,

        data,

        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get zerodose error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch zerodose records",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    // ============================================================
    // Authentication
    // ============================================================

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        {
          status: 401,
        },
      );
    }

    let payload;

    try {
      const result = await jwtVerify(token, secret);
      payload = result.payload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired authentication.",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // Database
    // ============================================================

    await connectDB();

    // ============================================================
    // Get Logged-in Worker
    // ============================================================

    const worker = await User.findOne({
      _id: payload.userId,
      designation: "worker",
      isActive: true,
    }).lean();

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          message: "Only active workers can add zerodose.",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // Worker Assignment
    // ============================================================

    const { district, town, unionCouncil, ucmo, supervisor, teamNumber } =
      worker;

    if (
      !district ||
      !town ||
      !unionCouncil ||
      !ucmo ||
      !supervisor ||
      teamNumber === null ||
      teamNumber === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Worker is not properly assigned to district, town, union council, UCMO, supervisor or team.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Validate Worker IDs
    // ============================================================

    const workerIds = [
      {
        value: district,
        name: "district",
      },
      {
        value: town,
        name: "town",
      },
      {
        value: unionCouncil,
        name: "unionCouncil",
      },
      {
        value: ucmo,
        name: "ucmo",
      },
      {
        value: supervisor,
        name: "supervisor",
      },
    ];

    for (const field of workerIds) {
      if (!mongoose.Types.ObjectId.isValid(field.value)) {
        return NextResponse.json(
          {
            success: false,
            message: `Worker has an invalid ${field.name}.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ============================================================
    // Current Campaign
    //
    // Zerodose sirf active/current campaign ke andar
    // record ho sakta hai.
    // ============================================================

    // const now = new Date();

    // const currentCampaign = await Campaign.findOne({
    //   isActive: true,
    //   startDate: {
    //     $lte: now,
    //   },
    //   endDate: {
    //     $gte: now,
    //   },
    // })
    //   .select("_id name year month startDate endDate")
    //   .sort({
    //     startDate: -1,
    //   })
    //   .lean();

    // if (!currentCampaign) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message:
    //         "There is no active campaign available for recording Zerodose.",
    //     },
    //     {
    //       status: 400,
    //     },
    //   );
    // }

    const now = new Date();
    console.log("NOW:", new Date());
    const currentCampaign = await Campaign.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({
        startDate: -1,
      })
      .lean();

    if (!currentCampaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Zerodose can only be added during an active campaign.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Request Body
    //
    // Worker campaignId nahi bhejega.
    // Campaign backend khud decide karega.
    // ============================================================

    const body = await request.json();

    const { childName, fatherName, age, address, contactNo, location } = body;

    // ============================================================
    // Required Fields
    // ============================================================

    const requiredFields = [
      "childName",
      "fatherName",
      "age",
      "address",
      "location",
    ];

    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ============================================================
    // Child Name
    // ============================================================

    if (typeof childName !== "string" || !childName.trim()) {
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

    // ============================================================
    // Father Name
    // ============================================================

    if (typeof fatherName !== "string" || !fatherName.trim()) {
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

    // ============================================================
    // Age
    // ============================================================

    if (typeof age !== "number" || age < 0 || age > 59) {
      return NextResponse.json(
        {
          success: false,
          message: "Age must be a number between 0 and 59.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Address
    // ============================================================

    if (typeof address !== "string" || !address.trim()) {
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

    // ============================================================
    // Contact Number
    // ============================================================

    if (contactNo !== undefined && contactNo !== "") {
      if (!/^03\d{9}$/.test(contactNo)) {
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
    }

    // ============================================================
    // Location
    // ============================================================

    if (
      !location ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
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

    // ============================================================
    // Create Zerodose
    //
    // IMPORTANT:
    // Campaign bhi backend khud assign karega.
    // Worker campaignId provide nahi karega.
    // ============================================================

    const zerodose = await Zerodose.create({
      // Current campaign
      campaignId: currentCampaign._id,

      // Worker assignment
      districtId: district,
      townId: town,
      unionCouncilId: unionCouncil,

      ucmo,
      supervisor,
      teamNumber,

      // Child information
      childName: childName.trim(),
      fatherName: fatherName.trim(),
      age,

      address: address.trim(),
      contactNo: contactNo?.trim() || undefined,

      // Dates
      recordDate: new Date(),
      visitDate: null,
      coveredDate: null,

      // GPS
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },

      // Initial status
      clientStatus: null,
      vaccinationStatus: "recorded",
    });

    // ============================================================
    // Populate Created Zerodose
    // ============================================================

    const populatedZerodose = await Zerodose.findById(zerodose._id)
      .populate("campaignId", "name year month startDate endDate isActive")
      .populate("districtId", "name code")
      .populate("townId", "name code")
      .populate("unionCouncilId", "name code")
      .populate("ucmo", "name contactNumber")
      .populate("supervisor", "name contactNumber")
      .lean();

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Zerodose recorded successfully.",
        data: populatedZerodose,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create zerodose error:", error);

    // ============================================================
    // Mongoose Validation Error
    // ============================================================

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

    // ============================================================
    // Invalid ObjectId
    // ============================================================

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

    // ============================================================
    // Server Error
    // ============================================================

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create zerodose.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// POST
// Create Zerodose
// =====================================================

// export async function POST(request) {
//   try {
//     // ============================================================
//     // Authentication
//     // ============================================================

//     const token = request.cookies.get("auth_token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Not authenticated.",
//         },
//         {
//           status: 401,
//         },
//       );
//     }

//     let payload;

//     try {
//       const result = await jwtVerify(token, secret);
//       payload = result.payload;
//     } catch (error) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid or expired authentication.",
//         },
//         {
//           status: 401,
//         },
//       );
//     }

//     // ============================================================
//     // Database
//     // ============================================================

//     await connectDB();

//     // ============================================================
//     // Get Logged-in User
//     // ============================================================

//     const worker = await User.findOne({
//       _id: payload.userId,
//       designation: "worker",
//       isActive: true,
//     }).lean();

//     if (!worker) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only active workers can add zerodose.",
//         },
//         {
//           status: 403,
//         },
//       );
//     }

//     // ============================================================
//     // Worker Location / Team Information
//     // ============================================================

//     const { district, town, unionCouncil, ucmo, supervisor, teamNumber } =
//       worker;

//     if (
//       !district ||
//       !town ||
//       !unionCouncil ||
//       !ucmo ||
//       !supervisor ||
//       !teamNumber
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Worker is not properly assigned to district, town, union council, UCMO, supervisor or team.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Request Body
//     // ============================================================

//     const body = await request.json();

//     const { childName, fatherName, age, address, contactNo, location } = body;

//     // ============================================================
//     // Required Fields
//     // ============================================================

//     const requiredFields = [
//       "childName",
//       "fatherName",
//       "age",
//       "address",
//       "location",
//     ];

//     for (const field of requiredFields) {
//       if (
//         body[field] === undefined ||
//         body[field] === null ||
//         body[field] === ""
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `${field} is required.`,
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ============================================================
//     // Child Name
//     // ============================================================

//     if (typeof childName !== "string" || !childName.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid child name is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Father Name
//     // ============================================================

//     if (typeof fatherName !== "string" || !fatherName.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid father name is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Age
//     // ============================================================

//     if (typeof age !== "number" || age < 0 || age > 59) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Age must be a number between 0 and 59.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Address
//     // ============================================================

//     if (typeof address !== "string" || !address.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid address is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Contact Number
//     // ============================================================

//     if (contactNo !== undefined && contactNo !== "") {
//       if (!/^03\d{9}$/.test(contactNo)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Please enter a valid Pakistani mobile number.",
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ============================================================
//     // Location
//     // ============================================================

//     if (
//       !location ||
//       typeof location.latitude !== "number" ||
//       typeof location.longitude !== "number"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid latitude and longitude are required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Validate Worker IDs
//     // ============================================================

//     const workerIds = [
//       {
//         value: district,
//         name: "district",
//       },
//       {
//         value: town,
//         name: "town",
//       },
//       {
//         value: unionCouncil,
//         name: "unionCouncil",
//       },
//       {
//         value: ucmo,
//         name: "ucmo",
//       },
//       {
//         value: supervisor,
//         name: "supervisor",
//       },
//     ];

//     for (const field of workerIds) {
//       if (!mongoose.Types.ObjectId.isValid(field.value)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Worker has an invalid ${field.name}.`,
//           },
//           {
//             status: 400,
//           },
//         );
//       }
//     }

//     // ============================================================
//     // Create Zerodose
//     //
//     // IMPORTANT:
//     // Worker cannot provide:
//     // districtId
//     // townId
//     // unionCouncilId
//     // ucmo
//     // supervisor
//     // teamNumber
//     // clientStatus
//     // vaccinationStatus
//     // visitDate
//     // coveredDate
//     //
//     // All controlled fields are decided by backend.
//     // ============================================================

//     const zerodose = await Zerodose.create({
//       districtId: district,
//       townId: town,
//       unionCouncilId: unionCouncil,

//       ucmo: ucmo,
//       supervisor: supervisor,
//       teamNumber,

//       childName: childName.trim(),
//       fatherName: fatherName.trim(),
//       age,

//       address: address.trim(),
//       contactNo: contactNo?.trim() || undefined,

//       recordDate: new Date(),

//       visitDate: null,
//       coveredDate: null,

//       location: {
//         latitude: location.latitude,
//         longitude: location.longitude,
//       },

//       // Worker only records the zerodose.
//       clientStatus: null,
//       vaccinationStatus: "recorded",
//     });

//     // ============================================================
//     // Populate
//     // ============================================================

//     const populatedZerodose = await Zerodose.findById(zerodose._id)
//       .populate("districtId", "name code")
//       .populate("townId", "name code")
//       .populate("unionCouncilId", "name code")
//       .populate("ucmo", "name contactNumber")
//       .populate("supervisor", "name contactNumber")
//       .lean();

//     // ============================================================
//     // Response
//     // ============================================================

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Zerodose recorded successfully.",
//         data: populatedZerodose,
//       },
//       {
//         status: 201,
//       },
//     );
//   } catch (error) {
//     console.error("Create zerodose error:", error);

//     // ============================================================
//     // Mongoose Validation Error
//     // ============================================================

//     if (error.name === "ValidationError") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: Object.values(error.errors)
//             .map((item) => item.message)
//             .join(", "),
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Invalid ObjectId
//     // ============================================================

//     if (error instanceof mongoose.Error.CastError) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid data provided.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Server Error
//     // ============================================================

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to create zerodose.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }
