"use client";

import { useEffect, useState } from "react";

import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
import ZerodoseStats from "@/components/worker/ZerodoseStats";
import WorkerActions from "@/components/worker/WorkerActions";
import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

import { getCurrentCampaign } from "@/api/campaignApi";

export default function Page() {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCurrentCampaign = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCurrentCampaign();

        // console.log("Worker current campaign response:", response);

        if (cancelled) {
          return;
        }

        const currentCampaign = response?.data?.currentCampaign || null;

        setCampaign(currentCampaign);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Worker current campaign error:", error);
        console.error("API response:", error?.response?.data);

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

  return (
    <div className="min-h-full">
      {/* {error && (
        <div className="border-border bg-surface mb-5 rounded-xl border p-4">
          {" "}
          <p className="text-text-secondary text-sm">{error}</p>{" "}
        </div>
      )}

      <CurrentCampaignCard campaign={campaign} loading={loading} /> */}

      <ZerodoseStats />

      <WorkerActions campaign={campaign} />

      <ZerodoseCampaignSection
        // activeTab="current"
        // onTabChange={() => {}}
        // currentCampaign={campaign}
        // loadingCampaign={loading}
      />
    </div>
  );
}
