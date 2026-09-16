// "use client";

// export default function ZerodoseTable({ data = [], onTeamClick }) {
//   return (
//     <div className="mb-4 overflow-hidden rounded-xl border border-border shadow-sm md:rounded-2xl">
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           {/* ======================================================
//               Header
//           ====================================================== */}

//           <thead>
//             <tr className="border-b border-border bg-primary/10 dark:bg-slate-900">
//               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-left text-xs font-semibold text-text-secondary">
//                 Team No.
//               </th>

//               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-left text-xs font-semibold text-text-secondary">
//                 Name
//               </th>

//               {/* <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-left text-xs font-semibold text-text-secondary">
//                 Team Member
//               </th> */}

//               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-center text-xs font-semibold text-text-secondary">
//                 Recorded
//               </th>

//               <th className="whitespace-nowrap border-r border-border px-3 py-2.5 text-center text-xs font-semibold text-text-secondary">
//                 Visited
//               </th>

//               <th className="whitespace-nowrap px-3 py-2.5 text-center text-xs font-semibold text-text-secondary">
//                 Covered
//               </th>
//             </tr>
//           </thead>

//           {/* ======================================================
//               Body
//           ====================================================== */}

//           <tbody>
//             {data.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="px-3 py-8 text-center text-sm text-text-secondary"
//                 >
//                   No active teams found.
//                 </td>
//               </tr>
//             ) : (
//               data.map((team) => (
//                 <tr
//                   key={team.teamNumber}
//                   onClick={() => onTeamClick?.(team)}
//                   className={`group border-b border-border transition-colors ${
//                     onTeamClick ? "cursor-pointer" : ""
//                   }`}
//                 >
//                   {/* Team Number */}

//                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-xs font-semibold text-text transition-colors group-hover:bg-primary/5">
//                     T-00{team.teamNumber}
//                   </td>

//                   {/* Team Leader */}

//                   <td className="whitespace-wrap border-r border-border px-3 py-2 text-xs capitalize text-text transition-colors group-hover:bg-primary/5">
//                   <div className="flex flex-col gap-1">

//                     <span className="font-normal">{team.teamLeader?.name || "-"}</span>
//                    <span className="font-normal">{team.teamMember?.name || "-"}</span>

//                   </div>
//                   </td>

//                   {/* Team Member */}
// {/*
//                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-xs capitalize text-text transition-colors group-hover:bg-primary/5">
//                     {team.teamMember?.name || "-"}
//                   </td> */}

//                   {/* Recorded */}

//                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-center transition-colors group-hover:bg-primary/5">
//                     <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
//                       {team.recorded}
//                     </span>
//                   </td>

//                   {/* Visited */}

//                   <td className="whitespace-nowrap border-r border-border px-3 py-2 text-center transition-colors group-hover:bg-primary/5">
//                     <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
//                       {team.visited}
//                     </span>
//                   </td>

//                   {/* Covered */}

//                   <td className="whitespace-nowrap px-3 py-2 text-center transition-colors group-hover:bg-primary/5">
//                     <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
//                       {team.covered}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>

//           {/* ======================================================
//               Footer
//           ====================================================== */}

//           {data.length > 0 && (
//             <tfoot>
//               <tr className="bg-surface">
//                 <td
//                   colSpan={2}
//                   className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold text-text"
//                 >
//                   Total
//                 </td>

//                 <td className="whitespace-nowrap border-x border-border px-3 py-3 text-center text-xs font-bold text-text">
//                   {data.reduce(
//                     (total, team) => total + Number(team.recorded || 0),
//                     0,
//                   )}
//                 </td>

//                 <td className="whitespace-nowrap border-r border-border px-3 py-3 text-center text-xs font-bold text-text">
//                   {data.reduce(
//                     (total, team) => total + Number(team.visited || 0),
//                     0,
//                   )}
//                 </td>

//                 <td className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold text-text">
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

export default function ZerodoseTable({ data = [], onTeamClick }) {
  return (
    <div className="border-border mb-4 overflow-hidden rounded-xl border shadow-sm md:rounded-2xl">
      {" "}
      <div className="overflow-x-auto">
        {" "}
        <table className="w-full border-collapse">
          {/* Header */}{" "}
          <thead>
            {" "}
            <tr className="border-border bg-primary/10 border-b dark:bg-slate-900">
              {" "}
              <th className="border-border text-text-secondary w-[14%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
                Team No.{" "}
              </th>
              <th className="border-border text-text-secondary w-[24%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
                Name
              </th>
              <th className="border-border text-text-secondary w-[20.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
                Recorded
              </th>
              <th className="border-border text-text-secondary w-[20.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
                Visited
              </th>
              <th className="text-text-secondary w-[21%] px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
                Covered
              </th>
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-text-secondary px-2 py-6 text-center text-[11px]"
                >
                  No active teams found.
                </td>
              </tr>
            ) : (
              data.map((team) => (
                <tr
                  key={team.teamNumber}
                  onClick={() => onTeamClick?.(team)}
                  className={`group border-border border-b transition-colors ${
                    onTeamClick ? "cursor-pointer" : ""
                  }`}
                >
                  {/* Team Number */}
                  <td className="border-border text-text group-hover:bg-primary/5 border-r px-2 py-1.5 text-center align-middle text-[10px] font-semibold whitespace-nowrap transition-colors">
                    T-00{team.teamNumber}
                  </td>

                  {/* Team Names */}
                  <td className="border-border text-text group-hover:bg-primary/5 w-[24%] max-w-0 border-r px-2 py-1.5 text-[10px] capitalize transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate">
                        {team.teamLeader?.name || "-"}
                      </span>

                      <span className="truncate">
                        {team.teamMember?.name || "-"}
                      </span>
                    </div>
                  </td>

                  {/* Recorded */}
                  <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
                      {team.recorded || 0}
                    </span>
                  </td>

                  {/* Visited */}
                  <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
                      {team.visited || 0}
                    </span>
                  </td>

                  {/* Covered */}
                  <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
                      {team.covered || 0}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Footer */}
          {data.length > 0 && (
            <tfoot>
              <tr className="bg-surface">
                <td
                  colSpan={2}
                  className="text-text border-border border-r px-6 py-2 text-right text-[10px] font-semibold whitespace-nowrap"
                >
                  Total
                </td>

                <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, team) => total + Number(team.recorded || 0),
                    0,
                  )}
                </td>

                <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, team) => total + Number(team.visited || 0),
                    0,
                  )}
                </td>

                <td className="text-text px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, team) => total + Number(team.covered || 0),
                    0,
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
