

"use client";

import CampaignHeader from "./CampaignHeader";
import SupervisorsTable from "../ucmo/SupervisorsTable";
import ZerodoseTable from "./ZerodoseTable";

export default function CurrentCampaignSummery({
campaign,
data = [],
total = {
numberOfTeams: 0,
recordCount: 0,
visitCount: 0,
coveredCount: 0,
},
loading,
mode = null,
}) {
// ============================================================
// DETERMINE VIEW
// ============================================================

const isSupervisor = mode === "supervisor";

// ============================================================
// NO CURRENT CAMPAIGN
// ============================================================

if (!campaign) {
return ( <section> <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl"> <p className="text-text font-medium">
Current campaign not found. </p>


      <p className="text-text-secondary mt-1 text-sm">
        No active campaign data is available.
      </p>
    </div>
  </section>
);


}

// ============================================================
// RENDER
// ============================================================

return ( <section>
{/* ========================================================
CAMPAIGN HEADER
======================================================== */}


  <CampaignHeader
    campaign={campaign}
    label="CURRENT CAMPAIGN"
    teams={Number(total?.numberOfTeams || 0)}
    recorded={Number(total?.recordCount || 0)}
    visited={Number(total?.visitCount || 0)}
    covered={Number(total?.coveredCount || 0)}
  />

  {/* ========================================================
      SECTION HEADING
  ======================================================== */}

  <div className="mb-3 flex items-center justify-between">
    <div>
      <h3 className="text-text text-base font-semibold md:text-lg">
        Current Zerodose
      </h3>

      <p className="text-text-secondary mt-1 text-xs">
        {isSupervisor
          ? "Team-wise Zerodose record for current campaign"
          : "Supervisor-wise Zerodose record for current campaign"}
      </p>
    </div>

    <span className="text-text-secondary text-xs">
      {Number(total?.numberOfTeams || 0)} Teams
    </span>
  </div>

  {/* ========================================================
      TABLE
  ======================================================== */}

  {isSupervisor ? (
    <ZerodoseTable
      data={data}
      loading={loading}
    />
  ) : (
    <SupervisorsTable
      data={data}
      loading={loading}
    />
  )}
</section>


);
}
