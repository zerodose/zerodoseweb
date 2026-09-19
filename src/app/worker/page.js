"use client";

import { useEffect, useState } from "react";

import ZerodoseStats from "@/components/worker/ZerodoseStats";
import WorkerActions from "@/components/worker/WorkerActions";
import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";
import { getWorkerSummary } from "@/api/dashboardApi";
import { getCurrentCampaign } from "@/api/campaignApi";

export default function Page() {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  // ============================================================
  // GET CURRENT CAMPAIGN
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadCurrentCampaign = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCurrentCampaign();

        if (cancelled) {
          return;
        }

        const currentCampaign = response?.data?.currentCampaign || null;

        setCampaign(currentCampaign);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCampaign(null);

        setError(
          error?.response?.data?.message ||
            error?.response?.data?.error?.message ||
            error?.message ||
            "Failed to load current campaign.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCurrentCampaign();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // GET WORKER SUMMARY
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        setLoading(true);

        const response = await getWorkerSummary();

        if (cancelled) {
          return;
        }

        const data = response?.data || {};

        setSummary({
          recorded: Number(data?.recordCount || 0),
          visited: Number(data?.visitCount || 0),
          covered: Number(data?.coveredCount || 0),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("❌ Get worker summary error:", error);

        setSummary({
          recorded: 0,
          visited: 0,
          covered: 0,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full">
      <ZerodoseStats summary={summary} loading={loading} />
      <WorkerActions campaign={campaign} />
      <ZerodoseCampaignSection />
    </div>
  );
}
