// // import { NextResponse } from "next/server";

// // import { connectDB } from "@/lib/db";
// // import User from "@/models/User";
// // import District from "@/models/District";
// // import Town from "@/models/Town";
// // import UnionCouncil from "@/models/UnionCouncil";
// // import Zerodose from "@/models/Zerodose";
// // import Campaign from "@/models/Campaign";

// // export async function GET(request) {
// //   try {
// //     await connectDB();

// //     const { searchParams } = new URL(request.url);

// //     const metricsParam = searchParams.get("metrics");
// //     const isActiveParam = searchParams.get("isActive");

// //     if (!metricsParam) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "metrics is required",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     const metrics = metricsParam
// //       .split(",")
// //       .map((item) => item.trim())
// //       .filter(Boolean);

// //     const allowedMetrics = [
// //       "districts",
// //       "towns",
// //       "unionCouncils",
// //       "campaigns",
// //       "ucmos",
// //       "supervisors",
// //       "workers",
// //       "vaccinators",
// //       "otherstaff",
// //       "townfp",
// //       "districtfp",
// //       "admins",

// //       "teams",

// //       "zerodose",
// //       "recorded",
// //       "visited",
// //       "covered",
// //     ];

// //     const invalidMetrics = metrics.filter(
// //       (metric) => !allowedMetrics.includes(metric),
// //     );

// //     if (invalidMetrics.length > 0) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: `Invalid metrics: ${invalidMetrics.join(", ")}`,
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     // =====================================================
// //     // isActive
// //     //
// //     // true  = active only
// //     // false = inactive only
// //     // all / missing = both
// //     // =====================================================

// //     // let activeFilter = {};

// //     // if (isActiveParam === "true") {
// //     //   activeFilter = {
// //     //     isActive: true,
// //     //   };
// //     // }

// //     // if (isActiveParam === "false") {
// //     //   activeFilter = {
// //     //     isActive: false,
// //     //   };
// //     // }

// //     // if (isActiveParam && !["true", "false", "all"].includes(isActiveParam)) {
// //     //   return NextResponse.json(
// //     //     {
// //     //       success: false,
// //     //       message: "isActive must be true, false or all",
// //     //     },
// //     //     { status: 400 },
// //     //   );
// //     // }

// //     let activeFilter = {};

// //     if (isActiveParam === "true") {
// //       activeFilter = {
// //         isActive: true,
// //       };
// //     } else if (isActiveParam === "false") {
// //       activeFilter = {
// //         isActive: false,
// //       };
// //     } else if (isActiveParam === "all" || !isActiveParam) {
// //       activeFilter = {};
// //     } else {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "isActive must be true, false or all",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     const data = {};

// //     // =====================================================
// //     // Campaigns
// //     // =====================================================

// //     if (metrics.includes("campaigns")) {
// //       data.campaigns = await Campaign.countDocuments({
// //         ...activeFilter,
// //       });
// //     }
// //     // =====================================================
// //     // Locations
// //     // =====================================================

// //     if (metrics.includes("districts")) {
// //       data.districts = await District.countDocuments({
// //         ...activeFilter,
// //       });
// //     }

// //     if (metrics.includes("towns")) {
// //       data.towns = await Town.countDocuments({
// //         ...activeFilter,
// //       });
// //     }

// //     if (metrics.includes("unionCouncils")) {
// //       data.unionCouncils = await UnionCouncil.countDocuments({
// //         ...activeFilter,
// //       });
// //     }

// //     // =====================================================
// //     // Users
// //     // =====================================================

// //     const userMetrics = {
// //       ucmos: "ucmo",
// //       supervisors: "supervisor",
// //       workers: "worker",
// //       vaccinators: "vaccinator",
// //       otherstaff: "otherstaff",
// //       townfp: "townfp",
// //       districtfp: "districtfp",
// //       admins: "admin",
// //     };

// //     for (const [metric, designation] of Object.entries(userMetrics)) {
// //       if (metrics.includes(metric)) {
// //         data[metric] = await User.countDocuments({
// //           designation,
// //           ...activeFilter,
// //         });
// //       }
// //     }

// //     // =====================================================
// //     // Teams
// //     //
// //     // Team = supervisor + teamNumber
// //     // =====================================================

// //     if (metrics.includes("teams")) {
// //       const workers = await User.find(
// //         {
// //           designation: "worker",
// //           teamNumber: {
// //             $ne: null,
// //           },
// //           supervisor: {
// //             $ne: null,
// //           },
// //         },
// //         {
// //           supervisor: 1,
// //           teamNumber: 1,
// //           isActive: 1,
// //         },
// //       ).lean();

// //       const teamsMap = new Map();

// //       for (const worker of workers) {
// //         const key = `${worker.supervisor.toString()}_${worker.teamNumber}`;

// //         if (!teamsMap.has(key)) {
// //           teamsMap.set(key, {
// //             hasActiveWorker: false,
// //             hasInactiveWorker: false,
// //           });
// //         }

// //         const team = teamsMap.get(key);

// //         if (worker.isActive) {
// //           team.hasActiveWorker = true;
// //         } else {
// //           team.hasInactiveWorker = true;
// //         }
// //       }

// //       let teamCount = 0;

// //       for (const team of teamsMap.values()) {
// //         if (isActiveParam === "true") {
// //           if (team.hasActiveWorker) {
// //             teamCount++;
// //           }

// //           continue;
// //         }

// //         if (isActiveParam === "false") {
// //           if (!team.hasActiveWorker && team.hasInactiveWorker) {
// //             teamCount++;
// //           }

// //           continue;
// //         }

// //         // all / missing
// //         teamCount++;
// //       }

// //       data.teams = teamCount;
// //     }

// //     // =====================================================
// //     // Zerodose
// //     // Zerodose has no isActive
// //     // =====================================================

// //     if (metrics.includes("zerodose")) {
// //       data.zerodose = await Zerodose.countDocuments();
// //     }

// //     if (metrics.includes("recorded")) {
// //       data.recorded = await Zerodose.countDocuments({
// //         vaccinationStatus: "recorded",
// //       });
// //     }

// //     if (metrics.includes("visited")) {
// //       data.visited = await Zerodose.countDocuments({
// //         vaccinationStatus: "visited",
// //       });
// //     }

// //     if (metrics.includes("covered")) {
// //       data.covered = await Zerodose.countDocuments({
// //         vaccinationStatus: "covered",
// //       });
// //     }

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         data,
// //       },
// //       {
// //         status: 200,
// //       },
// //     );
// //   } catch (error) {
// //     console.error("Global dashboard counts error:", error);

// //     return NextResponse.json(
// //       {
// //         success: false,
// //         message: "Failed to fetch global dashboard counts",
// //       },
// //       {
// //         status: 500,
// //       },
// //     );
// //   }
// // }

// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import District from "@/models/District";
// import Town from "@/models/Town";
// import UnionCouncil from "@/models/UnionCouncil";
// import Zerodose from "@/models/Zerodose";
// import Campaign from "@/models/Campaign";

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);

//     // ============================================================
//     // Query Parameters
//     // ============================================================

//     const metricsParam = searchParams.get("metrics");
//     const isActiveParam = searchParams.get("isActive");

//     const districtId = searchParams.get("district");
//     const townId = searchParams.get("town");
//     const unionCouncilId = searchParams.get("unionCouncil");

//     // ============================================================
//     // Metrics Validation
//     // ============================================================

//     if (!metricsParam) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "metrics is required",
//         },
//         { status: 400 },
//       );
//     }

//     const metrics = metricsParam
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean);

//     const allowedMetrics = [
//       "districts",
//       "towns",
//       "unionCouncils",
//       "campaigns",

//       "ucmos",
//       "supervisors",
//       "workers",
//       "vaccinators",
//       "otherstaff",
//       "townfp",
//       "districtfp",
//       "admins",

//       "teams",

//       "zerodose",
//       "recorded",
//       "visited",
//       "covered",
//     ];

//     const invalidMetrics = metrics.filter(
//       (metric) => !allowedMetrics.includes(metric),
//     );

//     if (invalidMetrics.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Invalid metrics: ${invalidMetrics.join(", ")}`,
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Validate Scope
//     // ============================================================
//     //
//     // Only one location scope can be supplied at a time.
//     //
//     // Admin:
//     //   no district/town/unionCouncil
//     //
//     // District FP:
//     //   district=ID
//     //
//     // Town FP:
//     //   town=ID
//     //
//     // UC:
//     //   unionCouncil=ID
//     //
//     // ============================================================

//     const scopeCount = [districtId, townId, unionCouncilId].filter(
//       Boolean,
//     ).length;

//     if (scopeCount > 1) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Only one scope can be provided: district, town or unionCouncil.",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Active Filter
//     // ============================================================

//     let activeFilter = {};

//     if (isActiveParam === "true") {
//       activeFilter = {
//         isActive: true,
//       };
//     } else if (isActiveParam === "false") {
//       activeFilter = {
//         isActive: false,
//       };
//     } else if (isActiveParam === "all" || !isActiveParam) {
//       activeFilter = {};
//     } else {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "isActive must be true, false or all",
//         },
//         { status: 400 },
//       );
//     }

//     // ============================================================
//     // Scope Filters
//     // ============================================================

//     const userLocationFilter = {};
//     const townFilter = {};
//     const unionCouncilFilter = {};
//     const zerodoseFilter = {};

//     // ------------------------------------------------------------
//     // District Scope
//     // ------------------------------------------------------------

//     if (districtId) {
//       userLocationFilter.district = districtId;

//       townFilter.district = districtId;

//       unionCouncilFilter.district = districtId;

//       zerodoseFilter.district = districtId;
//     }

//     // ------------------------------------------------------------
//     // Town Scope
//     // ------------------------------------------------------------

//     if (townId) {
//       userLocationFilter.town = townId;

//       unionCouncilFilter.town = townId;

//       zerodoseFilter.town = townId;
//     }

//     // ------------------------------------------------------------
//     // Union Council Scope
//     // ------------------------------------------------------------

//     if (unionCouncilId) {
//       userLocationFilter.unionCouncil = unionCouncilId;

//       zerodoseFilter.unionCouncil = unionCouncilId;
//     }

//     // ============================================================
//     // Verify Scope IDs
//     // ============================================================

//     if (districtId) {
//       const districtExists = await District.exists({
//         _id: districtId,
//       });

//       if (!districtExists) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "District not found",
//           },
//           { status: 404 },
//         );
//       }
//     }

//     if (townId) {
//       const townExists = await Town.exists({
//         _id: townId,
//       });

//       if (!townExists) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Town not found",
//           },
//           { status: 404 },
//         );
//       }
//     }

//     if (unionCouncilId) {
//       const unionCouncilExists = await UnionCouncil.exists({
//         _id: unionCouncilId,
//       });

//       if (!unionCouncilExists) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Union Council not found",
//           },
//           { status: 404 },
//         );
//       }
//     }

//     // ============================================================
//     // Result
//     // ============================================================

//     const data = {};

//     // ============================================================
//     // Campaigns
//     // ============================================================
//     //
//     // IMPORTANT:
//     // Campaign is global unless your Campaign schema contains
//     // district/town/unionCouncil fields.
//     //
//     // Therefore currently campaigns are counted globally.
//     //
//     // If Campaign has district/town/unionCouncil, this should
//     // also receive the relevant scope filter.
//     //
//     // ============================================================

//     if (metrics.includes("campaigns")) {
//       const campaignFilter = {
//         ...activeFilter,
//       };

//       if (districtId) {
//         campaignFilter.district = districtId;
//       }

//       if (townId) {
//         campaignFilter.town = townId;
//       }

//       if (unionCouncilId) {
//         campaignFilter.unionCouncil = unionCouncilId;
//       }

//       data.campaigns = await Campaign.countDocuments(campaignFilter);
//     }

//     // ============================================================
//     // Districts
//     // ============================================================
//     //
//     // Admin:
//     //   all districts
//     //
//     // District:
//     //   1 if selected district exists
//     //
//     // Town / UC:
//     //   1 parent district
//     //
//     // ============================================================

//     if (metrics.includes("districts")) {
//       if (districtId) {
//         data.districts = await District.countDocuments({
//           _id: districtId,
//           ...activeFilter,
//         });
//       } else if (townId) {
//         const town = await Town.findOne({
//           _id: townId,
//         })
//           .select("district")
//           .lean();

//         data.districts = town?.district ? 1 : 0;
//       } else if (unionCouncilId) {
//         const unionCouncil = await UnionCouncil.findOne({
//           _id: unionCouncilId,
//         })
//           .select("district")
//           .lean();

//         data.districts = unionCouncil?.district ? 1 : 0;
//       } else {
//         data.districts = await District.countDocuments({
//           ...activeFilter,
//         });
//       }
//     }

//     // ============================================================
//     // Towns
//     // ============================================================

//     if (metrics.includes("towns")) {
//       if (districtId) {
//         data.towns = await Town.countDocuments({
//           ...townFilter,
//           ...activeFilter,
//         });
//       } else if (townId) {
//         data.towns = await Town.countDocuments({
//           _id: townId,
//           ...activeFilter,
//         });
//       } else if (unionCouncilId) {
//         const unionCouncil = await UnionCouncil.findOne({
//           _id: unionCouncilId,
//         })
//           .select("town")
//           .lean();

//         data.towns = unionCouncil?.town ? 1 : 0;
//       } else {
//         data.towns = await Town.countDocuments({
//           ...activeFilter,
//         });
//       }
//     }

//     // ============================================================
//     // Union Councils
//     // ============================================================

//     if (metrics.includes("unionCouncils")) {
//       if (districtId || townId) {
//         data.unionCouncils = await UnionCouncil.countDocuments({
//           ...unionCouncilFilter,
//           ...activeFilter,
//         });
//       } else if (unionCouncilId) {
//         data.unionCouncils = await UnionCouncil.countDocuments({
//           _id: unionCouncilId,
//           ...activeFilter,
//         });
//       } else {
//         data.unionCouncils = await UnionCouncil.countDocuments({
//           ...activeFilter,
//         });
//       }
//     }

//     // ============================================================
//     // Users
//     // ============================================================

//     const userMetrics = {
//       ucmos: "ucmo",
//       supervisors: "supervisor",
//       workers: "worker",
//       vaccinators: "vaccinator",
//       otherstaff: "otherstaff",
//       townfp: "townfp",
//       districtfp: "districtfp",
//       admins: "admin",
//     };

//     for (const [metric, designation] of Object.entries(userMetrics)) {
//       if (!metrics.includes(metric)) {
//         continue;
//       }

//       const userFilter = {
//         ...userLocationFilter,
//         designation,
//         ...activeFilter,
//       };

//       data[metric] = await User.countDocuments(userFilter);
//     }

//     // ============================================================
//     // Teams
//     // ============================================================
//     //
//     // Team = supervisor + teamNumber
//     //
//     // Scope comes from userLocationFilter.
//     //
//     // ============================================================

//     if (metrics.includes("teams")) {
//       const workers = await User.find(
//         {
//           ...userLocationFilter,
//           designation: "worker",
//           teamNumber: {
//             $ne: null,
//           },
//           supervisor: {
//             $ne: null,
//           },
//         },
//         {
//           supervisor: 1,
//           teamNumber: 1,
//           isActive: 1,
//         },
//       ).lean();

//       const teamsMap = new Map();

//       for (const worker of workers) {
//         const key = `${worker.supervisor.toString()}_${worker.teamNumber}`;

//         if (!teamsMap.has(key)) {
//           teamsMap.set(key, {
//             hasActiveWorker: false,
//             hasInactiveWorker: false,
//           });
//         }

//         const team = teamsMap.get(key);

//         if (worker.isActive) {
//           team.hasActiveWorker = true;
//         } else {
//           team.hasInactiveWorker = true;
//         }
//       }

//       let teamCount = 0;

//       for (const team of teamsMap.values()) {
//         if (isActiveParam === "true") {
//           if (team.hasActiveWorker) {
//             teamCount++;
//           }

//           continue;
//         }

//         if (isActiveParam === "false") {
//           if (!team.hasActiveWorker && team.hasInactiveWorker) {
//             teamCount++;
//           }

//           continue;
//         }

//         teamCount++;
//       }

//       data.teams = teamCount;
//     }

//     // ============================================================
//     // Zerodose
//     // ============================================================

//     if (metrics.includes("zerodose")) {
//       data.zerodose = await Zerodose.countDocuments(zerodoseFilter);
//     }

//     // ============================================================
//     // Recorded
//     // ============================================================

//     if (metrics.includes("recorded")) {
//       data.recorded = await Zerodose.countDocuments({
//         ...zerodoseFilter,
//         vaccinationStatus: "recorded",
//       });
//     }

//     // ============================================================
//     // Visited
//     // ============================================================

//     if (metrics.includes("visited")) {
//       data.visited = await Zerodose.countDocuments({
//         ...zerodoseFilter,
//         vaccinationStatus: "visited",
//       });
//     }

//     // ============================================================
//     // Covered
//     // ============================================================

//     if (metrics.includes("covered")) {
//       data.covered = await Zerodose.countDocuments({
//         ...zerodoseFilter,
//         vaccinationStatus: "covered",
//       });
//     }

//     // ============================================================
//     // Response
//     // ============================================================

//     return NextResponse.json(
//       {
//         success: true,
//         scope: {
//           type: districtId
//             ? "district"
//             : townId
//               ? "town"
//               : unionCouncilId
//                 ? "unionCouncil"
//                 : "global",
//           district: districtId || null,
//           town: townId || null,
//           unionCouncil: unionCouncilId || null,
//         },
//         data,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.error("Global dashboard counts error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch dashboard counts",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import District from "@/models/District";
import Town from "@/models/Town";
import UnionCouncil from "@/models/UnionCouncil";
import Zerodose from "@/models/Zerodose";
import Campaign from "@/models/Campaign";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // ============================================================
    // Query Parameters
    // ============================================================

    const metricsParam = searchParams.get("metrics");
    const isActiveParam = searchParams.get("isActive");

    const districtId = searchParams.get("district");
    const townId = searchParams.get("town");
    const unionCouncilId = searchParams.get("unionCouncil");

    // ============================================================
    // Metrics Validation
    // ============================================================

    if (!metricsParam) {
      return NextResponse.json(
        {
          success: false,
          message: "metrics is required",
        },
        { status: 400 },
      );
    }

    const metrics = metricsParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const allowedMetrics = [
      "districts",
      "towns",
      "unionCouncils",
      "campaigns",

      "ucmos",
      "supervisors",
      "workers",
      "vaccinators",
      "otherstaff",
      "townfp",
      "districtfp",
      "admins",

      "teams",

      "zerodose",
      "recorded",
      "visited",
      "covered",
    ];

    const invalidMetrics = metrics.filter(
      (metric) => !allowedMetrics.includes(metric),
    );

    if (invalidMetrics.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid metrics: ${invalidMetrics.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Validate Scope
    // ============================================================
    //
    // Admin:
    //   no district/town/unionCouncil
    //
    // District FP:
    //   district=ID
    //
    // Town FP:
    //   town=ID
    //
    // Union Council:
    //   unionCouncil=ID
    //
    // Only ONE scope is allowed at a time.
    //
    // ============================================================

    const scopeCount = [
      districtId,
      townId,
      unionCouncilId,
    ].filter(Boolean).length;

    if (scopeCount > 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only one scope can be provided: district, town or unionCouncil.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Active Filter
    // ============================================================

    let activeFilter = {};

    if (isActiveParam === "true") {
      activeFilter = {
        isActive: true,
      };
    } else if (isActiveParam === "false") {
      activeFilter = {
        isActive: false,
      };
    } else if (isActiveParam === "all" || !isActiveParam) {
      activeFilter = {};
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be true, false or all",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // Scope Filters
    // ============================================================

    const userLocationFilter = {};
    const townFilter = {};
    const unionCouncilFilter = {};
    const zerodoseFilter = {};

    // ============================================================
    // District Scope
    // ============================================================

    if (districtId) {
      userLocationFilter.district = districtId;

      townFilter.district = districtId;

      unionCouncilFilter.district = districtId;

      zerodoseFilter.district = districtId;
    }

    // ============================================================
    // Town Scope
    // ============================================================

    if (townId) {
      userLocationFilter.town = townId;

      unionCouncilFilter.town = townId;

      zerodoseFilter.town = townId;
    }

    // ============================================================
    // Union Council Scope
    // ============================================================

    if (unionCouncilId) {
      userLocationFilter.unionCouncil = unionCouncilId;

      zerodoseFilter.unionCouncil = unionCouncilId;
    }

    // ============================================================
    // Verify Scope IDs
    // ============================================================

    if (districtId) {
      const districtExists = await District.exists({
        _id: districtId,
      });

      if (!districtExists) {
        return NextResponse.json(
          {
            success: false,
            message: "District not found",
          },
          { status: 404 },
        );
      }
    }

    if (townId) {
      const townExists = await Town.exists({
        _id: townId,
      });

      if (!townExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Town not found",
          },
          { status: 404 },
        );
      }
    }

    if (unionCouncilId) {
      const unionCouncilExists = await UnionCouncil.exists({
        _id: unionCouncilId,
      });

      if (!unionCouncilExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Union Council not found",
          },
          { status: 404 },
        );
      }
    }

    // ============================================================
    // Result
    // ============================================================

    const data = {};

    // ============================================================
    // Campaigns
    // ============================================================
    //
    // Campaigns are global because Campaign does not have
    // district/town/unionCouncil scope fields.
    //
    // Therefore campaign count must NOT receive location filters.
    //
    // ============================================================

    if (metrics.includes("campaigns")) {
      data.campaigns = await Campaign.countDocuments({
        ...activeFilter,
      });
    }

    // ============================================================
    // Districts
    // ============================================================

    if (metrics.includes("districts")) {
      // ----------------------------------------------------------
      // Admin / Global
      // ----------------------------------------------------------

      if (!districtId && !townId && !unionCouncilId) {
        data.districts = await District.countDocuments({
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // District Scope
      // ----------------------------------------------------------

      else if (districtId) {
        data.districts = await District.countDocuments({
          _id: districtId,
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // Town Scope
      // ----------------------------------------------------------

      else if (townId) {
        const town = await Town.findOne({
          _id: townId,
        })
          .select("district")
          .lean();

        if (!town?.district) {
          data.districts = 0;
        } else {
          data.districts = await District.countDocuments({
            _id: town.district,
            ...activeFilter,
          });
        }
      }

      // ----------------------------------------------------------
      // Union Council Scope
      // ----------------------------------------------------------

      else if (unionCouncilId) {
        const unionCouncil = await UnionCouncil.findOne({
          _id: unionCouncilId,
        })
          .select("district")
          .lean();

        if (!unionCouncil?.district) {
          data.districts = 0;
        } else {
          data.districts = await District.countDocuments({
            _id: unionCouncil.district,
            ...activeFilter,
          });
        }
      }
    }

    // ============================================================
    // Towns
    // ============================================================

    if (metrics.includes("towns")) {
      // ----------------------------------------------------------
      // Admin / Global
      // ----------------------------------------------------------

      if (!districtId && !townId && !unionCouncilId) {
        data.towns = await Town.countDocuments({
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // District Scope
      // ----------------------------------------------------------

      else if (districtId) {
        data.towns = await Town.countDocuments({
          ...townFilter,
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // Town Scope
      // ----------------------------------------------------------

      else if (townId) {
        data.towns = await Town.countDocuments({
          _id: townId,
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // Union Council Scope
      // ----------------------------------------------------------

      else if (unionCouncilId) {
        const unionCouncil = await UnionCouncil.findOne({
          _id: unionCouncilId,
        })
          .select("town")
          .lean();

        if (!unionCouncil?.town) {
          data.towns = 0;
        } else {
          data.towns = await Town.countDocuments({
            _id: unionCouncil.town,
            ...activeFilter,
          });
        }
      }
    }

    // ============================================================
    // Union Councils
    // ============================================================

    if (metrics.includes("unionCouncils")) {
      // ----------------------------------------------------------
      // Admin / Global
      // ----------------------------------------------------------

      if (!districtId && !townId && !unionCouncilId) {
        data.unionCouncils = await UnionCouncil.countDocuments({
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // District Scope
      // ----------------------------------------------------------

      else if (districtId) {
        data.unionCouncils = await UnionCouncil.countDocuments({
          ...unionCouncilFilter,
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // Town Scope
      // ----------------------------------------------------------

      else if (townId) {
        data.unionCouncils = await UnionCouncil.countDocuments({
          ...unionCouncilFilter,
          ...activeFilter,
        });
      }

      // ----------------------------------------------------------
      // Union Council Scope
      // ----------------------------------------------------------

      else if (unionCouncilId) {
        data.unionCouncils = await UnionCouncil.countDocuments({
          _id: unionCouncilId,
          ...activeFilter,
        });
      }
    }

    // ============================================================
    // Users
    // ============================================================

    const userMetrics = {
      ucmos: "ucmo",
      supervisors: "supervisor",
      workers: "worker",
      vaccinators: "vaccinator",
      otherstaff: "otherstaff",
      townfp: "townfp",
      districtfp: "districtfp",
      admins: "admin",
    };

    for (const [metric, designation] of Object.entries(userMetrics)) {
      if (!metrics.includes(metric)) {
        continue;
      }

      const userFilter = {
        ...userLocationFilter,
        designation,
        ...activeFilter,
      };

      data[metric] = await User.countDocuments(userFilter);
    }

    // ============================================================
    // Teams
    // ============================================================
    //
    // Team identity:
    //
    //   supervisor ObjectId + teamNumber
    //
    // supervisor is a User document reference.
    //
    // Therefore using supervisor ObjectId here is CORRECT.
    //
    // ============================================================

    if (metrics.includes("teams")) {
      const workers = await User.find(
        {
          ...userLocationFilter,
          designation: "worker",
          teamNumber: {
            $ne: null,
          },
          supervisor: {
            $ne: null,
          },
        },
        {
          supervisor: 1,
          teamNumber: 1,
          isActive: 1,
        },
      ).lean();

      const teamsMap = new Map();

      for (const worker of workers) {
        const supervisorKey = worker.supervisor?.toString();

        if (!supervisorKey || worker.teamNumber == null) {
          continue;
        }

        const key = `${supervisorKey}_${worker.teamNumber}`;

        if (!teamsMap.has(key)) {
          teamsMap.set(key, {
            hasActiveWorker: false,
            hasInactiveWorker: false,
          });
        }

        const team = teamsMap.get(key);

        if (worker.isActive === true) {
          team.hasActiveWorker = true;
        } else {
          team.hasInactiveWorker = true;
        }
      }

      let teamCount = 0;

      for (const team of teamsMap.values()) {
        // --------------------------------------------------------
        // Active teams
        // At least one worker is active.
        // --------------------------------------------------------

        if (isActiveParam === "true") {
          if (team.hasActiveWorker) {
            teamCount++;
          }

          continue;
        }

        // --------------------------------------------------------
        // Inactive teams
        // No active worker and at least one inactive worker.
        // --------------------------------------------------------

        if (isActiveParam === "false") {
          if (!team.hasActiveWorker && team.hasInactiveWorker) {
            teamCount++;
          }

          continue;
        }

        // --------------------------------------------------------
        // All teams
        // --------------------------------------------------------

        teamCount++;
      }

      data.teams = teamCount;
    }

    // ============================================================
    // Zerodose
    // ============================================================

    if (metrics.includes("zerodose")) {
      data.zerodose = await Zerodose.countDocuments(zerodoseFilter);
    }

    // ============================================================
    // Recorded
    // ============================================================

    if (metrics.includes("recorded")) {
      data.recorded = await Zerodose.countDocuments({
        ...zerodoseFilter,
        vaccinationStatus: "recorded",
      });
    }

    // ============================================================
    // Visited
    // ============================================================

    if (metrics.includes("visited")) {
      data.visited = await Zerodose.countDocuments({
        ...zerodoseFilter,
        vaccinationStatus: "visited",
      });
    }

    // ============================================================
    // Covered
    // ============================================================

    if (metrics.includes("covered")) {
      data.covered = await Zerodose.countDocuments({
        ...zerodoseFilter,
        vaccinationStatus: "covered",
      });
    }

    // ============================================================
    // Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        scope: {
          type: districtId
            ? "district"
            : townId
              ? "town"
              : unionCouncilId
                ? "unionCouncil"
                : "global",

          district: districtId || null,
          town: townId || null,
          unionCouncil: unionCouncilId || null,
        },

        data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Global dashboard counts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard counts",
      },
      {
        status: 500,
      },
    );
  }
}