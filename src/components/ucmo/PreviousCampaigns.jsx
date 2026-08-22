"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  History,
  Package,
  Users,
} from "lucide-react";
import { useState } from "react";

import SupervisorCard from "./SupervisorCard";
import { formatDate } from "@/lib/formatDate";

export default function PreviousCampaigns({
  campaigns = [],
  loading = false,
  
}) {
  const [expandedCampaigns, setExpandedCampaigns] = useState({});

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-surface border-border h-24 animate-pulse rounded-2xl border"
          />
        ))}
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <div className="bg-surface border-border rounded-2xl border p-10 text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
          <History size={24} />
        </div>

        <h3 className="text-text text-base font-semibold">
          No Previous Campaigns
        </h3>

        <p className="text-text-secondary mt-1 text-sm">
          No previous campaign records are available.
        </p>
      </div>
    );
  }

  const toggleCampaign = (campaignId) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  return (
    <section>
      <div className="mb-5">
        <h3 className="text-text text-base font-semibold md:text-lg">
          Campaign History
        </h3>

        <p className="text-text-secondary mt-1 text-xs md:text-sm">
          Previous campaigns with their supervisors and Zerodose records.
        </p>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const campaignId =
            campaign?._id?.toString() || campaign?.id?.toString();

          const expanded = !!expandedCampaigns[campaignId];

          const supervisors = campaign.supervisors || [];

          const totalZerodose = supervisors.reduce(
            (total, supervisor) => total + (supervisor.zerodose?.length || 0),
            0,
          );

          return (
            <div
              key={campaignId}
              className="bg-surface border-border overflow-hidden rounded-2xl border"
            >
              <button
                type="button"
                onClick={() => toggleCampaign(campaignId)}
                className="hover:bg-background flex w-full items-center justify-between gap-4 p-4 text-left transition md:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    <History size={20} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-text truncate text-sm font-semibold md:text-base">
                      {campaign.name || "Unnamed Campaign"}
                    </h4>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-text-secondary flex items-center gap-1 text-[11px]">
                        <CalendarDays size={12} />
                        {formatDate(campaign.startDate)} -{" "}
                        {formatDate(campaign.endDate)}
                      </span>

                      <span className="text-text-secondary hidden sm:inline">
                        •
                      </span>

                      <span className="text-text-secondary flex items-center gap-1 text-[11px]">
                        <Users size={11} />
                        {supervisors.length}
                      </span>

                      <span className="text-text-secondary hidden sm:inline">
                        •
                      </span>

                      <span className="text-text-secondary flex items-center gap-1 text-[11px]">
                        <Package size={11} />
                        {totalZerodose}
                      </span>
                    </div>
                  </div>
                </div>

                {expanded ? (
                  <ChevronDown
                    size={20}
                    className="text-text-secondary shrink-0"
                  />
                ) : (
                  <ChevronRight
                    size={20}
                    className="text-text-secondary shrink-0"
                  />
                )}
              </button>

              {expanded && (
                <div className="border-border border-t p-3 md:p-4">
                  {supervisors.length === 0 ? (
                    <div className="bg-background border-border rounded-xl border p-5 text-center">
                      <Users
                        size={25}
                        className="text-text-secondary mx-auto mb-2"
                      />

                      <p className="text-text text-sm font-medium">
                        No Supervisors
                      </p>

                      <p className="text-text-secondary mt-1 text-xs">
                        No supervisor records are available for this campaign.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {supervisors.map((supervisor) => {
                        const supervisorId =
                          supervisor?._id?.toString() ||
                          supervisor?.id?.toString();

                        return (
                          <SupervisorCard
                            key={supervisorId}
                            supervisor={supervisor}
                            formatDate={formatDate}
                            previous
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
