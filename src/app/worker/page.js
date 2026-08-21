"use client";

import { useEffect, useMemo, useState } from "react";

import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
import ZerodoseStats from "@/components/worker/ZerodoseStats";
import WorkerActions from "@/components/worker/WorkerActions";
import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

import { getZerodoses } from "@/api/zerodoseApi";
import { getCampaigns } from "@/api/campaignApi";

export default function Page() {
  const [campaign, setCampaign] = useState(null);
  const [zerodoses, setZerodoses] = useState([]);

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingZerodose, setLoadingZerodose] = useState(true);

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  const [previousZerodoses, setPreviousZerodoses] = useState([]);

  // ============================================================
  // Campaign
  // ============================================================

  const loadCampaign = async () => {
    try {
      setLoadingCampaign(true);
      setError("");

      const response = await getCampaigns({
        status: "current",
        page: 1,
        limit: 1,
      });

      const campaigns = response?.data || [];

      setCampaign(campaigns[0] || null);
    } catch (error) {
      console.error("Get current campaign error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load current campaign.",
      );
    } finally {
      setLoadingCampaign(false);
    }
  };

  // ============================================================
  // Zerodose
  // ============================================================

  const loadZerodose = async () => {
    try {
      setLoadingZerodose(true);

      const response = await getZerodoses({
        page: 1,
        limit: 50,
        sortBy: "recordDate",
        sortOrder: "desc",
      });

      setZerodoses(response?.data || []);
    } catch (error) {
      console.error("Get worker zerodose error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load zerodose records.",
      );
    } finally {
      setLoadingZerodose(false);
    }
  };

  useEffect(() => {
    loadCampaign();
    loadZerodose();
  }, []);

  // ============================================================
  // Current Zerodose
  // ============================================================

  const currentZerodoses = useMemo(() => {
    if (!campaign) {
      return zerodoses;
    }

    if (!campaign.startDate) {
      return zerodoses;
    }

    const start = new Date(campaign.startDate);

    const end = campaign.endDate ? new Date(campaign.endDate) : new Date();

    end.setHours(23, 59, 59, 999);

    return zerodoses.filter((item) => {
      if (!item.recordDate) return false;

      const recordDate = new Date(item.recordDate);

      return recordDate >= start && recordDate <= end;
    });
  }, [campaign, zerodoses]);

  // ============================================================
  // Statistics
  // ============================================================

  const totalZerodose = currentZerodoses.length;

  const visitedZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "visited",
  ).length;

  const coveredZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "covered",
  ).length;

  const recordedZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "recorded",
  ).length;

  // ============================================================
  // Helpers
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (item) => {
    if (item.vaccinationStatus === "covered") {
      return {
        label: "Covered",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (item.vaccinationStatus === "visited") {
      return {
        label: "Visited",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      };
    }

    return {
      label: "Recorded",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    };
  };

  // ============================================================
  // Refresh
  // ============================================================

  const handleRefresh = async () => {
    await Promise.all([loadCampaign(), loadZerodose()]);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full">
      
      {error && (
        <div className="border-border bg-surface mb-5 flex items-center justify-between gap-3 rounded-xl border p-4">
          <p className="text-text-secondary text-sm">{error}</p>

          <button
            type="button"
            onClick={handleRefresh}
            className="text-primary flex shrink-0 items-center gap-2 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <CurrentCampaignCard
        campaign={campaign}
        loading={loadingCampaign}
        formatDate={formatDate}
      />

      <ZerodoseStats
        total={totalZerodose}
        recorded={recordedZerodose}
        visited={visitedZerodose}
        covered={coveredZerodose}
        loading={loadingZerodose}
      />

      <WorkerActions campaign={campaign} />

      <ZerodoseCampaignSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentZerodoses={currentZerodoses}
        previousZerodoses={previousZerodoses}
        loading={loadingZerodose}
        onRefresh={handleRefresh}
        getStatus={getStatus}
        formatDate={formatDate}
      />
    </div>
  );
}
