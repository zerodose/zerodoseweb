
"use client";

import { useEffect, useState } from "react";

import CampaignTabs from "@/components/supervisor/CampaignTabs";
import CurrentCampaignSummery from "@/components/supervisor/CurrentCampaignSummery";
import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";
import { getSupervisorTeamSummary } from "@/api/dashboardApi";

export default function SupervisorCampaignSection({ authUser }) {
  const [activeTab, setActiveTab] = useState("current");

  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);

  const [zerodoseData, setZerodoseData] = useState([]);
  const [currentTotal, setCurrentTotal] = useState({
    numberOfTeams: 0,
    recordCount: 0,
    visitCount: 0,
    coveredCount: 0,
  });

  const [previousZerodoseData, setPreviousZerodoseData] = useState([]);
  const [previousTotal, setPreviousTotal] = useState({
    numberOfTeams: 0,
    recordCount: 0,
    visitCount: 0,
    coveredCount: 0,
  });

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

          setCurrentTotal({
            numberOfTeams: 0,
            recordCount: 0,
            visitCount: 0,
            coveredCount: 0,
          });

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

        setCurrentTotal({
          numberOfTeams: 0,
          recordCount: 0,
          visitCount: 0,
          coveredCount: 0,
        });

        setLoading(false);
      }
    };

    loadCurrentCampaign();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // GET CURRENT CAMPAIGN SUPERVISOR TEAM SUMMARY
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadSupervisorTeamSummary = async () => {
      if (!currentCampaign?._id) {
        return;
      }

      try {
        setLoading(true);

        const response = await getSupervisorTeamSummary(currentCampaign._id);

        if (cancelled) {
          return;
        }

        const data = response?.data || {};

        console.log("Current Supervisor Summary ==>", data);

        setZerodoseData(Array.isArray(data?.teams) ? data.teams : []);

        setCurrentTotal({
          numberOfTeams: Number(data?.total?.numberOfTeams || 0),
          recordCount: Number(data?.total?.recordCount || 0),
          visitCount: Number(data?.total?.visitCount || 0),
          coveredCount: Number(data?.total?.coveredCount || 0),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Get supervisor current team summary error:", error);

        setZerodoseData([]);

        setCurrentTotal({
          numberOfTeams: 0,
          recordCount: 0,
          visitCount: 0,
          coveredCount: 0,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSupervisorTeamSummary();

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
      console.error("Get previous campaigns error:", error);

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

      setPreviousTotal({
        numberOfTeams: 0,
        recordCount: 0,
        visitCount: 0,
        coveredCount: 0,
      });

      return;
    }

    setSelectedPreviousCampaignId(campaignId);
    setPreviousZerodoseData([]);

    setPreviousTotal({
      numberOfTeams: 0,
      recordCount: 0,
      visitCount: 0,
      coveredCount: 0,
    });

    setPreviousLoading(true);

    try {
      const response = await getSupervisorTeamSummary(campaignId);

      const data = response?.data || {};

      console.log("Previous Supervisor Summary ==>", data);

      setPreviousZerodoseData(Array.isArray(data?.teams) ? data.teams : []);

      setPreviousTotal({
        numberOfTeams: Number(data?.total?.numberOfTeams || 0),
        recordCount: Number(data?.total?.recordCount || 0),
        visitCount: Number(data?.total?.visitCount || 0),
        coveredCount: Number(data?.total?.coveredCount || 0),
      });
    } catch (error) {
      console.error("Get previous supervisor team summary error:", error);

      setPreviousZerodoseData([]);

      setPreviousTotal({
        numberOfTeams: 0,
        recordCount: 0,
        visitCount: 0,
        coveredCount: 0,
      });
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
        String(campaign?._id) === String(selectedPreviousCampaignId),
    ) || null;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full space-y-6">
      {/* ======================================================
CAMPAIGN TABS
====================================================== */}

      <CampaignTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* ======================================================
      CURRENT CAMPAIGN
  ====================================================== */}

      {activeTab === "current" && (
        <CurrentCampaignSummery
          campaign={currentCampaign}
          data={zerodoseData}
          total={currentTotal}
          loading={loading}
          mode={authUser?.designation}
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
          total={previousTotal}
          loading={previousLoading}
          onCampaignSelect={handlePreviousCampaignSelect}
          mode={authUser?.designation}
        />
      )}
    </div>
  );
}
