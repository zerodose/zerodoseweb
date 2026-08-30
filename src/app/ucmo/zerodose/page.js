"use client";

import { useEffect, useMemo, useState } from "react";

import { getCampaigns } from "@/api/campaignApi";
import { getZerodoses } from "@/api/zerodoseApi";
import { getUsers } from "@/api/userApi";
import { LucideSyringe } from "lucide-react";

import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
import CurrentCampaign from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
import PreviousCampaigns from "@/components/supervisor/zerodose/PreviousCampaigns";
import ZerodosePageSkeleton from "@/components/supervisor/zerodose/ZerodosePageSkeleton";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");

  const [campaigns, setCampaigns] = useState([]);
  const [zerodoses, setZerodoses] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // SAFE ID
  // ============================================================

  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      return value._id?.toString() || value.id?.toString() || null;
    }

    return value.toString();
  };

  // ============================================================
  // CAMPAIGN STATUS
  // ============================================================

  const getCampaignStatus = (campaign) => {
    if (!campaign?.startDate || !campaign?.endDate) {
      return "previous";
    }

    const now = new Date();

    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );

    const end = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );

    if (today < start) {
      return "upcoming";
    }

    if (today >= start && today <= end) {
      return "current";
    }

    return "previous";
  };

  // ============================================================
  // FETCH DATA
  // ============================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (!storedAuthUser?.id) {
          throw new Error("UCMO authentication data not found.");
        }

        const ucmoId = String(storedAuthUser.id);

        // --------------------------------------------------------
        // CAMPAIGNS
        // --------------------------------------------------------

        const campaignsResponse = await getCampaigns();

        if (!campaignsResponse?.success) {
          throw new Error(
            campaignsResponse?.message || "Failed to fetch campaigns.",
          );
        }

        setCampaigns(campaignsResponse.data || []);

        // --------------------------------------------------------
        // SUPERVISORS UNDER THIS UCMO
        // --------------------------------------------------------

        const supervisorsResponse = await getUsers({
          page: 1,
          limit: 100,
          designation: "supervisor",
          isActive: true,
          ucmo: ucmoId,
        });

        if (!supervisorsResponse?.success) {
          throw new Error(
            supervisorsResponse?.message || "Failed to fetch UCMO supervisors.",
          );
        }

        setSupervisors(supervisorsResponse.data || []);

        // --------------------------------------------------------
        // ZERODOSE
        // --------------------------------------------------------
        // Directly fetch Zerodose belonging to this UCMO.
        // This includes Zerodose from ALL supervisors
        // under the logged-in UCMO.

        let allZerodoses = [];

        let page = 1;
        let totalPages = 1;

        do {
          const zerodoseResponse = await getZerodoses({
            page,
            limit: 50,
            sortBy: "recordDate",
            sortOrder: "desc",
            ucmo: ucmoId,
          });

          if (!zerodoseResponse?.success) {
            throw new Error(
              zerodoseResponse?.message || "Failed to fetch Zerodose records.",
            );
          }

          const pageData = zerodoseResponse.data || [];

          allZerodoses = [...allZerodoses, ...pageData];

          totalPages = zerodoseResponse.pagination?.totalPages || 1;

          page += 1;
        } while (page <= totalPages);

        setZerodoses(allZerodoses);
      } catch (error) {
        console.error("UCMO Zerodose fetch error:", error);

        setError(error?.message || "Failed to load Zerodose data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // UCMO ZERODOSE DATA
  // ============================================================

  // No supervisor-specific filtering here.
  // The API already returns all Zerodose records
  // belonging to the logged-in UCMO.

  const ucmoZerodoses = useMemo(() => {
    return zerodoses;
  }, [zerodoses]);

  // ============================================================
  // NORMALIZED CAMPAIGNS
  // ============================================================

  const normalizedCampaigns = useMemo(() => {
    return campaigns.map((campaign) => ({
      ...campaign,
      campaignStatus: getCampaignStatus(campaign),
    }));
  }, [campaigns]);

  // ============================================================
  // CURRENT CAMPAIGN
  // ============================================================

  const currentCampaign = useMemo(() => {
    return (
      normalizedCampaigns.find(
        (campaign) => campaign.campaignStatus === "current",
      ) || null
    );
  }, [normalizedCampaigns]);

  // ============================================================
  // PREVIOUS CAMPAIGNS
  // ============================================================

  const previousCampaigns = useMemo(() => {
    return normalizedCampaigns
      .filter((campaign) => campaign.campaignStatus === "previous")
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();
        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });
  }, [normalizedCampaigns]);

  // ============================================================
  // CURRENT DATA
  // ============================================================

  const currentData = useMemo(() => {
    if (!currentCampaign) {
      return [];
    }

    const currentCampaignId = getId(currentCampaign);

    if (!currentCampaignId) {
      return [];
    }

    return ucmoZerodoses.filter((item) => {
      const itemCampaignId = getId(
        item?.campaign || item?.campaignId || item?.campaign?._id,
      );

      return (
        itemCampaignId && String(itemCampaignId) === String(currentCampaignId)
      );
    });
  }, [ucmoZerodoses, currentCampaign]);

  // ============================================================
  // PREVIOUS DATA
  // ============================================================

  const previousData = useMemo(() => {
    if (!previousCampaigns.length) {
      return [];
    }

    const previousIds = new Set(
      previousCampaigns.map((campaign) => getId(campaign)).filter(Boolean),
    );

    return ucmoZerodoses.filter((item) => {
      const itemCampaignId = getId(
        item?.campaign || item?.campaignId || item?.campaign?._id,
      );

      return itemCampaignId && previousIds.has(String(itemCampaignId));
    });
  }, [ucmoZerodoses, previousCampaigns]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <ZerodosePageSkeleton />;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-full">
      <ApprovalPageHeader
        title="Zerodose"
        description="View campaign-wise Zerodose records and team details"
        onBack={() => window.history.back()}
        rightContent={
          <div className="border-primary/20 bg-primary-light text-primary dark:border-primary/30 dark:bg-primary/10 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
            <LucideSyringe size={18} />

            <span>
              {currentData.length} {currentData.length === 1 ? "ZD" : "ZD"}
            </span>
          </div>
        }
      />

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ======================================================
          TABS
      ====================================================== */}

      <ZerodoseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ======================================================
          CURRENT
      ====================================================== */}

      {activeTab === "current" && (
        <CurrentCampaign campaign={currentCampaign} data={currentData} />
      )}

      {/* ======================================================
          PREVIOUS
      ====================================================== */}

      {activeTab === "previous" && (
        <PreviousCampaigns campaigns={previousCampaigns} data={previousData} />
      )}
    </div>
  );
}
