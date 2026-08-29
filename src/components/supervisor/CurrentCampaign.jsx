
"use client";

import { useMemo } from "react";

import CampaignHeader from "./CampaignHeader";
import SupervisorZerodoseTableSkeleton from "./SupervisorZerodoseTableSkeleton";
import ZerodoseTable from "./ZerodoseTable";

export default function CurrentCampaign({
  campaign,
  data = [],
  activeTeams = [],
  loading = false,
}) {
  // ------------------------------------------------------------
  // Only show skeleton while API is loading
  // ------------------------------------------------------------

  // if (loading) {
  //   return <SupervisorZerodoseTableSkeleton />;
  // }

  // ------------------------------------------------------------
  // No campaign available
  // ------------------------------------------------------------

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
  // TEAM-WISE DATA
  // ============================================================

  const teamData = useMemo(() => {
    const teamsMap = new Map();

    // ----------------------------------------------------------
    // Add active teams
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
        recorded: 0,
        visited: 0,
        covered: 0,
      });
    });

    // ----------------------------------------------------------
    // Add current campaign Zerodose
    // ----------------------------------------------------------

    data.forEach((item) => {
      const teamNumber = Number(item.teamNumber);

      if (!Number.isInteger(teamNumber)) {
        return;
      }

      if (!teamsMap.has(teamNumber)) {
        teamsMap.set(teamNumber, {
          teamNumber,
          teamLeader: null,
          teamMember: null,
          recorded: 0,
          visited: 0,
          covered: 0,
        });
      }

      const team = teamsMap.get(teamNumber);

      // Every Zerodose record = recorded
      team.recorded += 1;

      // Visit based on visitDate
      if (item.visitDate) {
        team.visited += 1;
      }

      // Covered based on coveredDate/status
      if (item.coveredDate || item.vaccinationStatus === "covered") {
        team.covered += 1;
      }

      // --------------------------------------------------------
      // Worker information if populated in Zerodose
      // --------------------------------------------------------

      const worker = item.user;

      if (worker?.workerRole === "teamLeader") {
        team.teamLeader = worker;
      }

      if (worker?.workerRole === "teamMember") {
        team.teamMember = worker;
      }
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) => a.teamNumber - b.teamNumber,
    );
  }, [activeTeams, data]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalTeams = teamData.length;

  const totalRecorded = teamData.reduce(
    (total, team) => total + team.recorded,
    0,
  );

  return (
    <section>
      <CampaignHeader
        campaign={campaign}
        label="CURRENT CAMPAIGN"
        teams={totalTeams}
        recorded={totalRecorded}
      />

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-text text-base font-semibold md:text-lg">
            Current Zerodose
          </h3>

          <p className="text-text-secondary mt-1 text-xs">
            Team-wise Zerodose record for current campaign
          </p>
        </div>

        <span className="text-text-secondary text-xs">{totalTeams} Teams</span>
      </div>

      <ZerodoseTable data={teamData} />
    </section>
  );
}
