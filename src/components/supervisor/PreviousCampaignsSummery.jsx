

"use client";

import { Layers3 } from "lucide-react";

import CampaignHeader from "./CampaignHeader";
import SupervisorsTable from "../ucmo/SupervisorsTable";
import ZerodoseTable from "./ZerodoseTable";
import CampaignFilter from "../campaign/CampaignFilter";

export default function PreviousCampaignsSummery({
campaigns = [],
selectedCampaign = null,
data = [],
total = {
numberOfTeams: 0,
recordCount: 0,
visitCount: 0,
coveredCount: 0,
},
loading = false,
onCampaignSelect,
mode = null,
}) {
// ============================================================
// DETERMINE VIEW
// ============================================================

const isSupervisor = mode === "supervisor";

return ( <section>
{/* ======================================================
HEADER
====================================================== */}


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
          Select a campaign to view{" "}
          {isSupervisor
            ? "team-wise"
            : "supervisor-wise"}{" "}
          Zerodose records.
        </p>
      </div>
    </div>
  </div>

  {/* ======================================================
      CAMPAIGN FILTER
  ====================================================== */}

  <CampaignFilter
    campaigns={campaigns}
    onCampaignSelect={onCampaignSelect}
  />

  {/* ======================================================
      LOADING
  ====================================================== */}

  {selectedCampaign && loading && (
    <div className="border-border bg-surface mt-4 rounded-2xl border p-8 text-center">
      <div className="border-border border-t-primary mx-auto h-7 w-7 animate-spin rounded-full border-2" />

      <p className="text-text-secondary mt-3 text-sm">
        Loading campaign data...
      </p>
    </div>
  )}

  {/* ======================================================
      SELECTED CAMPAIGN
  ====================================================== */}

  {selectedCampaign && !loading && data.length > 0 && (
    <>
      {/* ==================================================
          CAMPAIGN HEADER
      ================================================== */}

      <CampaignHeader
        campaign={selectedCampaign}
        label="PREVIOUS CAMPAIGN"
        teams={Number(total?.numberOfTeams || 0)}
        recorded={Number(total?.recordCount || 0)}
        visited={Number(total?.visitCount || 0)}
        covered={Number(total?.coveredCount || 0)}
      />

      {/* ==================================================
          SECTION HEADING
      ================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-text text-base font-semibold md:text-lg">
            Previous Campaign Zerodose
          </h3>

          <p className="text-text-secondary mt-1 text-xs">
            {isSupervisor
              ? "Team-wise Zerodose record for selected campaign"
              : "Supervisor-wise Zerodose record for selected campaign"}
          </p>
        </div>

        <span className="text-text-secondary text-xs">
          {Number(total?.numberOfTeams || 0)} Teams
        </span>
      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      {isSupervisor ? (
        <ZerodoseTable data={data} />
      ) : (
        <SupervisorsTable data={data} />
      )}
    </>
  )}

  {/* ======================================================
      NO DATA
  ====================================================== */}

  {selectedCampaign && !loading && data.length === 0 && (
    <div className="border-border bg-surface mt-4 rounded-2xl border p-6 text-center">
      <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
        <Layers3 size={22} />
      </div>

      <p className="text-text font-medium">
        No Zerodose records found.
      </p>

      <p className="text-text-secondary mt-1 text-sm">
        No records are available for this campaign.
      </p>
    </div>
  )}
</section>


);
}
