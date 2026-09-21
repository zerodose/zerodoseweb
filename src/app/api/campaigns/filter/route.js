// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";

// import Campaign from "@/models/Campaign";

// export async function GET() {
// try {
// await connectDB();

// const now = new Date();

// const today = new Date(
//   Date.UTC(
//     now.getUTCFullYear(),
//     now.getUTCMonth(),
//     now.getUTCDate(),
//   ),
// );

// const currentCampaign = await Campaign.findOne(
//   {
//     startDate: {
//       $lte: today,
//     },
//     endDate: {
//       $gte: today,
//     },
//   },
//   {
//     _id: 1,
//   },
// ).lean();

// const campaigns = await Campaign.find(
//   currentCampaign
//     ? {
//         _id: {
//           $ne: currentCampaign._id,
//         },
//       }
//     : {},
//   {
//     _id: 1,
//     name: 1,
//     year: 1,
//     month: 1,
//     startDate: 1,
//     endDate: 1,
//   },
// )
//   .sort({
//     year: -1,
//     month: -1,
//     name: 1,
//   })
//   .lean();

// return NextResponse.json(
//   {
//     success: true,
//     data: campaigns,
//   },
//   {
//     status: 200,
//   },
// );

// } catch (error) {
// console.error("Get campaign filter data error:", error);

// return NextResponse.json(
//   {
//     success: false,
//     message:
//       error.message || "Failed to fetch campaign filter data.",
//   },
//   {
//     status: 500,
//   },
// );

// }
// }

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import Campaign from "@/models/Campaign";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    // ==================================================
    // PREVIOUS CAMPAIGNS ONLY
    // ==================================================
    // If campaign ends on 19 Sep:
    //
    // 19 Sep -> still campaign day
    // 20 Sep -> previous campaign
    //
    // Therefore only campaigns with:
    //
    // endDate < today
    //
    // are returned.
    //
    // Current:
    // startDate <= today <= endDate
    //
    // Future:
    // startDate > today
    //
    // Both current and future are excluded.

    const campaigns = await Campaign.find(
      {
        endDate: {
          $lt: today,
        },
      },
      {
        _id: 1,
        name: 1,
        year: 1,
        month: 1,
        startDate: 1,
        endDate: 1,
      },
    )
      .sort({
        endDate: -1,
        year: -1,
        month: -1,
        name: 1,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: campaigns,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get campaign filter data error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch campaign filter data.",
      },
      {
        status: 500,
      },
    );
  }
}
