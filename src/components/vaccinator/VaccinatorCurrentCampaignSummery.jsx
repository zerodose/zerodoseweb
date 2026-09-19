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
  mode,
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
          // supervisorId: item?.supervisorId || "",
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
  const rows = [1, 2, 3, 4];

  return (
    <div className="mb-5">
      {/* ============================================================
          SUPERVISOR CARDS
      ============================================================ */}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row}
            className="border-border bg-background relative overflow-hidden rounded-2xl border shadow-sm"
          >
            {/* Top accent */}
            <div className="bg-primary/40 absolute top-0 right-0 left-0 h-0.5" />

            <div className="p-3.5 sm:p-4">
              {/* ==================================================
                  SUPERVISOR INFO
              ================================================== */}

              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Avatar */}
                  <div className="bg-surface h-10 w-10 shrink-0 animate-pulse rounded-xl" />

                  <div className="min-w-0 flex-1">
                    {/* Name */}
                    <div className="bg-surface h-4 w-32 animate-pulse rounded-md sm:w-40" />

                    {/* Code */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="bg-surface h-2.5 w-20 animate-pulse rounded-md" />

                      <div className="bg-surface h-5 w-12 animate-pulse rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="bg-surface h-8 w-8 shrink-0 animate-pulse rounded-lg" />
              </div>

              {/* ==================================================
                  STATS
              ================================================== */}

              <div className="border-border mt-3 grid grid-cols-4 overflow-hidden rounded-xl border">
                {[1, 2, 3, 4].map((stat) => (
                  <div
                    key={stat}
                    className={`bg-surface px-1.5 py-2.5 text-center sm:px-2 ${
                      stat !== 4 ? "border-border border-r" : ""
                    }`}
                  >
                    {/* Label */}
                    <div className="bg-border mx-auto h-3 w-12 animate-pulse rounded-md sm:w-14" />

                    {/* Value */}
                    <div className="bg-border mx-auto mt-2 h-5 w-7 animate-pulse rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================
          OVERALL SUMMARY
      ============================================================ */}

    </div>
  );
}
