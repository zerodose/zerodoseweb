
"use client";

import { useEffect, useState } from "react";

import CampaignTabs from "@/components/supervisor/CampaignTabs";
import VaccinatorCurrentCampaignSummery from "@/components/vaccinator/VaccinatorCurrentCampaignSummery";
import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

import { getUCMOSupervisorSummary } from "@/api/dashboardApi";
import {
getCampaignFilter,
getCurrentCampaign,
} from "@/api/campaignApi";

export default function UCMOCampaignSection({ authUser }) {
const [activeTab, setActiveTab] = useState("current");

const [campaigns, setCampaigns] = useState([]);
const [currentCampaign, setCurrentCampaign] = useState(null);

const [zerodoseData, setZerodoseData] = useState([]);
const [previousZerodoseData, setPreviousZerodoseData] =
useState([]);

const [selectedPreviousCampaignId, setSelectedPreviousCampaignId] =
useState("");

const [loading, setLoading] = useState(true);
const [previousLoading, setPreviousLoading] = useState(false);

// ============================================================
// GET CURRENT CAMPAIGN
// ============================================================

useEffect(() => {
let cancelled = false;


const loadCurrentCampaign = async () => {
  try {
    setLoading(true);

    const response = await getCurrentCampaign();

    if (cancelled) {
      return;
    }

    const data = response?.data || {};
    const campaign = data?.currentCampaign || null;

    setCurrentCampaign(campaign);

    if (!campaign?._id) {
      setZerodoseData([]);
      setLoading(false);

      return;
    }
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error("Get current campaign error:", error);

    setCurrentCampaign(null);
    setZerodoseData([]);
    setLoading(false);
  }
};

loadCurrentCampaign();

return () => {
  cancelled = true;
};


}, []);

// ============================================================
// GET CURRENT UCMO SUPERVISOR SUMMARY
// ============================================================

useEffect(() => {
let cancelled = false;


const loadSupervisorSummary = async () => {
  if (!currentCampaign?._id) {
    return;
  }

  try {
    setLoading(true);

    const response =
      await getUCMOSupervisorSummary(
        currentCampaign._id,
      );

    if (cancelled) {
      return;
    }

    const data = response?.data || {};

    console.log("Current UCMO Summary ==>", data);

    setZerodoseData(
      Array.isArray(data?.supervisors)
        ? data.supervisors
        : [],
    );
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error(
      "Get current UCMO supervisor summary error:",
      error,
    );

    setZerodoseData([]);
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
};

loadSupervisorSummary();

return () => {
  cancelled = true;
};


}, [currentCampaign]);

// ============================================================
// TAB CHANGE
// ============================================================

const handleTabChange = async (tab) => {
setActiveTab(tab);


if (tab !== "previous") {
  return;
}

// Campaigns already loaded
if (campaigns.length > 0) {
  return;
}

try {
  setLoading(true);

  const response = await getCampaignFilter();

  const campaignList = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  setCampaigns(campaignList);
} catch (error) {
  console.error(
    "Get previous campaigns error:",
    error,
  );

  setCampaigns([]);
} finally {
  setLoading(false);
}


};

// ============================================================
// PREVIOUS CAMPAIGN SELECT
// ============================================================

const handlePreviousCampaignSelect = async (campaignId) => {
if (!campaignId) {
setSelectedPreviousCampaignId("");
setPreviousZerodoseData([]);


  return;
}

setSelectedPreviousCampaignId(campaignId);
setPreviousZerodoseData([]);
setPreviousLoading(true);

try {
  const response =
    await getUCMOSupervisorSummary(campaignId);

  const data = response?.data || {};

  console.log(
    "Previous UCMO Summary ==>",
    data,
  );

  setPreviousZerodoseData(
    Array.isArray(data?.supervisors)
      ? data.supervisors
      : [],
  );
} catch (error) {
  console.error(
    "Get previous UCMO supervisor summary error:",
    error,
  );

  setPreviousZerodoseData([]);
} finally {
  setPreviousLoading(false);
}


};

// ============================================================
// SELECTED PREVIOUS CAMPAIGN
// ============================================================

const selectedPreviousCampaign =
campaigns.find(
(campaign) =>
String(campaign?._id) ===
String(selectedPreviousCampaignId),
) || null;

// ============================================================
// UI
// ============================================================

return ( <div className="w-full space-y-6">
{/* ======================================================
CAMPAIGN TABS
====================================================== */}


  <CampaignTabs
    activeTab={activeTab}
    setActiveTab={handleTabChange}
  />

  {/* ======================================================
      CURRENT CAMPAIGN
  ====================================================== */}

  {activeTab === "current" && (
    <VaccinatorCurrentCampaignSummery
      campaign={currentCampaign}
      data={zerodoseData}
      loading={loading}
      authUser={authUser}
    />
  )}

  {/* ======================================================
      PREVIOUS CAMPAIGNS
  ====================================================== */}

  {activeTab === "previous" && (
    <PreviousCampaignsSummery
      campaigns={campaigns}
      selectedCampaign={selectedPreviousCampaign}
      data={previousZerodoseData}
      loading={previousLoading}
      onCampaignSelect={
        handlePreviousCampaignSelect
      }
   
    />
  )}
</div>


);
}
