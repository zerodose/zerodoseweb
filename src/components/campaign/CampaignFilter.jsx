"use client";

import { Filter } from "lucide-react";

import Select from "../ui/Select";

export default function CampaignFilter({
  filter,
  title = "Campaign Filter",
  description = "Choose year, month and campaign",
}) {
  return (
    <div className="border-border relative mb-6 overflow-hidden rounded-2xl border shadow-sm">
      {/* Top accent */}
      <div className="from-primary via-primary-dark to-primary h-1 w-full bg-gradient-to-r" />

      <div className="p-4 md:p-5">
        {/* Filter heading */}
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

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Year */}
          <Select
            label="Year"
            name="year"
            value={filter.selectedYear}
            onChange={(event) => filter.handleYearChange(event.target.value)}
            options={filter.yearOptions}
            placeholder="Select Year"
          />

          {/* Month */}
          <Select
            label="Month"
            name="month"
            value={filter.selectedMonth}
            onChange={(event) => filter.handleMonthChange(event.target.value)}
            options={filter.monthOptions}
            placeholder="Select Month"
            disabled={!filter.selectedYear}
          />

          {/* Campaign */}
          <Select
            label="Campaign"
            name="campaign"
            value={filter.selectedCampaignId}
            onChange={(event) =>
              filter.handleCampaignChange(event.target.value)
            }
            options={filter.campaignSelectOptions}
            placeholder="Select Campaign"
            disabled={!filter.selectedMonth}
            searchable
            searchPlaceholder="Search campaign..."
          />
        </div>
      </div>
    </div>
  );
}
