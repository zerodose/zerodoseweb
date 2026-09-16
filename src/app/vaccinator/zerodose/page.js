
"use client";

import { useEffect, useState } from "react";

import { getCampaigns, getCurrentCampaign } from "@/api/campaignApi";
import { getVaccinatorZerodose } from "@/api/zerodoseApi";
import { LucideSyringe } from "lucide-react";

import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";
import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");

  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [previousCampaigns, setPreviousCampaigns] = useState([]);

  const [zerodoses, setZerodoses] = useState([]);
  const [previousZerodoses, setPreviousZerodoses] = useState([]);

  const [unionCouncilName, setUnionCouncilName] = useState("-");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  const [vaccinationStatus, setVaccinationStatus] = useState({
    total: {
      recorded: 0,
      visited: 0,
      covered: 0,
    },
    teams: [],
  });

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
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // AUTH USER
        // --------------------------------------------------------

        let storedAuthUser = {};

        try {
          storedAuthUser = JSON.parse(localStorage.getItem("authUser") || "{}");
        } catch (error) {
          console.error("Failed to parse authUser:", error);
        }

        // --------------------------------------------------------
        // CURRENT CAMPAIGN
        // --------------------------------------------------------

        const currentCampaignResponse = await getCurrentCampaign();

        if (!currentCampaignResponse?.success) {
          throw new Error(
            currentCampaignResponse?.message ||
              "Failed to fetch current campaign.",
          );
        }

        const campaign = currentCampaignResponse?.data?.currentCampaign || null;

        if (cancelled) {
          return;
        }

        setCurrentCampaign(campaign);

        // --------------------------------------------------------
        // UNION COUNCIL
        // --------------------------------------------------------

        setUnionCouncilName(storedAuthUser?.unionCouncil?.name || "-");

        // --------------------------------------------------------
        // CURRENT CAMPAIGN ZERODOSE
        // --------------------------------------------------------

        if (campaign?._id) {
          const response = await getVaccinatorZerodose({
            campaignId: campaign._id,
            filter: "recorded",
          });

          if (!response?.success) {
            throw new Error(
              response?.message || "Failed to fetch current Zerodose.",
            );
          }

          console.log("Vaccinator Zerodose response:", response);

          const currentData = Array.isArray(response.data) ? response.data : [];

          if (!cancelled) {
            setZerodoses(currentData);

            setSummary(
              response.summary || {
                recorded: 0,
                visited: 0,
                covered: 0,
              },
            );

            setVaccinationStatus(
              response.vaccinationStatus || {
                recorded: 0,
                visited: 0,
                covered: 0,
              },
            );
          }
        } else {
          setZerodoses([]);

          setSummary({
            recorded: 0,
            visited: 0,
            covered: 0,
          });

          setVaccinationStatus({
            recorded: 0,
            visited: 0,
            covered: 0,
          });
        }

        // --------------------------------------------------------
        // PREVIOUS CAMPAIGNS
        // --------------------------------------------------------

        const campaignsResponse = await getCampaigns();

        if (!campaignsResponse?.success) {
          throw new Error(
            campaignsResponse?.message || "Failed to fetch campaigns.",
          );
        }

        const campaigns = Array.isArray(campaignsResponse.data)
          ? campaignsResponse.data
          : [];

        const previous = campaigns
          .map((campaign) => ({
            ...campaign,
            campaignStatus: getCampaignStatus(campaign),
          }))
          .filter((campaign) => campaign.campaignStatus === "previous")
          .sort((a, b) => {
            const dateA = new Date(a?.startDate || 0).getTime();

            const dateB = new Date(b?.startDate || 0).getTime();

            return dateB - dateA;
          });

        if (!cancelled) {
          setPreviousCampaigns(previous);
        }

        console.log("Vaccinator Zerodose data fetched successfully:", {
          currentCampaignId: campaign?._id || null,
          currentRecordedCount: campaign?._id
            ? Array.isArray(zerodoses)
              ? zerodoses.length
              : 0
            : 0,
          previousCampaigns: previous.length,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Vaccinator Zerodose fetch error:", error);

        setError(error?.message || "Failed to load Zerodose data.");

        setCurrentCampaign(null);
        setPreviousCampaigns([]);
        setZerodoses([]);
        setPreviousZerodoses([]);
        setUnionCouncilName("-");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CURRENT FILTER
  // ============================================================

  const handleCurrentFilterChange = async (filter) => {
    if (!currentCampaign?._id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getVaccinatorZerodose({
        campaignId: currentCampaign._id,
        filter,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch Zerodose data.");
      }

      setZerodoses(Array.isArray(response.data) ? response.data : []);

      setSummary(
        response.summary || {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
      );

      setVaccinationStatus(
        response.vaccinationStatus || {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
      );
    } catch (error) {
      console.error("Vaccinator current Zerodose filter error:", error);

      setError(error?.message || "Failed to load Zerodose data.");

      setZerodoses([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PREVIOUS CAMPAIGN DATA
  // ============================================================

  const handlePreviousCampaignSelect = async (
    campaignId,
    filter = "recorded",
  ) => {
    if (!campaignId) {
      setPreviousZerodoses([]);

      setSummary({
        recorded: 0,
        visited: 0,
        covered: 0,
      });

      setVaccinationStatus({
        total: {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
        supervisors: [],
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getVaccinatorZerodose({
        campaignId,
        filter,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch previous campaign Zerodose.",
        );
      }

      const previousData = Array.isArray(response.data) ? response.data : [];

      setPreviousZerodoses(previousData);

      setSummary(
        response.summary || {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
      );

      setVaccinationStatus(
        response.vaccinationStatus || {
          total: {
            recorded: 0,
            visited: 0,
            covered: 0,
          },
          teams: [],
        },
      );
    } catch (error) {
      console.error("Previous campaign Zerodose error:", error);

      setError(error?.message || "Failed to load previous campaign data.");

      setPreviousZerodoses([]);

      setSummary({
        recorded: 0,
        visited: 0,
        covered: 0,
      });

      setVaccinationStatus({
        total: {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
        supervisors: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL SKELETON
  // ============================================================

  // if (loading && !currentCampaign) {
  //   return <ZerodosePageSkeleton />;
  // }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative min-h-full">
      {/* Loader only while API is loading */}
      {/* {loading && <Loader text="Loading..." />} */}

      <ApprovalPageHeader
        title="Zerodose"
        description="View campaign-wise Zerodose records and team details"
        onBack={() => window.history.back()}
        rightContent={
          <div className="border-primary/10 bg-primary-light text-primary dark:bg-primary/10 dark:border-primary/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
            <LucideSyringe size={18} />
          </div>
        }
      />
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <ZerodoseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "current" && (
        <CurrentCampaignZerodose
          campaign={currentCampaign}
          data={zerodoses}
          unionCouncilName={unionCouncilName}
          loading={loading}
          summary={summary}
          vaccinationStatus={vaccinationStatus}
          onFilterChange={handleCurrentFilterChange}
        />
      )}
      {activeTab === "previous" && (
        <PreviousCampaignsZerodose
          campaigns={previousCampaigns}
          data={previousZerodoses}
          unionCouncilName={unionCouncilName}
          loading={loading}
          summary={summary}
          vaccinationStatus={vaccinationStatus}
          onCampaignSelect={handlePreviousCampaignSelect}
        />
      )}
    </div>
  );
}
