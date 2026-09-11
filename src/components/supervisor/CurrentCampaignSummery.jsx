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
// }) {
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

//   const teamData = useMemo(() => {
//     const teamsMap = new Map();

//     // ----------------------------------------------------------
//     // Add all active teams first
//     // ----------------------------------------------------------

//     activeTeams.forEach((activeTeam) => {
//       const teamNumber = Number(activeTeam.teamNumber);

//       if (!Number.isInteger(teamNumber)) {
//         return;
//       }

//       teamsMap.set(teamNumber, {
//         teamNumber,
//         teamLeader: activeTeam.teamLeader || null,
//         teamMember: activeTeam.teamMember || null,
//         unionCouncil: activeTeam.unionCouncil || null,
//         recorded: 0,
//         visited: 0,
//         covered: 0,
//       });
//     });

//     // ----------------------------------------------------------
//     // Merge already-aggregated campaign data
//     // ----------------------------------------------------------

//     data.forEach((item) => {
//       const teamNumber = Number(item.teamNumber);

//       if (!Number.isInteger(teamNumber)) {
//         return;
//       }

//       if (!teamsMap.has(teamNumber)) {
//         teamsMap.set(teamNumber, {
//           teamNumber,
//           teamLeader: item.teamLeader || null,
//           teamMember: item.teamMember || null,
//           unionCouncil: item.unionCouncil || null,
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });
//       }

//       const team = teamsMap.get(teamNumber);

//       // --------------------------------------------------------
//       // USE EXISTING COUNTS
//       // --------------------------------------------------------

//       team.recorded = Number(item.recorded || 0);
//       team.visited = Number(item.visited || 0);
//       team.covered = Number(item.covered || 0);

//       // --------------------------------------------------------
//       // Use API team information if available
//       // --------------------------------------------------------

//       if (item.teamLeader) {
//         team.teamLeader = item.teamLeader;
//       }

//       if (item.teamMember) {
//         team.teamMember = item.teamMember;
//       }

//       if (item.unionCouncil) {
//         team.unionCouncil = item.unionCouncil;
//       }
//     });

//     return Array.from(teamsMap.values()).sort(
//       (a, b) => a.teamNumber - b.teamNumber,
//     );
//   }, [activeTeams, data]);

//   // ============================================================
//   // SUMMARY
//   // ============================================================

//   const totalTeams = activeTeams.length || teamData.length;

//   const totalRecorded = teamData.reduce(
//     (total, team) => total + Number(team.recorded || 0),
//     0,
//   );

//   const totalCovered = teamData.reduce(
//     (total, team) => total + Number(team.covered || 0),
//     0,
//   );

//   return (
//     <section>
//       {/* ========================================================
//           Campaign Header
//       ======================================================== */}

//       <CampaignHeader
//         campaign={campaign}
//         label="CURRENT CAMPAIGN"
//         teams={totalTeams}
//         recorded={totalRecorded}
//         covered={totalCovered}
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
//             Team-wise Zerodose record for current campaign
//           </p>
//         </div>

//         {authUser?.designation === "supervisor" ? (
//           <span className="text-text-secondary text-xs">
//             {totalTeams} Teams
//           </span>
//         ) : (
//           <span className="text-text-secondary text-xs">
//             {totalSupervisors || 0} Supervisors
//           </span>
//         )}
//       </div>

//       {/* ========================================================
//           Table
//       ======================================================== */}

//       {authUser?.designation === "supervisor" ? (
//           <ZerodoseTable data={teamData} />
//         ) : (
//          <SupervisorsTable data={teamData} />
//         )}

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
}) {
  // ============================================================
  // TEAM DATA
  // ============================================================

  const teamData = useMemo(() => {
    const teamsMap = new Map();

    // ----------------------------------------------------------
    // Add all active teams first
    // ----------------------------------------------------------

    activeTeams.forEach((activeTeam) => {
      const teamNumber = Number(activeTeam.teamNumber);

      if (!Number.isInteger(teamNumber)) {
        return;
      }

      teamsMap.set(teamNumber, {
        teamNumber,
        teamLeader: activeTeam.teamLeader || null,
        teamMember: activeTeam.teamMember || null,
        unionCouncil: activeTeam.unionCouncil || null,
        recorded: 0,
        visited: 0,
        covered: 0,
      });
    });

    // ----------------------------------------------------------
    // Merge campaign data
    // ----------------------------------------------------------

    data.forEach((item) => {
      const teamNumber = Number(item.teamNumber);

      if (!Number.isInteger(teamNumber)) {
        return;
      }

      if (!teamsMap.has(teamNumber)) {
        teamsMap.set(teamNumber, {
          teamNumber,
          teamLeader: item.teamLeader || null,
          teamMember: item.teamMember || null,
          unionCouncil: item.unionCouncil || null,
          recorded: 0,
          visited: 0,
          covered: 0,
        });
      }

      const team = teamsMap.get(teamNumber);

      team.recorded = Number(item.recorded || 0);
      team.visited = Number(item.visited || 0);
      team.covered = Number(item.covered || 0);

      if (item.teamLeader) {
        team.teamLeader = item.teamLeader;
      }

      if (item.teamMember) {
        team.teamMember = item.teamMember;
      }

      if (item.unionCouncil) {
        team.unionCouncil = item.unionCouncil;
      }
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) => a.teamNumber - b.teamNumber,
    );
  }, [activeTeams, data]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalTeams = activeTeams.length || teamData.length;

  const totalRecorded = teamData.reduce(
    (total, team) => total + Number(team.recorded || 0),
    0,
  );

  const totalCovered = teamData.reduce(
    (total, team) => total + Number(team.covered || 0),
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
        teams={totalTeams}
        recorded={totalRecorded}
        covered={totalCovered}
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
            Team-wise Zerodose record for current campaign
          </p>
        </div>

        {authUser?.designation === "supervisor" ? (
          <span className="text-text-secondary text-xs">
            {totalTeams} Teams
          </span>
        ) : (
          <span className="text-text-secondary text-xs">
            {totalSupervisors || 0} Supervisors
          </span>
        )}
      </div>

      {/* ========================================================
          Table
      ======================================================== */}

      {authUser?.designation === "supervisor" ? (
        <ZerodoseTable data={teamData} />
      ) : (
        <SupervisorsTable data={teamData} />
      )}
    </section>
  );
}
