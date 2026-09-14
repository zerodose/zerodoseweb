// "use client";

// import { useEffect, useMemo, useState } from "react";

// import { getCampaigns } from "@/api/campaignApi";
// import { getSupervisorTeamSummary } from "@/api/dashboardApi";
// import { getActiveSupervisorTeamCount } from "@/api/userApi";
// import SupervisorSummaryCards from "@/components/supervisor/SupervisorSummaryCards";
// import SupervisorActions from "@/components/supervisor/SupervisorActions";
// import CampaignTabs from "@/components/supervisor/CampaignTabs";
// import { getPendingZerodoseCount } from "@/api/zerodoseApprovalApi";
// import PendingApprovalButton from "@/components/ucmo/PendingApprovalButton";
// import CurrentCampaignSummery from "@/components/supervisor/CurrentCampaignSummery";
// import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

// export default function Page() {
//   const [activeTab, setActiveTab] = useState("current");
//   const [activeTeamCount, setActiveTeamCount] = useState(0);
//   const [campaigns, setCampaigns] = useState([]);
//   const [teamSummary, setTeamSummary] = useState([]);
//   const [authUser, setAuthUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [pendingApprovals, setPendingApprovals] = useState(0);
//   const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState(true);

//   const getCampaignStatus = (campaign) => {
//     if (!campaign?.startDate || !campaign?.endDate) {
//       return "previous";
//     }

//     const now = new Date();

//     const startDate = new Date(campaign.startDate);
//     const endDate = new Date(campaign.endDate);

//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     const start = new Date(
//       startDate.getFullYear(),
//       startDate.getMonth(),
//       startDate.getDate(),
//     );

//     const end = new Date(
//       endDate.getFullYear(),
//       endDate.getMonth(),
//       endDate.getDate(),
//     );

//     if (today < start) {
//       return "upcoming";
//     }

//     if (today >= start && today <= end) {
//       return "current";
//     }

//     return "previous";
//   };

//   /*
//    * ============================================================
//    * CAMPAIGNS + TEAM SUMMARY
//    * ============================================================
//    */
//   useEffect(() => {
//     const fetchSupervisorData = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const storedAuthUser = JSON.parse(
//           localStorage.getItem("authUser") || "{}",
//         );
//         setAuthUser(storedAuthUser);
//         const supervisorId = storedAuthUser?.id;

//         const [teamCountResponse, campaignsResponse, summaryResponse] =
//           await Promise.all([
//             getActiveSupervisorTeamCount(supervisorId),
//             getCampaigns(),
//             getSupervisorTeamSummary(),
//           ]);

//         if (!campaignsResponse?.success) {
//           throw new Error(
//             campaignsResponse?.message || "Failed to fetch campaigns.",
//           );
//         }

//         if (!summaryResponse?.success) {
//           throw new Error(
//             summaryResponse?.message ||
//               "Failed to fetch supervisor team summary.",
//           );
//         }

//         setCampaigns(campaignsResponse.data || []);
//         setTeamSummary(summaryResponse.data || []);
//         setActiveTeamCount(teamCountResponse.count || 0);
//       } catch (error) {
//         console.error("Supervisor data fetch error:", error);

//         setError(error?.message || "Failed to load supervisor dashboard.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSupervisorData();
//   }, []);

//   /*
//    * ============================================================
//    * PENDING ZERODOSE APPROVAL COUNT
//    * ============================================================
//    */
//   useEffect(() => {
//     const fetchPendingApprovals = async () => {
//       try {
//         setPendingApprovalsLoading(true);

//         const storedAuthUser = JSON.parse(
//           localStorage.getItem("authUser") || "{}",
//         );

//         if (!storedAuthUser?.id) {
//           setPendingApprovals(0);
//           return;
//         }

//         const supervisorId = String(storedAuthUser.id);

//         const response = await getPendingZerodoseCount(supervisorId);

//         if (!response?.success) {
//           setPendingApprovals(0);
//           return;
//         }

//         setPendingApprovals(response.count || 0);
//       } catch (error) {
//         console.error("Pending Zerodose count error:", error);
//         setPendingApprovals(0);
//       } finally {
//         setPendingApprovalsLoading(false);
//       }
//     };

//     fetchPendingApprovals();
//   }, []);

//   /*
//    * ============================================================
//    * NORMALIZED CAMPAIGNS
//    * ============================================================
//    */
//   const normalizedCampaigns = useMemo(() => {
//     return campaigns.map((campaign) => ({
//       ...campaign,
//       campaignStatus: getCampaignStatus(campaign),
//     }));
//   }, [campaigns]);

//   const currentCampaign = useMemo(() => {
//     return (
//       normalizedCampaigns.find(
//         (campaign) => campaign.campaignStatus === "current",
//       ) || null
//     );
//   }, [normalizedCampaigns]);

//   const previousCampaigns = useMemo(() => {
//     return normalizedCampaigns
//       .filter((campaign) => campaign.campaignStatus === "previous")
//       .sort((a, b) => {
//         const dateA = new Date(a.startDate).getTime();
//         const dateB = new Date(b.startDate).getTime();

//         return dateB - dateA;
//       });
//   }, [normalizedCampaigns]);

//   /*
//    * ============================================================
//    * TEAM SUMMARY
//    *
//    * Expected API response:
//    *
//    * {
//    *   teamNumber: 1,
//    *   teamLeader: {
//    *     _id: "...",
//    *     name: "Ali"
//    *   },
//    *   teamMember: {
//    *     _id: "...",
//    *     name: "Ahmed"
//    *   },
//    *   recorded: 100,
//    *   visited: 70,
//    *   covered: 60,
//    *   campaign: {
//    *     _id: "...",
//    *     name: "NID"
//    *   }
//    * }
//    *
//    * ============================================================
//    */

//   const activeTeams = useMemo(() => {
//     if (!currentCampaign) {
//       return [];
//     }

//     const currentCampaignId = String(currentCampaign._id || currentCampaign.id);

//     const teamsMap = new Map();

//     teamSummary.forEach((record) => {
//       const recordCampaignId =
//         record.campaign?._id || record.campaign?.id || record.campaign;

//       if (!recordCampaignId || String(recordCampaignId) !== currentCampaignId) {
//         return;
//       }

//       if (record.teamNumber === null || record.teamNumber === undefined) {
//         return;
//       }

//       const teamNumber = String(record.teamNumber);

//       if (!teamsMap.has(teamNumber)) {
//         teamsMap.set(teamNumber, {
//           teamNumber: record.teamNumber,
//           teamLeader: record.teamLeader || null,
//           teamMember: record.teamMember || null,
//           unionCouncil: record.unionCouncil || null,
//         });
//       }
//     });

//     return Array.from(teamsMap.values()).sort(
//       (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
//     );
//   }, [teamSummary, currentCampaign]);

//   /*
//    * ============================================================
//    * CURRENT CAMPAIGN TEAM SUMMARY
//    * ============================================================
//    */
//   const currentData = useMemo(() => {
//     if (!currentCampaign) {
//       return [];
//     }

//     const currentCampaignId = String(currentCampaign._id || currentCampaign.id);

//     const teamsMap = new Map();

//     teamSummary.forEach((record) => {
//       const teamCampaignId =
//         record.campaign?._id || record.campaign?.id || record.campaign;

//       if (!teamCampaignId || String(teamCampaignId) !== currentCampaignId) {
//         return;
//       }

//       if (record.teamNumber === null || record.teamNumber === undefined) {
//         return;
//       }

//       const teamNumber = String(record.teamNumber);

//       if (!teamsMap.has(teamNumber)) {
//         teamsMap.set(teamNumber, {
//           teamNumber: record.teamNumber,
//           teamLeader: record.teamLeader || null,
//           teamMember: record.teamMember || null,
//           unionCouncil: record.unionCouncil || null,
//           campaign: record.campaign || currentCampaign,

//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });
//       }

//       const team = teamsMap.get(teamNumber);

//       const status = String(record.vaccinationStatus || "").toLowerCase();

//       /*
//        * Every Zerodose record is a recorded Zerodose.
//        */
//       team.recorded += 1;

//       /*
//        * Visited and Covered are status-based counts.
//        */
//       if (status === "visited") {
//         team.visited += 1;
//       }

//       if (status === "covered") {
//         team.covered += 1;
//       }
//     });

//     return Array.from(teamsMap.values()).sort(
//       (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
//     );
//   }, [teamSummary, currentCampaign]);

//   /*
//    * ============================================================
//    * PREVIOUS CAMPAIGN TEAM SUMMARY
//    * ============================================================
//    */
//   const previousData = useMemo(() => {
//     if (!previousCampaigns.length) {
//       return [];
//     }

//     const previousCampaignIds = new Set(
//       previousCampaigns
//         .map((campaign) => String(campaign._id || campaign.id))
//         .filter(Boolean),
//     );

//     return teamSummary
//       .filter((team) => {
//         const teamCampaignId =
//           team.campaign?._id || team.campaign?.id || team.campaign;

//         return (
//           teamCampaignId && previousCampaignIds.has(String(teamCampaignId))
//         );
//       })
//       .sort((a, b) => {
//         const dateA = new Date(a.campaign?.startDate || 0).getTime();

//         const dateB = new Date(b.campaign?.startDate || 0).getTime();

//         return dateB - dateA;
//       });
//   }, [teamSummary, previousCampaigns]);

//   /*
//    * ============================================================
//    * DASHBOARD COUNTS
//    * ============================================================
//    */
//   const totalRecorded = useMemo(() => {
//     return currentData.reduce(
//       (total, team) => total + Number(team.recorded || 0),
//       0,
//     );
//   }, [currentData]);

//   const totalVisited = useMemo(() => {
//     return currentData.reduce(
//       (total, team) => total + Number(team.visited || 0),
//       0,
//     );
//   }, [currentData]);

//   const totalCovered = useMemo(() => {
//     return currentData.reduce(
//       (total, team) => total + Number(team.covered || 0),
//       0,
//     );
//   }, [currentData]);

//   /*
//    * ============================================================
//    * UNION COUNCIL
//    * ============================================================
//    */
//   const currentUC = useMemo(() => {
//     return (
//       teamSummary.find((team) => team.unionCouncil?.name)?.unionCouncil?.name ||
//       "-"
//     );
//   }, [teamSummary]);

//   return (
//     <div className="min-h-full">
//       <div className="mb-4 flex flex-col md:mb-6">
//         <div className="mb-4 flex items-center justify-between">
//           <h1 className="text-text text-2xl font-bold md:text-3xl">
//             Supervisor
//           </h1>

//           <PendingApprovalButton
//             link="/supervisor/zerodoseApproval"
//             name="Zerodose Approval"
//             pendingApprovals={pendingApprovals}
//             loading={pendingApprovalsLoading}
//           />
//         </div>

//         <p className="text-text-secondary mt-1 text-sm">
//           Manage teams and campaign-wise Zerodose records
//         </p>
//       </div>

//       {error && (
//         <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       <SupervisorSummaryCards
//         totalTeams={activeTeamCount}
//         recordedZerodose={totalRecorded}
//         visitedZerodose={totalVisited}
//         coveredZerodose={totalCovered}
//       />

//       <SupervisorActions />

//       <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

//       {activeTab === "current" && (
//         <CurrentCampaignSummery
//           campaign={currentCampaign}
//           data={currentData}
//           activeTeams={activeTeams}
//           loading={loading}
//           authUser={authUser}
//         />
//       )}

//       {activeTab === "previous" && (
//         <PreviousCampaignsSummery
//           campaigns={previousCampaigns}
//           data={previousData}
//           loading={loading}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

import { getSupervisorSummary } from "@/api/dashboardApi";
import { getPendingZerodoseCount } from "@/api/zerodoseApprovalApi";

import SupervisorSummaryCards from "@/components/supervisor/SupervisorSummaryCards";
import SupervisorActions from "@/components/supervisor/SupervisorActions";
import CampaignTabs from "@/components/supervisor/CampaignTabs";
import PendingApprovalButton from "@/components/ucmo/PendingApprovalButton";
import CurrentCampaignSummery from "@/components/supervisor/CurrentCampaignSummery";
import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");

  const [dashboardData, setDashboardData] = useState({
    totalTeams: 0,
    recordedZerodose: 0,
    visitedZerodose: 0,
    coveredZerodose: 0,
    currentCampaign: null,
    teams: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState(true);

  // ============================================================
  // SUPERVISOR DASHBOARD
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const fetchSupervisorData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSupervisorSummary();

        console.log("Supervisor dashboard response:", response);

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to fetch supervisor dashboard.",
          );
        }

        const data = response?.data || {};

        if (cancelled) return;

        setDashboardData({
          totalTeams: Number(data.totalTeams || 0),

          recordedZerodose: Number(data.recordedZerodose || 0),

          visitedZerodose: Number(data.visitedZerodose || 0),

          coveredZerodose: Number(data.coveredZerodose || 0),

          currentCampaign: data.currentCampaign || null,

          teams: Array.isArray(data.teams)
            ? data.teams.map((team) => ({
                teamNumber: Number(team.teamNumber || 0),

                teamLeader: {
                  name: team.teamLeader?.name || "Not assigned",
                  userId: team.teamLeader?.userId || null,
                  workerRole: team.teamLeader?.workerRole || "teamLeader",
                },

                teamMember: {
                  name: team.teamMember?.name || "Not assigned",
                  userId: team.teamMember?.userId || null,
                  workerRole: team.teamMember?.workerRole || "teamMember",
                },

                recorded: Number(team.recorded || 0),

                visited: Number(team.visited || 0),

                covered: Number(team.covered || 0),
              }))
            : [],
        });
      } catch (error) {
        if (cancelled) return;

        console.error("Supervisor dashboard fetch error:", error);

        setError(error?.message || "Failed to load supervisor dashboard.");

        setDashboardData({
          totalTeams: 0,
          recordedZerodose: 0,
          visitedZerodose: 0,
          coveredZerodose: 0,
          currentCampaign: null,
          teams: [],
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSupervisorData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // PENDING ZERODOSE APPROVALS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const fetchPendingApprovals = async () => {
      try {
        setPendingApprovalsLoading(true);

        let supervisorId = null;

        try {
          const storedAuthUser = localStorage.getItem("authUser");

          if (storedAuthUser) {
            const parsedUser = JSON.parse(storedAuthUser);

            supervisorId = parsedUser?.id ? String(parsedUser.id) : null;
          }
        } catch (error) {
          console.error("Auth user parse error:", error);
        }

        if (!supervisorId) {
          if (!cancelled) {
            setPendingApprovals(0);
          }

          return;
        }

        const response = await getPendingZerodoseCount(supervisorId);

        if (cancelled) return;

        if (!response?.success) {
          setPendingApprovals(0);
          return;
        }

        setPendingApprovals(Number(response.count || 0));
      } catch (error) {
        if (cancelled) return;

        console.error("Pending Zerodose count error:", error);

        setPendingApprovals(0);
      } finally {
        if (!cancelled) {
          setPendingApprovalsLoading(false);
        }
      }
    };

    fetchPendingApprovals();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CURRENT CAMPAIGN DATA
  // ============================================================

  const currentCampaign = dashboardData.currentCampaign;

  const currentData = dashboardData.teams;

  const activeTeams = dashboardData.teams;

  // ============================================================
  // PREVIOUS CAMPAIGNS
  // ============================================================

  const previousCampaigns = [];

  const previousData = [];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-col md:mb-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-text text-2xl font-bold md:text-3xl">
              Supervisor
            </h1>

            <PendingApprovalButton
              link="/supervisor/zerodoseApproval"
              name="Zerodose Approval"
              pendingApprovals={pendingApprovals}
              loading={pendingApprovalsLoading}
            />
          </div>

          <p className="text-text-secondary mt-1 text-sm">
            Manage teams and campaign-wise Zerodose records
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <SupervisorSummaryCards
          totalTeams={dashboardData.totalTeams}
          recordedZerodose={dashboardData.recordedZerodose}
          visitedZerodose={dashboardData.visitedZerodose}
          coveredZerodose={dashboardData.coveredZerodose}
        />

        {/* Actions */}
        <SupervisorActions />

        {/* Campaign Tabs */}
        <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Current Campaign */}
        {activeTab === "current" && (
          <CurrentCampaignSummery
            campaign={currentCampaign}
            data={currentData}
            activeTeams={activeTeams}
            loading={loading}
            mode="supervisor"
          />
        )}

        {/* Previous Campaigns */}
        {activeTab === "previous" && (
          <PreviousCampaignsSummery
            campaigns={previousCampaigns}
            data={previousData}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
