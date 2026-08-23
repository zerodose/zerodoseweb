"use client";

import { useEffect, useMemo, useState } from "react";
import { getCampaigns } from "@/api/campaignApi";
import { getZerodoses } from "@/api/zerodoseApi";
import { getUsers } from "@/api/userApi";
import UCMOSummaryCards from "@/components/ucmo/UCMOSummaryCards";
import UCMOActions from "@/components/ucmo/UCMOActions";
import CampaignTabs from "@/components/ucmo/CampaignTabs";
import CurrentCampaign from "@/components/ucmo/CurrentCampaign";
import PreviousCampaigns from "@/components/ucmo/PreviousCampaigns";
import { UsersRound } from "lucide-react";
import ActionLinkButton from "@/components/admin/ui/ActionLinkButton";
import { getPendingUserApprovals } from "@/api/userApprovalsApi";

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");
  const [campaigns, setCampaigns] = useState([]);
  const [zerodoses, setZerodoses] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [authUnionCouncilId, setAuthUnionCouncilId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // GET ID
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
  // FORMAT DATE
  // ============================================================

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
  // FETCH UCMO DATA
  // ============================================================

  useEffect(() => {
    const fetchUCMOData = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // AUTH
        // --------------------------------------------------------

        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (!storedAuthUser?.id) {
          throw new Error("UCMO authentication data not found.");
        }

        const ucmoId = String(storedAuthUser.id);

        // --------------------------------------------------------
        // AUTH UNION COUNCIL
        // --------------------------------------------------------

        const authUnionCouncilId =
          getId(storedAuthUser.unionCouncil) ||
          getId(storedAuthUser.unionCouncilId);

        setAuthUnionCouncilId(authUnionCouncilId);

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
        // ACTIVE SUPERVISORS
        // --------------------------------------------------------

        const supervisorsResponse = await getUsers({
          page: 1,
          limit: 50,
          designation: "supervisor",
          status: "active",
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
        // ACTIVE USERS / TEAMS
        // --------------------------------------------------------

        if (authUnionCouncilId) {
          const usersResponse = await getUsers({
            page: 1,
            limit: 100,
            designation: "worker",
            isActive: true,
            unionCouncil: authUnionCouncilId,
          });

          if (!usersResponse?.success) {
            throw new Error(
              usersResponse?.message || "Failed to fetch active workers.",
            );
          }

          setActiveUsers(usersResponse.data || []);
        } else {
          setActiveUsers([]);
        }

        // --------------------------------------------------------
        // PENDING SUPERVISOR APPROVALS
        // --------------------------------------------------------

        // --------------------------------------------------------
        // PENDING APPROVALS
        // UCMO APPROVES:
        // supervisor + vaccinator + otherstaff
        // --------------------------------------------------------

        if (authUnionCouncilId) {
          const approvalDesignations = [
            "supervisor",
            "vaccinator",
            "otherstaff",
          ];

          const approvalResponses = await Promise.all(
            approvalDesignations.map((designation) =>
              getPendingUserApprovals({
                page: 1,
                limit: 10,
                designation,
                unionCouncil: authUnionCouncilId,
              }),
            ),
          );

          approvalResponses.forEach((response, index) => {
            if (!response?.success) {
              throw new Error(
                response?.message ||
                  `Failed to fetch ${approvalDesignations[index]} approvals.`,
              );
            }
          });

          const totalPendingApprovals = approvalResponses.reduce(
            (total, response) => {
              return (
                total +
                (Array.isArray(response?.data) ? response.data.length : 0)
              );
            },
            0,
          );

          setPendingApprovals(totalPendingApprovals);
        } else {
          setPendingApprovals(0);
        }

        // --------------------------------------------------------
        // ALL ZERODOSE
        // --------------------------------------------------------

        let allZerodoses = [];

        let page = 1;
        let totalPages = 1;

        do {
          const zerodoseResponse = await getZerodoses({
            page,
            limit: 50,
            sortBy: "recordDate",
            sortOrder: "desc",
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
        console.error("UCMO data fetch error:", error);

        setError(error?.message || "Failed to load UCMO data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUCMOData();
  }, []);

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
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();

        return dateB - dateA;
      });
  }, [normalizedCampaigns]);

  // ============================================================
  // UPCOMING CAMPAIGNS
  // ============================================================

  const upcomingCampaigns = useMemo(() => {
    return normalizedCampaigns
      .filter((campaign) => campaign.campaignStatus === "upcoming")
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();

        return dateA - dateB;
      });
  }, [normalizedCampaigns]);

  // ============================================================
  // UCMO SUPERVISOR IDS
  // ============================================================

  const supervisorIds = useMemo(() => {
    return new Set(
      supervisors
        .map((supervisor) => getId(supervisor))
        .filter(Boolean)
        .map(String),
    );
  }, [supervisors]);

  // ============================================================
  // UCMO ZERODOSE DATA
  // ============================================================

  const ucmoZerodoseData = useMemo(() => {
    if (!supervisorIds.size) {
      return [];
    }

    return zerodoses.filter((item) => {
      const itemSupervisorId = getId(
        item.supervisor || item.supervisorId || item.supervisor?._id,
      );

      if (!itemSupervisorId) {
        return false;
      }

      return supervisorIds.has(String(itemSupervisorId));
    });
  }, [zerodoses, supervisorIds]);

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

    return ucmoZerodoseData
      .filter((item) => {
        const itemCampaignId = getId(
          item.campaign || item.campaignId || item.campaign?._id,
        );

        return (
          itemCampaignId && String(itemCampaignId) === String(currentCampaignId)
        );
      })
      .map((item) => ({
        ...item,
        campaign: item.campaign || currentCampaign,
      }));
  }, [ucmoZerodoseData, currentCampaign]);

  // ============================================================
  // PREVIOUS DATA
  // ============================================================

  const previousData = useMemo(() => {
    if (!previousCampaigns.length || !ucmoZerodoseData.length) {
      return [];
    }

    const previousCampaignIds = new Set(
      previousCampaigns
        .map((campaign) => getId(campaign))
        .filter(Boolean)
        .map(String),
    );

    return ucmoZerodoseData
      .filter((item) => {
        const itemCampaignId = getId(
          item.campaign || item.campaignId || item.campaign?._id,
        );

        return (
          itemCampaignId && previousCampaignIds.has(String(itemCampaignId))
        );
      })
      .map((item) => {
        const itemCampaignId = getId(
          item.campaign || item.campaignId || item.campaign?._id,
        );

        const campaign =
          previousCampaigns.find(
            (campaign) => String(getId(campaign)) === String(itemCampaignId),
          ) || item.campaign;

        return {
          ...item,
          campaign,
        };
      });
  }, [ucmoZerodoseData, previousCampaigns]);

  // ============================================================
  // UPCOMING DATA
  // ============================================================

  const upcomingData = useMemo(() => {
    if (!upcomingCampaigns.length || !ucmoZerodoseData.length) {
      return [];
    }

    const upcomingCampaignIds = new Set(
      upcomingCampaigns
        .map((campaign) => getId(campaign))
        .filter(Boolean)
        .map(String),
    );

    return ucmoZerodoseData
      .filter((item) => {
        const itemCampaignId = getId(
          item.campaign || item.campaignId || item.campaign?._id,
        );

        return (
          itemCampaignId && upcomingCampaignIds.has(String(itemCampaignId))
        );
      })
      .map((item) => {
        const itemCampaignId = getId(
          item.campaign || item.campaignId || item.campaign?._id,
        );

        const campaign =
          upcomingCampaigns.find(
            (campaign) => String(getId(campaign)) === String(itemCampaignId),
          ) || item.campaign;

        return {
          ...item,
          campaign,
        };
      });
  }, [ucmoZerodoseData, upcomingCampaigns]);

  // ============================================================
  // CURRENT SUPERVISORS
  // ============================================================

  const currentSupervisors = useMemo(() => {
    if (!currentCampaign) {
      return [];
    }

    return supervisors.map((supervisor) => {
      const supervisorId = getId(supervisor);

      const supervisorZerodose = currentData.filter((item) => {
        const itemSupervisorId = getId(
          item.supervisor || item.supervisorId || item.supervisor?._id,
        );

        return (
          itemSupervisorId &&
          supervisorId &&
          String(itemSupervisorId) === String(supervisorId)
        );
      });

      return {
        ...supervisor,
        status: supervisor.status || "active",
        zerodose: supervisorZerodose,
      };
    });
  }, [supervisors, currentData, currentCampaign]);

  // ============================================================
  // PREVIOUS CAMPAIGNS WITH SUPERVISORS
  // ============================================================

  const previousCampaignsWithSupervisors = useMemo(() => {
    return previousCampaigns.map((campaign) => {
      const campaignId = getId(campaign);

      const campaignZerodose = previousData.filter((item) => {
        const itemCampaignId = getId(
          item.campaign || item.campaignId || item.campaign?._id,
        );

        return (
          itemCampaignId &&
          campaignId &&
          String(itemCampaignId) === String(campaignId)
        );
      });

      const campaignSupervisors = supervisors.map((supervisor) => {
        const supervisorId = getId(supervisor);

        const supervisorZerodose = campaignZerodose.filter((item) => {
          const itemSupervisorId = getId(
            item.supervisor || item.supervisorId || item.supervisor?._id,
          );

          return (
            itemSupervisorId &&
            supervisorId &&
            String(itemSupervisorId) === String(supervisorId)
          );
        });

        return {
          ...supervisor,
          status: supervisor.status || "active",
          zerodose: supervisorZerodose,
        };
      });

      return {
        ...campaign,
        supervisors: campaignSupervisors,
      };
    });
  }, [previousCampaigns, previousData, supervisors]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const currentZerodoseCount = currentData.length;

  // ============================================================
  // CURRENT RECORDED ZERODOSE
  // ============================================================

  const currentRecordedZerodoseCount = useMemo(() => {
    return currentData.filter((item) => item.vaccinationStatus === "recorded")
      .length;
  }, [currentData]);

  // ============================================================
  // CURRENT COVERED ZERODOSE
  // ============================================================

  const currentCoveredZerodoseCount = useMemo(() => {
    return currentData.filter((item) => item.vaccinationStatus === "covered")
      .length;
  }, [currentData]);

  // ============================================================
  // ACTIVE TEAMS
  // ============================================================

  const activeTeamsCount = useMemo(() => {
    const teamNumbers = new Set();

    if (!authUnionCouncilId) {
      return 0;
    }

    activeUsers.forEach((user) => {
      const userUnionCouncilId =
        getId(user.unionCouncil) || getId(user.unionCouncilId);

      if (
        user.isActive === true &&
        userUnionCouncilId &&
        String(userUnionCouncilId) === String(authUnionCouncilId) &&
        user.teamNumber !== null &&
        user.teamNumber !== undefined &&
        String(user.teamNumber).trim() !== ""
      ) {
        teamNumbers.add(String(user.teamNumber));
      }
    });

    return teamNumbers.size;
  }, [activeUsers, authUnionCouncilId]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-7xl">
        {/* ======================================================
              HEADER
          ====================================================== */}

        <div className="mb-4 flex flex-col md:mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-text text-2xl font-bold md:text-3xl">UCMO</h1>
            <UCMOActions
              link={"/ucmo/pendingapprovals"}
              name={"Supervisor Approvals"}
              pendingApprovals={pendingApprovals}
              loading={loading}
            />
          </div>

          <p className="text-text-secondary mt-1 text-sm">
            Manage supervisors and campaign-wise Zerodose records
          </p>
        </div>

        {/* ======================================================
              ERROR
          ====================================================== */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>
          </div>
        )}

        {/* ======================================================
              SUMMARY
          ====================================================== */}

        <UCMOSummaryCards
          totalSupervisors={supervisors.length}
          recordedZerodose={currentRecordedZerodoseCount}
          coveredZerodose={currentCoveredZerodoseCount}
          activeTeams={activeTeamsCount}
        />

        {/* ======================================================
              ACTIONS
          ====================================================== */}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-4">
          <ActionLinkButton
            href="/ucmo/supervisor-management"
            label="Teams Management"
            icon={UsersRound}
          />

          <ActionLinkButton
            href="/ucmo/supervisorDetail"
            label="Supervisor Details"
            icon={UsersRound}
          />
        </div>

        {/* ======================================================
              TABS
          ====================================================== */}

        <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* ======================================================
              CURRENT CAMPAIGN
          ====================================================== */}

        {activeTab === "current" && (
          <CurrentCampaign
            campaign={currentCampaign}
            supervisors={currentSupervisors}
            loading={loading}
          />
        )}

        {/* ======================================================
              PREVIOUS CAMPAIGNS
          ====================================================== */}

        {activeTab === "previous" && (
          <PreviousCampaigns
            campaigns={previousCampaignsWithSupervisors}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
