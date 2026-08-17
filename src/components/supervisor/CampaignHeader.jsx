"use client";

import { CalendarDays } from "lucide-react";

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CampaignHeader({
  campaign,
  label = "CURRENT CAMPAIGN",
  recorded = 0,
  covered = 0,
  teams = 0,
}) {
  if (!campaign) return null;

  const isCurrent = label === "CURRENT CAMPAIGN";

  return (
    <div className="bg-primary mb-5 overflow-hidden rounded-2xl p-5 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Campaign Information */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white" />

            <span className="text-xs font-medium text-white/80">{label}</span>
          </div>

          <h2 className="text-xl font-bold text-white md:text-2xl">
            {campaign.name}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
            <CalendarDays size={15} />

            <span>
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </span>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="flex gap-3">
          {/* First Stat */}
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-xs text-white/70">
              {isCurrent ? "Total Teams" : "Recorded"}
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              {isCurrent ? teams : recorded}
            </p>
          </div>

          {/* Second Stat */}
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-xs text-white/70">
              {isCurrent ? "Total Zerodose" : "Covered"}
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              {isCurrent ? recorded : covered}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
