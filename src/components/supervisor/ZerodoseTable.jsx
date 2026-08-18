// "use client";

// export default function ZerodoseTable({ data = [], onTeamClick }) {
//   return (
//     <div className="bg-surface border-border overflow-hidden rounded-xl border md:rounded-2xl">
//       <div className="overflow-x-auto">
//         <table className="w-full min-w-[900px] border-collapse">
//           {/* ======================================================
//               Header
//           ====================================================== */}

//           <thead>
//             <tr className="bg-background border-border border-b">
//               <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
//                 Team No.
//               </th>

//               <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
//                 Team Leader
//               </th>

//               <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
//                 Team Member
//               </th>

//               <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
//                 Recorded
//               </th>

//               <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
//                 Visited
//               </th>

//               <th className="text-text-secondary px-4 py-3 text-center text-xs font-semibold">
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
//                   className="text-text-secondary px-4 py-10 text-center text-sm"
//                 >
//                   No active teams found.
//                 </td>
//               </tr>
//             ) : (
//               data.map((team) => {
//                 return (
//                   <tr
//                     key={team.teamNumber}
//                     onClick={() => onTeamClick?.(team)}
//                     className={`border-border border-b last:border-b-0 ${
//                       onTeamClick ? "hover:bg-background cursor-pointer" : ""
//                     }`}
//                   >
//                     {/* Team Number */}
//                     <td className="text-text border-border border-r px-4 py-4 text-sm font-semibold">
//                       T-00{team.teamNumber}
//                     </td>

//                     {/* Team Leader */}
//                     <td className="text-text border-border border-r px-4 py-4 text-sm">
//                       {team.teamLeader?.name || "-"}
//                     </td>

//                     {/* Team Member */}
//                     <td className="text-text border-border border-r px-4 py-4 text-sm">
//                       {team.teamMember?.name || "-"}
//                     </td>

//                     {/* Recorded */}
//                     <td className="border-border border-r px-4 py-4 text-center">
//                       <span className="text-primary bg-primary/10 inline-flex min-w-9 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold">
//                         {team.recorded}
//                       </span>
//                     </td>

//                     {/* Visited */}
//                     <td className="border-border border-r px-4 py-4 text-center">
//                       <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
//                         {team.visited}
//                       </span>
//                     </td>

//                     {/* Covered */}
//                     <td className="px-4 py-4 text-center">
//                       <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
//                         {team.covered}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>

//           {/* ======================================================
//               Footer
//           ====================================================== */}

//           {data.length > 0 && (
//             <tfoot>
//               <tr className="bg-background">
//                 <td
//                   colSpan={3}
//                   className="text-text px-4 py-4 text-right text-xs font-semibold"
//                 >
//                   Total
//                 </td>

//                 {/* Total Recorded */}
//                 <td className="text-text border-border border-r px-4 py-4 text-center text-sm font-bold">
//                   {data.reduce((total, team) => total + team.recorded, 0)}
//                 </td>

//                 {/* Total Visited */}
//                 <td className="text-text border-border border-r px-4 py-4 text-center text-sm font-bold">
//                   {data.reduce((total, team) => total + team.visited, 0)}
//                 </td>

//                 {/* Total Covered */}
//                 <td className="text-text px-4 py-4 text-center text-sm font-bold">
//                   {data.reduce((total, team) => total + team.covered, 0)}
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
    <div className="border-border overflow-hidden rounded-xl border bg-white md:rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          {/* ======================================================
              Header
          ====================================================== */}

          <thead>
            <tr className="border-border border-b bg-white">
              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Team No.
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Team Leader
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Team Member
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                Recorded
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                Visited
              </th>

              <th className="text-text-secondary px-4 py-3 text-center text-xs font-semibold">
                Covered
              </th>
            </tr>
          </thead>

          {/* ======================================================
              Body
          ====================================================== */}

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-text-secondary px-4 py-10 text-center text-sm"
                >
                  No active teams found.
                </td>
              </tr>
            ) : (
              data.map((team) => {
                return (
                  <tr
                    key={team.teamNumber}
                    onClick={() => onTeamClick?.(team)}
                    className={`group border-border border-b ${
                      onTeamClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Team Number */}
                    <td className="text-text border-border border-r px-4 py-2.5 text-sm font-semibold transition-colors group-hover:bg-blue-50">
                      T-00{team.teamNumber}
                    </td>

                    {/* Team Leader */}
                    <td className="text-text border-border border-r px-4 py-2.5 text-sm capitalize transition-colors group-hover:bg-blue-50">
                      {team.teamLeader?.name || "-"}
                    </td>

                    {/* Team Member */}
                    <td className="text-text border-border border-r px-4 py-2.5 text-sm capitalize transition-colors group-hover:bg-blue-50">
                      {team.teamMember?.name || "-"}
                    </td>

                    {/* Recorded */}
                    <td className="border-border border-r px-4 py-2.5 text-center transition-colors group-hover:bg-blue-50">
                      <span className="text-primary bg-primary/10 inline-flex min-w-9 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold">
                        {team.recorded}
                      </span>
                    </td>

                    {/* Visited */}
                    <td className="border-border border-r px-4 py-2.5 text-center transition-colors group-hover:bg-blue-50">
                      <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                        {team.visited}
                      </span>
                    </td>

                    {/* Covered */}
                    <td className="border-border px-4 py-2.5 text-center transition-colors group-hover:bg-blue-50">
                      <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                        {team.covered}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* ======================================================
              Footer
          ====================================================== */}

          {data.length > 0 && (
            <tfoot>
              <tr className="bg-white">
                <td
                  colSpan={3}
                  className="text-text px-4 py-4 text-right text-xs font-semibold"
                >
                  Total
                </td>

                {/* Total Recorded */}

                <td className="text-text border-border border-r px-4 py-4 text-center text-sm font-bold">
                  {data.reduce(
                    (total, team) => total + Number(team.recorded || 0),
                    0,
                  )}
                </td>

                {/* Total Visited */}

                <td className="text-text border-border border-r px-4 py-4 text-center text-sm font-bold">
                  {data.reduce(
                    (total, team) => total + Number(team.visited || 0),
                    0,
                  )}
                </td>

                {/* Total Covered */}

                <td className="text-text px-4 py-4 text-center text-sm font-bold">
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
