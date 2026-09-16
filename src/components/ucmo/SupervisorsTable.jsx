// // "use client";

// // export default function SupervisorsTable({ data = [], onSupervisorClick }) {
// //   return (
// //     <div className="border-border mb-4 overflow-hidden rounded-xl border shadow-sm md:rounded-2xl">
// //       <div className="overflow-x-auto">
// //         <table className="w-full border-collapse">
// //           {/* Header */}
// //           <thead>
// //             <tr className="border-border bg-primary/10 border-b dark:bg-slate-900">
// //               <th className="border-border text-text-secondary w-[14%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
// //                 Sup Code
// //               </th>
// //               <th className="border-border text-text-secondary w-[24%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
// //                 Sup Name
// //               </th>
// //               <th className="border-border text-text-secondary w-[15.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
// //                 Teams
// //               </th>
// //               <th className="border-border text-text-secondary w-[15.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
// //                 Recorded
// //               </th>
// //               <th className="border-border text-text-secondary w-[15.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
// //                 Visited
// //               </th>
// //               <th className="text-text-secondary w-[15.5%] px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
// //                 Covered
// //               </th>
// //             </tr>
// //           </thead>

// //           {/* Body */}
// //           <tbody>
// //             {data.length === 0 ? (
// //               <tr>
// //                 <td
// //                   colSpan={6}
// //                   className="text-text-secondary px-2 py-6 text-center text-[11px]"
// //                 >
// //                   No active supervisors found.
// //                 </td>
// //               </tr>
// //             ) : (
// //               data.map((supervisor) => (
// //                 <tr
// //                   key={supervisor.supervisorCode}
// //                   onClick={() => onSupervisorClick?.(supervisor)}
// //                   className={`group border-border border-b transition-colors ${
// //                     onSupervisorClick ? "cursor-pointer" : ""
// //                   }`}
// //                 >
// //                   {/* Supervisor Code */}
// //                   <td className="border-border text-text group-hover:bg-primary/5 border-r px-2 py-1.5 text-center align-middle text-[10px] whitespace-nowrap transition-colors">
// //                     {supervisor.supervisorCode
// //                       ? String(supervisor.supervisorCode).startsWith("0")
// //                         ? supervisor.supervisorCode
// //                         : `0${supervisor.supervisorCode}`
// //                       : "-"}
// //                   </td>

// //                   {/* Supervisor Name */}
// //                   <td className="border-border text-text group-hover:bg-primary/5 w-[24%] max-w-0 border-r px-2 py-1.5 text-[10px] whitespace-nowrap capitalize transition-colors">
// //                     <div className="truncate">
// //                       {supervisor.supervisorName || "-"}
// //                     </div>
// //                   </td>

// //                   {/* Total Teams */}
// //                   <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
// //                     <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
// //                       {supervisor.totalTeams || 0}
// //                     </span>
// //                   </td>

// //                   {/* Recorded */}
// //                   <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
// //                     <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
// //                       {supervisor.recorded || 0}
// //                     </span>
// //                   </td>

// //                   {/* Visited */}
// //                   <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
// //                     <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
// //                       {supervisor.visited || 0}
// //                     </span>
// //                   </td>

// //                   {/* Covered */}
// //                   <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
// //                     <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
// //                       {supervisor.covered || 0}
// //                     </span>
// //                   </td>
// //                 </tr>
// //               ))
// //             )}
// //           </tbody>

// //           {/* Footer */}
// //           {data.length > 0 && (
// //             <tfoot>
// //               <tr className="bg-surface">
// //                 <td
// //                   colSpan={2}
// //                   className="text-text border-border py-2 text-right px-6 border-r text-[10px] font-semibold whitespace-nowrap"
// //                 >
// //                   Total
// //                 </td>

// //                 <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
// //                   {data.reduce(
// //                     (total, supervisor) =>
// //                       total + Number(supervisor.totalTeams || 0),
// //                     0,
// //                   )}
// //                 </td>

// //                 <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
// //                   {data.reduce(
// //                     (total, supervisor) =>
// //                       total + Number(supervisor.recorded || 0),
// //                     0,
// //                   )}
// //                 </td>

// //                 <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
// //                   {data.reduce(
// //                     (total, supervisor) =>
// //                       total + Number(supervisor.visited || 0),
// //                     0,
// //                   )}
// //                 </td>

// //                 <td className="text-text px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
// //                   {data.reduce(
// //                     (total, supervisor) =>
// //                       total + Number(supervisor.covered || 0),
// //                     0,
// //                   )}
// //                 </td>
// //               </tr>
// //             </tfoot>
// //           )}
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { Users, UserRound } from "lucide-react";

// export default function SupervisorsTable({ data = [], onSupervisorClick }) {
//   const totalTeams = data.reduce(
//     (total, supervisor) => total + Number(supervisor.totalTeams || 0),
//     0,
//   );

//   const totalRecorded = data.reduce(
//     (total, supervisor) => total + Number(supervisor.recorded || 0),
//     0,
//   );

//   const totalVisited = data.reduce(
//     (total, supervisor) => total + Number(supervisor.visited || 0),
//     0,
//   );

//   const totalCovered = data.reduce(
//     (total, supervisor) => total + Number(supervisor.covered || 0),
//     0,
//   );

//   const getSupervisorCode = (code) => {
//     if (!code) return "-";

//     return String(code).startsWith("0") ? code : `0${code}`;
//   };

//   return (
//     <div className="mb-4 space-y-3">
//       {/* ============================================================
//           SUPERVISORS LIST
//       ============================================================ */}

//       {data.length === 0 ? (
//         <div className="border-border bg-background rounded-xl border px-4 py-10 text-center shadow-sm md:rounded-2xl">
//           <UserRound
//             size={28}
//             className="text-text-secondary mx-auto mb-2 opacity-60"
//           />

//           <p className="text-text-secondary text-sm">
//             No active supervisors found.
//           </p>
//         </div>
//       ) : (
//         data.map((supervisor) => (
//           <div
//             key={supervisor.supervisorCode}
//             onClick={() => onSupervisorClick?.(supervisor)}
//             className={`border-border bg-background group rounded-xl border p-3 shadow-sm transition-all duration-200 md:rounded-2xl md:p-4 ${
//               onSupervisorClick
//                 ? "hover:border-primary/30 cursor-pointer hover:shadow-md active:scale-[0.995]"
//                 : ""
//             }`}
//           >
//             {/* ======================================================
//                 SUPERVISOR HEADER
//             ====================================================== */}

//             <div className="mb-3 flex items-center justify-between gap-3">
//               <div className="flex min-w-0 items-center gap-2.5">
//                 <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
//                   <UserRound size={18} />
//                 </div>

//                 <div className="min-w-0">
//                   <p className="text-text truncate text-sm font-semibold capitalize">
//                     {supervisor.supervisorName || "-"}
//                   </p>

//                   <p className="text-text-secondary mt-0.5 text-[11px]">
//                     Code:{" "}
//                     <span className="font-medium">
//                       {getSupervisorCode(supervisor.supervisorCode)}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               {onSupervisorClick && (
//                 <span className="text-text-secondary shrink-0 text-[10px]">
//                   View
//                 </span>
//               )}
//             </div>

//             {/* ======================================================
//                 SUPERVISOR STATS
//             ====================================================== */}

//             <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
//               {/* Teams */}
//               <div className="bg-surface rounded-lg px-1.5 py-2 text-center">
//                 <p className="text-text-secondary text-[10px] font-medium">
//                   Teams
//                 </p>

//                 <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                   {supervisor.totalTeams || 0}
//                 </p>
//               </div>

//               {/* Recorded */}
//               <div className="bg-surface rounded-lg px-1.5 py-2 text-center">
//                 <p className="text-text-secondary text-[10px] font-medium">
//                   Recorded
//                 </p>

//                 <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                   {supervisor.recorded || 0}
//                 </p>
//               </div>

//               {/* Visited */}
//               <div className="bg-surface rounded-lg px-1.5 py-2 text-center">
//                 <p className="text-text-secondary text-[10px] font-medium">
//                   Visited
//                 </p>

//                 <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                   {supervisor.visited || 0}
//                 </p>
//               </div>

//               {/* Covered */}
//               <div className="bg-surface rounded-lg px-1.5 py-2 text-center">
//                 <p className="text-text-secondary text-[10px] font-medium">
//                   Covered
//                 </p>

//                 <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                   {supervisor.covered || 0}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))
//       )}

//       {/* ============================================================
//           TOTAL SUMMARY
//       ============================================================ */}

//       {data.length > 0 && (
//         <div className="border-primary/20 bg-primary/5 rounded-xl border p-3 shadow-sm md:rounded-2xl md:p-4">
//           <div className="mb-3 flex items-center gap-2">
//             <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
//               <Users size={16} />
//             </div>

//             <div>
//               <p className="text-text text-sm font-semibold">Overall Total</p>

//               <p className="text-text-secondary text-[10px]">
//                 All active supervisors
//               </p>
//             </div>
//           </div>

//           <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
//             <div className="bg-background rounded-lg px-1.5 py-2 text-center">
//               <p className="text-text-secondary text-[10px] font-medium">
//                 Teams
//               </p>

//               <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                 {totalTeams}
//               </p>
//             </div>

//             <div className="bg-background rounded-lg px-1.5 py-2 text-center">
//               <p className="text-text-secondary text-[10px] font-medium">
//                 Recorded
//               </p>

//               <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                 {totalRecorded}
//               </p>
//             </div>

//             <div className="bg-background rounded-lg px-1.5 py-2 text-center">
//               <p className="text-text-secondary text-[10px] font-medium">
//                 Visited
//               </p>

//               <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                 {totalVisited}
//               </p>
//             </div>

//             <div className="bg-background rounded-lg px-1.5 py-2 text-center">
//               <p className="text-text-secondary text-[10px] font-medium">
//                 Covered
//               </p>

//               <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
//                 {totalCovered}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Eye,
  Users,
  UserRound,
} from "lucide-react";

export default function SupervisorsTable({ data = [], onSupervisorClick }) {
  const totalTeams = data.reduce(
    (total, supervisor) => total + Number(supervisor.totalTeams || 0),
    0,
  );

  const totalRecorded = data.reduce(
    (total, supervisor) => total + Number(supervisor.recorded || 0),
    0,
  );

  const totalVisited = data.reduce(
    (total, supervisor) => total + Number(supervisor.visited || 0),
    0,
  );

  const totalCovered = data.reduce(
    (total, supervisor) => total + Number(supervisor.covered || 0),
    0,
  );

  const getSupervisorCode = (code) => {
    if (!code) return "-";

    return String(code).startsWith("0") ? code : `0${code}`;
  };

  const stats = [
    {
      key: "totalTeams",
      label: "Teams",
      icon: Users,
      getValue: (supervisor) => supervisor.totalTeams || 0,
    },
    {
      key: "recorded",
      label: "Recorded",
      icon: ClipboardList,
      getValue: (supervisor) => supervisor.recorded || 0,
    },
    {
      key: "visited",
      label: "Visited",
      icon: Eye,
      getValue: (supervisor) => supervisor.visited || 0,
    },
    {
      key: "covered",
      label: "Covered",
      icon: CheckCircle2,
      getValue: (supervisor) => supervisor.covered || 0,
    },
  ];

  return (
    <div className="mb-5">
      {/* ============================================================
HEADER
============================================================ */}

    

      {/* ============================================================
      SUPERVISORS
  ============================================================ */}

      {data.length === 0 ? (
        <div className="border-border bg-background rounded-2xl border px-4 py-12 text-center shadow-sm">
          <div className="bg-primary/5 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
            <UserRound size={22} />
          </div>

          <p className="text-text text-sm font-semibold">
            No active supervisors
          </p>

          <p className="text-text-secondary mt-1 text-xs">
            There are currently no active supervisors to display.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {data.map((supervisor, index) => (
            <div
              key={supervisor.supervisorCode || index}
              onClick={() => onSupervisorClick?.(supervisor)}
              className={`border-border bg-background group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 ${
                onSupervisorClick
                  ? "hover:border-primary/30 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                  : ""
              }`}
            >
              {/* Subtle top accent */}
              <div className="bg-primary absolute top-0 right-0 left-0 h-0.5 opacity-70" />

              <div className="p-3.5 sm:p-4">
                {/* ==================================================
                SUPERVISOR INFO
            ================================================== */}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <UserRound size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h4 className="text-text truncate text-sm font-semibold capitalize sm:text-[15px]">
                          {supervisor.supervisorName || "-"}
                        </h4>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-text-secondary text-[10px] sm:text-[11px]">
                          Supervisor Code
                        </span>

                        <span className="bg-surface text-text rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                          {getSupervisorCode(supervisor.supervisorCode)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {onSupervisorClick && (
                    <div className="border-border bg-surface text-text-secondary group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors">
                      <ArrowUpRight size={15} />
                    </div>
                  )}
                </div>

                {/* ==================================================
                STATS
            ================================================== */}

                <div className="border-border mt-3 grid grid-cols-4 overflow-hidden rounded-xl border">
                  {stats.map((stat, statIndex) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.key}
                        className={`bg-surface px-1.5 py-2.5 text-center sm:px-2 ${
                          statIndex !== stats.length - 1
                            ? "border-border border-r"
                            : ""
                        }`}
                      >
                        <div className="text-text-secondary flex items-center justify-center gap-1">
                          <Icon size={11} strokeWidth={2} />

                          <span className="text-[9px] font-medium sm:text-[10px]">
                            {stat.label}
                          </span>
                        </div>

                        <p className="text-text mt-1 text-sm font-bold sm:text-base">
                          {stat.getValue(supervisor)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom hover indicator */}
              {onSupervisorClick && (
                <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
      OVERALL SUMMARY
  ============================================================ */}

      {data.length > 0 && (
        <div className="border-primary/20 bg-primary/[0.04] mt-4 overflow-hidden rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between px-3.5 py-3 sm:px-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
                <Users size={17} />
              </div>

              <div>
                <p className="text-text text-xs font-semibold sm:text-sm">
                  Overall Summary
                </p>

                <p className="text-text-secondary mt-0.5 text-[10px] sm:text-[11px]">
                  Combined activity
                </p>
              </div>
            </div>

            <span className="text-primary text-[10px] font-semibold sm:text-xs">
              {data.length} Supervisors
            </span>
          </div>

          <div className="border-primary/10 border-t">
            <div className="grid grid-cols-4">
              <div className="px-1.5 py-3 text-center">
                <p className="text-text-secondary text-[9px] font-medium sm:text-[10px]">
                  Teams
                </p>

                <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
                  {totalTeams}
                </p>
              </div>

              <div className="border-primary/10 border-l px-1.5 py-3 text-center">
                <p className="text-text-secondary text-[9px] font-medium sm:text-[10px]">
                  Recorded
                </p>

                <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
                  {totalRecorded}
                </p>
              </div>

              <div className="border-primary/10 border-l px-1.5 py-3 text-center">
                <p className="text-text-secondary text-[9px] font-medium sm:text-[10px]">
                  Visited
                </p>

                <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
                  {totalVisited}
                </p>
              </div>

              <div className="border-primary/10 border-l px-1.5 py-3 text-center">
                <p className="text-text-secondary text-[9px] font-medium sm:text-[10px]">
                  Covered
                </p>

                <p className="text-text mt-0.5 text-sm font-bold sm:text-base">
                  {totalCovered}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
