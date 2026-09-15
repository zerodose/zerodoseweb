// // "use client";

// // import { useEffect, useMemo, useState } from "react";

// // import { getCampaigns } from "@/api/campaignApi";
// // import { getZerodoses } from "@/api/zerodoseApi";
// // import { LucideSyringe } from "lucide-react";

// // import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
// // import ZerodosePageSkeleton from "@/components/supervisor/zerodose/ZerodosePageSkeleton";
// // import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";
// // import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
// // import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

// // export default function Page() {
// //   const [activeTab, setActiveTab] = useState("current");

// //   const [campaigns, setCampaigns] = useState([]);
// //   const [zerodoses, setZerodoses] = useState([]);

// //   const [unionCouncilName, setUnionCouncilName] = useState("-");

// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");

// //   // ============================================================
// //   // SAFE ID
// //   // ============================================================

// //   const getId = (value) => {
// //     if (!value) {
// //       return null;
// //     }

// //     if (typeof value === "object") {
// //       return value._id?.toString() || value.id?.toString() || null;
// //     }

// //     return value.toString();
// //   };

// //   // ============================================================
// //   // CAMPAIGN STATUS
// //   // ============================================================

// //   const getCampaignStatus = (campaign) => {
// //     if (!campaign?.startDate || !campaign?.endDate) {
// //       return "previous";
// //     }

// //     const now = new Date();

// //     const startDate = new Date(campaign.startDate);
// //     const endDate = new Date(campaign.endDate);

// //     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// //     const start = new Date(
// //       startDate.getFullYear(),
// //       startDate.getMonth(),
// //       startDate.getDate(),
// //     );

// //     const end = new Date(
// //       endDate.getFullYear(),
// //       endDate.getMonth(),
// //       endDate.getDate(),
// //     );

// //     if (today < start) {
// //       return "upcoming";
// //     }

// //     if (today >= start && today <= end) {
// //       return "current";
// //     }

// //     return "previous";
// //   };

// //   // ============================================================
// //   // FETCH DATA
// //   // ============================================================

// //   useEffect(() => {
// //     let cancelled = false;

// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
// //         setError("");

// //         // --------------------------------------------------------
// //         // AUTH USER
// //         // --------------------------------------------------------
// //         //
// //         // authUser is ONLY used for display information.
// //         //
// //         // Authorization / data scope is handled by backend
// //         // using the authenticated auth_token cookie.
// //         //

// //         let storedAuthUser = {};

// //         try {
// //           storedAuthUser = JSON.parse(localStorage.getItem("authUser") || "{}");
// //         } catch (error) {
// //           console.error("Failed to parse authUser:", error);
// //         }

// //         // --------------------------------------------------------
// //         // CAMPAIGNS
// //         // --------------------------------------------------------

// //         const campaignsResponse = await getCampaigns();

// //         if (!campaignsResponse?.success) {
// //           throw new Error(
// //             campaignsResponse?.message || "Failed to fetch campaigns.",
// //           );
// //         }

// //         let allZerodoses = [];

// //         let page = 1;
// //         let totalPages = 1;

// //         do {
// //           const zerodoseResponse = await getZerodoses({
// //             page,
// //             limit: 50,
// //             sortBy: "recordDate",
// //             sortOrder: "desc",
// //           });

// //           if (!zerodoseResponse?.success) {
// //             throw new Error(
// //               zerodoseResponse?.message || "Failed to fetch Zerodose records.",
// //             );
// //           }

// //           const pageData = Array.isArray(zerodoseResponse.data)
// //             ? zerodoseResponse.data
// //             : [];

// //           allZerodoses = [...allZerodoses, ...pageData];

// //           totalPages = Number(zerodoseResponse.pagination?.totalPages) || 0;

// //           page += 1;
// //         } while (page <= totalPages);

// //         if (cancelled) {
// //           return;
// //         }

// //         // --------------------------------------------------------
// //         // CAMPAIGNS
// //         // --------------------------------------------------------

// //         setCampaigns(
// //           Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [],
// //         );

// //         // --------------------------------------------------------
// //         // ZERODOSE
// //         // --------------------------------------------------------

// //         setZerodoses(allZerodoses);

// //         // --------------------------------------------------------
// //         // UNION COUNCIL NAME
// //         // --------------------------------------------------------
// //         //
// //         // This is display-only.
// //         //
// //         // We do NOT use this value for authorization/filtering.
// //         //
// //         const localUnionCouncilName =
// //           storedAuthUser?.unionCouncil?.name ||
// //           allZerodoses?.find((item) => item?.unionCouncil?.name)?.unionCouncil
// //             ?.name ||
// //           "-";

// //         setUnionCouncilName(localUnionCouncilName);

// //         console.log("Vaccinator Zerodose data fetched successfully:", {
// //           campaigns: campaignsResponse.data?.length || 0,
// //           zerodoses: allZerodoses.length,
// //           unionCouncil: localUnionCouncilName,
// //         });
// //       } catch (error) {
// //         if (cancelled) {
// //           return;
// //         }

// //         console.error("Vaccinator Zerodose fetch error:", error);

// //         setError(error?.message || "Failed to load Zerodose data.");

// //         setCampaigns([]);
// //         setZerodoses([]);
// //         setUnionCouncilName("-");
// //       } finally {
// //         if (!cancelled) {
// //           setLoading(false);
// //         }
// //       }
// //     };

// //     fetchData();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, []);

// //   // ============================================================
// //   // NORMALIZED CAMPAIGNS
// //   // ============================================================

// //   const normalizedCampaigns = useMemo(() => {
// //     return campaigns.map((campaign) => ({
// //       ...campaign,
// //       campaignStatus: getCampaignStatus(campaign),
// //     }));
// //   }, [campaigns]);

// //   // ============================================================
// //   // CURRENT CAMPAIGN
// //   // ============================================================

// //   const currentCampaign = useMemo(() => {
// //     return (
// //       normalizedCampaigns.find(
// //         (campaign) => campaign.campaignStatus === "current",
// //       ) || null
// //     );
// //   }, [normalizedCampaigns]);

// //   // ============================================================
// //   // PREVIOUS CAMPAIGNS
// //   // ============================================================

// //   const previousCampaigns = useMemo(() => {
// //     return normalizedCampaigns
// //       .filter((campaign) => campaign.campaignStatus === "previous")
// //       .sort((a, b) => {
// //         const dateA = new Date(a?.startDate || 0).getTime();

// //         const dateB = new Date(b?.startDate || 0).getTime();

// //         return dateB - dateA;
// //       });
// //   }, [normalizedCampaigns]);

// //   // ============================================================
// //   // CURRENT DATA
// //   // ============================================================
// //   //
// //   // Backend has already scoped these records to the
// //   // authenticated Vaccinator's Union Council.
// //   //
// //   // Therefore:
// //   //
// //   // DO NOT filter by supervisor here.
// //   //
// //   // This includes:
// //   //
// //   // Supervisor 1 → all teams
// //   // Supervisor 2 → all teams
// //   // Supervisor 3 → all teams
// //   //
// //   // within the Vaccinator's own UC.
// //   // ============================================================

// //   const currentData = useMemo(() => {
// //     if (!currentCampaign) {
// //       return [];
// //     }

// //     const currentCampaignId = getId(currentCampaign);

// //     if (!currentCampaignId) {
// //       return [];
// //     }

// //     return zerodoses.filter((item) => {
// //       const itemCampaignId = getId(
// //         item?.campaign || item?.campaignId || item?.campaign?._id,
// //       );

// //       return (
// //         itemCampaignId && String(itemCampaignId) === String(currentCampaignId)
// //       );
// //     });
// //   }, [zerodoses, currentCampaign]);

// //   // ============================================================
// //   // PREVIOUS DATA
// //   // ============================================================

// //   const previousData = useMemo(() => {
// //     if (!previousCampaigns.length) {
// //       return [];
// //     }

// //     const previousIds = new Set(
// //       previousCampaigns.map((campaign) => getId(campaign)).filter(Boolean),
// //     );

// //     return zerodoses.filter((item) => {
// //       const itemCampaignId = getId(
// //         item?.campaign || item?.campaignId || item?.campaign?._id,
// //       );

// //       return itemCampaignId && previousIds.has(String(itemCampaignId));
// //     });
// //   }, [zerodoses, previousCampaigns]);

// //   // ============================================================
// //   // CURRENT ZERODOSE COUNT
// //   // ============================================================

// //   const currentZerodoseCount = currentData.length;

// //   // ============================================================
// //   // LOADING
// //   // ============================================================

// //   if (loading) {
// //     return <ZerodosePageSkeleton />;
// //   }

// //   // ============================================================
// //   // RENDER
// //   // ============================================================

// //   return (
// //     <div className="min-h-full">
// //       <ApprovalPageHeader
// //         title="Zerodose"
// //         description="View campaign-wise Zerodose records and team details"
// //         onBack={() => window.history.back()}
// //         rightContent={
// //           <div className="border-primary/20 bg-primary-light text-primary dark:bg-primary/10 dark:border-primary/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
// //             <LucideSyringe size={18} />

// //             <span>
// //               {currentZerodoseCount} {currentZerodoseCount === 1 ? "ZD" : "ZD"}
// //             </span>
// //           </div>
// //         }
// //       />

// //       {/* ======================================================
// //           ERROR
// //       ====================================================== */}

// //       {error && (
// //         <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
// //           {error}
// //         </div>
// //       )}

// //       {/* ======================================================
// //           TABS
// //       ====================================================== */}

// //       <ZerodoseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

// //       {/* ======================================================
// //           CURRENT
// //       ====================================================== */}

// //       {activeTab === "current" && (
// //         <CurrentCampaignZerodose
// //           campaign={currentCampaign}
// //           data={currentData}
// //           unionCouncilName={unionCouncilName}
// //         />
// //       )}

// //       {/* ======================================================
// //           PREVIOUS
// //       ====================================================== */}

// //       {activeTab === "previous" && (
// //         <PreviousCampaignsZerodose
// //           campaigns={previousCampaigns}
// //           data={previousData}
// //           unionCouncilName={unionCouncilName}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";

// import { getCampaigns, getCurrentCampaign } from "@/api/campaignApi";
// import { getVaccinatorZerodose } from "@/api/zerodoseApi";
// import { LucideSyringe } from "lucide-react";

// import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
// import ZerodosePageSkeleton from "@/components/supervisor/zerodose/ZerodosePageSkeleton";
// import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";
// import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
// import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";
// import Loader from "@/components/ui/Loader";

// export default function Page() {
//   const [activeTab, setActiveTab] = useState("current");

//   const [currentCampaign, setCurrentCampaign] = useState(null);
//   const [previousCampaigns, setPreviousCampaigns] = useState([]);

//   const [zerodoses, setZerodoses] = useState([]);
//   const [previousZerodoses, setPreviousZerodoses] = useState([]);

//   const [unionCouncilName, setUnionCouncilName] = useState("-");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [summary, setSummary] = useState({
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });
//   const [vaccinationStatus, setVaccinationStatus] = useState({
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

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
//   // INITIAL LOAD
//   // ============================================================

//   useEffect(() => {
//     let cancelled = false;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         // --------------------------------------------------------
//         // AUTH USER
//         // --------------------------------------------------------

//         let storedAuthUser = {};

//         try {
//           storedAuthUser = JSON.parse(localStorage.getItem("authUser") || "{}");
//         } catch (error) {
//           console.error("Failed to parse authUser:", error);
//         }

//         // --------------------------------------------------------
//         // CURRENT CAMPAIGN
//         // --------------------------------------------------------

//         const currentCampaignResponse = await getCurrentCampaign();

//         if (!currentCampaignResponse?.success) {
//           throw new Error(
//             currentCampaignResponse?.message ||
//               "Failed to fetch current campaign.",
//           );
//         }

//         const currentCampaign =
//           currentCampaignResponse?.data?.currentCampaign || null;

//         if (cancelled) {
//           return;
//         }

//         setCurrentCampaign(currentCampaign);

//         // --------------------------------------------------------
//         // UNION COUNCIL NAME
//         // --------------------------------------------------------

//         setUnionCouncilName(storedAuthUser?.unionCouncil?.name || "-");

//         // --------------------------------------------------------
//         // CURRENT CAMPAIGN ZERODOSE
//         //
//         // FIRST FILTER = RECORDED
//         // --------------------------------------------------------

//         if (currentCampaign?._id) {
//           const response = await getVaccinatorZerodose({
//             campaignId: currentCampaign._id,
//             filter: "recorded",
//           });

//           if (!response?.success) {
//             throw new Error(
//               response?.message || "Failed to fetch current Zerodose.",
//             );
//           }
//           console.log("Vaccinator Zerodose response:", response);
//           if (currentCampaign?._id) {
//             const response = await getVaccinatorZerodose({
//               campaignId: currentCampaign._id,
//               filter: "recorded",
//             });

//             if (!response?.success) {
//               throw new Error(
//                 response?.message || "Failed to fetch current Zerodose.",
//               );
//             }

//             console.log("Vaccinator Zerodose response:", response);

//             const currentData = Array.isArray(response.data)
//               ? response.data
//               : [];

//             if (!cancelled) {
//               setZerodoses(currentData);

//               setSummary(
//                 response.summary || {
//                   recorded: 0,
//                   visited: 0,
//                   covered: 0,
//                 },
//               );
//               setVaccinationStatus(
//                 response.vaccinationStatus || {
//                   recorded: 0,
//                   visited: 0,
//                   covered: 0,
//                 },
//               );
//             }
//           } else {
//             setZerodoses([]);

//             setSummary({
//               recorded: 0,
//               visited: 0,
//               covered: 0,
//             });
//           }
//         } else {
//           setZerodoses([]);
//         }

//         // --------------------------------------------------------
//         // PREVIOUS CAMPAIGNS
//         // --------------------------------------------------------

//         const campaignsResponse = await getCampaigns();

//         if (!campaignsResponse?.success) {
//           throw new Error(
//             campaignsResponse?.message || "Failed to fetch campaigns.",
//           );
//         }

//         const campaigns = Array.isArray(campaignsResponse.data)
//           ? campaignsResponse.data
//           : [];

//         const previous = campaigns
//           .map((campaign) => ({
//             ...campaign,
//             campaignStatus: getCampaignStatus(campaign),
//           }))
//           .filter((campaign) => campaign.campaignStatus === "previous")
//           .sort((a, b) => {
//             const dateA = new Date(a?.startDate || 0).getTime();

//             const dateB = new Date(b?.startDate || 0).getTime();

//             return dateB - dateA;
//           });

//         if (!cancelled) {
//           setPreviousCampaigns(previous);
//         }

//         console.log("Vaccinator Zerodose data fetched successfully:", {
//           currentCampaignId: currentCampaign?._id || null,
//           currentRecordedCount: currentCampaign?._id ? zerodoses.length : 0,
//           previousCampaigns: previous.length,
//         });
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         console.error("Vaccinator Zerodose fetch error:", error);

//         setError(error?.message || "Failed to load Zerodose data.");

//         setCurrentCampaign(null);
//         setPreviousCampaigns([]);
//         setZerodoses([]);
//         setPreviousZerodoses([]);
//         setUnionCouncilName("-");
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchData();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // ============================================================
//   // FILTER CURRENT CAMPAIGN
//   // ============================================================

//   const handleCurrentFilterChange = async (filter) => {
//     if (!currentCampaign?._id) {
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await getVaccinatorZerodose({
//         campaignId: currentCampaign._id,
//         filter,
//       });

//       if (!response?.success) {
//         throw new Error(response?.message || "Failed to fetch Zerodose data.");
//       }

//       setZerodoses(Array.isArray(response.data) ? response.data : []);

//       setSummary(
//         response.summary || {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//       );
//       setVaccinationStatus(
//         response.vaccinationStatus || {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//       );
//     } catch (error) {
//       console.error("Vaccinator current Zerodose filter error:", error);

//       setError(error?.message || "Failed to load Zerodose data.");

//       setZerodoses([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // PREVIOUS CAMPAIGN DATA
//   // ============================================================
//   //
//   // Previous campaign component can select a campaign.
//   // Data is fetched using:
//   //
//   // campaignId + filter
//   //
//   // Default filter = recorded
//   // ============================================================

//   const handlePreviousCampaignSelect = async (
//     campaignId,
//     filter = "recorded",
//   ) => {
//     if (!campaignId) {
//       setPreviousZerodoses([]);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await getVaccinatorZerodose({
//         campaignId,
//         filter,
//       });

//       if (!response?.success) {
//         throw new Error(
//           response?.message || "Failed to fetch previous campaign Zerodose.",
//         );
//       }

//       setPreviousZerodoses(Array.isArray(response.data) ? response.data : []);
//     } catch (error) {
//       console.error("Previous campaign Zerodose error:", error);

//       setError(error?.message || "Failed to load previous campaign data.");

//       setPreviousZerodoses([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // CURRENT COUNT
//   // ============================================================

//   const currentZerodoseCount = zerodoses.length;

//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (loading && !currentCampaign) {
//     return <ZerodosePageSkeleton />;
//   }

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="min-h-full">
//       <Loader
//         text={
//           loading && currentCampaign ? "Loading..." : "Loading"
//         }
//       />
//       <ApprovalPageHeader
//         title="Zerodose"
//         description="View campaign-wise Zerodose records and team details"
//         onBack={() => window.history.back()}
//         rightContent={
//           <div className="border-primary/20 bg-primary-light text-primary dark:bg-primary/10 dark:border-primary/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
//             {/* {" "} */}
//             <LucideSyringe size={18} />
//             {/* <span> */}
//             {/* {currentZerodoseCount} */}
//             {/* ZD</span> */}
//           </div>
//         }
//       />

//       {/* ======================================================
//       ERROR
//   ====================================================== */}

//       {error && (
//         <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       {/* ======================================================
//       MAIN TABS
//   ====================================================== */}

//       <ZerodoseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

//       {/* ======================================================
//       CURRENT
//   ====================================================== */}

//       {activeTab === "current" && (
//         <CurrentCampaignZerodose
//           campaign={currentCampaign}
//           data={zerodoses}
//           unionCouncilName={unionCouncilName}
//           loading={loading}
//           summary={summary}
//           vaccinationStatus={vaccinationStatus}
//           onFilterChange={handleCurrentFilterChange}
//         />
//       )}

//       {/* ======================================================
//       PREVIOUS
//   ====================================================== */}

//       {activeTab === "previous" && (
//         <PreviousCampaignsZerodose
//           campaigns={previousCampaigns}
//           data={previousZerodoses}
//           unionCouncilName={unionCouncilName}
//           loading={loading}
//           summary={summary}
//           vaccinationStatus={vaccinationStatus}
//           onCampaignSelect={handlePreviousCampaignSelect}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

import { getCampaigns, getCurrentCampaign } from "@/api/campaignApi";
import { getVaccinatorZerodose } from "@/api/zerodoseApi";
import { LucideSyringe } from "lucide-react";

import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
import ZerodosePageSkeleton from "@/components/supervisor/zerodose/ZerodosePageSkeleton";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";
import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";
import Loader from "@/components/ui/Loader";

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
    recorded: 0,
    visited: 0,
    covered: 0,
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

      setPreviousZerodoses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Previous campaign Zerodose error:", error);

      setError(error?.message || "Failed to load previous campaign data.");

      setPreviousZerodoses([]);
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
          <div className="border-primary/20 bg-primary-light text-primary dark:bg-primary/10 dark:border-primary/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
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
