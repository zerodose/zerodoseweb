"use client";

import { CalendarDays, Users, Package } from "lucide-react";

import SupervisorCard from "./SupervisorCard";
import { formatDate } from "@/lib/formatDate";

export default function CurrentCampaign({
  campaign,
  supervisors = [],
  loading = false,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-surface border-border h-36 animate-pulse rounded-2xl border" />

        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-surface border-border h-20 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="bg-surface border-border rounded-2xl border p-10 text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
          <CalendarDays size={24} />
        </div>

        <h3 className="text-text text-base font-semibold md:text-lg">
          No Current Campaign
        </h3>

        <p className="text-text-secondary mt-1 text-sm">
          There is currently no active campaign.
        </p>
      </div>
    );
  }

  const totalZerodose = supervisors.reduce(
    (total, supervisor) => total + (supervisor.zerodose?.length || 0),
    0,
  );

  return (
    <section>
      {/* Campaign Header */}
      <div className="bg-primary mb-6 overflow-hidden rounded-2xl p-5 shadow-sm md:p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />

              <span className="text-xs font-medium tracking-wide text-white/80">
                CURRENT CAMPAIGN
              </span>
            </div>

            <h2 className="text-xl font-bold text-white md:text-2xl">
              {campaign.name || "Current Campaign"}
            </h2>

            <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <CalendarDays size={15} />

              <span>
                {formatDate(campaign.startDate)} -{" "}
                {formatDate(campaign.endDate)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-28 rounded-xl bg-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-white/70">
                <Users size={14} />

                <p className="text-xs">Supervisors</p>
              </div>

              <p className="mt-1 text-lg font-bold text-white">
                {supervisors.length}
              </p>
            </div>

            <div className="min-w-28 rounded-xl bg-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-white/70">
                <Package size={14} />

                <p className="text-xs">Zerodose</p>
              </div>

              <p className="mt-1 text-lg font-bold text-white">
                {totalZerodose}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supervisors */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-text text-base font-semibold md:text-lg">
              Active Supervisors
            </h3>

            <p className="text-text-secondary mt-1 text-xs">
              Supervisors assigned to your UCMO.
            </p>
          </div>

          <span className="text-text-secondary shrink-0 text-xs">
            {supervisors.length} Supervisors
          </span>
        </div>

        {supervisors.length === 0 ? (
          <div className="bg-surface border-border rounded-2xl border p-8 text-center">
            <Users size={30} className="text-text-secondary mx-auto mb-3" />

            <p className="text-text text-sm font-medium">
              No active supervisors found
            </p>

            <p className="text-text-secondary mt-1 text-xs">
              No supervisors are currently assigned to this UCMO.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {supervisors.map((supervisor) => {
              const supervisorId =
                supervisor?._id?.toString() || supervisor?.id?.toString();

              return (
                <SupervisorCard
                  key={supervisorId}
                  supervisor={supervisor}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
