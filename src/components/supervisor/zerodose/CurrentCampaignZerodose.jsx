"use client";

import { CalendarDays, Layers3 } from "lucide-react";

import CampaignHeader from "@/components/supervisor/CampaignHeader";
import ZerodoseTeamSummary from "./ZerodoseTeamSummary";

export default function CurrentCampaignZerodose({
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