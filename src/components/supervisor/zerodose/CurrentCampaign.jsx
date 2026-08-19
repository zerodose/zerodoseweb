"use client";

import { CalendarDays, Layers3 } from "lucide-react";

import CampaignHeader from "@/components/supervisor/CampaignHeader";
import ZerodoseTeamSummary from "./ZerodoseTeamSummary";

export default function CurrentCampaign({
  campaign,
  data = [],
  unionCouncilName = "-",
}) {
  if (!campaign) {
    return (
      <section>
        <div className="border-border bg-surface rounded-2xl border p-8 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <CalendarDays size={22} />
          </div>

          <h3 className="text-text text-base font-semibold">
            No Current Campaign
          </h3>

          <p className="text-text-secondary mt-1 text-sm">
            There is no active campaign at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* ======================================================
          CAMPAIGN HEADER
      ====================================================== */}

      <CampaignHeader
        campaign={campaign}
        label="CURRENT CAMPAIGN"
        teams={
          new Set(
            data
              .map((item) => item?.teamNumber)
              .filter(
                (number) =>
                  number !== null &&
                  number !== undefined &&
                  number !== "",
              ),
          ).size
        }
        recorded={data.length}
        covered={
          data.filter(
            (item) =>
              item?.coveredDate ||
              item?.vaccinationStatus === "covered",
          ).length
        }
      />

      {/* ======================================================
          UC
      ====================================================== */}

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

      {/* ======================================================
          TEAM SUMMARY + DETAILS
      ====================================================== */}

      <ZerodoseTeamSummary
        data={data}
        title="Current Campaign Zerodose"
        description="Team-wise Zerodose records for the current campaign."
      />
    </section>
  );
}