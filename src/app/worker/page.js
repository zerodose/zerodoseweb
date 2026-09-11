"use client";

import { useEffect, useMemo, useState } from "react";

import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
import ZerodoseStats from "@/components/worker/ZerodoseStats";
import WorkerActions from "@/components/worker/WorkerActions";
import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

import { getZerodoses } from "@/api/zerodoseApi";
import { getCampaigns } from "@/api/campaignApi";

export default function Page() {
  const [campaign, setCampaign] = useState(null);
  const [previousCampaigns, setPreviousCampaigns] = useState([]);

  const [zerodoses, setZerodoses] = useState([]);
  const [previousZerodoses, setPreviousZerodoses] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingZerodose, setLoadingZerodose] = useState(true);

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // ============================================================
  // Current Campaign
  // ============================================================

  const loadCampaign = async () => {
    try {
      setLoadingCampaign(true);
      setError("");

      // Sirf CURRENT campaign
      const response = await getCampaigns({
        status: "current",
        page: 1,
        limit: 1,
      });

      // ========================================================
      // Handle different possible API response structures
      // ========================================================

      const campaigns = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response)
            ? response
            : [];

      const currentCampaign = campaigns[0] || null;

      setCampaign(currentCampaign);

      return currentCampaign;
    } catch (error) {
      console.error("Get current campaign error:", error);

      setCampaign(null);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to load current campaign.",
      );

      return null;
    } finally {
      setLoadingCampaign(false);
    }
  };

  // ============================================================
  // Current Zerodose
  // ============================================================

  const loadZerodose = async (campaignId = campaign?._id) => {
    try {
      setLoadingZerodose(true);
      setError("");

      if (!campaignId) {
        setZerodoses([]);
        setPage(1);
        setHasMore(false);
        return;
      }

      const response = await getZerodoses({
        page: 1,
        limit: 10,
        sortBy: "recordDate",
        sortOrder: "desc",
        campaign: campaignId,
        isActive: true,
      });

      setZerodoses(response?.data || []);
      setPage(1);
      setHasMore(response?.pagination?.hasNextPage ?? false);
    } catch (error) {
      console.error("Get worker zerodose error:", error);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to load zerodose records.",
      );
    } finally {
      setLoadingZerodose(false);
    }
  };

  // ============================================================
  // Load More Zerodose
  // ============================================================

  const loadMoreZerodose = async () => {
    if (loadingMore || !hasMore || !campaign?._id) return;

    try {
      setLoadingMore(true);

      const nextPage = page + 1;

      const response = await getZerodoses({
        page: nextPage,
        limit: 10,
        campaign: campaign._id,
        sortBy: "recordDate",
        sortOrder: "desc",
      });

      const newRecords = response?.data || [];

      setZerodoses((prev) => [...prev, ...newRecords]);

      setPage(nextPage);

      setHasMore(response?.pagination?.hasNextPage ?? false);
    } catch (error) {
      console.error("Load more zerodose error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ============================================================
  // Campaign pehle load hoga
  // ============================================================

  useEffect(() => {
    loadCampaign();
  }, []);

  // ============================================================
  // Campaign milne ke baad zerodose load hoga
  // ============================================================

  useEffect(() => {
    if (campaign?._id) {
      loadZerodose(campaign._id);
    } else if (!loadingCampaign) {
      setZerodoses([]);
      setPage(1);
      setHasMore(false);
      setLoadingZerodose(false);
    }
  }, [campaign?._id, loadingCampaign]);

  // ============================================================
  // Current Zerodose
  // ============================================================

  const currentZerodoses = useMemo(() => {
    return zerodoses;
  }, [zerodoses]);

  // ============================================================
  // Statistics
  // ============================================================

  const totalZerodose = currentZerodoses.length;

  const visitedZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "visited",
  ).length;

  const coveredZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "covered",
  ).length;

  const recordedZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "recorded",
  ).length;

  // ============================================================
  // Helpers
  // ============================================================

  const getStatus = (item) => {
    if (item.vaccinationStatus === "covered") {
      return {
        label: "Covered",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (item.vaccinationStatus === "visited") {
      return {
        label: "Visited",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      };
    }

    return {
      label: "Recorded",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    };
  };

  // ============================================================
  // Refresh
  // ============================================================

  const handleRefresh = async () => {
    const refreshedCampaign = await loadCampaign();

    // IMPORTANT:
    // loadCampaign ke baad React state update hone ka wait nahi
    // karna. Returned campaign directly use karenge.
    if (refreshedCampaign?._id) {
      await loadZerodose(refreshedCampaign._id);
    } else {
      setZerodoses([]);
      setPage(1);
      setHasMore(false);
      setLoadingZerodose(false);
    }
  };

  return (
    <div className="min-h-full">
      {error && (
        <div className="border-border bg-surface mb-5 flex items-center justify-between gap-3 rounded-xl border p-4">
          <p className="text-text-secondary text-sm">{error}</p>

          <button
            type="button"
            onClick={handleRefresh}
            className="text-primary flex shrink-0 items-center gap-2 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

      <ZerodoseStats
        total={totalZerodose}
        recorded={recordedZerodose}
        visited={visitedZerodose}
        covered={coveredZerodose}
        loading={loadingZerodose}
      />

      <WorkerActions campaign={campaign} />

      <ZerodoseCampaignSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentZerodoses={currentZerodoses}
        previousZerodoses={previousZerodoses}
        loading={loadingZerodose}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMoreZerodose}
        onRefresh={handleRefresh}
        getStatus={getStatus}
        previousCampaigns={previousCampaigns}
      />
    </div>
  );
}

// "use client";

// import { useEffect, useMemo, useState } from "react";

// import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
// import ZerodoseStats from "@/components/worker/ZerodoseStats";
// import WorkerActions from "@/components/worker/WorkerActions";
// import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

// import { getZerodoses } from "@/api/zerodoseApi";
// import { getCampaigns } from "@/api/campaignApi";

// export default function Page() {
//   const [campaign, setCampaign] = useState(null);
//   const [previousCampaigns, setPreviousCampaigns] = useState([]);

//   const [zerodoses, setZerodoses] = useState([]);
//   const [previousZerodoses, setPreviousZerodoses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [loadingCampaign, setLoadingCampaign] = useState(true);
//   const [loadingZerodose, setLoadingZerodose] = useState(true);

//   const [error, setError] = useState("");
//   const [activeTab, setActiveTab] = useState("current");

//   // ============================================================
//   // Current Campaign
//   // ============================================================

//   const loadCampaign = async () => {
//     try {
//       setLoadingCampaign(true);
//       setError("");

//       // Sirf CURRENT campaign
//       const response = await getCampaigns({
//         status: "current",
//         page: 1,
//         limit: 1,
//       });

//       // ========================================================
//       // Handle different possible API response structures
//       // ========================================================

//       const campaigns =
//         Array.isArray(response?.data)
//           ? response.data
//           : Array.isArray(response?.data?.data)
//             ? response.data.data
//             : Array.isArray(response)
//               ? response
//               : [];

//       const currentCampaign = campaigns[0] || null;

//       setCampaign(currentCampaign);

//       return currentCampaign;
//     } catch (error) {
//       console.error("Get current campaign error:", error);

//       setCampaign(null);

//       setError(
//         error?.response?.data?.message ||
//           error?.response?.data?.error?.message ||
//           error?.message ||
//           "Failed to load current campaign.",
//       );

//       return null;
//     } finally {
//       setLoadingCampaign(false);
//     }
//   };

//   // ============================================================
//   // Current Zerodose
//   // ============================================================

//   const loadZerodose = async (campaignId = campaign?._id) => {
//     try {
//       setLoadingZerodose(true);
//       setError("");

//       if (!campaignId) {
//         setZerodoses([]);
//         setPage(1);
//         setHasMore(false);
//         return;
//       }

//       const response = await getZerodoses({
//         page: 1,
//         limit: 10,
//         sortBy: "recordDate",
//         sortOrder: "desc",
//         campaign: campaignId,
//         isActive: true,
//       });

//       setZerodoses(response?.data || []);
//       setPage(1);
//       setHasMore(response?.pagination?.hasNextPage ?? false);
//     } catch (error) {
//       console.error("Get worker zerodose error:", error);

//       setError(
//         error?.response?.data?.message ||
//           error?.response?.data?.error?.message ||
//           error?.message ||
//           "Failed to load zerodose records.",
//       );
//     } finally {
//       setLoadingZerodose(false);
//     }
//   };

//   // ============================================================
//   // Load More Zerodose
//   // ============================================================

//   const loadMoreZerodose = async () => {
//     if (loadingMore || !hasMore || !campaign?._id) return;

//     try {
//       setLoadingMore(true);

//       const nextPage = page + 1;

//       const response = await getZerodoses({
//         page: nextPage,
//         limit: 10,
//         campaign: campaign._id,
//         sortBy: "recordDate",
//         sortOrder: "desc",
//       });

//       const newRecords = response?.data || [];

//       setZerodoses((prev) => [...prev, ...newRecords]);

//       setPage(nextPage);

//       setHasMore(response?.pagination?.hasNextPage ?? false);
//     } catch (error) {
//       console.error("Load more zerodose error:", error);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // ============================================================
//   // Campaign pehle load hoga
//   // ============================================================

//   useEffect(() => {
//     loadCampaign();
//   }, []);

//   // ============================================================
//   // Campaign milne ke baad zerodose load hoga
//   // ============================================================

//   useEffect(() => {
//     if (campaign?._id) {
//       loadZerodose(campaign._id);
//     } else if (!loadingCampaign) {
//       setZerodoses([]);
//       setPage(1);
//       setHasMore(false);
//       setLoadingZerodose(false);
//     }
//   }, [campaign?._id, loadingCampaign]);

//   // ============================================================
//   // Current Zerodose
//   // ============================================================

//   const currentZerodoses = useMemo(() => {
//     return zerodoses;
//   }, [zerodoses]);

//   // ============================================================
//   // Statistics
//   // ============================================================

//   const totalZerodose = currentZerodoses.length;

//   const visitedZerodose = currentZerodoses.filter(
//     (item) => item.vaccinationStatus === "visited",
//   ).length;

//   const coveredZerodose = currentZerodoses.filter(
//     (item) => item.vaccinationStatus === "covered",
//   ).length;

//   const recordedZerodose = currentZerodoses.filter(
//     (item) => item.vaccinationStatus === "recorded",
//   ).length;

//   // ============================================================
//   // Helpers
//   // ============================================================

//   const getStatus = (item) => {
//     if (item.vaccinationStatus === "covered") {
//       return {
//         label: "Covered",
//         className:
//           "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
//       };
//     }

//     if (item.vaccinationStatus === "visited") {
//       return {
//         label: "Visited",
//         className:
//           "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
//       };
//     }

//     return {
//       label: "Recorded",
//       className:
//         "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
//     };
//   };

//   // ============================================================
//   // Refresh
//   // ============================================================

//   const handleRefresh = async () => {
//     const refreshedCampaign = await loadCampaign();

//     // IMPORTANT:
//     // loadCampaign ke baad React state update hone ka wait nahi
//     // karna. Returned campaign directly use karenge.
//     if (refreshedCampaign?._id) {
//       await loadZerodose(refreshedCampaign._id);
//     } else {
//       setZerodoses([]);
//       setPage(1);
//       setHasMore(false);
//       setLoadingZerodose(false);
//     }
//   };

//   return (
//     <div className="min-h-full">
//       {error && (
//         <div className="border-border bg-surface mb-5 flex items-center justify-between gap-3 rounded-xl border p-4">
//           <p className="text-text-secondary text-sm">{error}</p>

//           <button
//             type="button"
//             onClick={handleRefresh}
//             className="text-primary flex shrink-0 items-center gap-2 text-sm font-medium"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

//       <ZerodoseStats
//         total={totalZerodose}
//         recorded={recordedZerodose}
//         visited={visitedZerodose}
//         covered={coveredZerodose}
//         loading={loadingZerodose}
//       />

//       <WorkerActions campaign={campaign} />

//       <ZerodoseCampaignSection
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         currentZerodoses={currentZerodoses}
//         previousZerodoses={previousZerodoses}
//         loading={loadingZerodose}
//         loadingMore={loadingMore}
//         hasMore={hasMore}
//         onLoadMore={loadMoreZerodose}
//         onRefresh={handleRefresh}
//         getStatus={getStatus}
//         previousCampaigns={previousCampaigns}
//       />
//     </div>
//   );
// }

// // "use client";

// // import { useEffect, useMemo, useState } from "react";

// // import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
// // import ZerodoseStats from "@/components/worker/ZerodoseStats";
// // import WorkerActions from "@/components/worker/WorkerActions";
// // import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

// // import { getZerodoses } from "@/api/zerodoseApi";
// // import { getCampaigns } from "@/api/campaignApi";

// // export default function Page() {
// //   const [campaign, setCampaign] = useState(null);
// //   const [previousCampaigns, setPreviousCampaigns] = useState([]);

// //   const [zerodoses, setZerodoses] = useState([]);
// //   const [previousZerodoses, setPreviousZerodoses] = useState([]);
// //   const [page, setPage] = useState(1);
// //   const [hasMore, setHasMore] = useState(true);
// //   const [loadingMore, setLoadingMore] = useState(false);
// //   const [loadingCampaign, setLoadingCampaign] = useState(true);
// //   const [loadingZerodose, setLoadingZerodose] = useState(true);

// //   const [error, setError] = useState("");
// //   const [activeTab, setActiveTab] = useState("current");

// //   // ============================================================
// //   // Current Campaign
// //   // ============================================================

// //   const loadCampaign = async () => {
// //     try {
// //       setLoadingCampaign(true);
// //       setError("");

// //       // Sirf CURRENT campaign
// //       const response = await getCampaigns({
// //         status: "current",
// //         page: 1,
// //         limit: 1,
// //       });

// //       const campaigns = response?.data || [];

// //       setCampaign(campaigns[0] || null);
// //     } catch (error) {
// //       console.error("Get current campaign error:", error);

// //       setError(
// //         error?.response?.data?.message ||
// //           error?.message ||
// //           "Failed to load current campaign.",
// //       );
// //     } finally {
// //       setLoadingCampaign(false);
// //     }
// //   };

// //   // ============================================================
// //   // Current Zerodose
// //   // ============================================================

// //   const loadZerodose = async () => {
// //     try {
// //       setLoadingZerodose(true);
// //       setError("");

// //       if (!campaign?._id) {
// //         setZerodoses([]);
// //         setPage(1);
// //         setHasMore(false);
// //         return;
// //       }

// //       const response = await getZerodoses({
// //         page: 1,
// //         limit: 10,
// //         sortBy: "recordDate",
// //         sortOrder: "desc",
// //         campaign: campaign._id,
// //         isActive: true,
// //       });

// //       setZerodoses(response?.data || []);
// //       setPage(1);
// //       setHasMore(response?.pagination?.hasNextPage ?? false);
// //     } catch (error) {
// //       console.error("Get worker zerodose error:", error);

// //       setError(
// //         error?.response?.data?.message ||
// //           error?.message ||
// //           "Failed to load zerodose records.",
// //       );
// //     } finally {
// //       setLoadingZerodose(false);
// //     }
// //   };

// //   const loadMoreZerodose = async () => {
// //     if (loadingMore || !hasMore || !campaign?._id) return;

// //     try {
// //       setLoadingMore(true);

// //       const nextPage = page + 1;

// //       const response = await getZerodoses({
// //         page: nextPage,
// //         limit: 10,
// //         campaign: campaign._id,
// //         sortBy: "recordDate",
// //         sortOrder: "desc",
// //       });

// //       const newRecords = response?.data || [];

// //       setZerodoses((prev) => [...prev, ...newRecords]);

// //       setPage(nextPage);

// //       setHasMore(response?.pagination?.hasNextPage ?? false);
// //     } catch (error) {
// //       console.error("Load more zerodose error:", error);
// //     } finally {
// //       setLoadingMore(false);
// //     }
// //   };
// //   // Campaign pehle load hoga
// //   useEffect(() => {
// //     loadCampaign();
// //   }, []);

// //   // Campaign milne ke baad zerodose load hoga
// //   useEffect(() => {
// //     if (campaign?._id) {
// //       loadZerodose();
// //     }
// //   }, [campaign?._id]);

// //   // ============================================================
// //   // Current Zerodose
// //   // ============================================================

// //   const currentZerodoses = useMemo(() => {
// //     return zerodoses;
// //   }, [zerodoses]);

// //   // ============================================================
// //   // Statistics
// //   // ============================================================

// //   const totalZerodose = currentZerodoses.length;

// //   const visitedZerodose = currentZerodoses.filter(
// //     (item) => item.vaccinationStatus === "visited",
// //   ).length;

// //   const coveredZerodose = currentZerodoses.filter(
// //     (item) => item.vaccinationStatus === "covered",
// //   ).length;

// //   const recordedZerodose = currentZerodoses.filter(
// //     (item) => item.vaccinationStatus === "recorded",
// //   ).length;

// //   // ============================================================
// //   // Helpers
// //   // ============================================================

// //   const getStatus = (item) => {
// //     if (item.vaccinationStatus === "covered") {
// //       return {
// //         label: "Covered",
// //         className:
// //           "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
// //       };
// //     }

// //     if (item.vaccinationStatus === "visited") {
// //       return {
// //         label: "Visited",
// //         className:
// //           "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
// //       };
// //     }

// //     return {
// //       label: "Recorded",
// //       className:
// //         "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
// //     };
// //   };

// //   // ============================================================
// //   // Refresh
// //   // ============================================================

// //   const handleRefresh = async () => {
// //     await loadCampaign();

// //     if (campaign?._id) {
// //       await loadZerodose();
// //     }
// //   };

// //   return (
// //     <div className="min-h-full">
// //       {error && (
// //         <div className="border-border bg-surface mb-5 flex items-center justify-between gap-3 rounded-xl border p-4">
// //           <p className="text-text-secondary text-sm">{error}</p>

// //           <button
// //             type="button"
// //             onClick={handleRefresh}
// //             className="text-primary flex shrink-0 items-center gap-2 text-sm font-medium"
// //           >
// //             Retry
// //           </button>
// //         </div>
// //       )}

// //       <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

// //       <ZerodoseStats
// //         total={totalZerodose}
// //         recorded={recordedZerodose}
// //         visited={visitedZerodose}
// //         covered={coveredZerodose}
// //         loading={loadingZerodose}
// //       />

// //       <WorkerActions campaign={campaign} />

// //       <ZerodoseCampaignSection
// //         activeTab={activeTab}
// //         onTabChange={setActiveTab}
// //         currentZerodoses={currentZerodoses}
// //         previousZerodoses={previousZerodoses}
// //         loading={loadingZerodose}
// //         loadingMore={loadingMore}
// //         hasMore={hasMore}
// //         onLoadMore={loadMoreZerodose}
// //         onRefresh={handleRefresh}
// //         getStatus={getStatus}
// //         previousCampaigns={previousCampaigns}
// //       />
// //     </div>
// //   );
// // }
