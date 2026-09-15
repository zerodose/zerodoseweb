// "use client";

// import { useMemo } from "react";

// import CampaignHeader from "../supervisor/CampaignHeader";
// import SupervisorsTable from "../ucmo/SupervisorsTable";

// export default function VaccinatorCurrentCampaignSummery({
//   campaign,
//   data = [],
//   loading = false,
//   authUser,
// }) {
//   // ============================================================
//   // SUPERVISOR SUMMARY
//   // ============================================================
//   //
//   // API DATA:
//   //
//   // supervisorId
//   // supervisorName
//   // supervisorCode
//   // numberOfTeams
//   // recordCount
//   // visitCount
//   // coveredCount
//   //
//   // Convert API structure into the structure expected
//   // by SupervisorsTable.
//   // ============================================================

//   const supervisorSummary = useMemo(() => {
//     if (!Array.isArray(data)) {
//       return [];
//     }

//     return (
//       data
//         .map((item) => ({
//           supervisorId: item?.supervisorId || "",

//           supervisorCode: item?.supervisorCode || "-",

//           supervisorName: item?.supervisorName || "-",

//           totalTeams: Number(item?.numberOfTeams || 0),

//           recorded: Number(item?.recordCount || 0),

//           visited: Number(item?.visitCount || 0),

//           covered: Number(item?.coveredCount || 0),
//         }))
//         // Only supervisors having recorded Zerodose
//         .filter((supervisor) => supervisor.recorded > 0)
//         // Sort by Supervisor Code
//         .sort((a, b) => {
//           const codeA = String(a?.supervisorCode || "").trim();

//           const codeB = String(b?.supervisorCode || "").trim();

//           const numberA = Number(codeA.match(/\d+/)?.[0] || 0);

//           const numberB = Number(codeB.match(/\d+/)?.[0] || 0);

//           if (numberA !== numberB) {
//             return numberA - numberB;
//           }

//           return codeA.localeCompare(codeB);
//         })
//     );
//   }, [data]);

//   // ============================================================
//   // TOTAL SUMMARY
//   // ============================================================

//   const summary = useMemo(() => {
//     return supervisorSummary.reduce(
//       (result, supervisor) => {
//         result.recorded += Number(supervisor?.recorded || 0);

//         result.visited += Number(supervisor?.visited || 0);

//         result.covered += Number(supervisor?.covered || 0);

//         result.totalTeams += Number(supervisor?.totalTeams || 0);

//         return result;
//       },
//       {
//         totalTeams: 0,
//         recorded: 0,
//         visited: 0,
//         covered: 0,
//       },
//     );
//   }, [supervisorSummary]);

//   // ============================================================
//   // NO CURRENT CAMPAIGN
//   // ============================================================

//   if (!campaign && !loading) {
//     return (
//       <section>
//         <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
//           <p className="text-text font-medium">Current campaign not found. </p>
//           <p className="text-text-secondary mt-1 text-sm">
//             No active campaign data is available for this vaccinator.
//           </p>
//         </div>
//       </section>
//     );
//   }

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <section>
//       {/* ========================================================
// CURRENT CAMPAIGN HEADER
// ======================================================== */}

//       <CampaignHeader
//         campaign={campaign}
//         label="CURRENT CAMPAIGN"
//         teams={summary.totalTeams}
//         recorded={summary.recorded}
//         visited={summary.visited}
//         covered={summary.covered}
//       />

//       {/* ========================================================
//       SECTION HEADER
//   ======================================================== */}

//       <div className="mt-5 mb-3 flex items-center justify-between">
//         <div>
//           <h3 className="text-text text-base font-semibold md:text-lg">
//             Current Zerodose
//           </h3>

//           <p className="text-text-secondary mt-1 text-xs">
//             Supervisor-wise Zerodose record for current campaign
//           </p>
//         </div>

//         <span className="text-text-secondary text-xs">
//           {supervisorSummary.length} Supervisors
//         </span>
//       </div>

//       {/* ========================================================
//       LOADING SKELETON
//   ======================================================== */}

//       {loading ? (
//         <div className="bg-surface border-border overflow-hidden rounded-xl border md:rounded-2xl">
//           <div className="animate-pulse space-y-3 p-4 md:p-5">
//             <div className="bg-border h-10 rounded-lg" />
//             <div className="bg-border h-12 rounded-lg" />
//             <div className="bg-border h-12 rounded-lg" />
//             <div className="bg-border h-12 rounded-lg" />
//           </div>
//         </div>
//       ) : supervisorSummary.length === 0 ? (
//         /* ======================================================
//        EMPTY STATE
//     ====================================================== */

//         <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
//           <p className="text-text font-medium">No Zerodose records found.</p>

//           <p className="text-text-secondary mt-1 text-sm">
//             No supervisor has recorded Zerodose activity for this campaign yet.
//           </p>
//         </div>
//       ) : (
//         /* ======================================================
//        SUPERVISOR TABLE
//     ====================================================== */

//         <SupervisorsTable data={supervisorSummary} />
//       )}
//     </section>
//   );
// }

"use client";

import { useMemo } from "react";

import CampaignHeader from "../supervisor/CampaignHeader";
import SupervisorsTable from "../ucmo/SupervisorsTable";
import CampaignHeaderSkeleton from "./CampaignHeaderSkeleton";

export default function VaccinatorCurrentCampaignSummery({
  campaign,
  data = [],
  loading = false,
  authUser,
}) {
  // ============================================================
  // SUPERVISOR SUMMARY
  // ============================================================

  const supervisorSummary = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return (
      data
        .map((item) => ({
          supervisorId: item?.supervisorId || "",
          supervisorCode: item?.supervisorCode || "-",
          supervisorName: item?.supervisorName || "-",

          totalTeams: Number(item?.numberOfTeams || 0),

          recorded: Number(item?.recordCount || 0),

          visited: Number(item?.visitCount || 0),

          covered: Number(item?.coveredCount || 0),
        }))
        // Only supervisors having recorded Zerodose
        .filter((supervisor) => supervisor.recorded > 0)

        // Sort by Supervisor Code
        .sort((a, b) => {
          const codeA = String(a?.supervisorCode || "").trim();
          const codeB = String(b?.supervisorCode || "").trim();

          const numberA = Number(codeA.match(/\d+/)?.[0] || 0);
          const numberB = Number(codeB.match(/\d+/)?.[0] || 0);

          if (numberA !== numberB) {
            return numberA - numberB;
          }

          return codeA.localeCompare(codeB);
        })
    );
  }, [data]);

  // ============================================================
  // TOTAL SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    return supervisorSummary.reduce(
      (result, supervisor) => {
        result.recorded += Number(supervisor?.recorded || 0);
        result.visited += Number(supervisor?.visited || 0);
        result.covered += Number(supervisor?.covered || 0);
        result.totalTeams += Number(supervisor?.totalTeams || 0);

        return result;
      },
      {
        totalTeams: 0,
        recorded: 0,
        visited: 0,
        covered: 0,
      },
    );
  }, [supervisorSummary]);

  // ============================================================
  // LOADING SKELETON
  // ============================================================
  //
  // IMPORTANT:
  // Loading check comes BEFORE campaign/data checks.
  // This means skeleton remains visible while ANY API is loading.
  // ============================================================

  if (loading) {
    return (
      <section>
        {/* ======================================================
            CAMPAIGN HEADER SKELETON
        ====================================================== */}

        <CampaignHeaderSkeleton />

        {/* ======================================================
            SECTION HEADER SKELETON
        ====================================================== */}

        <div className="mt-5 mb-3 flex items-center justify-between">
          <div className="animate-pulse">
            <div className="bg-border h-5 w-36 rounded-md" />

            <div className="bg-border mt-2 h-3 w-64 rounded-md" />
          </div>

          <div className="bg-border h-4 w-20 animate-pulse rounded-md" />
        </div>

        {/* ======================================================
            SUPERVISORS TABLE SKELETON
        ====================================================== */}

        <SupervisorsTableSkeleton />
      </section>
    );
  }

  // ============================================================
  // NO CURRENT CAMPAIGN
  // ============================================================

  if (!campaign) {
    return (
      <section>
        <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
          <p className="text-text font-medium">Current campaign not found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No active campaign data is available for this vaccinator.
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      {/* ========================================================
          CURRENT CAMPAIGN HEADER
      ======================================================== */}

      <CampaignHeader
        campaign={campaign}
        label="CURRENT CAMPAIGN"
        teams={summary.totalTeams}
        recorded={summary.recorded}
        visited={summary.visited}
        covered={summary.covered}
      />

      {/* ========================================================
          SECTION HEADER
      ======================================================== */}

      <div className="mt-5 mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-text text-base font-semibold md:text-lg">
            Current Zerodose
          </h3>

          <p className="text-text-secondary mt-1 text-xs">
            Supervisor-wise Zerodose record for current campaign
          </p>
        </div>

        <p className="text-text-secondary text-xs text-nowrap">
          <span className="border-border bg-primary/5 mr-1 h-10 w-10 rounded-full border p-1 font-semibold">
            {supervisorSummary.length}
          </span>
          Supervisors
        </p>
      </div>

      {/* ========================================================
          NO DATA
      ======================================================== */}

      {supervisorSummary.length === 0 ? (
        <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
          <p className="text-text font-medium">No Zerodose records found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No supervisor has recorded Zerodose activity for this campaign yet.
          </p>
        </div>
      ) : (
        /* ======================================================
           SUPERVISOR TABLE
        ====================================================== */

        <SupervisorsTable data={supervisorSummary} />
      )}
    </section>
  );
}

// ============================================================
// SUPERVISORS TABLE SKELETON
// Same UI structure as SupervisorsTable
// ============================================================

function SupervisorsTableSkeleton() {
  const rows = [1, 2, 3];

  return (
    <div className="border-border mb-4 overflow-hidden rounded-xl border shadow-sm md:rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* ==================================================
              HEADER
          ================================================== */}

          <thead>
            <tr className="border-border bg-primary/10 border-b dark:bg-slate-900">
              {/* Sup Code */}
              <th className="border-border border-r px-3 py-2.5 text-left">
                <div className="bg-border h-3 w-16 animate-pulse rounded-md" />
              </th>

              {/* Supervisor Name */}
              <th className="border-border border-r px-3 py-2.5 text-left">
                <div className="bg-border h-3 w-28 animate-pulse rounded-md" />
              </th>

              {/* Teams */}
              <th className="border-border border-r px-3 py-2.5 text-center">
                <div className="bg-border mx-auto h-3 w-20 animate-pulse rounded-md" />
              </th>

              {/* Recorded */}
              <th className="border-border border-r px-3 py-2.5 text-center">
                <div className="bg-border mx-auto h-3 w-16 animate-pulse rounded-md" />
              </th>

              {/* Visited */}
              <th className="border-border border-r px-3 py-2.5 text-center">
                <div className="bg-border mx-auto h-3 w-14 animate-pulse rounded-md" />
              </th>

              {/* Covered */}
              <th className="px-3 py-2.5 text-center">
                <div className="bg-border mx-auto h-3 w-16 animate-pulse rounded-md" />
              </th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          ================================================== */}

          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-border border-b last:border-b-0">
                {/* Supervisor Code */}

                <td className="border-border border-r px-3 py-2">
                  <div className="bg-surface mx-auto h-4 w-12 animate-pulse rounded-md" />
                </td>

                {/* Supervisor Name */}

                <td className="border-border border-r px-3 py-2">
                  <div className="bg-surface h-4 w-32 animate-pulse rounded-md" />
                </td>

                {/* Teams */}

                <td className="border-border border-r px-3 py-2 text-center">
                  <div className="bg-surface mx-auto h-7 w-9 animate-pulse rounded-md" />
                </td>

                {/* Recorded */}

                <td className="border-border border-r px-3 py-2 text-center">
                  <div className="bg-surface mx-auto h-7 w-9 animate-pulse rounded-md" />
                </td>

                {/* Visited */}

                <td className="border-border border-r px-3 py-2 text-center">
                  <div className="bg-surface mx-auto h-7 w-9 animate-pulse rounded-md" />
                </td>

                {/* Covered */}

                <td className="px-3 py-2 text-center">
                  <div className="bg-surface mx-auto h-7 w-9 animate-pulse rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <tfoot>
            <tr className="bg-surface">
              {/* Total */}

              <td
                colSpan={2}
                className="border-border border-r px-3 py-3 text-right"
              >
                <div className="bg-border ml-auto h-3 w-10 animate-pulse rounded-md" />
              </td>

              {/* Total Teams */}

              <td className="border-border border-r px-3 py-3 text-center">
                <div className="bg-border mx-auto h-4 w-8 animate-pulse rounded-md" />
              </td>

              {/* Total Recorded */}

              <td className="border-border border-r px-3 py-3 text-center">
                <div className="bg-border mx-auto h-4 w-8 animate-pulse rounded-md" />
              </td>

              {/* Total Visited */}

              <td className="border-border border-r px-3 py-3 text-center">
                <div className="bg-border mx-auto h-4 w-8 animate-pulse rounded-md" />
              </td>

              {/* Total Covered */}

              <td className="px-3 py-3 text-center">
                <div className="bg-border mx-auto h-4 w-8 animate-pulse rounded-md" />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
