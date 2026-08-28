"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  Layers3,
} from "lucide-react";

import CampaignHeader from "@/components/supervisor/CampaignHeader";
import ZerodoseTeamSummary from "./ZerodoseTeamSummary";

export default function PreviousCampaigns({
  campaigns = [],
  data = [],
  unionCouncilName = "-",
}) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] =
    useState("");

  // ============================================================
  // ID
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

    campaigns.forEach((campaign) => {
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
  // SORTED
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
          .filter(
            (year) =>
              year !== null &&
              year !== undefined &&
              year !== "",
          ),
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
          .filter(
            (campaign) =>
              String(campaign?.year) ===
              String(selectedYear),
          )
          .map((campaign) => campaign?.month)
          .filter(
            (month) =>
              month !== null &&
              month !== undefined &&
              month !== "",
          ),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns, selectedYear]);

  // ============================================================
  // CAMPAIGNS
  // ============================================================

  const campaignOptions = useMemo(() => {
    if (!selectedYear || !selectedMonth) {
      return [];
    }

    return uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) ===
            String(selectedYear) &&
          String(campaign?.month) ===
            String(selectedMonth),
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();
        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });
  }, [uniqueCampaigns, selectedYear, selectedMonth]);

  // ============================================================
  // DEFAULT LATEST
  // ============================================================

  useEffect(() => {
    if (!sortedCampaigns.length) {
      setSelectedYear("");
      setSelectedMonth("");
      setSelectedCampaignId("");

      return;
    }

    const latest = sortedCampaigns[0];

    const id = getId(latest);

    if (!id) {
      return;
    }

    setSelectedYear(
      latest?.year !== null &&
        latest?.year !== undefined
        ? String(latest.year)
        : "",
    );

    setSelectedMonth(
      latest?.month !== null &&
        latest?.month !== undefined
        ? String(latest.month)
        : "",
    );

    setSelectedCampaignId(id);
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
        (campaign) =>
          String(getId(campaign)) ===
          String(selectedCampaignId),
      ) || null
    );
  }, [uniqueCampaigns, selectedCampaignId]);

  // ============================================================
  // SELECTED DATA
  // ============================================================

  const selectedData = useMemo(() => {
    if (!selectedCampaignId) {
      return [];
    }

    return data.filter((item) => {
      const campaignId = getId(
        item?.campaign ||
          item?.campaignId ||
          item?.campaign?._id,
      );

      return (
        campaignId &&
        String(campaignId) ===
          String(selectedCampaignId)
      );
    });
  }, [data, selectedCampaignId]);

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
      .filter(
        (campaign) =>
          String(campaign?.year) === String(value),
      )
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

    setSelectedMonth(
      firstCampaign?.month !== null &&
        firstCampaign?.month !== undefined
        ? String(firstCampaign.month)
        : "",
    );

    setSelectedCampaignId(
      getId(firstCampaign) || "",
    );
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
          String(campaign?.year) ===
            String(selectedYear) &&
          String(campaign?.month) ===
            String(value),
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();
        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });

    setSelectedCampaignId(
      getId(campaignsOfMonth[0]) || "",
    );
  };

  // ============================================================
  // CAMPAIGN CHANGE
  // ============================================================

  const handleCampaignChange = (value) => {
    setSelectedCampaignId(value);
  };

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
              Select a campaign to view team-wise and
              individual Zerodose records.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          FILTER CARD
      ====================================================== */}

      <div className="border-border relative mb-6 overflow-hidden rounded-2xl border shadow-sm">
        <div className="from-primary via-primary-dark to-primary h-1 w-full bg-gradient-to-r" />

        <div className="p-4 md:p-5">
          {/* Filter heading */}

          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Filter size={18} />
            </div>

            <div>
              <h4 className="text-text text-sm font-semibold md:text-base">
                Campaign Filter
              </h4>

              <p className="text-text-secondary mt-0.5 text-xs">
                Choose year, month and campaign
              </p>
            </div>
          </div>

          {/* Filters */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* YEAR */}

            <div>
              <label className="text-text mb-2 block text-xs font-semibold">
                Year
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />

                <select
                  value={selectedYear}
                  onChange={(e) =>
                    handleYearChange(e.target.value)
                  }
                  className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4"
                >
                  <option value="">Select Year</option>

                  {years.map((year) => (
                    <option
                      key={`year-${year}`}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
            </div>

            {/* MONTH */}

            <div>
              <label className="text-text mb-2 block text-xs font-semibold">
                Month
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />

                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    handleMonthChange(e.target.value)
                  }
                  disabled={!selectedYear}
                  className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Month</option>

                  {months.map((month) => (
                    <option
                      key={`month-${selectedYear}-${month}`}
                      value={month}
                    >
                      {month}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
            </div>

            {/* CAMPAIGN */}

            <div>
              <label className="text-text mb-2 block text-xs font-semibold">
                Campaign
              </label>

              <div className="relative">
                <Layers3
                  size={17}
                  className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />

                <select
                  value={selectedCampaignId}
                  onChange={(e) =>
                    handleCampaignChange(e.target.value)
                  }
                  disabled={!selectedMonth}
                  className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Campaign</option>

                  {campaignOptions.map((campaign) => {
                    const campaignId = getId(campaign);

                    if (!campaignId) {
                      return null;
                    }

                    return (
                      <option
                        key={`campaign-${campaignId}`}
                        value={campaignId}
                      >
                        {campaign.name}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown
                  size={17}
                  className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
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
            teams={
              new Set(
                selectedData
                  .map((item) => item?.teamNumber)
                  .filter(
                    (number) =>
                      number !== null &&
                      number !== undefined &&
                      number !== "",
                  ),
              ).size
            }
            recorded={selectedData.length}
            covered={
              selectedData.filter(
                (item) =>
                  item?.coveredDate ||
                  item?.vaccinationStatus === "covered",
              ).length
            }
          />

          {/* UC */}

          <div className="border-border bg-surface mb-5 flex items-center gap-3 rounded-xl border px-4 py-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Layers3 size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-text-secondary text-xs">
                Union Council
              </p>

              <p className="text-text truncate text-sm font-semibold">
                {unionCouncilName}
              </p>
            </div>
          </div>

          {/* Team summary */}

          <ZerodoseTeamSummary
            data={selectedData}
            title="Previous Campaign Zerodose"
            description="Team-wise and individual Zerodose records for the selected campaign."
          />
        </>
      )}
    </section>
  );
}