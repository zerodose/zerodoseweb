"use client";

import { useMemo } from "react";
import { Layers3 } from "lucide-react";

import CampaignHeader from "./CampaignHeader";
import ZerodoseTable from "./ZerodoseTable";


import useCampaignFilter from "@/hooks/useCampaignFilter";
import CampaignFilter from "../campaign/CampaignFilter";

export default function PreviousCampaignsSummery({
  campaigns = [],
  data = [],
}) {
  // ============================================================
  // REUSABLE CAMPAIGN FILTER
  // ============================================================

  const filter = useCampaignFilter({
    campaigns,
    data,
  });

  // ============================================================
  // SELECTED DATA FROM FILTER
  // ============================================================

  const { selectedCampaign, selectedRawData } = filter;

  // ============================================================
  // TEAM-WISE DATA
  // ============================================================

  const teamData = useMemo(() => {
    const teamsMap = new Map();

    selectedRawData.forEach((item) => {
      const rawTeamNumber = item?.teamNumber;

      if (
        rawTeamNumber === null ||
        rawTeamNumber === undefined ||
        rawTeamNumber === ""
      ) {
        return;
      }

      const teamNumber = Number(rawTeamNumber);

      if (!Number.isInteger(teamNumber)) {
        return;
      }

      if (!teamsMap.has(teamNumber)) {
        teamsMap.set(teamNumber, {
          teamNumber,
          teamLeader: item?.teamLeader || null,
          teamMember: item?.teamMember || null,

          recorded: 0,
          visited: 0,
          covered: 0,
        });
      }

      const team = teamsMap.get(teamNumber);

      // ========================================================
      // RECORDED
      // ========================================================

      team.recorded += 1;

      // ========================================================
      // VISITED
      // ========================================================

      if (item?.visitDate || item?.vaccinationStatus === "visited") {
        team.visited += 1;
      }

      // ========================================================
      // COVERED
      // ========================================================

      if (item?.coveredDate || item?.vaccinationStatus === "covered") {
        team.covered += 1;
      }

      // ========================================================
      // HISTORICAL TEAM ASSIGNMENT
      // ========================================================

      if (item?.teamLeader) {
        team.teamLeader = item.teamLeader;
      }

      if (item?.teamMember) {
        team.teamMember = item.teamMember;
      }
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
    );
  }, [selectedRawData]);

  // ============================================================
  // TOTAL RECORDED
  // ============================================================

  const totalRecorded = useMemo(() => {
    return teamData.reduce(
      (total, team) => total + Number(team.recorded || 0),
      0,
    );
  }, [teamData]);

  // ============================================================
  // TOTAL COVERED
  // ============================================================

  const totalCovered = useMemo(() => {
    return teamData.reduce(
      (total, team) => total + Number(team.covered || 0),
      0,
    );
  }, [teamData]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Layers3 size={18} />
          </div>

          <div>
            <h3 className="text-text text-base font-semibold md:text-lg">
              Previous Campaigns
            </h3>

            <p className="text-text-secondary mt-0.5 text-xs md:text-sm">
              Select a campaign to view team-wise Zerodose records.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          REUSABLE CAMPAIGN FILTER
      ====================================================== */}

      <CampaignFilter
        filter={filter}
        title="Campaign Filter"
        description="Choose year, month and campaign"
      />

      {/* ======================================================
          SELECTED CAMPAIGN
      ====================================================== */}

      {selectedCampaign && selectedRawData.length > 0 && (
        <>
          <CampaignHeader
            campaign={selectedCampaign}
            label="PREVIOUS CAMPAIGN"
            teams={teamData.length}
            recorded={totalRecorded}
            covered={totalCovered}
          />

          {/* Team heading */}

          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-text text-base font-semibold md:text-lg">
                Previous Campaign Zerodose
              </h3>

              <p className="text-text-secondary mt-1 text-xs">
                Team-wise Zerodose record for selected campaign
              </p>
            </div>

            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
              {teamData.length} Teams
            </span>
          </div>

          <ZerodoseTable data={teamData} />
        </>
      )}

      {/* ======================================================
          NO DATA
      ====================================================== */}

      {selectedCampaign && selectedRawData.length === 0 && (
        <div className="border-border bg-surface rounded-2xl border p-6 text-center">
          <p className="text-text font-medium">No Zerodose records found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No records are available for this campaign.
          </p>
        </div>
      )}
    </section>
  );
}
