// // // "use client";

// // // import { useEffect, useState } from "react";

// // // import { getCampaigns, getCurrentCampaign } from "@/api/campaignApi";

// // // import { getWorkerZerodose } from "@/api/zerodoseApi";
// // // import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
// // // import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
// // // import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

// // // export default function Page() {
// // //   const [activeTab, setActiveTab] = useState("current");

// // //   const [currentCampaign, setCurrentCampaign] = useState(null);
// // //   const [previousCampaigns, setPreviousCampaigns] = useState([]);

// // //   const [zerodoses, setZerodoses] = useState([]);
// // //   const [previousZerodoses, setPreviousZerodoses] = useState([]);

// // //   const [unionCouncilName, setUnionCouncilName] = useState("-");

// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState("");
// // //   const [designation, setDesignation] = useState("");

// // //   const [summary, setSummary] = useState({
// // //     recorded: 0,
// // //     visited: 0,
// // //     covered: 0,
// // //   });

// // //   const [vaccinationStatus, setVaccinationStatus] = useState({
// // //     total: {
// // //       recorded: 0,
// // //       visited: 0,
// // //       covered: 0,
// // //     },
// // //     teams: [],
// // //   });

// // //   // ============================================================
// // //   // CAMPAIGN STATUS
// // //   // ============================================================

// // //   const getCampaignStatus = (campaign) => {
// // //     if (!campaign?.startDate || !campaign?.endDate) {
// // //       return "previous";
// // //     }

// // //     const now = new Date();

// // //     const startDate = new Date(campaign.startDate);
// // //     const endDate = new Date(campaign.endDate);

// // //     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// // //     const start = new Date(
// // //       startDate.getFullYear(),
// // //       startDate.getMonth(),
// // //       startDate.getDate(),
// // //     );

// // //     const end = new Date(
// // //       endDate.getFullYear(),
// // //       endDate.getMonth(),
// // //       endDate.getDate(),
// // //     );

// // //     if (today < start) {
// // //       return "upcoming";
// // //     }

// // //     if (today >= start && today <= end) {
// // //       return "current";
// // //     }

// // //     return "previous";
// // //   };

// // //   // ============================================================
// // //   // INITIAL LOAD
// // //   // ============================================================

// // //   useEffect(() => {
// // //     let cancelled = false;

// // //     const fetchData = async () => {
// // //       try {
// // //         setLoading(true);
// // //         setError("");

// // //         // --------------------------------------------------------
// // //         // AUTH USER
// // //         // --------------------------------------------------------

// // //         let storedAuthUser = {};

// // //         try {
// // //           storedAuthUser = JSON.parse(localStorage.getItem("authUser") || "{}");
// // //         } catch (error) {
// // //           console.error("Failed to parse authUser:", error);
// // //         }
// // //         setDesignation(storedAuthUser?.designation || "");
// // //         // --------------------------------------------------------
// // //         // CURRENT CAMPAIGN
// // //         // --------------------------------------------------------

// // //         const currentCampaignResponse = await getCurrentCampaign();

// // //         if (!currentCampaignResponse?.success) {
// // //           throw new Error(
// // //             currentCampaignResponse?.message ||
// // //               "Failed to fetch current campaign.",
// // //           );
// // //         }

// // //         const campaign = currentCampaignResponse?.data?.currentCampaign || null;

// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         setCurrentCampaign(campaign);

// // //         // --------------------------------------------------------
// // //         // UNION COUNCIL
// // //         // --------------------------------------------------------

// // //         setUnionCouncilName(storedAuthUser?.unionCouncil?.name || "-");

// // //         // --------------------------------------------------------
// // //         // CURRENT CAMPAIGN ZERODOSE
// // //         // --------------------------------------------------------

// // //         if (campaign?._id) {
// // //           const response = await getWorkerZerodose({
// // //             campaignId: campaign._id,
// // //             filter: "recorded",
// // //           });

// // //           if (!response?.success) {
// // //             throw new Error(
// // //               response?.message || "Failed to fetch current Zerodose.",
// // //             );
// // //           }

// // //           console.log("Vaccinator Zerodose response:", response);

// // //           const currentData = Array.isArray(response.data) ? response.data : [];

// // //           if (!cancelled) {
// // //             setZerodoses(currentData);

// // //             setSummary(
// // //               response.summary || {
// // //                 recorded: 0,
// // //                 visited: 0,
// // //                 covered: 0,
// // //               },
// // //             );

// // //             setVaccinationStatus(
// // //               response.vaccinationStatus || {
// // //                 recorded: 0,
// // //                 visited: 0,
// // //                 covered: 0,
// // //               },
// // //             );
// // //           }
// // //         } else {
// // //           setZerodoses([]);

// // //           setSummary({
// // //             recorded: 0,
// // //             visited: 0,
// // //             covered: 0,
// // //           });

// // //           setVaccinationStatus({
// // //             recorded: 0,
// // //             visited: 0,
// // //             covered: 0,
// // //           });
// // //         }

// // //         // --------------------------------------------------------
// // //         // PREVIOUS CAMPAIGNS
// // //         // --------------------------------------------------------

// // //         const campaignsResponse = await getCampaigns();

// // //         if (!campaignsResponse?.success) {
// // //           throw new Error(
// // //             campaignsResponse?.message || "Failed to fetch campaigns.",
// // //           );
// // //         }

// // //         const campaigns = Array.isArray(campaignsResponse.data)
// // //           ? campaignsResponse.data
// // //           : [];

// // //         const previous = campaigns
// // //           .map((campaign) => ({
// // //             ...campaign,
// // //             campaignStatus: getCampaignStatus(campaign),
// // //           }))
// // //           .filter((campaign) => campaign.campaignStatus === "previous")
// // //           .sort((a, b) => {
// // //             const dateA = new Date(a?.startDate || 0).getTime();

// // //             const dateB = new Date(b?.startDate || 0).getTime();

// // //             return dateB - dateA;
// // //           });

// // //         if (!cancelled) {
// // //           setPreviousCampaigns(previous);
// // //         }

// // //         console.log("Vaccinator Zerodose data fetched successfully:", {
// // //           currentCampaignId: campaign?._id || null,
// // //           currentRecordedCount: campaign?._id
// // //             ? Array.isArray(zerodoses)
// // //               ? zerodoses.length
// // //               : 0
// // //             : 0,
// // //           previousCampaigns: previous.length,
// // //         });
// // //       } catch (error) {
// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         console.error("Vaccinator Zerodose fetch error:", error);

// // //         setError(error?.message || "Failed to load Zerodose data.");

// // //         setCurrentCampaign(null);
// // //         setPreviousCampaigns([]);
// // //         setZerodoses([]);
// // //         setPreviousZerodoses([]);
// // //         setUnionCouncilName("-");
// // //       } finally {
// // //         if (!cancelled) {
// // //           setLoading(false);
// // //         }
// // //       }
// // //     };

// // //     fetchData();

// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //   }, []);

// // //   // ============================================================
// // //   // CURRENT FILTER
// // //   // ============================================================

// // //   const handleCurrentFilterChange = async (filter) => {
// // //     if (!currentCampaign?._id) {
// // //       return;
// // //     }

// // //     try {
// // //       setLoading(true);
// // //       setError("");

// // //       const response = await getWorkerZerodose({
// // //         campaignId: currentCampaign._id,
// // //         filter,
// // //       });

// // //       if (!response?.success) {
// // //         throw new Error(response?.message || "Failed to fetch Zerodose data.");
// // //       }

// // //       setZerodoses(Array.isArray(response.data) ? response.data : []);

// // //       setSummary(
// // //         response.summary || {
// // //           recorded: 0,
// // //           visited: 0,
// // //           covered: 0,
// // //         },
// // //       );

// // //       setVaccinationStatus(
// // //         response.vaccinationStatus || {
// // //           recorded: 0,
// // //           visited: 0,
// // //           covered: 0,
// // //         },
// // //       );
// // //     } catch (error) {
// // //       console.error("Vaccinator current Zerodose filter error:", error);

// // //       setError(error?.message || "Failed to load Zerodose data.");

// // //       setZerodoses([]);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // ============================================================
// // //   // PREVIOUS CAMPAIGN DATA
// // //   // ============================================================

// // //   const handlePreviousCampaignSelect = async (
// // //     campaignId,
// // //     filter = "recorded",
// // //   ) => {
// // //     if (!campaignId) {
// // //       setPreviousZerodoses([]);

// // //       setSummary({
// // //         recorded: 0,
// // //         visited: 0,
// // //         covered: 0,
// // //       });

// // //       setVaccinationStatus({
// // //         total: {
// // //           recorded: 0,
// // //           visited: 0,
// // //           covered: 0,
// // //         },
// // //         supervisors: [],
// // //       });

// // //       return;
// // //     }

// // //     try {
// // //       setLoading(true);
// // //       setError("");

// // //       const response = await getWorkerZerodose({
// // //         campaignId,
// // //         filter,
// // //       });

// // //       if (!response?.success) {
// // //         throw new Error(
// // //           response?.message || "Failed to fetch previous campaign Zerodose.",
// // //         );
// // //       }

// // //       const previousData = Array.isArray(response.data) ? response.data : [];

// // //       setPreviousZerodoses(previousData);

// // //       setSummary(
// // //         response.summary || {
// // //           recorded: 0,
// // //           visited: 0,
// // //           covered: 0,
// // //         },
// // //       );

// // //       setVaccinationStatus(
// // //         response.vaccinationStatus || {
// // //           total: {
// // //             recorded: 0,
// // //             visited: 0,
// // //             covered: 0,
// // //           },
// // //           teams: [],
// // //         },
// // //       );
// // //     } catch (error) {
// // //       console.error("Previous campaign Zerodose error:", error);

// // //       setError(error?.message || "Failed to load previous campaign data.");

// // //       setPreviousZerodoses([]);

// // //       setSummary({
// // //         recorded: 0,
// // //         visited: 0,
// // //         covered: 0,
// // //       });

// // //       setVaccinationStatus({
// // //         total: {
// // //           recorded: 0,
// // //           visited: 0,
// // //           covered: 0,
// // //         },
// // //         supervisors: [],
// // //       });
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // ============================================================
// // //   // INITIAL SKELETON
// // //   // ============================================================

// // //   // if (loading && !currentCampaign) {
// // //   //   return <ZerodosePageSkeleton />;
// // //   // }

// // //   // ============================================================
// // //   // RENDER
// // //   // ============================================================

// // //   return (
// // //     <div className="relative min-h-full">
// // //       <ZerodoseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
// // //       {activeTab === "current" && (
// // //         <CurrentCampaignZerodose
// // //           campaign={currentCampaign}
// // //           data={zerodoses}
// // //           unionCouncilName={unionCouncilName}
// // //           loading={loading}
// // //           summary={summary}
// // //           vaccinationStatus={vaccinationStatus}
// // //           onFilterChange={handleCurrentFilterChange}
// // //           designation={designation}
// // //         />
// // //       )}
// // //       {activeTab === "previous" && (
// // //         <PreviousCampaignsZerodose
// // //           campaigns={previousCampaigns}
// // //           data={previousZerodoses}
// // //           unionCouncilName={unionCouncilName}
// // //           loading={loading}
// // //           summary={summary}
// // //           vaccinationStatus={vaccinationStatus}
// // //           onCampaignSelect={handlePreviousCampaignSelect}
// // //           designation={designation}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useEffect, useState } from "react";

// // import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";
// // import { getWorkerZerodose } from "@/api/zerodoseApi";
// // import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
// // import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
// // import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

// // export default function Page() {
// //   const [activeTab, setActiveTab] = useState("current");

// //   const [campaigns, setCampaigns] = useState([]);
// //   const [currentCampaign, setCurrentCampaign] = useState(null);

// //   const [zerodoses, setZerodoses] = useState([]);
// //   const [previousZerodoses, setPreviousZerodoses] = useState([]);

// //   const [unionCouncilName, setUnionCouncilName] = useState("-");

// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [designation, setDesignation] = useState("");

// //   const [summary, setSummary] = useState({
// //     recorded: 0,
// //     visited: 0,
// //     covered: 0,
// //   });

// //   const [vaccinationStatus, setVaccinationStatus] = useState({
// //     total: {
// //       recorded: 0,
// //       visited: 0,
// //       covered: 0,
// //     },
// //     teams: [],
// //   });

// //   // ============================================================
// //   // TAB CHANGE
// //   // ============================================================

// //   const handleTabChange = async (tab) => {
// //     setActiveTab(tab);

// //     if (tab !== "previous") {
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       setError("");

// //       const campaignsResponse = await getCampaignFilter();

// //      console.log("Campaigns API Response:", campaignsResponse);

// //       if (!campaignsResponse?.success) {
// //         throw new Error(
// //           campaignsResponse?.message || "Failed to fetch campaigns",
// //         );
// //       }

// //       const allCampaigns = Array.isArray(campaignsResponse?.data)
// //         ? campaignsResponse.data
// //         : [];

// //       console.log("All Campaigns:", allCampaigns);

// //       setCampaigns(allCampaigns);
// //     } catch (error) {
// //       console.error("FETCH CAMPAIGNS ERROR:", error);

// //       setError(error?.message || "Failed to fetch campaigns");

// //       setCampaigns([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ============================================================
// //   // INITIAL LOAD
// //   // ============================================================

// //   useEffect(() => {
// //     const loadData = async () => {
// //       try {
// //         const authUser = JSON.parse(localStorage.getItem("authUser"));

// //         if (!authUser) {
// //           throw new Error("User information not found");
// //         }

// //         const designationValue = authUser?.designation || "";
// //         const unionCouncilValue = authUser?.unionCouncilName || "-";

// //         setDesignation(designationValue);
// //         setUnionCouncilName(unionCouncilValue);

// //         // ========================================================
// //         // CURRENT CAMPAIGN
// //         // ========================================================

// //         const currentCampaignResponse = await getCurrentCampaign();

// //         if (!currentCampaignResponse?.success) {
// //           throw new Error(
// //             currentCampaignResponse?.message ||
// //               "Failed to fetch current campaign",
// //           );
// //         }

// //         const campaign = currentCampaignResponse?.data?.currentCampaign || null;

// //         setCurrentCampaign(campaign);

// //         if (campaign?._id) {
// //           const response = await getWorkerZerodose({
// //             campaignId: campaign._id,
// //             filter: "recorded",
// //           });

// //           if (!response?.success) {
// //             throw new Error(
// //               response?.message || "Failed to fetch Zerodose data",
// //             );
// //           }

// //           setZerodoses(
// //             Array.isArray(response?.data?.data) ? response.data.data : [],
// //           );

// //           setSummary(
// //             response?.data?.summary || {
// //               recorded: 0,
// //               visited: 0,
// //               covered: 0,
// //             },
// //           );

// //           setVaccinationStatus(
// //             response?.data?.vaccinationStatus || {
// //               total: {
// //                 recorded: 0,
// //                 visited: 0,
// //                 covered: 0,
// //               },
// //               teams: [],
// //             },
// //           );
// //         } else {
// //           setZerodoses([]);

// //           setSummary({
// //             recorded: 0,
// //             visited: 0,
// //             covered: 0,
// //           });

// //           setVaccinationStatus({
// //             total: {
// //               recorded: 0,
// //               visited: 0,
// //               covered: 0,
// //             },
// //             teams: [],
// //           });
// //         }

// //         // ========================================================
// //         // IMPORTANT:
// //         // getCampaigns() IS NOT CALLED HERE.
// //         //
// //         // It will only run when the user clicks
// //         // "Previous Campaigns".
// //         // ========================================================
// //       } catch (err) {
// //         console.error("FETCH DATA ERROR:", err);

// //         setError(err?.message || "Something went wrong");

// //         setCurrentCampaign(null);
// //         setZerodoses([]);
// //         setCampaigns([]);

// //         setSummary({
// //           recorded: 0,
// //           visited: 0,
// //           covered: 0,
// //         });

// //         setVaccinationStatus({
// //           total: {
// //             recorded: 0,
// //             visited: 0,
// //             covered: 0,
// //           },
// //           teams: [],
// //         });
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadData();
// //   }, []);

// //   // ============================================================
// //   // CURRENT CAMPAIGN FILTER
// //   // ============================================================

// //   const handleCurrentFilterChange = async (filter) => {
// //     if (!currentCampaign?._id) {
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       setError("");

// //       const response = await getWorkerZerodose({
// //         campaignId: currentCampaign._id,
// //         filter,
// //       });

// //       if (!response?.success) {
// //         throw new Error(response?.message || "Failed to fetch Zerodose data.");
// //       }

// //       setZerodoses(
// //         Array.isArray(response?.data?.data) ? response.data.data : [],
// //       );

// //       setSummary(
// //         response?.data?.summary || {
// //           recorded: 0,
// //           visited: 0,
// //           covered: 0,
// //         },
// //       );

// //       setVaccinationStatus(
// //         response?.data?.vaccinationStatus || {
// //           total: {
// //             recorded: 0,
// //             visited: 0,
// //             covered: 0,
// //           },
// //           teams: [],
// //         },
// //       );
// //     } catch (error) {
// //       console.error("Vaccinator current Zerodose filter error:", error);

// //       setError(error?.message || "Failed to load Zerodose data.");

// //       setZerodoses([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ============================================================
// //   // PREVIOUS CAMPAIGN DATA
// //   // ============================================================

// //   const handlePreviousCampaignSelect = async (
// //     campaignId,
// //     filter = "recorded",
// //   ) => {
// //     if (!campaignId) {
// //       setPreviousZerodoses([]);

// //       setSummary({
// //         recorded: 0,
// //         visited: 0,
// //         covered: 0,
// //       });

// //       setVaccinationStatus({
// //         total: {
// //           recorded: 0,
// //           visited: 0,
// //           covered: 0,
// //         },
// //         teams: [],
// //       });

// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       setError("");

// //       const response = await getWorkerZerodose({
// //         campaignId,
// //         filter,
// //       });

// //       if (!response?.success) {
// //         throw new Error(
// //           response?.message || "Failed to fetch previous campaign Zerodose.",
// //         );
// //       }

// //       const previousData = Array.isArray(response?.data?.data)
// //         ? response.data.data
// //         : [];

// //       setPreviousZerodoses(previousData);

// //       setSummary(
// //         response?.data?.summary || {
// //           recorded: 0,
// //           visited: 0,
// //           covered: 0,
// //         },
// //       );

// //       setVaccinationStatus(
// //         response?.data?.vaccinationStatus || {
// //           total: {
// //             recorded: 0,
// //             visited: 0,
// //             covered: 0,
// //           },
// //           teams: [],
// //         },
// //       );
// //     } catch (error) {
// //       console.error("Previous campaign Zerodose error:", error);

// //       setError(error?.message || "Failed to load previous campaign data.");

// //       setPreviousZerodoses([]);

// //       setSummary({
// //         recorded: 0,
// //         visited: 0,
// //         covered: 0,
// //       });

// //       setVaccinationStatus({
// //         total: {
// //           recorded: 0,
// //           visited: 0,
// //           covered: 0,
// //         },
// //         teams: [],
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ============================================================
// //   // RENDER
// //   // ============================================================

// //   return (
// //     <div className="relative min-h-full">
// //       {" "}
// //       <ZerodoseTabs activeTab={activeTab} setActiveTab={handleTabChange} />
// //       {activeTab === "current" && (
// //         <CurrentCampaignZerodose
// //           campaign={currentCampaign}
// //           data={zerodoses}
// //           unionCouncilName={unionCouncilName}
// //           loading={loading}
// //           summary={summary}
// //           vaccinationStatus={vaccinationStatus}
// //           onFilterChange={handleCurrentFilterChange}
// //           designation={designation}
// //         />
// //       )}
// //       {activeTab === "previous" && (
// //         <PreviousCampaignsZerodose
// //           campaigns={campaigns}
// //           data={previousZerodoses}
// //           unionCouncilName={unionCouncilName}
// //           loading={loading}
// //           summary={summary}
// //           vaccinationStatus={vaccinationStatus}
// //           onCampaignSelect={handlePreviousCampaignSelect}
// //           designation={designation}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";

// import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";
// import { getWorkerZerodose } from "@/api/zerodoseApi";
// import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
// import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
// import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

// export default function Page() {
//   const [activeTab, setActiveTab] = useState("current");

//   const [campaigns, setCampaigns] = useState([]);
//   const [currentCampaign, setCurrentCampaign] = useState(null);

//   const [zerodoses, setZerodoses] = useState([]);
//   const [previousZerodoses, setPreviousZerodoses] = useState([]);

//   const [selectedPreviousCampaignId, setSelectedPreviousCampaignId] =
//     useState("");

//   const [previousNoData, setPreviousNoData] = useState(false);

//   const [previousZerodoseFilter, setPreviousZerodoseFilter] =
//     useState("recorded");

//   const [unionCouncilName, setUnionCouncilName] = useState("-");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [designation, setDesignation] = useState("");

//   const [summary, setSummary] = useState({
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   const [vaccinationStatus, setVaccinationStatus] = useState({
//     total: {
//       recorded: 0,
//       visited: 0,
//       covered: 0,
//     },
//     teams: [],
//   });

//   // ============================================================
//   // TAB CHANGE
//   // ============================================================

//   const handleTabChange = async (tab) => {
//     setActiveTab(tab);

//     if (tab !== "previous") {
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const campaigns = await getCampaignFilter();

//       setCampaigns(campaigns);
//     } catch (error) {
//       console.error("FETCH CAMPAIGNS ERROR:", error);

//       setError(error?.message || "Failed to fetch campaigns");
//       setCampaigns([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // INITIAL LOAD
//   // ============================================================

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const authUser = JSON.parse(localStorage.getItem("authUser"));

//         if (!authUser) {
//           throw new Error("User information not found");
//         }

//         const designationValue = authUser?.designation || "";
//         const unionCouncilValue = authUser?.unionCouncilName || "-";

//         setDesignation(designationValue);
//         setUnionCouncilName(unionCouncilValue);

//         // ========================================================
//         // CURRENT CAMPAIGN
//         // ========================================================

//         const currentCampaignResponse = await getCurrentCampaign();

//         if (!currentCampaignResponse?.success) {
//           throw new Error(
//             currentCampaignResponse?.message ||
//               "Failed to fetch current campaign",
//           );
//         }

//         const campaign = currentCampaignResponse?.data?.currentCampaign || null;

//         setCurrentCampaign(campaign);

//         if (campaign?._id) {
//           const response = await getWorkerZerodose({
//             campaignId: campaign._id,
//             filter: "recorded",
//           });
//           console.log("Current 2 Campaing zerodose", response);
//           if (!response?.success) {
//             throw new Error(
//               response?.message || "Failed to fetch Zerodose data",
//             );
//           }

//           setZerodoses(
//             Array.isArray(response?.data?.data) ? response.data.data : [],
//           );

//           setSummary(
//             response?.data?.summary || {
//               recorded: 0,
//               visited: 0,
//               covered: 0,
//             },
//           );

//           setVaccinationStatus(
//             response?.data?.vaccinationStatus || {
//               total: {
//                 recorded: 0,
//                 visited: 0,
//                 covered: 0,
//               },
//               teams: [],
//             },
//           );
//         } else {
//           setZerodoses([]);

//           setSummary({
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           });

//           setVaccinationStatus({
//             total: {
//               recorded: 0,
//               visited: 0,
//               covered: 0,
//             },
//             teams: [],
//           });
//         }
//       } catch (err) {
//         console.error("FETCH DATA ERROR:", err);

//         setError(err?.message || "Something went wrong");

//         setCurrentCampaign(null);
//         setZerodoses([]);
//         setCampaigns([]);

//         setSummary({
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });

//         setVaccinationStatus({
//           total: {
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           },
//           teams: [],
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   // ============================================================
//   // CURRENT CAMPAIGN FILTER
//   // ============================================================

//   const handleCurrentFilterChange = async (filter) => {
//     if (!currentCampaign?._id) {
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await getWorkerZerodose({
//         campaignId: currentCampaign._id,
//         filter,
//       });
//       console.log("Current 1 Campaing zerodose", response);
//       if (!response?.success) {
//         throw new Error(response?.message || "Failed to fetch Zerodose data.");
//       }

//       setZerodoses(
//         Array.isArray(response?.data?.data) ? response.data.data : [],
//       );

//       setSummary(
//         response?.data?.summary || {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//       );

//       setVaccinationStatus(
//         response?.data?.vaccinationStatus || {
//           total: {
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           },
//           teams: [],
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

//   const handlePreviousCampaignSelect = async (campaignId) => {
//     setSelectedPreviousCampaignId(campaignId);
//     setPreviousNoData(false);
//     setPreviousZerodoses([]);
//     setLoading(true);
//     setError("");

//     const filters = ["recorded", "visited", "covered"];

//     try {
//       for (const filter of filters) {
//         const response = await getWorkerZerodose({
//           campaignId,
//           filter,
//         });

//         if (!response?.success) {
//           continue;
//         }
//         console.log("Previous Data==>", response);

//         const data = Array.isArray(response?.data) ? response.data : [];

//         if (data.length > 0) {
//           setPreviousZerodoses(data);

//           setSummary(
//             response?.summary || {
//               recorded: 0,
//               visited: 0,
//               covered: 0,
//             },
//           );

//           setVaccinationStatus(
//             response?.vaccinationStatus || {
//               total: {
//                 recorded: 0,
//                 visited: 0,
//                 covered: 0,
//               },
//             },
//           );

//           setPreviousZerodoseFilter(filter);
//           setPreviousNoData(false);

//           return;
//         }
//       }

//       setPreviousZerodoses([]);

//       setSummary({
//         recorded: 0,
//         visited: 0,
//         covered: 0,
//       });

//       setVaccinationStatus({
//         total: {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//       });

//       setPreviousZerodoseFilter("recorded");
//       setPreviousNoData(true);
//     } catch (error) {
//       console.error("Get previous campaign zerodose error:", error);

//       setPreviousZerodoses([]);
//       setPreviousNoData(true);
//       setError(error?.message || "Failed to fetch Zerodose data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePreviousFilterChange = async (filter) => {
//     if (!selectedPreviousCampaignId) {
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       setPreviousNoData(false);

//       const response = await getWorkerZerodose({
//         campaignId: selectedPreviousCampaignId,
//         filter,
//       });

//       if (!response?.success) {
//         throw new Error(response?.message || "Failed to fetch Zerodose data.");
//       }
//       const data = Array.isArray(response?.data) ? response.data : [];

//       setPreviousZerodoses(data);

//       setSummary(
//         response?.summary || {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//       );

//       setVaccinationStatus(
//         response?.vaccinationStatus || {
//           total: {
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           },
//         },
//       );

//       setPreviousZerodoseFilter(filter);

//       if (data.length === 0) {
//         setPreviousNoData(true);
//       }
//     } catch (error) {
//       console.error("Previous Zerodose filter error:", error);

//       setPreviousZerodoses([]);
//       setPreviousNoData(true);
//       setError(error?.message || "Failed to load Zerodose data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // SELECTED PREVIOUS CAMPAIGN
//   // ============================================================

//   const selectedPreviousCampaign =
//     campaigns.find(
//       (campaign) =>
//         String(campaign?._id) === String(selectedPreviousCampaignId),
//     ) || null;

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="relative min-h-full">
//       <ZerodoseTabs activeTab={activeTab} setActiveTab={handleTabChange} />

//       {activeTab === "current" && (
//         <CurrentCampaignZerodose
//           campaign={currentCampaign}
//           data={zerodoses}
//           unionCouncilName={unionCouncilName}
//           loading={loading}
//           summary={summary}
//           vaccinationStatus={vaccinationStatus}
//           onFilterChange={handleCurrentFilterChange}
//           designation={designation}
//         />
//       )}

//       {activeTab === "previous" && (
//         <PreviousCampaignsZerodose
//           campaigns={campaigns}
//           selectedCampaign={selectedPreviousCampaign}
//           data={previousZerodoses}
//           unionCouncilName={unionCouncilName}
//           loading={loading}
//           summary={summary}
//           vaccinationStatus={vaccinationStatus}
//           onFilterChange={handlePreviousFilterChange}
//           onCampaignSelect={handlePreviousCampaignSelect}
//           designation={designation}
//           noData={previousNoData}
//           activeFilter={previousZerodoseFilter}
//         />
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";

import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";
import { getWorkerZerodose } from "@/api/zerodoseApi";
import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

export default function Page() {
const [activeTab, setActiveTab] = useState("current");

const [campaigns, setCampaigns] = useState([]);
const [currentCampaign, setCurrentCampaign] = useState(null);

const [zerodoses, setZerodoses] = useState([]);
const [previousZerodoses, setPreviousZerodoses] = useState([]);

const [selectedPreviousCampaignId, setSelectedPreviousCampaignId] =
useState("");

const [previousNoData, setPreviousNoData] = useState(false);

const [previousZerodoseFilter, setPreviousZerodoseFilter] =
useState("recorded");

const [unionCouncilName, setUnionCouncilName] = useState("-");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [designation, setDesignation] = useState("");

const [summary, setSummary] = useState({
recorded: 0,
visited: 0,
covered: 0,
});

const [vaccinationStatus, setVaccinationStatus] = useState({
total: {
recorded: 0,
visited: 0,
covered: 0,
},
teams: [],
});

// ============================================================
// TAB CHANGE
// ============================================================

const handleTabChange = async (tab) => {
setActiveTab(tab);


if (tab !== "previous") {
  return;
}

try {
  setLoading(true);
  setError("");

  const campaigns = await getCampaignFilter();

  setCampaigns(campaigns);
} catch (error) {
  console.error("FETCH CAMPAIGNS ERROR:", error);

  setError(error?.message || "Failed to fetch campaigns");
  setCampaigns([]);
} finally {
  setLoading(false);
}


};

// ============================================================
// INITIAL LOAD
// ============================================================

useEffect(() => {
const loadData = async () => {
try {
const authUser = JSON.parse(localStorage.getItem("authUser"));


    if (!authUser) {
      throw new Error("User information not found");
    }

    const designationValue = authUser?.designation || "";
    const unionCouncilValue = authUser?.unionCouncilName || "-";

    setDesignation(designationValue);
    setUnionCouncilName(unionCouncilValue);

    // ========================================================
    // CURRENT CAMPAIGN
    // ========================================================

    const currentCampaignResponse = await getCurrentCampaign();

    if (!currentCampaignResponse?.success) {
      throw new Error(
        currentCampaignResponse?.message ||
          "Failed to fetch current campaign",
      );
    }

    const campaign =
      currentCampaignResponse?.data?.currentCampaign || null;

    setCurrentCampaign(campaign);

    if (campaign?._id) {
      const response = await getWorkerZerodose({
        campaignId: campaign._id,
        filter: "recorded",
      });

      // console.log("Current Campaign Zerodose:", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch Zerodose data",
        );
      }

      // IMPORTANT:
      // response.data is already the Zerodose array

      setZerodoses(
        Array.isArray(response?.data) ? response.data : [],
      );

      setSummary(
        response?.summary || {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
      );

      setVaccinationStatus(
        response?.vaccinationStatus || {
          total: {
            recorded: 0,
            visited: 0,
            covered: 0,
          },
          teams: [],
        },
      );
    } else {
      setZerodoses([]);

      setSummary({
        recorded: 0,
        visited: 0,
        covered: 0,
      });

      setVaccinationStatus({
        total: {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
        teams: [],
      });
    }
  } catch (err) {
    console.error("FETCH DATA ERROR:", err);

    setError(err?.message || "Something went wrong");

    setCurrentCampaign(null);
    setZerodoses([]);
    setCampaigns([]);

    setSummary({
      recorded: 0,
      visited: 0,
      covered: 0,
    });

    setVaccinationStatus({
      total: {
        recorded: 0,
        visited: 0,
        covered: 0,
      },
      teams: [],
    });
  } finally {
    setLoading(false);
  }
};

loadData();


}, []);

// ============================================================
// CURRENT CAMPAIGN FILTER
// ============================================================

const handleCurrentFilterChange = async (filter) => {
if (!currentCampaign?._id) {
return;
}


try {
  setLoading(true);
  setError("");

  const response = await getWorkerZerodose({
    campaignId: currentCampaign._id,
    filter,
  });

  // console.log("Current Campaign Filter Zerodose:", response);

  if (!response?.success) {
    throw new Error(
      response?.message || "Failed to fetch Zerodose data.",
    );
  }

  // IMPORTANT:
  // response.data is already the Zerodose array

  setZerodoses(
    Array.isArray(response?.data) ? response.data : [],
  );

  setSummary(
    response?.summary || {
      recorded: 0,
      visited: 0,
      covered: 0,
    },
  );

  setVaccinationStatus(
    response?.vaccinationStatus || {
      total: {
        recorded: 0,
        visited: 0,
        covered: 0,
      },
      teams: [],
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

const handlePreviousCampaignSelect = async (campaignId) => {
setSelectedPreviousCampaignId(campaignId);
setPreviousNoData(false);
setPreviousZerodoses([]);
setLoading(true);
setError("");


const filters = ["recorded", "visited", "covered"];

try {
  for (const filter of filters) {
    const response = await getWorkerZerodose({
      campaignId,
      filter,
    });

    if (!response?.success) {
      continue;
    }

    // console.log("Previous Data ==>", response);

    const data = Array.isArray(response?.data)
      ? response.data
      : [];

    if (data.length > 0) {
      setPreviousZerodoses(data);

      setSummary(
        response?.summary || {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
      );

      setVaccinationStatus(
        response?.vaccinationStatus || {
          total: {
            recorded: 0,
            visited: 0,
            covered: 0,
          },
          teams: [],
        },
      );

      setPreviousZerodoseFilter(filter);
      setPreviousNoData(false);

      return;
    }
  }

  setPreviousZerodoses([]);

  setSummary({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  setVaccinationStatus({
    total: {
      recorded: 0,
      visited: 0,
      covered: 0,
    },
  });

  setPreviousZerodoseFilter("recorded");
  setPreviousNoData(true);
} catch (error) {
  console.error("Get previous campaign zerodose error:", error);

  setPreviousZerodoses([]);
  setPreviousNoData(true);

  setSummary({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  setVaccinationStatus({
    total: {
      recorded: 0,
      visited: 0,
      covered: 0,
    },
  });

  setError(error?.message || "Failed to fetch Zerodose data.");
} finally {
  setLoading(false);
}


};

// ============================================================
// PREVIOUS CAMPAIGN FILTER
// ============================================================

const handlePreviousFilterChange = async (filter) => {
if (!selectedPreviousCampaignId) {
return;
}


try {
  setLoading(true);
  setError("");
  setPreviousNoData(false);

  const response = await getWorkerZerodose({
    campaignId: selectedPreviousCampaignId,
    filter,
  });

  if (!response?.success) {
    throw new Error(
      response?.message || "Failed to fetch Zerodose data.",
    );
  }

  const data = Array.isArray(response?.data)
    ? response.data
    : [];

  setPreviousZerodoses(data);

  setSummary(
    response?.summary || {
      recorded: 0,
      visited: 0,
      covered: 0,
    },
  );

  setVaccinationStatus(
    response?.vaccinationStatus || {
      total: {
        recorded: 0,
        visited: 0,
        covered: 0,
      },
    },
  );

  setPreviousZerodoseFilter(filter);

  if (data.length === 0) {
    setPreviousNoData(true);
  }
} catch (error) {
  console.error("Previous Zerodose filter error:", error);

  setPreviousZerodoses([]);
  setPreviousNoData(true);

  setSummary({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  setVaccinationStatus({
    total: {
      recorded: 0,
      visited: 0,
      covered: 0,
    },
  });

  setError(error?.message || "Failed to load Zerodose data.");
} finally {
  setLoading(false);
}


};

// ============================================================
// SELECTED PREVIOUS CAMPAIGN
// ============================================================

const selectedPreviousCampaign =
campaigns.find(
(campaign) =>
String(campaign?._id) ===
String(selectedPreviousCampaignId),
) || null;

// ============================================================
// RENDER
// ============================================================

return ( <div className="relative min-h-full"> <ZerodoseTabs
     activeTab={activeTab}
     setActiveTab={handleTabChange}
   />


  {activeTab === "current" && (
    <CurrentCampaignZerodose
      campaign={currentCampaign}
      data={zerodoses}
      unionCouncilName={unionCouncilName}
      loading={loading}
      summary={summary}
      vaccinationStatus={vaccinationStatus}
      onFilterChange={handleCurrentFilterChange}
      designation={designation}
    />
  )}

  {activeTab === "previous" && (
    <PreviousCampaignsZerodose
      campaigns={campaigns}
      selectedCampaign={selectedPreviousCampaign}
      data={previousZerodoses}
      unionCouncilName={unionCouncilName}
      loading={loading}
      summary={summary}
      vaccinationStatus={vaccinationStatus}
      onFilterChange={handlePreviousFilterChange}
      onCampaignSelect={handlePreviousCampaignSelect}
      designation={designation}
      noData={previousNoData}
      activeFilter={previousZerodoseFilter}
    />
  )}
</div>


);
}
