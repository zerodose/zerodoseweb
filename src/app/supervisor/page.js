"use client";

import { useEffect, useMemo, useState } from "react";

import { getCampaigns } from "@/api/campaignApi";
import { getZerodoses } from "@/api/zerodoseApi";
import { getUsers } from "@/api/userApi";

import SupervisorSummaryCards from "@/components/supervisor/SupervisorSummaryCards";
import SupervisorActions from "@/components/supervisor/SupervisorActions";
import CampaignTabs from "@/components/supervisor/CampaignTabs";
import CurrentCampaign from "@/components/supervisor/CurrentCampaign";
import PreviousCampaigns from "@/components/supervisor/PreviousCampaigns";
import UCMOActions from "@/components/ucmo/PendingApprovalButton";
import { getPendingZerodoseCount } from "@/api/zerodoseApprovalApi";
import { LayoutDashboard } from "lucide-react";
import PendingApprovalButton from "@/components/ucmo/PendingApprovalButton";

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");

  const [campaigns, setCampaigns] = useState([]);
  const [zerodoses, setZerodoses] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState(true);

  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      return value._id?.toString() || value.id?.toString() || null;
    }

    return value.toString();
  };

  const getCampaignStatus = (campaign) => {
    if (!campaign?.startDate || !campaign?.endDate) {
      return "previous";
    }

    const now = new Date();

    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    // Date comparison ko day-level par rakhein.
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

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        setLoading(true);
        setError("");

        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (!storedAuthUser?.id) {
          throw new Error("Supervisor authentication data not found.");
        }

        const supervisorId = String(storedAuthUser.id);

        const campaignsResponse = await getCampaigns();

        if (!campaignsResponse?.success) {
          throw new Error(
            campaignsResponse?.message || "Failed to fetch campaigns.",
          );
        }

        setCampaigns(campaignsResponse.data || []);

        const usersResponse = await getUsers({
          page: 1,
          limit: 50,
          designation: "worker",
          isActive: true,
          supervisor: supervisorId,
        });

        if (!usersResponse?.success) {
          throw new Error(
            usersResponse?.message || "Failed to fetch supervisor workers.",
          );
        }

        setWorkers(usersResponse.data || []);

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
        console.error("Supervisor data fetch error:", error);

        setError(error?.message || "Failed to load supervisor data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, []);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setPendingApprovalsLoading(true);

        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (!storedAuthUser?.id) {
          setPendingApprovals(0);
          return;
        }

        const supervisorId = String(storedAuthUser.id);

        const response = await getPendingZerodoseCount(supervisorId);

        if (!response?.success) {
          setPendingApprovals(0);
          return;
        }

        setPendingApprovals(response.count || 0);
      } catch (error) {
        console.error("Pending Zerodose count error:", error);
        setPendingApprovals(0);
      } finally {
        setPendingApprovalsLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  const supervisorUnionCouncilId = useMemo(() => {
    for (const worker of workers) {
      const unionCouncil =
        worker.unionCouncil?._id ||
        worker.unionCouncil?.id ||
        worker.unionCouncil;

      if (unionCouncil) {
        return String(unionCouncil);
      }
    }

    return null;
  }, [workers]);

  const supervisorUnionCouncilName = useMemo(() => {
    for (const worker of workers) {
      if (worker.unionCouncil?.name) {
        return worker.unionCouncil.name;
      }
    }

    return "-";
  }, [workers]);

  const activeTeams = useMemo(() => {
    const teamMap = new Map();

    workers.forEach((worker) => {
      if (
        worker.teamNumber === null ||
        worker.teamNumber === undefined ||
        worker.teamNumber === ""
      ) {
        return;
      }

      const teamNumber = worker.teamNumber;

      if (!teamMap.has(teamNumber)) {
        teamMap.set(teamNumber, {
          teamNumber,
          teamLeader: null,
          teamMember: null,
        });
      }

      const team = teamMap.get(teamNumber);

      if (worker.workerRole === "teamLeader") {
        team.teamLeader = worker;
      }

      if (worker.workerRole === "teamMember") {
        team.teamMember = worker;
      }
    });

    return Array.from(teamMap.values()).sort(
      (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
    );
  }, [workers]);

  const normalizedCampaigns = useMemo(() => {
    return campaigns.map((campaign) => ({
      ...campaign,
      campaignStatus: getCampaignStatus(campaign),
    }));
  }, [campaigns]);

  const currentCampaign = useMemo(() => {
    return (
      normalizedCampaigns.find(
        (campaign) => campaign.campaignStatus === "current",
      ) || null
    );
  }, [normalizedCampaigns]);

  const previousCampaigns = useMemo(() => {
    return normalizedCampaigns
      .filter((campaign) => campaign.campaignStatus === "previous")
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();

        return dateB - dateA;
      });
  }, [normalizedCampaigns]);

  const supervisorUCData = useMemo(() => {
    if (!supervisorUnionCouncilId) {
      return [];
    }

    return zerodoses.filter((item) => {
      const itemSupervisorId = getId(
        item.supervisor || item.supervisorId || item.supervisor?._id,
      );

      const itemUnionCouncilId = getId(
        item.unionCouncil || item.unionCouncilId || item.unionCouncil?._id,
      );

      if (
        !itemUnionCouncilId ||
        String(itemUnionCouncilId) !== String(supervisorUnionCouncilId)
      ) {
        return false;
      }

      if (
        itemSupervisorId &&
        itemSupervisorId !== null &&
        itemSupervisorId !== undefined
      ) {
        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (
          storedAuthUser?.id &&
          String(itemSupervisorId) !== String(storedAuthUser.id)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [zerodoses, supervisorUnionCouncilId]);

  const currentData = useMemo(() => {
    if (!currentCampaign) {
      return [];
    }

    const currentCampaignId = getId(currentCampaign);

    if (!currentCampaignId) {
      return [];
    }

    return supervisorUCData
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
  }, [supervisorUCData, currentCampaign]);

  // ============================================================

  const previousData = useMemo(() => {
    if (!previousCampaigns.length || !supervisorUCData.length) {
      return [];
    }

    const previousCampaignIds = new Set(
      previousCampaigns.map((campaign) => getId(campaign)).filter(Boolean),
    );

    return supervisorUCData
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
  }, [supervisorUCData, previousCampaigns]);

  const totalRecorded = supervisorUCData.length;

  const totalVisited = supervisorUCData.filter(
    (item) => item.vaccinationStatus === "visited",
  ).length;

  const totalCovered = supervisorUCData.filter(
    (item) => item.vaccinationStatus === "covered" || Boolean(item.coveredDate),
  ).length;

  const currentUC = supervisorUnionCouncilName;

  return (
    <div className="min-h-full">
      <div className="mb-4 flex flex-col md:mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-text text-2xl font-bold md:text-3xl">
            Supervisor
          </h1>
          <PendingApprovalButton
            link={"/supervisor/zerodoseApproval"}
            name={"Zerodose Approval"}
            pendingApprovals={pendingApprovals}
            loading={loading}
          />
        </div>

        <p className="text-text-secondary mt-1 text-sm">
          Manage teams and campaign-wise Zerodose records
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <SupervisorSummaryCards
        totalTeams={activeTeams.length}
        recordedZerodose={totalRecorded}
        visitedZerodose={totalVisited}
        coveredZerodose={totalCovered}
      />

      <SupervisorActions />

      <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "current" && (
        <CurrentCampaign
          campaign={currentCampaign}
          data={currentData}
          activeTeams={activeTeams}
          loading={loading}
        />
      )}

      {activeTab === "previous" && (
        <PreviousCampaigns
          campaigns={previousCampaigns}
          data={previousData}
          loading={loading}
        />
      )}
    </div>
  );
}
