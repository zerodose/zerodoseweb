// // import mongoose from "mongoose";
// // import { NextResponse } from "next/server";

// // import { connectDB } from "@/lib/db";
// // import User from "@/models/User";
// // import Zerodose from "@/models/Zerodose";
// // import { getAuthenticatedUser } from "@/lib/auth";

// // // ============================================================
// // // GET VACCINATOR SUPERVISOR SUMMARY
// // // ============================================================

// // export async function GET(request) {
// //   try {
// //     await connectDB();

// //     // ========================================================
// //     // AUTHENTICATION
// //     // ========================================================

// //     const auth = await getAuthenticatedUser(request);

// //     if (auth.error) {
// //       return auth.error;
// //     }

// //     const { user } = auth;

// //     // ========================================================
// //     // ONLY VACCINATOR
// //     // ========================================================

// //     if (user.designation !== "vaccinator") {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Only vaccinators can access supervisor summary.",
// //         },
// //         { status: 403 },
// //       );
// //     }

// //     // ========================================================
// //     // UNION COUNCIL
// //     // ========================================================

// //     if (!user.unionCouncil) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Union Council is not assigned to this vaccinator.",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     if (!mongoose.Types.ObjectId.isValid(user.unionCouncil)) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Invalid Union Council assigned to this vaccinator.",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     const unionCouncilObjectId = new mongoose.Types.ObjectId(user.unionCouncil);

// //     // ========================================================
// //     // CAMPAIGN ID
// //     // ========================================================

// //     const { searchParams } = new URL(request.url);

// //     const campaignId = searchParams.get("campaignId");

// //     if (!campaignId) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "campaignId is required.",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     if (!mongoose.Types.ObjectId.isValid(campaignId)) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Invalid campaignId.",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

// //     // ========================================================
// //     // SUPERVISOR SUMMARY
// //     //
// //     // Campaign + Union Council
// //     //
// //     // ONLY records where recordDate exists
// //     // ========================================================

// //     const supervisorData = await Zerodose.aggregate([
// //       // ------------------------------------------------------
// //       // CAMPAIGN + UNION COUNCIL + RECORDED
// //       // ------------------------------------------------------

// //       {
// //         $match: {
// //           campaign: campaignObjectId,

// //           unionCouncil: unionCouncilObjectId,

// //           recordDate: {
// //             $ne: null,
// //           },

// //           supervisor: {
// //             $ne: null,
// //           },
// //         },
// //       },

// //       // ------------------------------------------------------
// //       // GROUP BY CAMPAIGN + SUPERVISOR
// //       // ------------------------------------------------------

// //       {
// //         $group: {
// //           _id: {
// //             campaignId: "$campaign",
// //             supervisorId: "$supervisor",
// //           },

// //           recordCount: {
// //             $sum: 1,
// //           },

// //           visitCount: {
// //             $sum: {
// //               $cond: [
// //                 {
// //                   $ne: ["$visitDate", null],
// //                 },
// //                 1,
// //                 0,
// //               ],
// //             },
// //           },

// //           coveredCount: {
// //             $sum: {
// //               $cond: [
// //                 {
// //                   $ne: ["$coveredDate", null],
// //                 },
// //                 1,
// //                 0,
// //               ],
// //             },
// //           },

// //           teams: {
// //             $addToSet: "$teamNumber",
// //           },
// //         },
// //       },

// //       // ------------------------------------------------------
// //       // FINAL SUPERVISOR DATA
// //       // ------------------------------------------------------

// //       {
// //         $project: {
// //           _id: 0,

// //           campaignId: "$_id.campaignId",

// //           supervisorId: "$_id.supervisorId",

// //           recordCount: 1,

// //           visitCount: 1,

// //           coveredCount: 1,

// //           numberOfTeams: {
// //             $size: {
// //               $filter: {
// //                 input: "$teams",
// //                 as: "team",

// //                 cond: {
// //                   $ne: ["$$team", null],
// //                 },
// //               },
// //             },
// //           },
// //         },
// //       },

// //       // ------------------------------------------------------
// //       // MOST RECORDS FIRST
// //       // ------------------------------------------------------

// //       {
// //         $sort: {
// //           recordCount: -1,
// //         },
// //       },
// //     ]);

// //     // ========================================================
// //     // SUPERVISOR IDS
// //     // ========================================================

// //     const supervisorIds = supervisorData
// //       .map((item) => item.supervisorId)
// //       .filter(Boolean);

// //     // ========================================================
// //     // DEFAULT SUPERVISORS
// //     // ========================================================

// //     let supervisors = [];

// //     // ========================================================
// //     // GET SUPERVISOR USERS
// //     // ========================================================

// //     if (supervisorIds.length > 0) {
// //       const supervisorUsers = await User.find({
// //         _id: {
// //           $in: supervisorIds,
// //         },
// //       })
// //         .select("_id name supervisorCode")
// //         .lean();

// //       // ======================================================
// //       // MERGE USER DATA + ZERODOSE DATA
// //       // ======================================================

// //       supervisors = supervisorData.map((item) => {
// //         const supervisor = supervisorUsers.find(
// //           (user) => String(user._id) === String(item.supervisorId),
// //         );

// //         return {
// //           campaignId: item.campaignId,

// //           supervisorId: item.supervisorId,

// //           supervisorName: supervisor?.name || "-",

// //           supervisorCode: supervisor?.supervisorCode || "-",

// //           numberOfTeams: Number(item.numberOfTeams || 0),

// //           recordCount: Number(item.recordCount || 0),

// //           visitCount: Number(item.visitCount || 0),

// //           coveredCount: Number(item.coveredCount || 0),
// //         };
// //       });
// //     }

// //     // ========================================================
// //     // RESPONSE
// //     // ========================================================

// //     return NextResponse.json({
// //       success: true,

// //       data: {
// //         campaignId,

// //         supervisors,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Vaccinator Supervisor Summary Error:", error);

// //     return NextResponse.json(
// //       {
// //         success: false,
// //         message:
// //           error?.message || "Failed to get vaccinator supervisor summary.",
// //       },
// //       { status: 500 },
// //     );
// //   }
// // }



// import mongoose from "mongoose";
// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import Zerodose from "@/models/Zerodose";
// import { getAuthenticatedUser } from "@/lib/auth";

// // ============================================================
// // GET VACCINATOR SUPERVISOR SUMMARY
// // ============================================================

// export async function GET(request) {
// try {
// await connectDB();


// // ========================================================
// // AUTHENTICATION
// // ========================================================

// const auth = await getAuthenticatedUser(request);

// if (auth.error) {
//   return auth.error;
// }

// const { user } = auth;

// // ========================================================
// // ONLY VACCINATOR
// // ========================================================

// if (user.designation !== "vaccinator") {
//   return NextResponse.json(
//     {
//       success: false,
//       message: "Only vaccinators can access supervisor summary.",
//     },
//     { status: 403 },
//   );
// }

// // ========================================================
// // UNION COUNCIL
// // ========================================================

// if (!user.unionCouncil) {
//   return NextResponse.json(
//     {
//       success: false,
//       message: "Union Council is not assigned to this vaccinator.",
//     },
//     { status: 400 },
//   );
// }

// if (!mongoose.Types.ObjectId.isValid(user.unionCouncil)) {
//   return NextResponse.json(
//     {
//       success: false,
//       message: "Invalid Union Council assigned to this vaccinator.",
//     },
//     { status: 400 },
//   );
// }

// const unionCouncilObjectId = new mongoose.Types.ObjectId(
//   user.unionCouncil,
// );

// // ========================================================
// // CAMPAIGN ID
// // ========================================================

// const { searchParams } = new URL(request.url);

// const campaignId = searchParams.get("campaignId");

// if (!campaignId) {
//   return NextResponse.json(
//     {
//       success: false,
//       message: "campaignId is required.",
//     },
//     { status: 400 },
//   );
// }

// if (!mongoose.Types.ObjectId.isValid(campaignId)) {
//   return NextResponse.json(
//     {
//       success: false,
//       message: "Invalid campaignId.",
//     },
//     { status: 400 },
//   );
// }

// const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

// // ========================================================
// // SUPERVISOR SUMMARY
// //
// // Scope:
// // Campaign + Union Council + Supervisor Code
// //
// // ONLY records where recordDate exists
// // ========================================================

// const supervisorData = await Zerodose.aggregate([
//   // ------------------------------------------------------
//   // CAMPAIGN + UNION COUNCIL + RECORDED
//   // ------------------------------------------------------

//   {
//     $match: {
//       campaign: campaignObjectId,

//       unionCouncil: unionCouncilObjectId,

//       recordDate: {
//         $ne: null,
//       },

//       supervisorCode: {
//         $ne: null,
//       },
//     },
//   },

//   // ------------------------------------------------------
//   // GROUP BY CAMPAIGN + UNION COUNCIL + SUPERVISOR CODE
//   // ------------------------------------------------------

//   {
//     $group: {
//       _id: {
//         campaignId: "$campaign",
//         unionCouncil: "$unionCouncil",
//         supervisorCode: "$supervisorCode",
//       },

//       recordCount: {
//         $sum: 1,
//       },

//       visitCount: {
//         $sum: {
//           $cond: [
//             {
//               $ne: ["$visitDate", null],
//             },
//             1,
//             0,
//           ],
//         },
//       },

//       coveredCount: {
//         $sum: {
//           $cond: [
//             {
//               $ne: ["$coveredDate", null],
//             },
//             1,
//             0,
//           ],
//         },
//       },

//       teams: {
//         $addToSet: "$teamNumber",
//       },
//     },
//   },

//   // ------------------------------------------------------
//   // FINAL SUPERVISOR DATA
//   // ------------------------------------------------------

//   {
//     $project: {
//       _id: 0,

//       campaignId: "$_id.campaignId",

//       unionCouncil: "$_id.unionCouncil",

//       supervisorCode: "$_id.supervisorCode",

//       recordCount: 1,

//       visitCount: 1,

//       coveredCount: 1,

//       numberOfTeams: {
//         $size: {
//           $filter: {
//             input: "$teams",
//             as: "team",

//             cond: {
//               $ne: ["$$team", null],
//             },
//           },
//         },
//       },
//     },
//   },

//   // ------------------------------------------------------
//   // MOST RECORDS FIRST
//   // ------------------------------------------------------

//   {
//     $sort: {
//       recordCount: -1,
//     },
//   },
// ]);

// // ========================================================
// // SUPERVISOR CODES
// // ========================================================

// const supervisorCodes = supervisorData
//   .map((item) => item.supervisorCode)
//   .filter(
//     (supervisorCode) =>
//       supervisorCode !== null &&
//       supervisorCode !== undefined,
//   );

// // ========================================================
// // DEFAULT SUPERVISORS
// // ========================================================

// let supervisors = [];

// // ========================================================
// // GET SUPERVISOR USERS
// //
// // Lookup is also based on:
// // Union Council + Supervisor Code
// // ========================================================

// if (supervisorCodes.length > 0) {
//   const supervisorUsers = await User.find({
//     unionCouncil: user.unionCouncil,

//     designation: "supervisor",

//     supervisorCode: {
//       $in: supervisorCodes,
//     },
//   })
//     .select("_id name supervisorCode")
//     .lean();

//   // ======================================================
//   // MERGE USER DATA + ZERODOSE DATA
//   // ======================================================

//   supervisors = supervisorData.map((item) => {
//     const supervisor = supervisorUsers.find(
//       (user) =>
//         Number(user.supervisorCode) ===
//         Number(item.supervisorCode),
//     );

//     return {
//       campaignId: item.campaignId,

//       unionCouncil: item.unionCouncil,

//       supervisorId: supervisor?._id || null,

//       supervisorName: supervisor?.name || "-",

//       supervisorCode:
//         supervisor?.supervisorCode ??
//         item.supervisorCode ??
//         "-",

//       numberOfTeams: Number(
//         item.numberOfTeams || 0,
//       ),

//       recordCount: Number(
//         item.recordCount || 0,
//       ),

//       visitCount: Number(
//         item.visitCount || 0,
//       ),

//       coveredCount: Number(
//         item.coveredCount || 0,
//       ),
//     };
//   });
// }

// // ========================================================
// // TOTAL
// // ========================================================

// const total = supervisors.reduce(
//   (accumulator, supervisor) => {
//     accumulator.numberOfTeams += Number(
//       supervisor.numberOfTeams || 0,
//     );

//     accumulator.recordCount += Number(
//       supervisor.recordCount || 0,
//     );

//     accumulator.visitCount += Number(
//       supervisor.visitCount || 0,
//     );

//     accumulator.coveredCount += Number(
//       supervisor.coveredCount || 0,
//     );

//     return accumulator;
//   },
//   {
//     numberOfTeams: 0,
//     recordCount: 0,
//     visitCount: 0,
//     coveredCount: 0,
//   },
// );

// // ========================================================
// // RESPONSE
// // ========================================================

// return NextResponse.json({
//   success: true,

//   data: {
//     campaignId,

//     unionCouncil: user.unionCouncil,

//     total: {
//       numberOfSupervisors: supervisors.length,

//       numberOfTeams: total.numberOfTeams,

//       recordCount: total.recordCount,

//       visitCount: total.visitCount,

//       coveredCount: total.coveredCount,
//     },

//     supervisors,
//   },
// });


// } catch (error) {
// console.error("Vaccinator Supervisor Summary Error:", error);


// return NextResponse.json(
//   {
//     success: false,
//     message:
//       error?.message ||
//       "Failed to get vaccinator supervisor summary.",
//   },
//   { status: 500 },
// );


// }
// }



import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Zerodose from "@/models/Zerodose";
import { getAuthenticatedUser } from "@/lib/auth";

// ============================================================
// GET SUPERVISOR SUMMARY
//
// Allowed designations:
// - vaccinator
// - ucmo
// - otherstaff
// ============================================================

export async function GET(request) {
try {
await connectDB();


// ========================================================
// AUTHENTICATION
// ========================================================

const auth = await getAuthenticatedUser(request);

if (auth.error) {
  return auth.error;
}

const { user } = auth;

// ========================================================
// ALLOWED DESIGNATIONS
// ========================================================

const allowedDesignations = [
  "vaccinator",
  "ucmo",
  "otherstaff",
];

if (!allowedDesignations.includes(user.designation)) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Only vaccinators, UCMOs and other staff can access supervisor summary.",
    },
    { status: 403 },
  );
}

// ========================================================
// UNION COUNCIL
// ========================================================

if (!user.unionCouncil) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Union Council is not assigned to this user.",
    },
    { status: 400 },
  );
}

if (
  !mongoose.Types.ObjectId.isValid(
    user.unionCouncil,
  )
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Invalid Union Council assigned to this user.",
    },
    { status: 400 },
  );
}

const unionCouncilObjectId =
  new mongoose.Types.ObjectId(
    user.unionCouncil,
  );

// ========================================================
// CAMPAIGN ID
// ========================================================

const { searchParams } = new URL(request.url);

const campaignId =
  searchParams.get("campaignId");

if (!campaignId) {
  return NextResponse.json(
    {
      success: false,
      message: "campaignId is required.",
    },
    { status: 400 },
  );
}

if (
  !mongoose.Types.ObjectId.isValid(
    campaignId,
  )
) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid campaignId.",
    },
    { status: 400 },
  );
}

const campaignObjectId =
  new mongoose.Types.ObjectId(
    campaignId,
  );

// ========================================================
// SUPERVISOR SUMMARY
//
// Scope:
// Campaign + Union Council + Supervisor Code
//
// Only recorded Zerodose records are included.
// ========================================================

const supervisorData =
  await Zerodose.aggregate([
    // ----------------------------------------------------
    // CAMPAIGN + UNION COUNCIL + RECORDED
    // ----------------------------------------------------

    {
      $match: {
        campaign: campaignObjectId,

        unionCouncil:
          unionCouncilObjectId,

        recordDate: {
          $ne: null,
        },

        supervisorCode: {
          $ne: null,
        },
      },
    },

    // ----------------------------------------------------
    // GROUP BY CAMPAIGN + UNION COUNCIL + SUPERVISOR CODE
    // ----------------------------------------------------

    {
      $group: {
        _id: {
          campaignId: "$campaign",
          unionCouncil:
            "$unionCouncil",
          supervisorCode:
            "$supervisorCode",
        },

        recordCount: {
          $sum: 1,
        },

        visitCount: {
          $sum: {
            $cond: [
              {
                $ne: [
                  "$visitDate",
                  null,
                ],
              },
              1,
              0,
            ],
          },
        },

        coveredCount: {
          $sum: {
            $cond: [
              {
                $ne: [
                  "$coveredDate",
                  null,
                ],
              },
              1,
              0,
            ],
          },
        },

        teams: {
          $addToSet:
            "$teamNumber",
        },
      },
    },

    // ----------------------------------------------------
    // FINAL SUPERVISOR DATA
    // ----------------------------------------------------

    {
      $project: {
        _id: 0,

        campaignId:
          "$_id.campaignId",

        unionCouncil:
          "$_id.unionCouncil",

        supervisorCode:
          "$_id.supervisorCode",

        recordCount: 1,

        visitCount: 1,

        coveredCount: 1,

        numberOfTeams: {
          $size: {
            $filter: {
              input: "$teams",

              as: "team",

              cond: {
                $ne: [
                  "$$team",
                  null,
                ],
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // MOST RECORDS FIRST
    // ----------------------------------------------------

    {
      $sort: {
        recordCount: -1,
      },
    },
  ]);

// ========================================================
// SUPERVISOR CODES
// ========================================================

const supervisorCodes =
  supervisorData
    .map(
      (item) =>
        item.supervisorCode,
    )
    .filter(
      (supervisorCode) =>
        supervisorCode !== null &&
        supervisorCode !==
          undefined,
    );

// ========================================================
// DEFAULT SUPERVISORS
// ========================================================

let supervisors = [];

// ========================================================
// GET SUPERVISOR USERS
//
// Lookup:
// Union Council + Supervisor Code
// ========================================================

if (
  supervisorCodes.length > 0
) {
  const supervisorUsers =
    await User.find({
      unionCouncil:
        user.unionCouncil,

      designation:
        "supervisor",

      supervisorCode: {
        $in: supervisorCodes,
      },
    })
      .select(
        "_id name supervisorCode",
      )
      .lean();

  // ======================================================
  // MERGE USER DATA + ZERODOSE DATA
  // ======================================================

  supervisors =
    supervisorData.map(
      (item) => {
        const supervisor =
          supervisorUsers.find(
            (user) =>
              Number(
                user.supervisorCode,
              ) ===
              Number(
                item.supervisorCode,
              ),
          );

        return {
          campaignId:
            item.campaignId,

          unionCouncil:
            item.unionCouncil,

          supervisorId:
            supervisor?._id ||
            null,

          supervisorName:
            supervisor?.name ||
            "-",

          supervisorCode:
            supervisor?.supervisorCode ??
            item.supervisorCode ??
            "-",

          numberOfTeams:
            Number(
              item.numberOfTeams ||
                0,
            ),

          recordCount:
            Number(
              item.recordCount ||
                0,
            ),

          visitCount:
            Number(
              item.visitCount ||
                0,
            ),

          coveredCount:
            Number(
              item.coveredCount ||
                0,
            ),
        };
      },
    );
}

// ========================================================
// TOTAL
// ========================================================

const total =
  supervisors.reduce(
    (
      accumulator,
      supervisor,
    ) => {
      accumulator.numberOfTeams +=
        Number(
          supervisor.numberOfTeams ||
            0,
        );

      accumulator.recordCount +=
        Number(
          supervisor.recordCount ||
            0,
        );

      accumulator.visitCount +=
        Number(
          supervisor.visitCount ||
            0,
        );

      accumulator.coveredCount +=
        Number(
          supervisor.coveredCount ||
            0,
        );

      return accumulator;
    },
    {
      numberOfTeams: 0,
      recordCount: 0,
      visitCount: 0,
      coveredCount: 0,
    },
  );

// ========================================================
// RESPONSE
// ========================================================

return NextResponse.json({
  success: true,

  data: {
    campaignId,

    unionCouncil:
      user.unionCouncil,

    total: {
      numberOfSupervisors:
        supervisors.length,

      numberOfTeams:
        total.numberOfTeams,

      recordCount:
        total.recordCount,

      visitCount:
        total.visitCount,

      coveredCount:
        total.coveredCount,
    },

    supervisors,
  },
});


} catch (error) {
console.error(
"Supervisor Summary Error:",
error,
);


return NextResponse.json(
  {
    success: false,

    message:
      error?.message ||
      "Failed to get supervisor summary.",
  },
  { status: 500 },
);


}
}
