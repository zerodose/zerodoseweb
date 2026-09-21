
"use client";

import { Layers3 } from "lucide-react";

import CampaignHeader from "@/components/supervisor/CampaignHeader";
import ZerodoseTeamSummary from "./ZerodoseTeamSummary";
import CampaignFilter from "@/components/campaign/CampaignFilter";

export default function PreviousCampaignsZerodose({
  campaigns = [],
  selectedCampaign = null,
  data = [],
  summary = {
    recorded: 0,
    visited: 0,
    covered: 0,
  },
  total = {
    numberOfTeams: 0,
    recordCount: 0,
    visitCount: 0,
    coveredCount: 0,
  },
  vaccinationStatus,
  onFilterChange,
  onCampaignSelect,
  loading = false,
  noData = false,
  designation,
}) {
  return (
    <section>
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Layers3 size={18} />
          </div>
          <div>
            <h3 className="text-text text-base font-semibold md:text-lg">
              Previous Campaigns
            </h3>

            <p className="text-text-secondary mt-0.5 text-xs md:text-sm">
              Select a campaign to view team-wise and individual Zerodose
              records.
            </p>
          </div>
        </div>
      </div>
      <CampaignFilter
        campaigns={campaigns}
        onCampaignSelect={onCampaignSelect}
      />
      {selectedCampaign && (
        <>
          <CampaignHeader
            campaign={selectedCampaign}
            label="PREVIOUS CAMPAIGN"
            teams={Number(total?.numberOfTeams || 0)}
            recorded={Number(total?.recordCount || summary?.recorded || 0)}
            visited={Number(total?.visitCount || summary?.visited || 0)}
            covered={Number(total?.coveredCount || summary?.covered || 0)}
          />

          {noData ? (
            <div className="border-border bg-surface rounded-2xl border p-8 text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Layers3 size={22} />
              </div>

              <h3 className="text-text text-base font-semibold">
                No Zerodose Data
              </h3>

              <p className="text-text-secondary mt-1 text-sm">
                No Zerodose records were found for this campaign.
              </p>
            </div>
          ) : (
            <ZerodoseTeamSummary
              data={data}
              title="Previous Campaign Zerodose"
              description="Team-wise and individual Zerodose records for the selected campaign."
              vaccinationStatus={vaccinationStatus}
              onFilterChange={onFilterChange}
              loading={loading}
              designation={designation}
            />
          )}
        </>
      )}
    </section>
  );
}
