"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import CampaignHeader from "./CampaignHeader";
import ZerodoseTable from "./ZerodoseTable";

export default function PreviousCampaigns({ campaigns = [], loading = false }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  // ============================================================
  // SAFE ID
  // ============================================================

  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      return value._id?.toString() || value.id?.toString() || null;
    }

    return value.toString();
  };

  // ============================================================
  // UNIQUE CAMPAIGNS
  // ============================================================

  const uniqueCampaigns = useMemo(() => {
    const map = new Map();

    campaigns.forEach((item) => {
      const campaign = item?.campaign;

      if (!campaign) {
        return;
      }

      const campaignId = getId(campaign);

      if (!campaignId) {
        return;
      }

      if (!map.has(campaignId)) {
        map.set(campaignId, campaign);
      }
    });

    return Array.from(map.values());
  }, [campaigns]);

  // ============================================================
  // SORTED PREVIOUS CAMPAIGNS
  //
  // Latest campaign first
  // ============================================================

  const sortedCampaigns = useMemo(() => {
    return [...uniqueCampaigns].sort((a, b) => {
      const dateA = new Date(a?.startDate || 0).getTime();
      const dateB = new Date(b?.startDate || 0).getTime();

      return dateB - dateA;
    });
  }, [uniqueCampaigns]);

  // ============================================================
  // YEARS
  // ============================================================

  const years = useMemo(() => {
    return [
      ...new Set(
        uniqueCampaigns
          .map((campaign) => campaign?.year)
          .filter((year) => year !== null && year !== undefined && year !== ""),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns]);

  // ============================================================
  // MONTHS
  // ============================================================

  const months = useMemo(() => {
    if (!selectedYear) {
      return [];
    }

    return [
      ...new Set(
        uniqueCampaigns
          .filter((campaign) => String(campaign?.year) === String(selectedYear))
          .map((campaign) => campaign?.month)
          .filter(
            (month) => month !== null && month !== undefined && month !== "",
          ),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns, selectedYear]);

  // ============================================================
  // CAMPAIGN OPTIONS
  // ============================================================

  const campaignOptions = useMemo(() => {
    if (!selectedYear || !selectedMonth) {
      return [];
    }

    return uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) === String(selectedYear) &&
          String(campaign?.month) === String(selectedMonth),
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });
  }, [uniqueCampaigns, selectedYear, selectedMonth]);

  // ============================================================
  // DEFAULT LATEST PREVIOUS CAMPAIGN
  //
  // Page open hote hi latest campaign select hogi.
  //
  // ============================================================

  useEffect(() => {
    if (!sortedCampaigns.length) {
      setSelectedYear("");
      setSelectedMonth("");
      setSelectedCampaignId("");
      return;
    }

    const latestCampaign = sortedCampaigns[0];

    const latestCampaignId = getId(latestCampaign);

    const latestYear = latestCampaign?.year;
    const latestMonth = latestCampaign?.month;

    if (!latestCampaignId) {
      return;
    }

    setSelectedYear(
      latestYear !== null && latestYear !== undefined ? String(latestYear) : "",
    );

    setSelectedMonth(
      latestMonth !== null && latestMonth !== undefined
        ? String(latestMonth)
        : "",
    );

    setSelectedCampaignId(latestCampaignId);
  }, [sortedCampaigns]);

  // ============================================================
  // SELECTED CAMPAIGN
  // ============================================================

  const selectedCampaign = useMemo(() => {
    if (!selectedCampaignId) {
      return null;
    }

    return (
      uniqueCampaigns.find(
        (campaign) => String(getId(campaign)) === String(selectedCampaignId),
      ) || null
    );
  }, [uniqueCampaigns, selectedCampaignId]);

  // ============================================================
  // SELECTED CAMPAIGN RAW DATA
  // ============================================================

  const selectedRawData = useMemo(() => {
    if (!selectedCampaignId) {
      return [];
    }

    return campaigns.filter((item) => {
      const campaignId = getId(item?.campaign);

      return campaignId && String(campaignId) === String(selectedCampaignId);
    });
  }, [campaigns, selectedCampaignId]);

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

      // --------------------------------------------------------
      // CREATE TEAM
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // RECORDED
      // --------------------------------------------------------

      team.recorded += 1;

      // --------------------------------------------------------
      // VISITED
      // --------------------------------------------------------

      if (item?.visitDate || item?.vaccinationStatus === "visited") {
        team.visited += 1;
      }

      // --------------------------------------------------------
      // COVERED
      // --------------------------------------------------------

      if (item?.coveredDate || item?.vaccinationStatus === "covered") {
        team.covered += 1;
      }

      // --------------------------------------------------------
      // WORKER
      // --------------------------------------------------------

      const worker = item?.user;

      if (worker?.workerRole === "teamLeader") {
        team.teamLeader = worker;
      }

      if (worker?.workerRole === "teamMember") {
        team.teamMember = worker;
      }

      // --------------------------------------------------------
      // DIRECT WORKER
      // --------------------------------------------------------

      if (!team.teamLeader && item?.worker?.workerRole === "teamLeader") {
        team.teamLeader = item.worker;
      }

      if (!team.teamMember && item?.worker?.workerRole === "teamMember") {
        team.teamMember = item.worker;
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
  // YEAR CHANGE
  // ============================================================

  const handleYearChange = (value) => {
    setSelectedYear(value);

    if (!value) {
      setSelectedMonth("");
      setSelectedCampaignId("");
      return;
    }

    const campaignsOfYear = uniqueCampaigns
      .filter((campaign) => String(campaign?.year) === String(value))
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });

    const firstCampaign = campaignsOfYear[0];

    if (!firstCampaign) {
      setSelectedMonth("");
      setSelectedCampaignId("");
      return;
    }

    const month = firstCampaign?.month;
    const campaignId = getId(firstCampaign);

    setSelectedMonth(
      month !== null && month !== undefined ? String(month) : "",
    );

    setSelectedCampaignId(campaignId || "");
  };

  // ============================================================
  // MONTH CHANGE
  // ============================================================

  const handleMonthChange = (value) => {
    setSelectedMonth(value);

    if (!value) {
      setSelectedCampaignId("");
      return;
    }

    const campaignsOfMonth = uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) === String(selectedYear) &&
          String(campaign?.month) === String(value),
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });

    const firstCampaign = campaignsOfMonth[0];

    setSelectedCampaignId(getId(firstCampaign) || "");
  };

  // ============================================================
  // CAMPAIGN CHANGE
  // ============================================================

  const handleCampaignChange = (value) => {
    setSelectedCampaignId(value);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <section>
        <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
          <p className="text-text font-medium">Loading previous campaigns...</p>

          <p className="text-text-secondary mt-1 text-sm">
            Please wait while Zerodose records are loading.
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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-5">
        <h3 className="text-text text-base font-semibold md:text-lg">
          Previous Campaigns
        </h3>

        <p className="text-text-secondary mt-1 text-xs md:text-sm">
          Select year, month and campaign to view previous Zerodose records.
        </p>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-surface border-border mb-5 rounded-xl border p-4 md:rounded-2xl md:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* YEAR */}

          <div>
            <label className="text-text mb-1.5 block text-xs font-medium">
              Year
            </label>

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
              >
                <option value="">Select Year</option>

                {years.map((year) => (
                  <option key={`year-${year}`} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              />
            </div>
          </div>

          {/* MONTH */}

          <div>
            <label className="text-text mb-1.5 block text-xs font-medium">
              Month
            </label>

            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                disabled={!selectedYear}
                className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none disabled:opacity-50"
              >
                <option value="">Select Month</option>

                {months.map((month) => (
                  <option key={`month-${selectedYear}-${month}`} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              />
            </div>
          </div>

          {/* CAMPAIGN */}

          <div>
            <label className="text-text mb-1.5 block text-xs font-medium">
              Campaign
            </label>

            <div className="relative">
              <select
                value={selectedCampaignId}
                onChange={(e) => handleCampaignChange(e.target.value)}
                disabled={!selectedMonth}
                className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none disabled:opacity-50"
              >
                <option value="">Select Campaign</option>

                {campaignOptions.map((campaign) => {
                  const campaignId = getId(campaign);

                  if (!campaignId) {
                    return null;
                  }

                  return (
                    <option key={`campaign-${campaignId}`} value={campaignId}>
                      {campaign.name}
                    </option>
                  );
                })}
              </select>

              <ChevronDown
                size={16}
                className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SELECTED CAMPAIGN
      ====================================================== */}

      {selectedCampaign && (
        <>
          <CampaignHeader
            campaign={selectedCampaign}
            label="PREVIOUS CAMPAIGN"
            teams={teamData.length}
            recorded={totalRecorded}
            covered={totalCovered}
          />

          {/* TEAM HEADING */}

          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-text text-base font-semibold md:text-lg">
                Previous Campaign Zerodose
              </h3>

              <p className="text-text-secondary mt-1 text-xs">
                Team-wise Zerodose record for selected campaign
              </p>
            </div>

            <span className="text-text-secondary text-xs">
              {teamData.length} Teams
            </span>
          </div>

          {/* TEAM TABLE */}

          <ZerodoseTable data={teamData} />
        </>
      )}

      {/* ======================================================
          NO DATA
      ====================================================== */}

      {selectedCampaign && selectedRawData.length === 0 && (
        <div className="bg-surface border-border rounded-xl border p-6 text-center">
          <p className="text-text font-medium">No Zerodose records found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No records are available for this campaign.
          </p>
        </div>
      )}
    </section>
  );
}
