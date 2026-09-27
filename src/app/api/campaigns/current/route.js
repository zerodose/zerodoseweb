// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import Campaign from "@/models/Campaign";

// export async function GET() {
//   try {
//     await connectDB();

//     const now = new Date();
//     today.setHours(0, 0, 0, 0);

//     const currentCampaign = await Campaign.findOne({
//       startDate: {
//         $lte: now,
//       },
//       endDate: {
//         $gte: now,
//       },
//     }).lean({
//       virtuals: true,
//     });

//     return NextResponse.json({
//       success: true,
//       data: {
//         currentCampaign: currentCampaign || null,
//       },
//     });
//   } catch (error) {
//     console.error("Get Current Campaign Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error?.message || "Failed to get current campaign.",
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";

export async function GET() {
  try {
    await connectDB();

    // Sirf date consider karni hai, time nahi
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const currentCampaign = await Campaign.findOne({
      startDate: {
        $lte: today,
      },
      endDate: {
        $gte: today,
      },
    }).lean({
      virtuals: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        currentCampaign: currentCampaign || null,
      },
    });
  } catch (error) {
    console.error("Get Current Campaign Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get current campaign.",
      },
      { status: 500 },
    );
  }
}
