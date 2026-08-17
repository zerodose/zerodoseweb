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

  // ============================================================
  // FETCH SUPERVISOR DATA
  // ============================================================

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // Auth User
        // --------------------------------------------------------

        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (!storedAuthUser?.id) {
          throw new Error("Supervisor authentication data not found.");
        }

        setAuthUser(storedAuthUser);

        // --------------------------------------------------------
        // Get Supervisor Workers
        // --------------------------------------------------------

        const usersResponse = await getUsers({
          page: 1,
          limit: 50,
          designation: "worker",
          status: "active",
          supervisor: storedAuthUser.id,
        });

        if (!usersResponse?.success) {
          throw new Error(
            usersResponse?.message || "Failed to fetch supervisor workers.",
          );
        }

        const supervisorWorkers = usersResponse.data || [];

        setWorkers(supervisorWorkers);

        // --------------------------------------------------------
        // Fetch ALL Zerodose Pages
        //
        // Important:
        // One API call with limit 50 is not enough for totals.
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
        console.error("Supervisor data fetch error:", error);

        setError(error?.message || "Failed to load supervisor data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, []);

  // ============================================================
  // SUPERVISOR UNION COUNCIL
  // ============================================================
  //
  // Supervisor ke workers MongoDB se mil rahe hain.
  //
  // Worker:
  // worker.unionCouncil
  //
  // Sab workers same supervisor ke hain, isliye first valid
  // worker ka UC supervisor ka current UC hoga.
  //
  // ============================================================

  const supervisorunionCouncil = useMemo(() => {
    for (const worker of workers) {
      const unionCouncil = worker.unionCouncil?._id || worker.unionCouncil;

      if (unionCouncil) {
        return String(unionCouncil);
      }
    }

    return null;
  }, [workers]);

  // ============================================================
  // SUPERVISOR UNION COUNCIL NAME
  // ============================================================

  const supervisorUnionCouncilName = useMemo(() => {
    for (const worker of workers) {
      const unionCouncil = worker.unionCouncil;

      if (unionCouncil?.name) {
        return unionCouncil.name;
      }
    }

    return "-";
  }, [workers]);

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
  // SUPERVISOR + UNION COUNCIL DATA
  //
  // ALL CAMPAIGNS
  //
  // API already restricts supervisor to logged-in supervisor.
  //
  // Here we additionally restrict by supervisor's UC.
  // ============================================================

  const supervisorUCData = useMemo(() => {
    if (!supervisorunionCouncil) {
      return [];
    }

    return zerodoses.filter((item) => {
      const unionCouncil = item.unionCouncil?._id || item.unionCouncil;

      if (!unionCouncil) {
        return false;
      }

      return String(unionCouncil) === String(supervisorunionCouncil);
    });
  }, [zerodoses, supervisorunionCouncil]);

  // ============================================================
  // CURRENT CAMPAIGN DATA
  //
  // Current campaign only.
  //
  // Supervisor API scope already guarantees supervisor.
  // We only check active campaign + UC.
  // ============================================================

  const currentData = useMemo(() => {
    if (!supervisorunionCouncil) {
      return [];
    }

    return zerodoses.filter((item) => {
      const unionCouncil = item.unionCouncil?._id || item.unionCouncil;

      return (
        item.campaign?.isActive === true &&
        String(unionCouncil) === String(supervisorunionCouncil)
      );
    });
  }, [zerodoses, supervisorunionCouncil]);

  // ============================================================
  // CURRENT CAMPAIGN
  // ============================================================

  const currentCampaign = currentData[0]?.campaign || null;

  // ============================================================
  // PREVIOUS CAMPAIGNS
  //
  // Previous campaigns of supervisor + UC.
  // ============================================================

  const previousData = useMemo(() => {
    if (!supervisorunionCouncil) {
      return [];
    }

    return supervisorUCData.filter((item) => item.campaign?.isActive !== true);
  }, [supervisorUCData, supervisorunionCouncil]);

  // ============================================================
  // SUMMARY
  //
  // IMPORTANT:
  // These totals are ALL CAMPAIGNS totals
  // for this Supervisor + Union Council.
  // ============================================================

  const totalRecorded = supervisorUCData.length;

  const totalCovered = supervisorUCData.filter(
    (item) => item.vaccinationStatus === "covered" || Boolean(item.coveredDate),
  ).length;

  const currentUC = supervisorUnionCouncilName;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 md:mb-7">
        <h1 className="text-text text-2xl font-bold md:text-3xl">Supervisor</h1>

        <p className="text-text-secondary mt-1 text-sm">
          Manage teams and campaign-wise Zerodose records
        </p>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <SupervisorSummaryCards
        currentUC={currentUC}
        totalTeams={activeTeams.length}
        recordedZerodose={totalRecorded}
        coveredZerodose={totalCovered}
      />

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <SupervisorActions />

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
          data={currentData}
          activeTeams={activeTeams}
          loading={loading}
        />
      )}

      {/* ======================================================
          PREVIOUS CAMPAIGNS
      ====================================================== */}

      {activeTab === "previous" && (
        <PreviousCampaigns campaigns={previousData} loading={loading} />
      )}
    </div>
  );
}
