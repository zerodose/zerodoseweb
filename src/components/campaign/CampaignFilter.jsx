"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";

import Select from "../ui/Select";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CampaignFilter({
  campaigns = [],
  onCampaignSelect,
  title = "Campaign Filter",
  description = "Choose year, month and campaign",
}) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      return value?._id?.toString() || value?.id?.toString() || null;
    }

    return value.toString();
  };

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

  const yearOptions = useMemo(() => {
    const years = [
      ...new Set(
        uniqueCampaigns
          .map((campaign) => campaign?.year)
          .filter((year) => year !== null && year !== undefined && year !== ""),
      ),
    ].sort((a, b) => Number(b) - Number(a));

    return years.map((year) => ({
      value: String(year),
      label: String(year),
    }));
  }, [uniqueCampaigns]);

  const monthOptions = useMemo(() => {
    if (!selectedYear) {
      return [];
    }

    const months = [
      ...new Set(
        uniqueCampaigns
          .filter((campaign) => String(campaign?.year) === String(selectedYear))
          .map((campaign) => campaign?.month)
          .filter(
            (month) => month !== null && month !== undefined && month !== "",
          ),
      ),
    ].sort((a, b) => Number(b) - Number(a));

    return months.map((month) => ({
      value: String(month),
      label: MONTH_NAMES[Number(month) - 1] || String(month),
    }));
  }, [uniqueCampaigns, selectedYear]);

  const campaignSelectOptions = useMemo(() => {
    if (!selectedYear || !selectedMonth) {
      return [];
    }

    return uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) === String(selectedYear) &&
          String(campaign?.month) === String(selectedMonth),
      )
      .map((campaign) => {
        const campaignId = getId(campaign);

        if (!campaignId) {
          return null;
        }

        return {
          value: campaignId,
          label: campaign?.name || "Unnamed Campaign",
        };
      })
      .filter(Boolean);
  }, [uniqueCampaigns, selectedYear, selectedMonth]);

  const handleYearChange = (value) => {
    setSelectedYear(value);
    setSelectedMonth("");
    setSelectedCampaignId("");
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    setSelectedCampaignId("");
  };

  const handleCampaignChange = (value) => {
    setSelectedCampaignId(value);
  };

  const handleApplyFilter = () => {
    if (!selectedCampaignId) {
      return;
    }

    if (onCampaignSelect) {
      onCampaignSelect(selectedCampaignId);
    }
  };

  return (
    <div className="border-border relative mb-6 overflow-y-visible rounded-2xl border shadow-sm">
      <div className="from-primary via-primary-dark to-primary h-1 w-full bg-gradient-to-r" />

      <div className="p-4 md:p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Filter size={18} />
          </div>

          <div>
            <h4 className="text-text text-sm font-semibold md:text-base">
              {title}
            </h4>

            <p className="text-text-secondary mt-0.5 text-xs">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-y-visible md:grid-cols-4">
          <Select
            label="Select Year"
            name="year"
            value={selectedYear}
            onChange={(event) => handleYearChange(event.target.value)}
            options={yearOptions}
            placeholder="Select Year"
          />

          <Select
            label="Select Month"
            name="month"
            value={selectedMonth}
            onChange={(event) => handleMonthChange(event.target.value)}
            options={monthOptions}
            placeholder="Select Month"
            disabled={!selectedYear}
          />

          <Select
            label="Select Campaign"
            name="campaign"
            value={selectedCampaignId}
            onChange={(event) => handleCampaignChange(event.target.value)}
            options={campaignSelectOptions}
            placeholder="Select Campaign"
            disabled={!selectedMonth}
            searchable
            searchPlaceholder="Search campaign..."
          />

          <div>
            <span className="text-text min-h-5 z-50 mb-2 block text-sm font-medium">
              {/* Filter Button */}
            </span>
            <button
              type="button"
              onClick={handleApplyFilter}
              disabled={!selectedCampaignId}
              className="bg-primary hover disabled disabled disabled h-12 w-full rounded-lg px-5 text-sm font-medium text-white transition"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
