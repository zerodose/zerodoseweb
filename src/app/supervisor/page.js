"use client";

import { useEffect, useMemo, useState } from "react";
import { getZerodoses } from "@/api/zerodoseApi";
import { getUsers } from "@/api/userApi";

import SupervisorSummaryCards from "@/components/supervisor/SupervisorSummaryCards";
import SupervisorActions from "@/components/supervisor/SupervisorActions";
import CampaignTabs from "@/components/supervisor/CampaignTabs";
import CurrentCampaign from "@/components/supervisor/CurrentCampaign";
import PreviousCampaigns from "@/components/supervisor/PreviousCampaigns";

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");

  const [zerodoses, setZerodoses] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authUser, setAuthUser] = useState(null);

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

        setAuthUser(storedAuthUser);

        const [zerodoseResponse, usersResponse] = await Promise.all([
          getZerodoses({
            page: 1,
            limit: 50,
            sortBy: "recordDate",
            sortOrder: "desc",
          }),

          getUsers({
            page: 1,
            limit: 50,
            designation: "worker",
            status: "active",
            supervisor: storedAuthUser.id,
          }),
        ]);

        if (!zerodoseResponse?.success) {
          throw new Error(
            zerodoseResponse?.message || "Failed to fetch Zerodose records.",
          );
        }

        if (!usersResponse?.success) {
          throw new Error(
            usersResponse?.message || "Failed to fetch supervisor workers.",
          );
        }

        setZerodoses(zerodoseResponse.data || []);
        setWorkers(usersResponse.data || []);
      } catch (error) {
        console.error("Supervisor data fetch error:", error);

        setError(error?.message || "Failed to load supervisor data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, []);

  // ============================================================
  // ACTIVE TEAMS
  // ============================================================

  const activeTeams = useMemo(() => {
    const teamMap = new Map();

    workers.forEach((worker) => {
      if (worker.teamNumber === null || worker.teamNumber === undefined) {
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
      (a, b) => a.teamNumber - b.teamNumber,
    );
  }, [workers]);

  // ============================================================
  // CURRENT CAMPAIGN
  // ============================================================

  // const currentData = useMemo(() => {
  //   return zerodoses.filter((item) => item.campaignId?.isActive === true);
  // }, [zerodoses]);

  const currentData = useMemo(() => {
    return zerodoses.filter((item) => {
      const supervisorId = item.supervisor?._id || item.supervisor;

      return (
        item.campaignId?.isActive === true &&
        String(supervisorId) === String(authUser?.id)
      );
    });
  }, [zerodoses, authUser]);

  const currentCampaign = currentData[0]?.campaignId || null;

  // ============================================================
  // PREVIOUS CAMPAIGNS
  // ============================================================

  // const previousData = useMemo(() => {
  //   return zerodoses.filter((item) => item.campaignId?.isActive !== true);
  // }, [zerodoses]);

  const previousData = useMemo(() => {
    return zerodoses.filter((item) => item.campaignId?.isActive !== true);
  }, [zerodoses]);

  // ============================================================
  // CURRENT SUMMARY
  // ============================================================

  const currentRecorded = currentData.length;

  const currentCovered = currentData.filter(
    (item) => item.vaccinationStatus === "covered" || item.coveredDate,
  ).length;

  const currentUC = currentData[0]?.unionCouncilId?.name || "-";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* Header */}

      <div className="mb-6 md:mb-7">
        <h1 className="text-text text-2xl font-bold md:text-3xl">Supervisor</h1>

        <p className="text-text-secondary mt-1 text-sm">
          Manage teams and campaign-wise Zerodose records
        </p>
      </div>

      {/* Summary */}

      <SupervisorSummaryCards
        currentUC={currentUC}
        totalTeams={activeTeams.length}
        recordedZerodose={currentRecorded}
        coveredZerodose={currentCovered}
      />

      {/* Actions */}

      <SupervisorActions />

      {/* Tabs */}

      <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Current */}

      {activeTab === "current" && (
        <CurrentCampaign
          campaign={currentCampaign}
          data={currentData}
          activeTeams={activeTeams}
          loading={loading}
        />
      )}

      {/* Previous */}

      {activeTab === "previous" && (
        <PreviousCampaigns campaigns={previousData} loading={loading} />
      )}
    </div>
  );
}
