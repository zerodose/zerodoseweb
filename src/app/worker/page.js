// // // "use client";

// // // import { useCallback, useEffect, useState } from "react";

// // // import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
// // // import ZerodoseStats from "@/components/worker/ZerodoseStats";
// // // import WorkerActions from "@/components/worker/WorkerActions";
// // // import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

// // // import { getZerodoses } from "@/api/zerodoseApi";
// // // import { getCampaigns } from "@/api/campaignApi";

// // // export default function Page() {
// // //   // ============================================================
// // //   // STATE
// // //   // ============================================================

// // //   const [campaign, setCampaign] = useState(null);
// // //   const [previousCampaigns, setPreviousCampaigns] = useState([]);

// // //   const [zerodoses, setZerodoses] = useState([]);
// // //   const [previousZerodoses, setPreviousZerodoses] = useState([]);

// // //   const [page, setPage] = useState(1);
// // //   const [hasMore, setHasMore] = useState(true);
// // //   const [loadingMore, setLoadingMore] = useState(false);

// // //   const [loadingCampaign, setLoadingCampaign] = useState(true);
// // //   const [loadingZerodose, setLoadingZerodose] = useState(true);

// // //   const [error, setError] = useState("");
// // //   const [activeTab, setActiveTab] = useState("current");

// // //   const fetchWorkerData = useCallback(async () => {

// // //     const campaignResponse = await getCampaigns({
// // //       status: "current",
// // //       page: 1,
// // //       limit: 1,
// // //     });

// // //     console.log("📦 Current campaign response:", campaignResponse);

// // //     const campaigns = Array.isArray(campaignResponse?.data)
// // //       ? campaignResponse.data
// // //       : [];

// // //     const currentCampaign = campaigns[0] || null;

// // //     console.log("🎯 Current campaign:", currentCampaign);

// // //     // ----------------------------------------------------------
// // //     // 2. No current campaign
// // //     // ----------------------------------------------------------

// // //     if (!currentCampaign?._id) {
// // //       return {
// // //         campaign: null,
// // //         zerodoses: [],
// // //         hasMore: false,
// // //       };
// // //     }

// // //     // ----------------------------------------------------------
// // //     // 3. Get zerodose records for current campaign
// // //     // ----------------------------------------------------------

// // //     console.log("🔄 Loading zerodose for campaign:", currentCampaign._id);

// // //     const zerodoseResponse = await getZerodoses({
// // //       page: 1,
// // //       limit: 10,
// // //       sortBy: "recordDate",
// // //       sortOrder: "desc",
// // //       campaign: currentCampaign._id,
// // //       isActive: true,
// // //     });

// // //     console.log("📦 Zerodose response:", zerodoseResponse);

// // //     const records = Array.isArray(zerodoseResponse?.data)
// // //       ? zerodoseResponse.data
// // //       : [];

// // //     return {
// // //       campaign: currentCampaign,
// // //       zerodoses: records,
// // //       hasMore: zerodoseResponse?.pagination?.hasNextPage ?? false,
// // //     };
// // //   }, []);

// // //   // ============================================================
// // //   // INITIAL LOAD
// // //   //
// // //   // React 19 friendly:
// // //   // The effect does not synchronously call a function that
// // //   // immediately performs setState.
// // //   //
// // //   // State updates happen only after the async request completes.
// // //   // ============================================================

// // //   useEffect(() => {
// // //     let cancelled = false;

// // //     const loadInitialData = async () => {
// // //       try {
// // //         console.log("🔄 Loading worker page data...");

// // //         const result = await fetchWorkerData();

// // //         // Component may have unmounted while request was running.
// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         // ------------------------------------------------------
// // //         // Update campaign state
// // //         // ------------------------------------------------------

// // //         setCampaign(result.campaign);

// // //         // ------------------------------------------------------
// // //         // Update zerodose state
// // //         // ------------------------------------------------------

// // //         setZerodoses(result.zerodoses);
// // //         setPage(1);
// // //         setHasMore(result.hasMore);

// // //         // ------------------------------------------------------
// // //         // Loading complete
// // //         // ------------------------------------------------------

// // //         setLoadingCampaign(false);
// // //         setLoadingZerodose(false);
// // //         setError("");
// // //       } catch (error) {
// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         console.error("❌ Get worker page data error:", error);

// // //         console.error("❌ API response:", error?.response?.data);

// // //         setCampaign(null);
// // //         setZerodoses([]);
// // //         setPage(1);
// // //         setHasMore(false);

// // //         setError(
// // //           error?.response?.data?.message ||
// // //             error?.response?.data?.error?.message ||
// // //             error?.message ||
// // //             "Failed to load worker data.",
// // //         );

// // //         setLoadingCampaign(false);
// // //         setLoadingZerodose(false);
// // //       }
// // //     };

// // //     loadInitialData();

// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //   }, [fetchWorkerData]);

// // //   // ============================================================
// // //   // LOAD MORE ZERODOSE
// // //   // ============================================================

// // //   const loadMoreZerodose = async () => {
// // //     if (loadingMore || !hasMore || !campaign?._id) {
// // //       return;
// // //     }

// // //     try {
// // //       setLoadingMore(true);

// // //       const nextPage = page + 1;

// // //       console.log("🔄 Loading zerodose page:", nextPage);

// // //       const response = await getZerodoses({
// // //         page: nextPage,
// // //         limit: 10,
// // //         campaign: campaign._id,
// // //         sortBy: "recordDate",
// // //         sortOrder: "desc",
// // //         isActive: true,
// // //       });

// // //       console.log("📦 Load more zerodose response:", response);

// // //       const newRecords = Array.isArray(response?.data) ? response.data : [];

// // //       setZerodoses((prev) => [...prev, ...newRecords]);

// // //       setPage(nextPage);

// // //       setHasMore(response?.pagination?.hasNextPage ?? false);
// // //     } catch (error) {
// // //       console.error("❌ Load more zerodose error:", error);

// // //       setError(
// // //         error?.response?.data?.message ||
// // //           error?.response?.data?.error?.message ||
// // //           error?.message ||
// // //           "Failed to load more zerodose records.",
// // //       );
// // //     } finally {
// // //       setLoadingMore(false);
// // //     }
// // //   };

// // //   // ============================================================
// // //   // CURRENT ZERODOSES
// // //   // ============================================================

// // //   const currentZerodoses = zerodoses;

// // //   // ============================================================
// // //   // ZERODOSE STATS
// // //   // ============================================================

// // //   const totalZerodose = currentZerodoses.length;

// // //   const visitedZerodose = currentZerodoses.filter(
// // //     (item) => item?.vaccinationStatus === "visited",
// // //   ).length;

// // //   const coveredZerodose = currentZerodoses.filter(
// // //     (item) => item?.vaccinationStatus === "covered",
// // //   ).length;

// // //   const recordedZerodose = currentZerodoses.filter(
// // //     (item) => item?.vaccinationStatus === "recorded",
// // //   ).length;

// // //   // ============================================================
// // //   // STATUS FORMATTER
// // //   // ============================================================

// // //   const getStatus = (item) => {
// // //     const status = String(item?.vaccinationStatus || "recorded").toLowerCase();

// // //     if (status === "covered") {
// // //       return {
// // //         label: "Covered",
// // //         className:
// // //           "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
// // //       };
// // //     }

// // //     if (status === "visited") {
// // //       return {
// // //         label: "Visited",
// // //         className:
// // //           "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
// // //       };
// // //     }

// // //     return {
// // //       label: "Recorded",
// // //       className:
// // //         "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
// // //     };
// // //   };

// // //   const handleRefresh = async () => {
// // //     try {
// // //       setError("");

// // //       setLoadingCampaign(true);
// // //       setLoadingZerodose(true);

// // //       const result = await fetchWorkerData();

// // //       // --------------------------------------------------------
// // //       // Update campaign
// // //       // --------------------------------------------------------

// // //       setCampaign(result.campaign);

// // //       // --------------------------------------------------------
// // //       // Update zerodose
// // //       // --------------------------------------------------------

// // //       setZerodoses(result.zerodoses);
// // //       setPage(1);
// // //       setHasMore(result.hasMore);

// // //       // --------------------------------------------------------
// // //       // Loading complete
// // //       // --------------------------------------------------------

// // //       setLoadingCampaign(false);
// // //       setLoadingZerodose(false);
// // //     } catch (error) {
// // //       console.error("❌ Refresh error:", error);

// // //       console.error("❌ API response:", error?.response?.data);

// // //       setCampaign(null);
// // //       setZerodoses([]);
// // //       setPage(1);
// // //       setHasMore(false);

// // //       setError(
// // //         error?.response?.data?.message ||
// // //           error?.response?.data?.error?.message ||
// // //           error?.message ||
// // //           "Failed to refresh data.",
// // //       );

// // //       setLoadingCampaign(false);
// // //       setLoadingZerodose(false);
// // //     }
// // //   };

// // //   // ============================================================
// // //   // UI
// // //   // ============================================================

// // //   return (
// // //     <div className="min-h-full">
// // //       {/* ======================================================
// // //           ERROR
// // //       ====================================================== */}

// // //       {error && (
// // //         <div className="border-border bg-surface mb-5 flex items-center justify-between gap-3 rounded-xl border p-4">
// // //           <p className="text-text-secondary text-sm">{error}</p>

// // //           <button
// // //             type="button"
// // //             onClick={handleRefresh}
// // //             className="text-primary flex shrink-0 items-center gap-2 text-sm font-medium"
// // //           >
// // //             Retry
// // //           </button>
// // //         </div>
// // //       )}

// // //       {/* ======================================================
// // //           CURRENT CAMPAIGN
// // //       ====================================================== */}

// // //       <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

// // //       {/* ======================================================
// // //           STATS
// // //       ====================================================== */}

// // //       <ZerodoseStats
// // //         total={totalZerodose}
// // //         recorded={recordedZerodose}
// // //         visited={visitedZerodose}
// // //         covered={coveredZerodose}
// // //         loading={loadingZerodose}
// // //       />

// // //       {/* ======================================================
// // //           ACTIONS
// // //       ====================================================== */}

// // //       <WorkerActions campaign={campaign} />

// // //       {/* ======================================================
// // //           CAMPAIGN SECTION
// // //       ====================================================== */}

// // //       <ZerodoseCampaignSection
// // //         activeTab={activeTab}
// // //         onTabChange={setActiveTab}
// // //         currentZerodoses={currentZerodoses}
// // //         previousZerodoses={previousZerodoses}
// // //         loading={loadingZerodose}
// // //         loadingMore={loadingMore}
// // //         hasMore={hasMore}
// // //         onLoadMore={loadMoreZerodose}
// // //         onRefresh={handleRefresh}
// // //         getStatus={getStatus}
// // //         previousCampaigns={previousCampaigns}
// // //       />
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useCallback, useEffect, useState } from "react";

// // import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
// // import ZerodoseStats from "@/components/worker/ZerodoseStats";
// // import WorkerActions from "@/components/worker/WorkerActions";
// // import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

// // import { getWorkerZerodose } from "@/api/zerodoseApi";
// // import { getCampaigns } from "@/api/campaignApi";
// // import { getWorkerSummary } from "@/api/dashboardApi";

// // export default function Page() {
// //   // ============================================================
// //   // STATE
// //   // ============================================================

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
// //   // WORKER SUMMARY STATE
// //   // ============================================================

// //   const [summary, setSummary] = useState({
// //     total: 0,
// //     recorded: 0,
// //     visited: 0,
// //     covered: 0,
// //   });

// //   // ============================================================
// //   // FETCH WORKER DATA
// //   // ============================================================

// //   const fetchWorkerData = useCallback(async () => {
// //     // ----------------------------------------------------------
// //     // 1. Get current campaign
// //     // ----------------------------------------------------------

// //     const campaignResponse = await getCampaigns({
// //       status: "current",
// //       page: 1,
// //       limit: 1,
// //     });

// //     console.log("📦 Current campaign response:", campaignResponse);

// //     const campaigns = Array.isArray(campaignResponse?.data)
// //       ? campaignResponse.data
// //       : [];

// //     const currentCampaign = campaigns[0] || null;

// //     console.log("🎯 Current campaign:", currentCampaign);

// //     // ----------------------------------------------------------
// //     // 2. Get worker summary
// //     // ----------------------------------------------------------

// //     console.log("📊 Loading worker summary...");

// //     const summaryResponse = await getWorkerSummary();

// //     console.log("📊 Worker summary response:", summaryResponse);

// //     const workerSummary = summaryResponse?.data || {};

// //     const normalizedSummary = {
// //       total: Number(workerSummary?.recordCount || 0),
// //       recorded: Number(workerSummary?.recordCount || 0),
// //       visited: Number(workerSummary?.visitCount || 0),
// //       covered: Number(workerSummary?.coveredCount || 0),
// //     };

// //     // ----------------------------------------------------------
// //     // 3. No current campaign
// //     // ----------------------------------------------------------

// //     if (!currentCampaign?._id) {
// //       return {
// //         campaign: null,
// //         zerodoses: [],
// //         hasMore: false,
// //         summary: normalizedSummary,
// //       };
// //     }

// //     // ----------------------------------------------------------
// //     // 4. Get worker Zerodose records
// //     // ----------------------------------------------------------

// //     console.log(
// //       "🔄 Loading worker zerodose for campaign:",
// //       currentCampaign._id,
// //     );

// //     const zerodoseResponse = await getWorkerZerodose({
// //       campaignId: currentCampaign._id,
// //     });

// //     console.log("📦 Worker zerodose response:", zerodoseResponse);

// //     const records = Array.isArray(zerodoseResponse?.data)
// //       ? zerodoseResponse.data
// //       : [];

// //     return {
// //       campaign: currentCampaign,
// //       zerodoses: records,
// //       hasMore: zerodoseResponse?.pagination?.hasNextPage ?? false,
// //       summary: normalizedSummary,
// //     };
// //   }, []);

// //   // ============================================================
// //   // INITIAL LOAD
// //   // ============================================================

// //   useEffect(() => {
// //     let cancelled = false;

// //     const loadInitialData = async () => {
// //       try {
// //         console.log("🔄 Loading worker page data...");

// //         const result = await fetchWorkerData();

// //         if (cancelled) {
// //           return;
// //         }

// //         // ------------------------------------------------------
// //         // Campaign
// //         // ------------------------------------------------------

// //         setCampaign(result.campaign);

// //         // ------------------------------------------------------
// //         // Zerodose
// //         // ------------------------------------------------------

// //         setZerodoses(result.zerodoses);
// //         setPage(1);
// //         setHasMore(result.hasMore);

// //         // ------------------------------------------------------
// //         // Worker Summary
// //         // ------------------------------------------------------

// //         setSummary(result.summary);

// //         // ------------------------------------------------------
// //         // Loading complete
// //         // ------------------------------------------------------

// //         setLoadingCampaign(false);
// //         setLoadingZerodose(false);
// //         setError("");
// //       } catch (error) {
// //         if (cancelled) {
// //           return;
// //         }

// //         console.error("❌ Get worker page data error:", error);
// //         console.error("❌ API response:", error?.response?.data);

// //         setCampaign(null);
// //         setZerodoses([]);
// //         setPage(1);
// //         setHasMore(false);

// //         setSummary({
// //           total: 0,
// //           recorded: 0,
// //           visited: 0,
// //           covered: 0,
// //         });

// //         setError(
// //           error?.response?.data?.message ||
// //             error?.response?.data?.error?.message ||
// //             error?.message ||
// //             "Failed to load worker data.",
// //         );

// //         setLoadingCampaign(false);
// //         setLoadingZerodose(false);
// //       }
// //     };

// //     loadInitialData();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [fetchWorkerData]);

// //   // ============================================================
// //   // LOAD MORE ZERODOSE
// //   // ============================================================

// //   const loadMoreZerodose = async () => {
// //     if (loadingMore || !hasMore || !campaign?._id) {
// //       return;
// //     }

// //     try {
// //       setLoadingMore(true);

// //       const nextPage = page + 1;

// //       console.log("🔄 Loading worker zerodose page:", nextPage);

// //       const response = await getWorkerZerodose({
// //         campaignId: campaign._id,
// //         page: nextPage,
// //         limit: 10,
// //       });

// //       console.log("📦 Load more worker zerodose response:", response);

// //       const newRecords = Array.isArray(response?.data) ? response.data : [];

// //       setZerodoses((prev) => [...prev, ...newRecords]);

// //       setPage(nextPage);

// //       setHasMore(response?.pagination?.hasNextPage ?? false);
// //     } catch (error) {
// //       console.error("❌ Load more zerodose error:", error);
// //       console.error("❌ API response:", error?.response?.data);

// //       setError(
// //         error?.response?.data?.message ||
// //           error?.response?.data?.error?.message ||
// //           error?.message ||
// //           "Failed to load more zerodose records.",
// //       );
// //     } finally {
// //       setLoadingMore(false);
// //     }
// //   };

// //   // ============================================================
// //   // CURRENT ZERODOSES
// //   // ============================================================

// //   const currentZerodoses = zerodoses;

// //   // ============================================================
// //   // ZERODOSE STATS
// //   //
// //   // IMPORTANT:
// //   // These values now come directly from worker-summary API.
// //   // Do NOT calculate them from currentZerodoses.
// //   // ============================================================

// //   const totalZerodose = summary.total;
// //   const recordedZerodose = summary.recorded;
// //   const visitedZerodose = summary.visited;
// //   const coveredZerodose = summary.covered;

// //   // ============================================================
// //   // STATUS FORMATTER
// //   // ============================================================

// //   const getStatus = (item) => {
// //     const recordDate = item?.recordDate;
// //     const visitDate = item?.visitDate;
// //     const coverDate = item?.coverDate;

// //     // ----------------------------------------------------------
// //     // Covered
// //     // ----------------------------------------------------------

// //     if (recordDate && visitDate && coverDate) {
// //       return {
// //         label: "Covered",
// //         className:
// //           "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
// //       };
// //     }

// //     // ----------------------------------------------------------
// //     // Visited
// //     // ----------------------------------------------------------

// //     if (recordDate && visitDate && !coverDate) {
// //       return {
// //         label: "Visited",
// //         className:
// //           "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
// //       };
// //     }

// //     // ----------------------------------------------------------
// //     // Recorded
// //     // ----------------------------------------------------------

// //     return {
// //       label: "Recorded",
// //       className:
// //         "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
// //     };
// //   };

// //   // ============================================================
// //   // REFRESH
// //   // ============================================================

// //   const handleRefresh = async () => {
// //     try {
// //       setError("");

// //       setLoadingCampaign(true);
// //       setLoadingZerodose(true);

// //       const result = await fetchWorkerData();

// //       // --------------------------------------------------------
// //       // Campaign
// //       // --------------------------------------------------------

// //       setCampaign(result.campaign);

// //       // --------------------------------------------------------
// //       // Zerodose
// //       // --------------------------------------------------------

// //       setZerodoses(result.zerodoses);
// //       setPage(1);
// //       setHasMore(result.hasMore);

// //       // --------------------------------------------------------
// //       // Worker Summary
// //       // --------------------------------------------------------

// //       setSummary(result.summary);

// //       // --------------------------------------------------------
// //       // Loading complete
// //       // --------------------------------------------------------

// //       setLoadingCampaign(false);
// //       setLoadingZerodose(false);
// //     } catch (error) {
// //       console.error("❌ Refresh error:", error);
// //       console.error("❌ API response:", error?.response?.data);

// //       setCampaign(null);
// //       setZerodoses([]);
// //       setPage(1);
// //       setHasMore(false);

// //       setSummary({
// //         total: 0,
// //         recorded: 0,
// //         visited: 0,
// //         covered: 0,
// //       });

// //       setError(
// //         error?.response?.data?.message ||
// //           error?.response?.data?.error?.message ||
// //           error?.message ||
// //           "Failed to refresh data.",
// //       );

// //       setLoadingCampaign(false);
// //       setLoadingZerodose(false);
// //     }
// //   };

// //   // ============================================================
// //   // UI
// //   // ============================================================

// //   return (
// //     <div className="min-h-full">
// //       {/* ======================================================
// //           ERROR
// //       ====================================================== */}

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

// //       {/* ======================================================
// //           CURRENT CAMPAIGN
// //       ====================================================== */}

// //       <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

// //       {/* ======================================================
// //           STATS
// //       ====================================================== */}

// //       <ZerodoseStats
// //         total={totalZerodose}
// //         recorded={recordedZerodose}
// //         visited={visitedZerodose}
// //         covered={coveredZerodose}
// //         loading={loadingZerodose}
// //       />

// //       {/* ======================================================
// //           ACTIONS
// //       ====================================================== */}

// //       <WorkerActions campaign={campaign} />

// //       {/* ======================================================
// //           CAMPAIGN SECTION
// //       ====================================================== */}

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

// "use client";

// import { useCallback, useEffect, useState } from "react";

// import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
// import ZerodoseStats from "@/components/worker/ZerodoseStats";
// import WorkerActions from "@/components/worker/WorkerActions";
// import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

// import { getCampaigns } from "@/api/campaignApi";
// import { getWorkerSummary } from "@/api/dashboardApi";

// export default function Page() {
//   // ============================================================
//   // STATE
//   // ============================================================

//   const [campaign, setCampaign] = useState(null);
//   const [previousCampaigns, setPreviousCampaigns] = useState([]);

//   const [loadingCampaign, setLoadingCampaign] = useState(true);

//   const [error, setError] = useState("");

//   const [activeTab, setActiveTab] = useState("current");

//   // ============================================================
//   // WORKER SUMMARY STATE
//   // ============================================================

//   const [summary, setSummary] = useState({
//     total: 0,
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   // ============================================================
//   // FETCH CAMPAIGN + WORKER SUMMARY
//   //
//   // IMPORTANT:
//   // Zerodose records are NOT fetched here.
//   // ZerodoseCampaignSection handles its own API.
//   // ============================================================

//   const fetchWorkerData = useCallback(async () => {
//     // ----------------------------------------------------------
//     // 1. Get current campaign
//     // ----------------------------------------------------------

//     const campaignResponse = await getCampaigns({
//       status: "current",
//       page: 1,
//       limit: 1,
//     });

//     const campaigns = Array.isArray(campaignResponse?.data)
//       ? campaignResponse.data
//       : [];

//     const currentCampaign = campaigns[0] || null;

//     // ----------------------------------------------------------
//     // 2. Get worker summary
//     // ----------------------------------------------------------

//     const summaryResponse = await getWorkerSummary();

//     const workerSummary = summaryResponse?.data || {};

//     const normalizedSummary = {
//       total: Number(workerSummary?.recordCount || 0),
//       recorded: Number(workerSummary?.recordCount || 0),
//       visited: Number(workerSummary?.visitCount || 0),
//       covered: Number(workerSummary?.coveredCount || 0),
//     };

//     return {
//       campaign: currentCampaign,
//       summary: normalizedSummary,
//     };
//   }, []);

//   // ============================================================
//   // INITIAL LOAD
//   // ============================================================

//   useEffect(() => {
//     let cancelled = false;

//     const loadInitialData = async () => {
//       try {

//         setLoadingCampaign(true);
//         setError("");

//         const result = await fetchWorkerData();

//         if (cancelled) {
//           return;
//         }

//         // ------------------------------------------------------
//         // Campaign
//         // ------------------------------------------------------

//         setCampaign(result.campaign);

//         // ------------------------------------------------------
//         // Worker Summary
//         // ------------------------------------------------------

//         setSummary(result.summary);

//         // ------------------------------------------------------
//         // Loading complete
//         // ------------------------------------------------------

//         setLoadingCampaign(false);
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         setCampaign(null);

//         setSummary({
//           total: 0,
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });

//         setError(
//           error?.response?.data?.message ||
//             error?.response?.data?.error?.message ||
//             error?.message ||
//             "Failed to load worker data.",
//         );

//         setLoadingCampaign(false);
//       }
//     };

//     loadInitialData();

//     return () => {
//       cancelled = true;
//     };
//   }, [fetchWorkerData]);

//   // ============================================================
//   // ZERODOSE STATS
//   //
//   // These values come from worker-summary API.
//   // ============================================================

//   const totalZerodose = summary.total;
//   const recordedZerodose = summary.recorded;
//   const visitedZerodose = summary.visited;
//   const coveredZerodose = summary.covered;

//   // ============================================================
//   // REFRESH
//   //
//   // Refresh only campaign + summary.
//   // ZerodoseCampaignSection has its own refresh.
//   // ============================================================

//   const handleRefresh = async () => {
//     try {
//       setError("");
//       setLoadingCampaign(true);

//       const result = await fetchWorkerData();

//       setCampaign(result.campaign);
//       setSummary(result.summary);

//       setLoadingCampaign(false);
//     } catch (error) {

//       setCampaign(null);

//       setSummary({
//         total: 0,
//         recorded: 0,
//         visited: 0,
//         covered: 0,
//       });

//       setError(
//         error?.response?.data?.message ||
//           error?.response?.data?.error?.message ||
//           error?.message ||
//           "Failed to refresh data.",
//       );

//       setLoadingCampaign(false);
//     }
//   };

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="min-h-full">
//       {/* ======================================================
//           ERROR
//       ====================================================== */}

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

//       {/* ======================================================
//           CURRENT CAMPAIGN
//       ====================================================== */}

//       <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

//       {/* ======================================================
//           STATS
//       ====================================================== */}

//       <ZerodoseStats
//         total={totalZerodose}
//         recorded={recordedZerodose}
//         visited={visitedZerodose}
//         covered={coveredZerodose}
//         loading={loadingCampaign}
//       />

//       {/* ======================================================
//           ACTIONS
//       ====================================================== */}

//       <WorkerActions campaign={campaign} />

//       {/* ======================================================
//           ZERODOSE SECTION

//           All Zerodose API fetching happens inside this component.
//       ====================================================== */}

//       <ZerodoseCampaignSection
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         currentCampaign={campaign}
//         previousCampaigns={previousCampaigns}
//         loadingCampaign={loadingCampaign}
//       />
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";

import CurrentCampaignCard from "@/components/worker/CurrentCampaignCard";
import ZerodoseStats from "@/components/worker/ZerodoseStats";
import WorkerActions from "@/components/worker/WorkerActions";
import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

import { getCampaigns } from "@/api/campaignApi";
import { getWorkerSummary } from "@/api/dashboardApi";

import useAnimatedCounter from "@/hooks/useAnimatedCounter";

export default function Page() {
  // ============================================================
  // STATE
  // ============================================================

  const [campaign, setCampaign] = useState(null);
  const [previousCampaigns, setPreviousCampaigns] = useState([]);

  const [loadingCampaign, setLoadingCampaign] = useState(true);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("current");

  // ============================================================
  // WORKER SUMMARY STATE
  // ============================================================

  const [summary, setSummary] = useState({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  // ============================================================
  // ANIMATED WORKER SUMMARY
  // ============================================================

  const { values: animatedSummary, loadingDots } = useAnimatedCounter(summary, {
    loading: loadingCampaign,
    duration: 1000,
  });

  // ============================================================
  // FETCH CAMPAIGN + WORKER SUMMARY
  //
  // IMPORTANT:
  // Zerodose records are NOT fetched here.
  // ZerodoseCampaignSection handles its own API.
  // ============================================================

  const fetchWorkerData = useCallback(async () => {
    // ----------------------------------------------------------
    // 1. Get current campaign
    // ----------------------------------------------------------

    const campaignResponse = await getCampaigns({
      status: "current",
      page: 1,
      limit: 1,
    });

    const campaigns = Array.isArray(campaignResponse?.data)
      ? campaignResponse.data
      : [];

    const currentCampaign = campaigns[0] || null;

    // ----------------------------------------------------------
    // 2. Get worker summary
    // ----------------------------------------------------------

    const summaryResponse = await getWorkerSummary();

    const workerSummary = summaryResponse?.data || {};

    const normalizedSummary = {
      recorded: Number(workerSummary?.recordCount || 0),
      visited: Number(workerSummary?.visitCount || 0),
      covered: Number(workerSummary?.coveredCount || 0),
    };

    return {
      campaign: currentCampaign,
      summary: normalizedSummary,
    };
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        setLoadingCampaign(true);
        setError("");

        const result = await fetchWorkerData();

        if (cancelled) {
          return;
        }

        // ------------------------------------------------------
        // Campaign
        // ------------------------------------------------------

        setCampaign(result.campaign);

        // ------------------------------------------------------
        // Worker Summary
        // ------------------------------------------------------

        setSummary(result.summary);

        // ------------------------------------------------------
        // Loading complete
        // ------------------------------------------------------

        setLoadingCampaign(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCampaign(null);

        setSummary({
          recorded: 0,
          visited: 0,
          covered: 0,
        });

        setError(
          error?.response?.data?.message ||
            error?.response?.data?.error?.message ||
            error?.message ||
            "Failed to load worker data.",
        );

        setLoadingCampaign(false);
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchWorkerData]);

  // ============================================================
  // ZERODOSE STATS
  //
  // Animated values come from useAnimatedCounter.
  // ============================================================

  const recordedZerodose = animatedSummary.recorded;
  const visitedZerodose = animatedSummary.visited;
  const coveredZerodose = animatedSummary.covered;

  // ============================================================
  // REFRESH
  //
  // Refresh only campaign + summary.
  // ZerodoseCampaignSection has its own refresh.
  // ============================================================

  const handleRefresh = async () => {
    try {
      setError("");
      setLoadingCampaign(true);

      const result = await fetchWorkerData();

      setCampaign(result.campaign);
      setSummary(result.summary);

      setLoadingCampaign(false);
    } catch (error) {
      setCampaign(null);

      setSummary({
        recorded: 0,
        visited: 0,
        covered: 0,
      });

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to refresh data.",
      );

      setLoadingCampaign(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full">
      {/* ======================================================
          ERROR
      ====================================================== */}

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

      {/* ======================================================
          CURRENT CAMPAIGN
      ====================================================== */}

      <CurrentCampaignCard campaign={campaign} loading={loadingCampaign} />

      {/* ======================================================
          STATS
      ====================================================== */}

      <ZerodoseStats
        recorded={animatedSummary.recorded}
        visited={animatedSummary.visited}
        covered={animatedSummary.covered}
        loading={loadingCampaign}
        loadingDots={loadingDots}
      />

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <WorkerActions campaign={campaign} />

      {/* ======================================================
          ZERODOSE SECTION

          All Zerodose API fetching happens inside this component.
      ====================================================== */}

      <ZerodoseCampaignSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentCampaign={campaign}
        previousCampaigns={previousCampaigns}
        loadingCampaign={loadingCampaign}
      />
    </div>
  );
}
