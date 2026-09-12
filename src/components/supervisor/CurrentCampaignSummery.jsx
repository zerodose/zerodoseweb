// "use client";

// import { useMemo } from "react";

// import CampaignHeader from "./CampaignHeader";
// import SupervisorsTable from "../ucmo/SupervisorsTable";
// import ZerodoseTable from "./ZerodoseTable";

// export default function CurrentCampaignSummery({
//   campaign,
//   data = [],
//   activeTeams = [],
//   authUser,
//   totalSupervisors,
//   currentSupervisors = [],
// }) {
//   // ============================================================
//   // TEAM DATA
//   // ============================================================
//   //
//   // This data is used ONLY when logged-in user is a supervisor.
//   //
//   // Supervisor:
//   // Current campaign
//   //      ↓
//   // Own Zerodose records
//   //      ↓
//   // Team-wise aggregation
//   //      ↓
//   // ZerodoseTable
//   //
//   // ============================================================

//   const teamData = useMemo(() => {
//     const teamsMap = new Map();

//     // ----------------------------------------------------------
//     // Add all active teams first
//     // ----------------------------------------------------------

//     activeTeams.forEach((activeTeam) => {
//       const teamNumber = Number(activeTeam?.teamNumber);

//       if (!Number.isInteger(teamNumber)) {
//         return;
//       }

//       teamsMap.set(teamNumber, {
//         teamNumber,
//         teamLeader: activeTeam?.teamLeader || null,
//         teamMember: activeTeam?.teamMember || null,
//         unionCouncil: activeTeam?.unionCouncil || null,
//         recorded: 0,
//         visited: 0,
//         covered: 0,
//       });
//     });

//     // ----------------------------------------------------------
//     // Merge campaign data
//     // ----------------------------------------------------------

//     data.forEach((item) => {
//       const teamNumber = Number(item?.teamNumber);

//       if (!Number.isInteger(teamNumber)) {
//         return;
//       }

//       if (!teamsMap.has(teamNumber)) {
//         teamsMap.set(teamNumber, {
//           teamNumber,
//           teamLeader: item?.teamLeader || null,
//           teamMember: item?.teamMember || null,
//           unionCouncil: item?.unionCouncil || null,
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });
//       }

//       const team = teamsMap.get(teamNumber);

//       // --------------------------------------------------------
//       // IMPORTANT
//       //
//       // If data is already aggregated, use its values.
//       // Otherwise count individual Zerodose records.
//       // --------------------------------------------------------

//       if (
//         item?.recorded !== undefined ||
//         item?.visited !== undefined ||
//         item?.covered !== undefined
//       ) {
//         team.recorded += Number(item?.recorded || 0);
//         team.visited += Number(item?.visited || 0);
//         team.covered += Number(item?.covered || 0);
//       } else {
//         const status = String(item?.vaccinationStatus || "").toLowerCase();

//         if (status === "recorded") {
//           team.recorded += 1;
//         }

//         if (status === "visited") {
//           team.visited += 1;
//         }

//         if (status === "covered") {
//           team.covered += 1;
//         }
//       }

//       if (item?.teamLeader) {
//         team.teamLeader = item.teamLeader;
//       }

//       if (item?.teamMember) {
//         team.teamMember = item.teamMember;
//       }

//       if (item?.unionCouncil) {
//         team.unionCouncil = item.unionCouncil;
//       }
//     });

//     return Array.from(teamsMap.values()).sort(
//       (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
//     );
//   }, [activeTeams, data]);

//   // ============================================================
//   // SUPERVISOR SUMMARY
//   // ============================================================
//   //
//   // This is used ONLY for UCMO.
//   //
//   // UCMO:
//   // Current campaign
//   //      ↓
//   // Supervisors
//   //      ↓
//   // Each supervisor's own Zerodose records
//   //      ↓
//   // Supervisor-wise totals
//   //      ↓
//   // SupervisorsTable
//   //
//   // ============================================================

//   const supervisorSummary = useMemo(() => {
//     if (!Array.isArray(currentSupervisors)) {
//       return [];
//     }

//     return currentSupervisors
//       .filter((supervisor) => Number(supervisor?.recorded || 0) > 0)
//       .sort((a, b) => {
//         const codeA = String(a?.supervisorCode || a?.code || "");

//         const codeB = String(b?.supervisorCode || b?.code || "");

//         // Extract numeric part from supervisor code
//         const numberA = Number(codeA.match(/\d+/)?.[0] || 0);

//         const numberB = Number(codeB.match(/\d+/)?.[0] || 0);

//         return numberA - numberB;
//       });
//   }, [currentSupervisors]);

//   // ============================================================
//   // SUPERVISOR TOTALS
//   // ============================================================

//   const supervisorRecorded = useMemo(() => {
//     return supervisorSummary.reduce(
//       (total, supervisor) => total + Number(supervisor?.recorded || 0),
//       0,
//     );
//   }, [supervisorSummary]);

//   const supervisorCovered = useMemo(() => {
//     return supervisorSummary.reduce(
//       (total, supervisor) => total + Number(supervisor?.covered || 0),
//       0,
//     );
//   }, [supervisorSummary]);

//   const supervisorVisited = useMemo(() => {
//     return supervisorSummary.reduce(
//       (total, supervisor) => total + Number(supervisor?.visited || 0),
//       0,
//     );
//   }, [supervisorSummary]);

//   // ============================================================
//   // TEAM TOTALS
//   // ============================================================

//   const totalTeams = activeTeams.length || teamData.length;

//   const totalRecorded = teamData.reduce(
//     (total, team) => total + Number(team?.recorded || 0),
//     0,
//   );

//   const totalCovered = teamData.reduce(
//     (total, team) => total + Number(team?.covered || 0),
//     0,
//   );

//   // ============================================================
//   // NO CURRENT CAMPAIGN
//   // ============================================================

//   if (!campaign) {
//     return (
//       <section>
//         <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
//           <p className="text-text font-medium">Current campaign not found.</p>

//           <p className="text-text-secondary mt-1 text-sm">
//             No active campaign data is available for this supervisor.
//           </p>
//         </div>
//       </section>
//     );
//   }

//   // ============================================================
//   // IS SUPERVISOR?
//   // ============================================================

//   const isSupervisor = authUser?.designation === "supervisor";

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <section>
//       {/* ========================================================
//           Campaign Header
//       ======================================================== */}

//       <CampaignHeader
//         campaign={campaign}
//         label="CURRENT CAMPAIGN"
//         teams={isSupervisor ? totalTeams : supervisorSummary.length}
//         recorded={isSupervisor ? totalRecorded : supervisorRecorded}
//         covered={isSupervisor ? totalCovered : supervisorCovered}
//       />

//       {/* ========================================================
//           Section Heading
//       ======================================================== */}

//       <div className="mb-3 flex items-center justify-between">
//         <div>
//           <h3 className="text-text text-base font-semibold md:text-lg">
//             Current Zerodose
//           </h3>

//           <p className="text-text-secondary mt-1 text-xs">
//             {isSupervisor
//               ? "Team-wise Zerodose record for current campaign"
//               : "Supervisor-wise Zerodose record for current campaign"}
//           </p>
//         </div>

//         {isSupervisor ? (
//           <span className="text-text-secondary text-xs">
//             {totalTeams} Teams
//           </span>
//         ) : (
//           <span className="text-text-secondary text-xs">
//             {totalSupervisors || supervisorSummary.length || 0} Supervisors
//           </span>
//         )}
//       </div>

//       {/* ========================================================
//           TABLE
//       ======================================================== */}

//       {isSupervisor ? (
//         <ZerodoseTable data={teamData} />
//       ) : (
//         <SupervisorsTable data={supervisorSummary} />
//       )}
//     </section>
//   );
// }

"use client";

import { useMemo } from "react";

import CampaignHeader from "./CampaignHeader";
import SupervisorsTable from "../ucmo/SupervisorsTable";
import ZerodoseTable from "./ZerodoseTable";

export default function CurrentCampaignSummery({
  campaign,
  data = [],
  activeTeams = [],
  authUser,
  totalSupervisors,
  currentSupervisors = [],
  mode = null,
}) {
  // ============================================================
  // DETERMINE VIEW
  // ============================================================

  const isSupervisor =
    mode === "supervisor" || authUser?.designation === "supervisor";

  // ============================================================
  // TEAM DATA
  // ============================================================

  const teamData = useMemo(() => {
    const teamsMap = new Map();

    // ----------------------------------------------------------
    // Add active teams
    // ----------------------------------------------------------

    activeTeams.forEach((activeTeam) => {
      const teamNumber = Number(activeTeam?.teamNumber);

      if (!Number.isInteger(teamNumber)) {
        return;
      }

      teamsMap.set(teamNumber, {
        teamNumber,

        teamLeader: activeTeam?.teamLeader || null,

        teamMember: activeTeam?.teamMember || null,

        unionCouncil: activeTeam?.unionCouncil || null,

        recorded: 0,

        visited: 0,

        covered: 0,
      });
    });

    // ----------------------------------------------------------
    // Merge current campaign team data
    // ----------------------------------------------------------

    data.forEach((item) => {
      const teamNumber = Number(item?.teamNumber);

      if (!Number.isInteger(teamNumber)) {
        return;
      }

      if (!teamsMap.has(teamNumber)) {
        teamsMap.set(teamNumber, {
          teamNumber,

          teamLeader: item?.teamLeader || null,

          teamMember: item?.teamMember || null,

          unionCouncil: item?.unionCouncil || null,

          recorded: 0,

          visited: 0,

          covered: 0,
        });
      }

      const team = teamsMap.get(teamNumber);

      // --------------------------------------------------------
      // Backend already sends aggregated values
      // --------------------------------------------------------

      team.recorded = Number(item?.recorded || 0);

      team.visited = Number(item?.visited || 0);

      team.covered = Number(item?.covered || 0);

      // --------------------------------------------------------
      // Team leader
      // --------------------------------------------------------

      if (item?.teamLeader) {
        team.teamLeader = item.teamLeader;
      }

      // --------------------------------------------------------
      // Team member
      // --------------------------------------------------------

      if (item?.teamMember) {
        team.teamMember = item.teamMember;
      }

      // --------------------------------------------------------
      // Union Council
      // --------------------------------------------------------

      if (item?.unionCouncil) {
        team.unionCouncil = item.unionCouncil;
      }
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
    );
  }, [activeTeams, data]);

  // ============================================================
  // SUPERVISOR SUMMARY
  // ============================================================

  const supervisorSummary = useMemo(() => {
    if (!Array.isArray(currentSupervisors)) {
      return [];
    }

    return currentSupervisors
      .filter((supervisor) => Number(supervisor?.recorded || 0) > 0)
      .sort((a, b) => {
        const codeA = String(a?.supervisorCode || a?.code || "");

        const codeB = String(b?.supervisorCode || b?.code || "");

        const numberA = Number(codeA.match(/\d+/)?.[0] || 0);

        const numberB = Number(codeB.match(/\d+/)?.[0] || 0);

        return numberA - numberB;
      });
  }, [currentSupervisors]);

  // ============================================================
  // SUPERVISOR TOTALS
  // ============================================================

  const supervisorRecorded = useMemo(() => {
    return supervisorSummary.reduce(
      (total, supervisor) => total + Number(supervisor?.recorded || 0),
      0,
    );
  }, [supervisorSummary]);

  const supervisorCovered = useMemo(() => {
    return supervisorSummary.reduce(
      (total, supervisor) => total + Number(supervisor?.covered || 0),
      0,
    );
  }, [supervisorSummary]);

  const supervisorVisited = useMemo(() => {
    return supervisorSummary.reduce(
      (total, supervisor) => total + Number(supervisor?.visited || 0),
      0,
    );
  }, [supervisorSummary]);

  // ============================================================
  // TEAM TOTALS
  // ============================================================

  const totalTeams = activeTeams.length || teamData.length;

  const totalRecorded = teamData.reduce(
    (total, team) => total + Number(team?.recorded || 0),
    0,
  );
  const totalVisited = teamData.reduce(
    (total, team) => total + Number(team?.visited || 0),
    0,
  );

  const totalCovered = teamData.reduce(
    (total, team) => total + Number(team?.covered || 0),
    0,
  );

  // ============================================================
  // NO CURRENT CAMPAIGN
  // ============================================================

  if (!campaign) {
    return (
      <section>
        <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
          <p className="text-text font-medium">Current campaign not found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No active campaign data is available for this supervisor.
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
          Campaign Header
      ======================================================== */}

      <CampaignHeader
        campaign={campaign}
        label="CURRENT CAMPAIGN"
        teams={isSupervisor ? totalTeams : supervisorSummary.length}
        recorded={isSupervisor ? totalRecorded : supervisorRecorded}
        visited={isSupervisor ? totalVisited : supervisorVisited}
        covered={isSupervisor ? totalCovered : supervisorCovered}
      />

      {/* ========================================================
          Section Heading
      ======================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-text text-base font-semibold md:text-lg">
            Current Zerodose
          </h3>

          <p className="text-text-secondary mt-1 text-xs">
            {isSupervisor
              ? "Team-wise Zerodose record for current campaign"
              : "Supervisor-wise Zerodose record for current campaign"}
          </p>
        </div>

        {isSupervisor ? (
          <span className="text-text-secondary text-xs">
            {totalTeams} Teams
          </span>
        ) : (
          <span className="text-text-secondary text-xs">
            {totalSupervisors || supervisorSummary.length || 0} Supervisors
          </span>
        )}
      </div>

      {/* ========================================================
          TABLE
      ======================================================== */}

      {isSupervisor ? (
        <ZerodoseTable data={teamData} />
      ) : (
        <SupervisorsTable data={supervisorSummary} />
      )}
    </section>
  );
}
