// // "use client";

// // export default function ZerodoseTable({ data = [], onTeamClick }) {
// //   return (
// //     <div className="mb-4 overflow-hidden rounded-xl border border-border shadow-sm md:rounded-2xl">
// //       <div className="overflow-x-auto">
// //         <table className="w-full border-collapse">
// //           {/* ======================================================
// //               Header
// //           ====================================================== */}

// //           <thead>
// //             <tr className="border-b border-border bg-primary/10 dark:bg-slate-900">
// //               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-left text-xs font-semibold text-text-secondary">
// //                 Team No.
// //               </th>

// //               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-left text-xs font-semibold text-text-secondary">
// //                 Name
// //               </th>

// //               {/* <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-left text-xs font-semibold text-text-secondary">
// //                 Team Member
// //               </th> */}

// //               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-center text-xs font-semibold text-text-secondary">
// //                 Recorded
// //               </th>

// //               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-center text-xs font-semibold text-text-secondary">
// //                 Visited
// //               </th>

// //               <th className="whitespace-nowrap px-3 py-2.5 text-center text-xs font-semibold text-text-secondary">
// //                 Covered
// //               </th>
// //             </tr>
// //           </thead>

// //           {/* ======================================================
// //               Body
// //           ====================================================== */}

// //           <tbody>
// //             {data.length === 0 ? (
// //               <tr>
// //                 <td
// //                   colSpan={6}
// //                   className="px-3 py-8 text-center text-sm text-text-secondary"
// //                 >
// //                   No active teams found.
// //                 </td>
// //               </tr>
// //             ) : (
// //               data.map((team) => (
// //                 <tr
// //                   key={team.teamNumber}
// //                   onClick={() => onTeamClick?.(team)}
// //                   className={`group border-b border-border transition-colors ${
// //                     onTeamClick ? "cursor-pointer" : ""
// //                   }`}
// //                 >
// //                   {/* Team Number */}

// //                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-xs font-semibold text-text transition-colors group-hover:bg-primary/5">
// //                     T-00{team.teamNumber}
// //                   </td>

// //                   {/* Team Leader */}

// //                   <td className="whitespace-wrap border-r border-border px-3 py-2 text-xs capitalize text-text transition-colors group-hover:bg-primary/5">
// //                   <div className="flex flex-col gap-1">

// //                     <span className="font-normal">{team.teamLeader?.name || "-"}</span>
// //                    <span className="font-normal">{team.teamMember?.name || "-"}</span>

// //                   </div>
// //                   </td>

// //                   {/* Team Member */}
// // {/*
// //                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-xs capitalize text-text transition-colors group-hover:bg-primary/5">
// //                     {team.teamMember?.name || "-"}
// //                   </td> */}

// //                   {/* Recorded */}

// //                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-center transition-colors group-hover:bg-primary/5">
// //                     <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
// //                       {team.recorded}
// //                     </span>
// //                   </td>

// //                   {/* Visited */}

// //                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-center transition-colors group-hover:bg-primary/5">
// //                     <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
// //                       {team.visited}
// //                     </span>
// //                   </td>

// //                   {/* Covered */}

// //                   <td className="whitespace-nowrap px-3 py-2 text-center transition-colors group-hover:bg-primary/5">
// //                     <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
// //                       {team.covered}
// //                     </span>
// //                   </td>
// //                 </tr>
// //               ))
// //             )}
// //           </tbody>

// //           {/* ======================================================
// //               Footer
// //           ====================================================== */}

// //           {data.length > 0 && (
// //             <tfoot>
// //               <tr className="bg-surface">
// //                 <td
// //                   colSpan={2}
// //                   className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold text-text"
// //                 >
// //                   Total
// //                 </td>

// //                 <td className="whitespace-nowrap border-x border-border px-3 py-3 text-center text-xs font-bold text-text">
// //                   {data.reduce(
// //                     (total, team) => total + Number(team.recorded || 0),
// //                     0,
// //                   )}
// //                 </td>

// //                 <td className="whitespace-nowrap border-r border-border px-3 py-3 text-center text-xs font-bold text-text">
// //                   {data.reduce(
// //                     (total, team) => total + Number(team.visited || 0),
// //                     0,
// //                   )}
// //                 </td>

// //                 <td className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold text-text">
// //                   {data.reduce(
// //                     (total, team) => total + Number(team.covered || 0),
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

// export default function ZerodoseTable({ data = [], onTeamClick }) {
//   return (
//     <div className="border-border mb-4 overflow-hidden rounded-xl border shadow-sm md:rounded-2xl">

//       <div className="overflow-x-auto">

//         <table className="w-full border-collapse">
//           {/* Header */}
//           <thead>

//             <tr className="border-border bg-primary/10 border-b dark:bg-slate-900">

//               <th className="border-border text-text-secondary w-[14%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
//                 Team No.
//               </th>
//               <th className="border-border text-text-secondary w-[24%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
//                 Name
//               </th>
//               <th className="border-border text-text-secondary w-[20.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
//                 Recorded
//               </th>
//               <th className="border-border text-text-secondary w-[20.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
//                 Visited
//               </th>
//               <th className="text-text-secondary w-[21%] px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
//                 Covered
//               </th>
//             </tr>
//           </thead>
//           {/* Body */}
//           <tbody>
//             {data.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={5}
//                   className="text-text-secondary px-2 py-6 text-center text-[11px]"
//                 >
//                   No active teams found.
//                 </td>
//               </tr>
//             ) : (
//               data.map((team) => (
//                 <tr
//                   key={team.teamNumber}
//                   onClick={() => onTeamClick?.(team)}
//                   className={`group border-border border-b transition-colors ${
//                     onTeamClick ? "cursor-pointer" : ""
//                   }`}
//                 >
//                   {/* Team Number */}
//                   <td className="border-border text-text group-hover:bg-primary/5 border-r px-2 py-1.5 text-center align-middle text-[10px] font-semibold whitespace-nowrap transition-colors">
//                     T-00{team.teamNumber}
//                   </td>

//                   {/* Team Names */}
//                   <td className="border-border text-text group-hover:bg-primary/5 w-[24%] max-w-0 border-r px-2 py-1.5 text-[10px] capitalize transition-colors">
//                     <div className="flex flex-col gap-0.5">
//                       <span className="truncate">
//                         {team.teamLeader?.name || "-"}
//                       </span>

//                       <span className="truncate">
//                         {team.teamMember?.name || "-"}
//                       </span>
//                     </div>
//                   </td>

//                   {/* Recorded */}
//                   <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
//                     <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
//                       {team.recorded || 0}
//                     </span>
//                   </td>

//                   {/* Visited */}
//                   <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
//                     <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
//                       {team.visited || 0}
//                     </span>
//                   </td>

//                   {/* Covered */}
//                   <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
//                     <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
//                       {team.covered || 0}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//           {/* Footer */}
//           {data.length > 0 && (
//             <tfoot>
//               <tr className="bg-surface">
//                 <td
//                   colSpan={2}
//                   className="text-text border-border border-r px-6 py-2 text-right text-[10px] font-semibold whitespace-nowrap"
//                 >
//                   Total
//                 </td>

//                 <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
//                   {data.reduce(
//                     (total, team) => total + Number(team.recorded || 0),
//                     0,
//                   )}
//                 </td>

//                 <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
//                   {data.reduce(
//                     (total, team) => total + Number(team.visited || 0),
//                     0,
//                   )}
//                 </td>

//                 <td className="text-text px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
//                   {data.reduce(
//                     (total, team) => total + Number(team.covered || 0),
//                     0,
//                   )}
//                 </td>
//               </tr>
//             </tfoot>
//           )}
//         </table>
//       </div>
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

export default function ZerodoseTable({ data = [], onTeamClick }) {
  const totalRecorded = data.reduce(
    (total, team) => total + Number(team.recorded || 0),
    0,
  );

  const totalVisited = data.reduce(
    (total, team) => total + Number(team.visited || 0),
    0,
  );

  const totalCovered = data.reduce(
    (total, team) => total + Number(team.covered || 0),
    0,
  );

  const getTeamNumber = (teamNumber) => {
    if (teamNumber === undefined || teamNumber === null) {
      return "-";
    }

    return `T-${teamNumber}`;
  };

  const stats = [
    {
      key: "recorded",
      label: "Recorded",
      icon: ClipboardList,
      getValue: (team) => team.recorded || 0,
    },
    {
      key: "visited",
      label: "Visited",
      icon: Eye,
      getValue: (team) => team.visited || 0,
    },
    {
      key: "covered",
      label: "Covered",
      icon: CheckCircle2,
      getValue: (team) => team.covered || 0,
    },
  ];

  return (
    <div className="mb-5">
      {data.length === 0 ? (
        <div className="border-border bg-background rounded-2xl border px-4 py-12 text-center shadow-sm">
          <div className="bg-primary/5 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
            <Users size={22} />
          </div>

          <p className="text-text text-sm font-semibold">No active teams</p>

          <p className="text-text-secondary mt-1 text-xs">
            There are currently no active teams to display.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {data.map((team, index) => (
            <div
              key={team.teamNumber || index}
              onClick={() => onTeamClick?.(team)}
              className={`border-border bg-background group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 ${
                onTeamClick
                  ? "hover:border-primary/30 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                  : ""
              }`}
            >
              {/* Subtle top accent */}
              <div className="bg-primary absolute top-0 right-0 left-0 h-0.5 opacity-70" />

              <div className="p-3.5 sm:p-4">
                {/* ==================================================
                TEAM INFO
            ================================================== */}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Users size={19} />
                    </div>

                    <div className="flex min-w-0 justify-between items-center gap-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <h4 className="text-text truncate text-sm font-semibold sm:text-[15px]">
                          {getTeamNumber(team.teamNumber)}
                        </h4>
                      </div>

                     
                      <div className="flex min-w-0 flex-col gap-0 text-gray-700">
                        <p className="flex items-center justify-between gap-1 text-[13px]">
                          <span className="font-semibold">Leader: </span>
                          <span className="text-[13px] capitalize">
                            {team.teamLeader?.name || "-"}
                          </span>
                        </p>

                        <p className="flex items-center justify-between gap-1 text-[13px]">
                          <span className="font-semibold">Member: </span>
                          <span className="text-[13px] capitalize">
                           {team.teamMember?.name || "-"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {onTeamClick && (
                    <div className="border-border bg-surface text-text-secondary group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors">
                      <ArrowUpRight size={15} />
                    </div>
                  )}
                </div>

                {/* ==================================================
                STATS
            ================================================== */}

                <div className="border-border mt-3 grid grid-cols-3 overflow-hidden rounded-xl border">
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
                          {stat.getValue(team)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom hover indicator */}
              {onTeamClick && (
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
              {data.length} Team{data.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="border-primary/10 border-t">
            <div className="grid grid-cols-3">
              <div className="px-1.5 py-3 text-center">
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
