"use client";

import { ChevronDown } from "lucide-react";

export default function CampaignFilters({
  previousCampaigns,
  selectedYear,
  selectedMonth,
  selectedCampaign,
  setSelectedYear,
  setSelectedMonth,
  setSelectedCampaign,
}) {
  const years = [...new Set(previousCampaigns.map((campaign) => campaign.year))]
    .sort()
    .reverse();

  const months = previousCampaigns.filter(
    (campaign) => campaign.year === selectedYear,
  );

  const campaigns = previousCampaigns.filter(
    (campaign) =>
      campaign.year === selectedYear && campaign.month === selectedMonth,
  );

  return (
    <div className="bg-surface border-border mb-5 rounded-xl border p-4 md:rounded-2xl md:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Year */}
        <div>
          <label className="text-text mb-1.5 block text-xs font-medium">
            Year
          </label>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => {
                const year = e.target.value;

                setSelectedYear(year);

                const firstCampaign = previousCampaigns.find(
                  (campaign) => campaign.year === year,
                );

                if (firstCampaign) {
                  setSelectedMonth(firstCampaign.month);
                  setSelectedCampaign(firstCampaign.id.toString());
                }
              }}
              className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
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

        {/* Month */}
        <div>
          <label className="text-text mb-1.5 block text-xs font-medium">
            Month
          </label>

          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => {
                const month = e.target.value;

                setSelectedMonth(month);

                const campaign = previousCampaigns.find(
                  (item) => item.year === selectedYear && item.month === month,
                );

                if (campaign) {
                  setSelectedCampaign(campaign.id.toString());
                }
              }}
              className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
            >
              {months.map((campaign) => (
                <option key={campaign.month} value={campaign.month}>
                  {campaign.month}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            />
          </div>
        </div>

        {/* Campaign */}
        <div>
          <label className="text-text mb-1.5 block text-xs font-medium">
            Campaign
          </label>

          <div className="relative">
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
            >
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
