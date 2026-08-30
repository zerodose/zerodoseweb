// // "use client";

// // import { formatDate } from "@/lib/formatDate";
// // import { CalendarDays } from "lucide-react";

// // export default function CampaignHeader({
// //   campaign,
// //   label = "CURRENT CAMPAIGN",
// //   recorded = 0,
// //   covered = 0,
// //   teams = 0,
// // }) {
// //   if (!campaign) return null;

// //   const isCurrent = label === "CURRENT CAMPAIGN";

// //   return (
// //     <div className="bg-primary dark:bg-transparent rounded-2xl border-border border shadow-sm mb-5 overflow-hidden p-5 md:p-6">
// //       <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
// //         {/* Campaign Information */}
// //         <div>
// //           <div className="mb-2 flex items-center gap-2">
// //             <span className="flex h-2.5 w-2.5 rounded-full bg-white" />

// //             <span className="text-xs font-medium text-white/80">{label}</span>
// //           </div>

// //           <h2 className="text-xl font-bold text-white md:text-2xl">
// //             {campaign.name}
// //           </h2>

// //           <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
// //             <CalendarDays size={15} />

// //             <span>
// //               {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
// //             </span>
// //           </div>
// //         </div>

// //         {/* Campaign Stats */}
// //         <div className="flex gap-3">
// //           {/* First Stat */}
// //           <div className="rounded-xl bg-white/10 px-4 py-3">
// //             <p className="text-xs text-white/70">
// //               {isCurrent ? "Total Teams" : "Recorded"}
// //             </p>

// //             <p className="mt-1 text-lg font-bold text-white">
// //               {isCurrent ? teams : recorded}
// //             </p>
// //           </div>

// //           {/* Second Stat */}
// //           <div className="rounded-xl bg-white/10 px-4 py-3">
// //             <p className="text-xs text-white/70">
// //               {isCurrent ? "Total Zerodose" : "Covered"}
// //             </p>

// //             <p className="mt-1 text-lg font-bold text-white">
// //               {isCurrent ? recorded : covered}
// //             </p>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { formatDate } from "@/lib/formatDate";
// import { CalendarDays } from "lucide-react";

// export default function CampaignHeader({
//   campaign,
//   label = "CURRENT CAMPAIGN",
//   recorded = 0,
//   covered = 0,
//   teams = 0,
// }) {
//   if (!campaign) return null;

//   const isCurrent = label === "CURRENT CAMPAIGN";

//   return (
//     <div className="bg-primary dark:bg-transparent mb-5 overflow-hidden rounded-2xl border border-border shadow-sm">
//       <div className="flex flex-col justify-between gap-5 p-5 md:flex-row md:items-center md:p-6">
//         {/* Campaign Information */}
//         <div>
//           {/* <div className="mb-2 flex items-center gap-2">
//             <span className="flex h-2.5 w-2.5 rounded-full bg-white" />

//             <span className="text-xs font-medium text-white/80">
//               {label}
//             </span>
//           </div> */}

//          <div className="flex items-center gap-3 ">
//            <h2 className="text-xl font-bold text-white md:text-2xl">
//             {campaign.name}
//           </h2>

//           <div className="flex items-center gap-2 text-sm text-white/80">
//             <CalendarDays size={15} />

//             <span>
//               {formatDate(campaign.startDate)} -{" "}
//               {formatDate(campaign.endDate)}
//             </span>
//           </div>
//          </div>
//         </div>

//         {/* Campaign Stats */}
//         <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
//           {/* Total Teams */}
//           <div className="min-w-[90px] flex flex-col justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm sm:min-w-[105px] sm:px-4">
//             <p className="text-[11px] font-medium text-white/70 sm:text-xs">
//               {isCurrent ? "Total Teams" : "Recorded"}
//             </p>

//             <p className="mt-1 text-lg font-bold leading-none text-white sm:text-xl">
//               {isCurrent ? teams : recorded}
//             </p>
//           </div>

//           {/* Total Recorded */}
//           <div className="min-w-[90px] flex flex-col justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm sm:min-w-[105px] sm:px-4">
//             <p className="text-[11px] font-medium text-white/70 sm:text-xs">
//               {isCurrent ? "Total Recorded" : "Covered"}
//             </p>

//             <p className="mt-1 text-lg font-bold leading-none text-white sm:text-xl">
//               {isCurrent ? recorded : covered}
//             </p>
//           </div>

//           {/* Total Covered */}
//           <div className="min-w-[90px] flex flex-col justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm sm:min-w-[105px] sm:px-4">
//             <p className="text-[11px] font-medium text-white/70 sm:text-xs">
//               {isCurrent ? "Total Covered" : "Covered"}
//             </p>

//             <p className="mt-1 text-lg font-bold leading-none text-white sm:text-xl">
//               {isCurrent ? covered : covered}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { formatDate } from "@/lib/formatDate";
import { CalendarDays } from "lucide-react";

export default function CampaignHeader({
  campaign,
  recorded = 0,
  visited = 0,
  covered = 0,
}) {
  if (!campaign) return null;

  const stats = [
    {
      label: "Total Recorded",
      value: recorded,
    },
    {
      label: "Total Visited",
      value: visited,
    },
    {
      label: "Total Covered",
      value: covered,
    },
  ];

  return (
    <div className="bg-primary border-border relative mb-5 overflow-hidden rounded-2xl border shadow-sm dark:bg-transparent">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Campaign Information */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {campaign.name}
            </h2>

            <div className="flex items-center gap-2 text-sm text-white/80">
              <CalendarDays size={15} />

              <span className="whitespace-nowrap">
                {formatDate(campaign.startDate)} -{" "}
                {formatDate(campaign.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid w-full grid-cols-3 gap-2.5 sm:gap-3 lg:w-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-h-[50px] min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/15 sm:min-h-[82px] sm:min-w-[112px] sm:px-4"
            >
              <p className="text-[10px] leading-tight font-medium text-white/65 sm:text-xs">
                {stat.label}
              </p>

              <p className="mt-2 text-lg leading-none font-bold tracking-tight text-white sm:text-2xl">
                {Number(stat.value || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-white/30" />
    </div>
  );
}
