"use client";

import { CalendarDays } from "lucide-react";

export default function CurrentCampaignCard({
  campaign,
  loading,
  formatDate,
}) {
  return (
    <section className="mb-6">
      <div className="bg-primary relative overflow-hidden rounded-2xl p-5 shadow-sm md:p-6">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 text-white/80">
            <CalendarDays className="h-5 w-5" />

            <span className="text-sm font-medium">
              Current Campaign
            </span>
          </div>

          {loading ? (
            <div className="h-7 w-48 animate-pulse rounded bg-white/20" />
          ) : campaign ? (
            <>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                {campaign.name}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                <span>{formatDate(campaign.startDate)}</span>

                <span className="text-white/50">→</span>

                <span>{formatDate(campaign.endDate)}</span>
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white">
                No Active Campaign
              </h2>

              <p className="mt-1 text-sm text-white/80">
                There is currently no active campaign.
              </p>
            </div>
          )}
        </div>

        <CalendarDays className="absolute -right-5 -bottom-8 h-36 w-36 text-white/10" />
      </div>
    </section>
  );
}