// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";

// import { getCampaigns } from "@/api/campaignApi";

// import UCMOSummaryCards from "@/components/ucmo/UCMOSummaryCards";
// import PendingApprovalButton from "@/components/ucmo/PendingApprovalButton";
// import UCMOActions from "@/components/ucmo/UCMOAction";

// import { getPendingApprovalCount } from "@/api/userApprovalsApi";
// import { getUCMOSummary } from "@/api/dashboardApi";
// import { getUCMOTotalSummary } from "@/api/dashboardApi";

// import CurrentCampaignSummery from "@/components/supervisor/CurrentCampaignSummery";
// import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";
// import CampaignTabs from "@/components/supervisor/CampaignTabs";
// import UCMOCampaignSection from "@/components/ucmo/UCMOCampaignSection";

// export default function Page() {
//   const [activeTab, setActiveTab] = useState("current");

//   const [campaigns, setCampaigns] = useState([]);

//   const [authUser, setAuthUser] = useState(null);

//   const [pendingApprovals, setPendingApprovals] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const hasFetchedRef = useRef(false);

//   // ============================================================
//   // SUMMARY
//   // ============================================================

//   const [summary, setSummary] = useState({
//     totalSupervisors: 0,
//     activeTeams: 0,
//     recordedZerodose: 0,
//     visitedZerodose: 0,
//     coveredZerodose: 0,
//     currentCampaign: null,
//     supervisors: [],
//   });

//   // ============================================================
//   // GET ID
//   // ============================================================

//   const getId = (value) => {
//     if (!value) {
//       return null;
//     }

//     if (typeof value === "object") {
//       return value._id?.toString() || value.id?.toString() || null;
//     }

//     return value.toString();
//   };

//   // ============================================================
//   // CAMPAIGN STATUS
//   // ============================================================

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

//   // ============================================================
//   // FETCH UCMO DATA
//   // ============================================================

//   useEffect(() => {
//     if (hasFetchedRef.current) {
//       return;
//     }

//     hasFetchedRef.current = true;

//     const fetchUCMOData = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         // --------------------------------------------------------
//         // AUTH USER
//         //
//         // Only used for UI/display.
//         // Backend authorization is handled through auth_token.
//         // --------------------------------------------------------

//         const storedAuthUser = JSON.parse(
//           localStorage.getItem("authUser") || "{}",
//         );

//         if (!storedAuthUser?.id) {
//           throw new Error("UCMO authentication data not found.");
//         }

//         setAuthUser(storedAuthUser);

//         // --------------------------------------------------------
//         // UCMO SUMMARY
//         //
//         // IMPORTANT:
//         // No UCMO ID is sent.
//         //
//         // Backend identifies authenticated UCMO from JWT and
//         // automatically applies the correct Union Council scope.
//         // --------------------------------------------------------

//         const summaryResponse = await getUCMOTotalSummary();

//         console.log("summaryResponse", summaryResponse)
//         if (!summaryResponse?.success) {
//           throw new Error(
//             summaryResponse?.message || "Failed to fetch UCMO summary.",
//           );
//         }

//         setSummary({
//           totalSupervisors: summaryResponse.data?.totalSupervisors ?? 0,

//           activeTeams: summaryResponse.data?.activeTeams ?? 0,

//           recordedZerodose: summaryResponse.data?.recordedZerodose ?? 0,

//           visitedZerodose: summaryResponse.data?.visitedZerodose ?? 0,

//           coveredZerodose: summaryResponse.data?.coveredZerodose ?? 0,

//           currentCampaign: summaryResponse.data?.currentCampaign || null,

//           supervisors: Array.isArray(summaryResponse.data?.supervisors)
//             ? summaryResponse.data.supervisors
//             : [],
//         });

//         // --------------------------------------------------------
//         // CAMPAIGNS
//         // --------------------------------------------------------

//         const campaignsResponse = await getCampaigns();

//         if (!campaignsResponse?.success) {
//           throw new Error(
//             campaignsResponse?.message || "Failed to fetch campaigns.",
//           );
//         }

//         setCampaigns(
//           Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [],
//         );

//         // --------------------------------------------------------
//         // PENDING APPROVALS
//         //
//         // Keep current approval API because this is a separate
//         // requirement from Zerodose summary.
//         // --------------------------------------------------------

//         const approvalCountResponse = await getPendingApprovalCount({
//           userId: String(storedAuthUser.id),
//           designation: "ucmo",
//         });

//         if (!approvalCountResponse?.success) {
//           throw new Error(
//             approvalCountResponse?.message ||
//               "Failed to fetch pending approval count.",
//           );
//         }

//         setPendingApprovals(
//           approvalCountResponse?.count ??
//             approvalCountResponse?.data?.count ??
//             0,
//         );
//       } catch (error) {
//         console.error("UCMO data fetch error:", error);

//         setError(error?.message || "Failed to load UCMO data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUCMOData();
//   }, []);

//   // ============================================================
//   // NORMALIZED CAMPAIGNS
//   // ============================================================

//   const normalizedCampaigns = useMemo(() => {
//     return campaigns.map((campaign) => ({
//       ...campaign,
//       campaignStatus: getCampaignStatus(campaign),
//     }));
//   }, [campaigns]);

//   // ============================================================
//   // CURRENT CAMPAIGN
//   // ============================================================

//   const currentCampaign = useMemo(() => {
//     return (
//       normalizedCampaigns.find(
//         (campaign) => campaign.campaignStatus === "current",
//       ) || null
//     );
//   }, [normalizedCampaigns]);

//   // ============================================================
//   // PREVIOUS CAMPAIGNS
//   // ============================================================

//   const previousCampaigns = useMemo(() => {
//     return normalizedCampaigns
//       .filter((campaign) => campaign.campaignStatus === "previous")
//       .sort((a, b) => {
//         const dateA = new Date(a.startDate).getTime();

//         const dateB = new Date(b.startDate).getTime();

//         return dateB - dateA;
//       });
//   }, [normalizedCampaigns]);

//   // ============================================================
//   // UPCOMING CAMPAIGNS
//   // ============================================================

//   const upcomingCampaigns = useMemo(() => {
//     return normalizedCampaigns
//       .filter((campaign) => campaign.campaignStatus === "upcoming")
//       .sort((a, b) => {
//         const dateA = new Date(a.startDate).getTime();

//         const dateB = new Date(b.startDate).getTime();

//         return dateA - dateB;
//       });
//   }, [normalizedCampaigns]);

//   // ============================================================
//   // CURRENT SUPERVISOR DATA
//   //
//   // Backend already returns:
//   //
//   // {
//   //   supervisorId,
//   //   supervisorName,
//   //   supervisorCode,
//   //   totalTeams,
//   //   recorded,
//   //   visited,
//   //   covered
//   // }
//   //
//   // Therefore NO Zerodose records are processed here.
//   // ============================================================

//   const ucmoCurrentSupervisorData = useMemo(() => {
//     if (!currentCampaign) {
//       return [];
//     }

//     if (!Array.isArray(summary.supervisors)) {
//       return [];
//     }

//     return summary.supervisors.map((supervisor) => ({
//       ...supervisor,

//       supervisorCode: supervisor.supervisorCode || supervisor.code || "-",

//       supervisorName: supervisor.supervisorName || supervisor.name || "-",

//       totalTeams: Number(supervisor.totalTeams) || 0,

//       recorded: Number(supervisor.recorded) || 0,

//       visited: Number(supervisor.visited) || 0,

//       covered: Number(supervisor.covered) || 0,
//     }));
//   }, [summary.supervisors, currentCampaign]);

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="min-h-full">
//       <div className="mx-auto w-full max-w-7xl">
//         {/* ======================================================
//               HEADER
//           ====================================================== */}

//         <div className="mb-4 flex flex-col md:mb-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h1 className="text-text text-2xl font-bold md:text-3xl">UCMO</h1>

//             <PendingApprovalButton
//               link="/ucmo/pendingapprovals"
//               name="Supervisor Approvals"
//               pendingApprovals={pendingApprovals}
//               loading={loading}
//             />
//           </div>

//           <p className="text-text-secondary mt-1 text-sm">
//             Manage supervisors and campaign-wise Zerodose records
//           </p>
//         </div>

//         {/* ======================================================
//               ERROR
//           ====================================================== */}

//         {error && (
//           <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//             <span>{error}</span>
//           </div>
//         )}

//         {/* ======================================================
//               SUMMARY
//           ====================================================== */}

//         <UCMOSummaryCards
//           totalSupervisors={summary.totalSupervisors}
//           activeTeams={summary.activeTeams}
//           recordedZerodose={summary.recordedZerodose}
//           coveredZerodose={summary.coveredZerodose}
//         />

//         {/* ======================================================
//               ACTIONS
//           ====================================================== */}

//         <UCMOActions />

//         {/* ======================================================
//               CAMPAIGN TABS
//           ====================================================== */}

//         <UCMOCampaignSection authUser={authUser} />
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";

import { getCampaigns } from "@/api/campaignApi";
import { getPendingApprovalCount } from "@/api/userApprovalsApi";
import { getUCMOTotalSummary } from "@/api/dashboardApi";

import UCMOSummaryCards from "@/components/ucmo/UCMOSummaryCards";
import PendingApprovalButton from "@/components/ucmo/PendingApprovalButton";
import UCMOActions from "@/components/ucmo/UCMOAction";
import UCMOCampaignSection from "@/components/ucmo/UCMOCampaignSection";

export default function Page() {
  const [campaigns, setCampaigns] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasFetchedRef = useRef(false);

  // ============================================================
  // UCMO SUMMARY
  // ============================================================

  const [summary, setSummary] = useState({
    totalSupervisors: 0,
    activeTeams: 0,
    recordedZerodose: 0,
    visitedZerodose: 0,
    coveredZerodose: 0,
  });

  // ============================================================
  // FETCH UCMO DATA
  // ============================================================

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    const fetchUCMOData = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // AUTH USER
        // --------------------------------------------------------

        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (!storedAuthUser?.id) {
          throw new Error("UCMO authentication data not found.");
        }

        setAuthUser(storedAuthUser);

        // --------------------------------------------------------
        // UCMO SUMMARY
        // --------------------------------------------------------

        const summaryResponse = await getUCMOTotalSummary();

        console.log("UCMO summaryResponse:", summaryResponse);

        if (!summaryResponse?.success) {
          throw new Error(
            summaryResponse?.message || "Failed to fetch UCMO summary.",
          );
        }

        const data = summaryResponse.data || {};

        setSummary({
          totalSupervisors: Number(data.supervisorCount) || 0,
          activeTeams: Number(data.teamCount) || 0,
          recordedZerodose: Number(data.recordCount) || 0,
          visitedZerodose: Number(data.visitCount) || 0,
          coveredZerodose: Number(data.coveredCount) || 0,
        });

        // --------------------------------------------------------
        // CAMPAIGNS
        // --------------------------------------------------------

        const campaignsResponse = await getCampaigns();

        if (!campaignsResponse?.success) {
          throw new Error(
            campaignsResponse?.message || "Failed to fetch campaigns.",
          );
        }

        setCampaigns(
          Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [],
        );

        // --------------------------------------------------------
        // PENDING APPROVALS
        // --------------------------------------------------------

        const approvalCountResponse = await getPendingApprovalCount({
          userId: String(storedAuthUser.id),
          designation: "ucmo",
        });

        if (!approvalCountResponse?.success) {
          throw new Error(
            approvalCountResponse?.message ||
              "Failed to fetch pending approval count.",
          );
        }

        setPendingApprovals(
          approvalCountResponse?.count ??
            approvalCountResponse?.data?.count ??
            0,
        );
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

            <PendingApprovalButton
              link="/ucmo/pendingapprovals"
              name="Supervisor Approvals"
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
          totalSupervisors={summary.totalSupervisors}
          activeTeams={summary.activeTeams}
          recordedZerodose={summary.recordedZerodose}
          coveredZerodose={summary.coveredZerodose}
        />

        {/* ======================================================
              ACTIONS
          ====================================================== */}

        <UCMOActions />

        {/* ======================================================
              CAMPAIGNS
          ====================================================== */}

        <UCMOCampaignSection authUser={authUser} />
      </div>
    </div>
  );
}
