"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getCampaigns } from "@/api/campaignApi";
import { getUCMOSummary } from "@/api/dashboardApi";

import VaccinatorSummaryCards from "@/components/vaccinator/VaccinatorSummaryCards";
import VaccinatorCurrentCampaignSummery from "@/components/vaccinator/VaccinatorCurrentCampaignSummery";
import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";
import CampaignTabs from "@/components/supervisor/CampaignTabs";
import VaccinatorActions from "@/components/vaccinator/VaccinatorActions";

export default function VaccinatorPage() {
  const router = useRouter();

  // ============================================================
  // AUTH USER
  // ============================================================

  const authUser = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedAuthUser = localStorage.getItem("authUser");

      if (!storedAuthUser) {
        return null;
      }

      return JSON.parse(storedAuthUser);
    } catch (error) {
      console.error("Failed to parse authUser:", error);
      return null;
    }
  }, []);

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [activeTab, setActiveTab] = useState("current");

  const [campaigns, setCampaigns] = useState([]);

  const [summary, setSummary] = useState({
    totalSupervisors: 0,
    activeTeams: 0,

    recordedZerodose: 0,
    visitedZerodose: 0,
    coveredZerodose: 0,

    supervisors: [],
    currentCampaign: null,
  });

  const [loading, setLoading] = useState(true);

  // ============================================================
  // INITIAL API LOAD
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadVaccinatorData = async () => {
      try {
        const [campaignsResponse, summaryResponse] = await Promise.all([
          getCampaigns(),
          getUCMOSummary(),
        ]);

        if (cancelled) {
          return;
        }

        console.log(
          "Vaccinator dashboard data fetched successfully.",
          campaignsResponse,
          summaryResponse,
        );

        const campaignData =
          campaignsResponse?.data?.campaigns || campaignsResponse?.data || [];

        const summaryData = summaryResponse?.data || {};

        setCampaigns(Array.isArray(campaignData) ? campaignData : []);

        setSummary({
          totalSupervisors: Number(summaryData?.totalSupervisors || 0),

          activeTeams: Number(summaryData?.activeTeams || 0),

          recordedZerodose: Number(summaryData?.recordedZerodose || 0),

          visitedZerodose: Number(summaryData?.visitedZerodose || 0),

          coveredZerodose: Number(summaryData?.coveredZerodose || 0),

          supervisors: Array.isArray(summaryData?.supervisors)
            ? summaryData.supervisors
            : [],

          currentCampaign: summaryData?.currentCampaign || null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch vaccinator dashboard data:", error);

        setCampaigns([]);

        setSummary({
          totalSupervisors: 0,
          activeTeams: 0,
          recordedZerodose: 0,
          visitedZerodose: 0,
          coveredZerodose: 0,
          supervisors: [],
          currentCampaign: null,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVaccinatorData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CAMPAIGN STATUS
  // ============================================================

  const normalizedCampaigns = useMemo(() => {
    const now = new Date();

    return campaigns.map((campaign) => {
      if (!campaign?.startDate || !campaign?.endDate) {
        return {
          ...campaign,
          campaignStatus: "unknown",
        };
      }

      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);

      let campaignStatus = "current";

      if (now < startDate) {
        campaignStatus = "upcoming";
      } else if (now > endDate) {
        campaignStatus = "previous";
      }

      return {
        ...campaign,
        campaignStatus,
      };
    });
  }, [campaigns]);

  // ============================================================
  // CURRENT CAMPAIGN
  // ============================================================

  const currentCampaign =
    summary.currentCampaign ||
    normalizedCampaigns.find(
      (campaign) => campaign.campaignStatus === "current",
    ) ||
    null;

  // ============================================================
  // PREVIOUS CAMPAIGNS
  // ============================================================

  const previousCampaigns = useMemo(() => {
    return normalizedCampaigns.filter(
      (campaign) => campaign.campaignStatus === "previous",
    );
  }, [normalizedCampaigns]);

  // ============================================================
  // CURRENT SUPERVISOR DATA
  // ============================================================

  const currentSupervisorData = useMemo(() => {
    if (!currentCampaign) {
      return [];
    }

    if (!Array.isArray(summary.supervisors)) {
      return [];
    }

    return summary.supervisors.map((supervisor) => ({
      ...supervisor,

      supervisorId: supervisor?.supervisorId || supervisor?._id || "",

      supervisorCode: supervisor?.supervisorCode || supervisor?.code || "-",

      supervisorName: supervisor?.supervisorName || supervisor?.name || "-",

      totalTeams: Number(supervisor?.totalTeams || 0),

      recorded: Number(supervisor?.recorded || 0),

      visited: Number(supervisor?.visited || 0),

      covered: Number(supervisor?.covered || 0),
    }));
  }, [currentCampaign, summary.supervisors]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full space-y-6">
      {/* ========================================================
          SUMMARY CARDS
      ======================================================== */}

      <VaccinatorSummaryCards
        recordedZerodose={summary.recordedZerodose}
        visitedZerodose={summary.visitedZerodose}
        coveredZerodose={summary.coveredZerodose}
      />

      <VaccinatorActions />
      {/* ========================================================
          CAMPAIGN TABS
      ======================================================== */}

      <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ========================================================
          CURRENT CAMPAIGN
      ======================================================== */}

      {activeTab === "current" && (
        <VaccinatorCurrentCampaignSummery
          campaign={currentCampaign}
          data={currentSupervisorData}
          loading={loading}
          authUser={authUser}

          activeTeams={summary.activeTeams}
          totalSupervisors={summary.totalSupervisors}

          recorded={summary.recordedZerodose}
          visited={summary.visitedZerodose}
          covered={summary.coveredZerodose}
        />
      )}

      {/* ========================================================
          PREVIOUS CAMPAIGNS
      ======================================================== */}

      {activeTab === "previous" && (
        <PreviousCampaignsSummery
          campaigns={previousCampaigns}
          data={[]}
          loading={loading}
        />
      )}
    </div>
  );
}
