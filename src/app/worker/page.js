"use client";

import { useCallback, useEffect, useState } from "react";

import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
import ZerodoseStats from "@/components/worker/ZerodoseStats";
import WorkerActions from "@/components/worker/WorkerActions";
import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

import { getZerodoses } from "@/api/zerodoseApi";
import { getCampaigns } from "@/api/campaignApi";

export default function Page() {
  // ============================================================
  // STATE
  // ============================================================

  const [campaign, setCampaign] = useState(null);
  const [previousCampaigns, setPreviousCampaigns] = useState([]);

  const [zerodoses, setZerodoses] = useState([]);
  const [previousZerodoses, setPreviousZerodoses] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingZerodose, setLoadingZerodose] = useState(true);

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  const fetchWorkerData = useCallback(async () => {

    const campaignResponse = await getCampaigns({
      status: "current",
      page: 1,
      limit: 1,
    });

    console.log("📦 Current campaign response:", campaignResponse);

    const campaigns = Array.isArray(campaignResponse?.data)
      ? campaignResponse.data
      : [];

    const currentCampaign = campaigns[0] || null;

    console.log("🎯 Current campaign:", currentCampaign);

    // ----------------------------------------------------------
    // 2. No current campaign
    // ----------------------------------------------------------

    if (!currentCampaign?._id) {
      return {
        campaign: null,
        zerodoses: [],
        hasMore: false,
      };
    }

    // ----------------------------------------------------------
    // 3. Get zerodose records for current campaign
    // ----------------------------------------------------------

    console.log("🔄 Loading zerodose for campaign:", currentCampaign._id);

    const zerodoseResponse = await getZerodoses({
      page: 1,
      limit: 10,
      sortBy: "recordDate",
      sortOrder: "desc",
      campaign: currentCampaign._id,
      isActive: true,
    });

    console.log("📦 Zerodose response:", zerodoseResponse);

    const records = Array.isArray(zerodoseResponse?.data)
      ? zerodoseResponse.data
      : [];

    return {
      campaign: currentCampaign,
      zerodoses: records,
      hasMore: zerodoseResponse?.pagination?.hasNextPage ?? false,
    };
  }, []);

  // ============================================================
  // INITIAL LOAD
  //
  // React 19 friendly:
  // The effect does not synchronously call a function that
  // immediately performs setState.
  //
  // State updates happen only after the async request completes.
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        console.log("🔄 Loading worker page data...");

        const result = await fetchWorkerData();

        // Component may have unmounted while request was running.
        if (cancelled) {
          return;
        }

        // ------------------------------------------------------
        // Update campaign state
        // ------------------------------------------------------

        setCampaign(result.campaign);

        // ------------------------------------------------------
        // Update zerodose state
        // ------------------------------------------------------

        setZerodoses(result.zerodoses);
        setPage(1);
        setHasMore(result.hasMore);

        // ------------------------------------------------------
        // Loading complete
        // ------------------------------------------------------

        setLoadingCampaign(false);
        setLoadingZerodose(false);
        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("❌ Get worker page data error:", error);

        console.error("❌ API response:", error?.response?.data);

        setCampaign(null);
        setZerodoses([]);
        setPage(1);
        setHasMore(false);

        setError(
          error?.response?.data?.message ||
            error?.response?.data?.error?.message ||
            error?.message ||
            "Failed to load worker data.",
        );

        setLoadingCampaign(false);
        setLoadingZerodose(false);
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchWorkerData]);

  // ============================================================
  // LOAD MORE ZERODOSE
  // ============================================================

  const loadMoreZerodose = async () => {
    if (loadingMore || !hasMore || !campaign?._id) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = page + 1;

      console.log("🔄 Loading zerodose page:", nextPage);

      const response = await getZerodoses({
        page: nextPage,
        limit: 10,
        campaign: campaign._id,
        sortBy: "recordDate",
        sortOrder: "desc",
        isActive: true,
      });

      console.log("📦 Load more zerodose response:", response);

      const newRecords = Array.isArray(response?.data) ? response.data : [];

      setZerodoses((prev) => [...prev, ...newRecords]);

      setPage(nextPage);

      setHasMore(response?.pagination?.hasNextPage ?? false);
    } catch (error) {
      console.error("❌ Load more zerodose error:", error);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to load more zerodose records.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // ============================================================
  // CURRENT ZERODOSES
  // ============================================================

  const currentZerodoses = zerodoses;

  // ============================================================
  // ZERODOSE STATS
  // ============================================================

  const totalZerodose = currentZerodoses.length;

  const visitedZerodose = currentZerodoses.filter(
    (item) => item?.vaccinationStatus === "visited",
  ).length;

  const coveredZerodose = currentZerodoses.filter(
    (item) => item?.vaccinationStatus === "covered",
  ).length;

  const recordedZerodose = currentZerodoses.filter(
    (item) => item?.vaccinationStatus === "recorded",
  ).length;

  // ============================================================
  // STATUS FORMATTER
  // ============================================================

  const getStatus = (item) => {
    const status = String(item?.vaccinationStatus || "recorded").toLowerCase();

    if (status === "covered") {
      return {
        label: "Covered",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (status === "visited") {
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

  const handleRefresh = async () => {
    try {
      setError("");

      setLoadingCampaign(true);
      setLoadingZerodose(true);

      const result = await fetchWorkerData();

      // --------------------------------------------------------
      // Update campaign
      // --------------------------------------------------------

      setCampaign(result.campaign);

      // --------------------------------------------------------
      // Update zerodose
      // --------------------------------------------------------

      setZerodoses(result.zerodoses);
      setPage(1);
      setHasMore(result.hasMore);

      // --------------------------------------------------------
      // Loading complete
      // --------------------------------------------------------

      setLoadingCampaign(false);
      setLoadingZerodose(false);
    } catch (error) {
      console.error("❌ Refresh error:", error);

      console.error("❌ API response:", error?.response?.data);

      setCampaign(null);
      setZerodoses([]);
      setPage(1);
      setHasMore(false);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to refresh data.",
      );

      setLoadingCampaign(false);
      setLoadingZerodose(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full">
      {/* ======================================================
          ERROR
      ====================================================== */}

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

      {/* ======================================================
          CURRENT CAMPAIGN
      ====================================================== */}

      <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

      {/* ======================================================
          STATS
      ====================================================== */}

      <ZerodoseStats
        total={totalZerodose}
        recorded={recordedZerodose}
        visited={visitedZerodose}
        covered={coveredZerodose}
        loading={loadingZerodose}
      />

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <WorkerActions campaign={campaign} />

      {/* ======================================================
          CAMPAIGN SECTION
      ====================================================== */}

      <ZerodoseCampaignSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentZerodoses={currentZerodoses}
        previousZerodoses={previousZerodoses}
        loading={loadingZerodose}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMoreZerodose}
        onRefresh={handleRefresh}
        getStatus={getStatus}
        previousCampaigns={previousCampaigns}
      />
    </div>
  );
}
