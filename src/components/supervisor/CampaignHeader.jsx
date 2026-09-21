

"use client";

import { formatDate } from "@/lib/formatDate";
import { CalendarDays } from "lucide-react";

export default function CampaignHeader({
  campaign,
  recorded = 0,
  visited = 0,
  covered = 0,
}) {
  if (!campaign) return null;

  const stats = [
    {
      label: "Total Recorded",
      value: recorded,
    },
    {
      label: "Total Visited",
      value: visited,
    },
    {
      label: "Total Covered",
      value: covered,
    },
  ];

  return (
    <div className="bg-primary border-border relative mb-5 overflow-hidden rounded-2xl border shadow-sm dark:bg-transparent">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Campaign Information */}
        <div className="min-w-0">
          <div className="flex  justify-between flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {campaign.name}
            </h2>

            <div className="flex items-center gap-2 text-sm text-white/80">
              <CalendarDays size={15} />

              <span className="whitespace-nowrap">
                {formatDate(campaign.startDate)} -{" "}
                {formatDate(campaign.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid w-full grid-cols-3 gap-2.5 sm:gap-3 lg:w-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-h-[50px] min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/15 sm:min-h-[82px] sm:min-w-[112px] sm:px-4"
            >
              <p className="text-[10px] leading-tight font-medium text-white/65 sm:text-xs">
                {stat.label}
              </p>

              <p className="mt-2 text-lg leading-none font-bold tracking-tight text-white sm:text-2xl">
                {Number(stat.value || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-white/30" />
    </div>
  );
}
