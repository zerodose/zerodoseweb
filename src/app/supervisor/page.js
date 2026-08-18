// "use client";

// import { useEffect, useMemo, useState } from "react";

// import { getZerodoses } from "@/api/zerodoseApi";
// import { getUsers } from "@/api/userApi";

// import SupervisorSummaryCards from "@/components/supervisor/SupervisorSummaryCards";
// import SupervisorActions from "@/components/supervisor/SupervisorActions";
// import CampaignTabs from "@/components/supervisor/CampaignTabs";
// import CurrentCampaign from "@/components/supervisor/CurrentCampaign";
// import PreviousCampaigns from "@/components/supervisor/PreviousCampaigns";

// export default function Page() {
//   const [activeTab, setActiveTab] = useState("current");

//   const [zerodoses, setZerodoses] = useState([]);
//   const [workers, setWorkers] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [authUser, setAuthUser] = useState(null);

//   // ============================================================
//   // FETCH SUPERVISOR DATA
//   // ============================================================

//   useEffect(() => {
//     const fetchSupervisorData = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         // --------------------------------------------------------
//         // Auth User
//         // --------------------------------------------------------

//         const storedAuthUser = JSON.parse(
//           localStorage.getItem("authUser") || "{}",
//         );

//         if (!storedAuthUser?.id) {
//           throw new Error("Supervisor authentication data not found.");
//         }

//         setAuthUser(storedAuthUser);

//         // --------------------------------------------------------
//         // Get Supervisor Workers
//         // --------------------------------------------------------

//         const usersResponse = await getUsers({
//           page: 1,
//           limit: 50,
//           designation: "worker",
//           status: "active",
//           supervisor: storedAuthUser.id,
//         });

//         if (!usersResponse?.success) {
//           throw new Error(
//             usersResponse?.message || "Failed to fetch supervisor workers.",
//           );
//         }

//         const supervisorWorkers = usersResponse.data || [];

//         setWorkers(supervisorWorkers);

//         // --------------------------------------------------------
//         // Fetch ALL Zerodose Pages
//         //
//         // Important:
//         // One API call with limit 50 is not enough for totals.
//         // --------------------------------------------------------

//         let allZerodoses = [];

//         let page = 1;
//         let totalPages = 1;

//         do {
//           const zerodoseResponse = await getZerodoses({
//             page,
//             limit: 50,
//             sortBy: "recordDate",
//             sortOrder: "desc",
//           });

//           if (!zerodoseResponse?.success) {
//             throw new Error(
//               zerodoseResponse?.message || "Failed to fetch Zerodose records.",
//             );
//           }

//           const pageData = zerodoseResponse.data || [];

//           allZerodoses = [...allZerodoses, ...pageData];

//           totalPages = zerodoseResponse.pagination?.totalPages || 1;

//           page += 1;
//         } while (page <= totalPages);

//         setZerodoses(allZerodoses);
//       } catch (error) {
//         console.error("Supervisor data fetch error:", error);

//         setError(error?.message || "Failed to load supervisor data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSupervisorData();
//   }, []);

//   // ============================================================
//   // SUPERVISOR UNION COUNCIL
//   // ============================================================
//   //
//   // Supervisor ke workers MongoDB se mil rahe hain.
//   //
//   // Worker:
//   // worker.unionCouncil
//   //
//   // Sab workers same supervisor ke hain, isliye first valid
//   // worker ka UC supervisor ka current UC hoga.
//   //
//   // ============================================================

//   const supervisorunionCouncil = useMemo(() => {
//     for (const worker of workers) {
//       const unionCouncil = worker.unionCouncil?._id || worker.unionCouncil;

//       if (unionCouncil) {
//         return String(unionCouncil);
//       }
//     }

//     return null;
//   }, [workers]);

//   // ============================================================
//   // SUPERVISOR UNION COUNCIL NAME
//   // ============================================================

//   const supervisorUnionCouncilName = useMemo(() => {
//     for (const worker of workers) {
//       const unionCouncil = worker.unionCouncil;

//       if (unionCouncil?.name) {
//         return unionCouncil.name;
//       }
//     }

//     return "-";
//   }, [workers]);

//   // ============================================================
//   // ACTIVE TEAMS
//   // ============================================================

//   const activeTeams = useMemo(() => {
//     const teamMap = new Map();

//     workers.forEach((worker) => {
//       if (worker.teamNumber === null || worker.teamNumber === undefined) {
//         return;
//       }

//       const teamNumber = worker.teamNumber;

//       if (!teamMap.has(teamNumber)) {
//         teamMap.set(teamNumber, {
//           teamNumber,
//           teamLeader: null,
//           teamMember: null,
//         });
//       }

//       const team = teamMap.get(teamNumber);

//       if (worker.workerRole === "teamLeader") {
//         team.teamLeader = worker;
//       }

//       if (worker.workerRole === "teamMember") {
//         team.teamMember = worker;
//       }
//     });

//     return Array.from(teamMap.values()).sort(
//       (a, b) => a.teamNumber - b.teamNumber,
//     );
//   }, [workers]);

//   // ============================================================
//   // SUPERVISOR + UNION COUNCIL DATA
//   //
//   // ALL CAMPAIGNS
//   //
//   // API already restricts supervisor to logged-in supervisor.
//   //
//   // Here we additionally restrict by supervisor's UC.
//   // ============================================================

//   const supervisorUCData = useMemo(() => {
//     if (!supervisorunionCouncil) {
//       return [];
//     }

//     return zerodoses.filter((item) => {
//       const unionCouncil = item.unionCouncil?._id || item.unionCouncil;

//       if (!unionCouncil) {
//         return false;
//       }

//       return String(unionCouncil) === String(supervisorunionCouncil);
//     });
//   }, [zerodoses, supervisorunionCouncil]);

//   // ============================================================
//   // CURRENT CAMPAIGN DATA
//   //
//   // Current campaign only.
//   //
//   // Supervisor API scope already guarantees supervisor.
//   // We only check active campaign + UC.
//   // ============================================================

//  const currentData = useMemo(() => {
//   return supervisorUCData.filter(
//     (item) => item.campaign?.campaignStatus === "current",
//   );
// }, [supervisorUCData]);

// const previousData = useMemo(() => {
//   return supervisorUCData.filter(
//     (item) => item.campaign?.campaignStatus === "previous",
//   );
// }, [supervisorUCData]);

// const upcomingData = useMemo(() => {
//   return supervisorUCData.filter(
//     (item) => item.campaign?.campaignStatus === "upcoming",
//   );
// }, [supervisorUCData]);

// const currentCampaign = currentData[0]?.campaign || null;

//   // ============================================================
//   // SUMMARY
//   //
//   // IMPORTANT:
//   // These totals are ALL CAMPAIGNS totals
//   // for this Supervisor + Union Council.
//   // ============================================================

//   const totalRecorded = supervisorUCData.length;

//   const totalCovered = supervisorUCData.filter(
//     (item) => item.vaccinationStatus === "covered" || Boolean(item.coveredDate),
//   ).length;

//   const currentUC = supervisorUnionCouncilName;

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="min-h-full p-4 md:p-6">
//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="mb-6 md:mb-7">
//         <h1 className="text-text text-2xl font-bold md:text-3xl">Supervisor</h1>

//         <p className="text-text-secondary mt-1 text-sm">
//           Manage teams and campaign-wise Zerodose records
//         </p>
//       </div>

//       {/* ======================================================
//           ERROR
//       ====================================================== */}

//       {error && (
//         <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       {/* ======================================================
//           SUMMARY
//       ====================================================== */}

//       <SupervisorSummaryCards
//         currentUC={currentUC}
//         totalTeams={activeTeams.length}
//         recordedZerodose={totalRecorded}
//         coveredZerodose={totalCovered}
//       />

//       {/* ======================================================
//           ACTIONS
//       ====================================================== */}

//       <SupervisorActions />

//       {/* ======================================================
//           TABS
//       ====================================================== */}

//       <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

//       {/* ======================================================
//           CURRENT CAMPAIGN
//       ====================================================== */}

//       {activeTab === "current" && (
//         <CurrentCampaign
//           campaign={currentCampaign}
//           data={currentData}
//           activeTeams={activeTeams}
//           loading={loading}
//         />
//       )}

//       {/* ======================================================
//           PREVIOUS CAMPAIGNS
//       ====================================================== */}

//       {activeTab === "previous" && (
//         <PreviousCampaigns campaigns={previousData} loading={loading} />
//       )}
//     </div>
//   );
// }

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

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");

  const [campaigns, setCampaigns] = useState([]);
  const [zerodoses, setZerodoses] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // GET ID HELPER
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
  //
  // Status DB se nahi le rahe.
  // Dates ke according automatically calculate hoga.
  //
  // startDate <= today <= endDate => current
  // today < startDate              => upcoming
  // today > endDate                => previous
  //
  // ============================================================

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

  // ============================================================
  // FETCH SUPERVISOR DATA
  // ============================================================

  useEffect(() => {
    const fetchSupervisorData = async () => {
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
          throw new Error("Supervisor authentication data not found.");
        }

        const supervisorId = String(storedAuthUser.id);

        // --------------------------------------------------------
        // FETCH CAMPAIGNS
        // --------------------------------------------------------

        const campaignsResponse = await getCampaigns();

        if (!campaignsResponse?.success) {
          throw new Error(
            campaignsResponse?.message || "Failed to fetch campaigns.",
          );
        }

        setCampaigns(campaignsResponse.data || []);

        // --------------------------------------------------------
        // FETCH SUPERVISOR WORKERS
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // FETCH ALL ZERODOSE
        // --------------------------------------------------------
        //
        // Existing API structure ko maintain kar rahe hain.
        // Multiple pages fetch hongi.
        //
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
  // SUPERVISOR UNION COUNCIL ID
  // ============================================================

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

  // ============================================================
  // SUPERVISOR UNION COUNCIL NAME
  // ============================================================

  const supervisorUnionCouncilName = useMemo(() => {
    for (const worker of workers) {
      if (worker.unionCouncil?.name) {
        return worker.unionCouncil.name;
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

  // ============================================================
  // NORMALIZED CAMPAIGNS
  // ============================================================
  //
  // Har campaign ke saath automatically status attach kar rahe hain.
  //
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
  // SUPERVISOR ZERODOSE DATA
  // ============================================================
  //
  // Pehle supervisor + UC ke records filter karenge.
  //
  // API populated fields de to bhi work karega.
  // IDs de to bhi work karega.
  //
  // ============================================================

  const supervisorUCData = useMemo(() => {
    if (!supervisorUnionCouncilId) {
      return [];
    }

    return zerodoses.filter((item) => {
      // --------------------------------------------------------
      // SUPERVISOR CHECK
      // --------------------------------------------------------

      const itemSupervisorId = getId(
        item.supervisor || item.supervisorId || item.supervisor?._id,
      );

      // --------------------------------------------------------
      // UNION COUNCIL CHECK
      // --------------------------------------------------------

      const itemUnionCouncilId = getId(
        item.unionCouncil || item.unionCouncilId || item.unionCouncil?._id,
      );

      // UC must match
      if (
        !itemUnionCouncilId ||
        String(itemUnionCouncilId) !== String(supervisorUnionCouncilId)
      ) {
        return false;
      }

      // Agar Zerodose mein supervisor available hai
      // to supervisor bhi match hona chahiye.
      if (
        itemSupervisorId &&
        itemSupervisorId !== null &&
        itemSupervisorId !== undefined
      ) {
        // auth user ID
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

  // ============================================================
  // CURRENT CAMPAIGN ZERODOSE DATA
  // ============================================================
  //
  // IMPORTANT:
  // Current campaign directly campaign API se aa rahi hai.
  //
  // Zerodose records ko current campaign ID ke according filter
  // kar rahe hain.
  //
  // ============================================================

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

        // Agar API ne campaign populate nahi kiya
        // to frontend ko complete campaign object milega.
        campaign: item.campaign || currentCampaign,
      }));
  }, [supervisorUCData, currentCampaign]);

  // ============================================================
  // PREVIOUS CAMPAIGN ZERODOSE DATA
  // ============================================================
  //
  // PreviousCampaigns component ko campaign ke saath records
  // chahiye.
  //
  // Har record ke campaign object ko normalize kar rahe hain.
  //
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

  // ============================================================
  // UPCOMING DATA
  // ============================================================
  //
  // Future campaign ke records normally zero honge.
  // Agar test/dummy records hain to unko bhi available rakha hai.
  //
  // ============================================================

  const upcomingData = useMemo(() => {
    if (!upcomingCampaigns.length || !supervisorUCData.length) {
      return [];
    }

    const upcomingCampaignIds = new Set(
      upcomingCampaigns.map((campaign) => getId(campaign)).filter(Boolean),
    );

    return supervisorUCData
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
  }, [supervisorUCData, upcomingCampaigns]);

  // ============================================================
  // SUMMARY
  // ============================================================
  //
  // Summary ko ALL supervisor + UC Zerodose records par rakha hai.
  //
  // ============================================================

  const totalRecorded = supervisorUCData.length;

  const totalCovered = supervisorUCData.filter(
    (item) => item.vaccinationStatus === "covered" || Boolean(item.coveredDate),
  ).length;

  const currentUC = supervisorUnionCouncilName;

  // ============================================================
  // DEBUG
  // ============================================================
  //
  // Development mein console mein easily check kar sakte ho.
  //
  // ============================================================

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
