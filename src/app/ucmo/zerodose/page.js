// "use client";

// import { useEffect, useState } from "react";

// import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";
// import { getUCZerodose } from "@/api/zerodoseApi";
// import { LucideSyringe } from "lucide-react";

// import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
// import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";
// import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
// import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

// export default function Page() {
//   const [activeTab, setActiveTab] = useState("current");

//   const [currentCampaign, setCurrentCampaign] = useState(null);
//   const [previousCampaigns, setPreviousCampaigns] = useState([]);
//   const [selectedPreviousCampaign, setSelectedPreviousCampaign] =
//     useState(null);

//   const [zerodoses, setZerodoses] = useState([]);
//   const [previousZerodoses, setPreviousZerodoses] = useState([]);

//   const [unionCouncilName, setUnionCouncilName] = useState("-");

//   const [loading, setLoading] = useState(true);
//   const [previousLoading, setPreviousLoading] = useState(false);
//   const [error, setError] = useState("");

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

//   const [previousSummary, setPreviousSummary] = useState({
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   const [previousVaccinationStatus, setPreviousVaccinationStatus] = useState({
//     total: {
//       recorded: 0,
//       visited: 0,
//       covered: 0,
//     },
//     teams: [],
//   });

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

//         const campaign = currentCampaignResponse?.data?.currentCampaign || null;

//         if (cancelled) {
//           return;
//         }

//         setCurrentCampaign(campaign);

//         // --------------------------------------------------------
//         // UNION COUNCIL
//         // --------------------------------------------------------

//         setUnionCouncilName(storedAuthUser?.unionCouncil?.name || "-");

//         // --------------------------------------------------------
//         // CURRENT CAMPAIGN ZERODOSE
//         // --------------------------------------------------------

//         if (campaign?._id) {
//           const response = await getUCZerodose({
//             campaignId: campaign._id,
//             filter: "recorded",
//           });

//           if (!response?.success) {
//             throw new Error(
//               response?.message || "Failed to fetch current Zerodose.",
//             );
//           }

//           console.log("UCMO Zerodose response:", response);

//           const currentData = Array.isArray(response.data) ? response.data : [];

//           if (!cancelled) {
//             setZerodoses(currentData);

//             setSummary(
//               response.summary || {
//                 recorded: 0,
//                 visited: 0,
//                 covered: 0,
//               },
//             );

//             setVaccinationStatus(
//               response.vaccinationStatus || {
//                 total: {
//                   recorded: 0,
//                   visited: 0,
//                   covered: 0,
//                 },
//                 teams: [],
//               },
//             );
//           }
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

//         // --------------------------------------------------------
//         // PREVIOUS CAMPAIGNS
//         // --------------------------------------------------------

//         const campaignsResponse = await getCampaignFilter();

//         if (!campaignsResponse?.success) {
//           throw new Error(
//             campaignsResponse?.message || "Failed to fetch previous campaigns.",
//           );
//         }

//         const campaigns = Array.isArray(campaignsResponse.data)
//           ? campaignsResponse.data
//           : [];

//         if (!cancelled) {
//           setPreviousCampaigns(campaigns);
//         }

//         console.log("UCMO Zerodose data fetched successfully:", {
//           currentCampaignId: campaign?._id || null,
//           previousCampaigns: campaigns.length,
//         });
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         console.error("UCMO Zerodose fetch error:", error);

//         setError(error?.message || "Failed to load Zerodose data.");

//         setCurrentCampaign(null);
//         setPreviousCampaigns([]);
//         setSelectedPreviousCampaign(null);

//         setZerodoses([]);
//         setPreviousZerodoses([]);

//         setUnionCouncilName("-");

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

//         setPreviousSummary({
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });

//         setPreviousVaccinationStatus({
//           total: {
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           },
//           teams: [],
//         });
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
//   // CURRENT FILTER
//   // ============================================================

//   const handleCurrentFilterChange = async (filter) => {
//     if (!currentCampaign?._id) {
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await getUCZerodose({
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
//           total: {
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           },
//           teams: [],
//         },
//       );
//     } catch (error) {
//       console.error("UCMO current Zerodose filter error:", error);

//       setError(error?.message || "Failed to load Zerodose data.");

//       setZerodoses([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // PREVIOUS CAMPAIGN SELECT
//   // ============================================================

//   const handlePreviousCampaignSelect = async (
//     campaignId,
//     filter = "recorded",
//   ) => {
//     if (!campaignId) {
//       setSelectedPreviousCampaign(null);
//       setPreviousZerodoses([]);

//       setPreviousSummary({
//         recorded: 0,
//         visited: 0,
//         covered: 0,
//       });

//       setPreviousVaccinationStatus({
//         total: {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//         teams: [],
//       });

//       return;
//     }

//     const campaign =
//       previousCampaigns.find(
//         (item) => String(item?._id) === String(campaignId),
//       ) || null;

//     setSelectedPreviousCampaign(campaign);
//     setPreviousZerodoses([]);
//     setPreviousLoading(true);
//     setError("");

//     try {
//       const response = await getUCZerodose({
//         campaignId,
//         filter,
//       });

//       if (!response?.success) {
//         throw new Error(
//           response?.message || "Failed to fetch previous campaign Zerodose.",
//         );
//       }

//       const previousData = Array.isArray(response.data) ? response.data : [];

//       setPreviousZerodoses(previousData);

//       setPreviousSummary(
//         response.summary || {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//       );

//       setPreviousVaccinationStatus(
//         response.vaccinationStatus || {
//           total: {
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           },
//           teams: [],
//         },
//       );
//     } catch (error) {
//       console.error("Previous UCMO Zerodose error:", error);

//       setError(error?.message || "Failed to load previous campaign data.");

//       setPreviousZerodoses([]);

//       setPreviousSummary({
//         recorded: 0,
//         visited: 0,
//         covered: 0,
//       });

//       setPreviousVaccinationStatus({
//         total: {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//         teams: [],
//       });
//     } finally {
//       setPreviousLoading(false);
//     }
//   };

//   // ============================================================
//   // PREVIOUS CAMPAIGN FILTER
//   // ============================================================

//   const handlePreviousFilterChange = async (filter) => {
//     if (!selectedPreviousCampaign?._id) {
//       return;
//     }

//     try {
//       setPreviousLoading(true);
//       setError("");

//       const response = await getUCZerodose({
//         campaignId: selectedPreviousCampaign._id,
//         filter,
//       });

//       if (!response?.success) {
//         throw new Error(
//           response?.message || "Failed to fetch previous Zerodose data.",
//         );
//       }

//       setPreviousZerodoses(Array.isArray(response.data) ? response.data : []);

//       setPreviousSummary(
//         response.summary || {
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         },
//       );

//       setPreviousVaccinationStatus(
//         response.vaccinationStatus || {
//           total: {
//             recorded: 0,
//             visited: 0,
//             covered: 0,
//           },
//           teams: [],
//         },
//       );
//     } catch (error) {
//       console.error("Previous UCMO Zerodose filter error:", error);

//       setError(error?.message || "Failed to load previous Zerodose data.");

//       setPreviousZerodoses([]);
//     } finally {
//       setPreviousLoading(false);
//     }
//   };

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="relative min-h-full">
//       <ApprovalPageHeader
//         title="Zerodose"
//         description="View campaign-wise Zerodose records and team details"
//         onBack={() => window.history.back()}
//         rightContent={
//           <div className="border-primary/10 bg-primary-light text-primary dark:bg-primary/10 dark:border-primary/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
//             {" "}
//             <LucideSyringe size={18} />{" "}
//           </div>
//         }
//       />

//       {error && (
//         <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       <ZerodoseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

//       {activeTab === "current" && (
//         <CurrentCampaignZerodose
//           campaign={currentCampaign}
//           data={zerodoses}
//           unionCouncilName={unionCouncilName}
//           loading={loading}
//           summary={summary}
//           vaccinationStatus={vaccinationStatus}
//           onFilterChange={handleCurrentFilterChange}
//           designation="ucmo"
//         />
//       )}

//       {activeTab === "previous" && (
//         <PreviousCampaignsZerodose
//           campaigns={previousCampaigns}
//           selectedCampaign={selectedPreviousCampaign}
//           data={previousZerodoses}
//           unionCouncilName={unionCouncilName}
//           loading={previousLoading}
//           summary={previousSummary}
//           vaccinationStatus={previousVaccinationStatus}
//           onCampaignSelect={handlePreviousCampaignSelect}
//           onFilterChange={handlePreviousFilterChange}
//           designation="ucmo"
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";
import { getUCZerodose } from "@/api/zerodoseApi";
import { LucideSyringe } from "lucide-react";

import ZerodoseTabs from "@/components/supervisor/zerodose/ZerodoseTabs";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";
import CurrentCampaignZerodose from "@/components/supervisor/zerodose/CurrentCampaignZerodose";
import PreviousCampaignsZerodose from "@/components/supervisor/zerodose/PreviousCampaignsZerodose";

export default function Page() {
  const [activeTab, setActiveTab] = useState("current");

  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [previousCampaigns, setPreviousCampaigns] = useState([]);
  const [selectedPreviousCampaign, setSelectedPreviousCampaign] =
    useState(null);

  const [zerodoses, setZerodoses] = useState([]);
  const [previousZerodoses, setPreviousZerodoses] = useState([]);

  const [unionCouncilName, setUnionCouncilName] = useState("-");

  const [loading, setLoading] = useState(true);
  const [previousLoading, setPreviousLoading] = useState(false);

  const [error, setError] = useState("");

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

  const [previousSummary, setPreviousSummary] = useState({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  const [previousVaccinationStatus, setPreviousVaccinationStatus] = useState({
    total: {
      recorded: 0,
      visited: 0,
      covered: 0,
    },
    teams: [],
  });

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
          const response = await getUCZerodose({
            campaignId: campaign._id,
            filter: "recorded",
          });

          if (!response?.success) {
            throw new Error(
              response?.message || "Failed to fetch current Zerodose.",
            );
          }

          console.log("UCMO Zerodose response:", response);

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
                total: {
                  recorded: 0,
                  visited: 0,
                  covered: 0,
                },
                teams: [],
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
            total: {
              recorded: 0,
              visited: 0,
              covered: 0,
            },
            teams: [],
          });
        }

        // --------------------------------------------------------
        // PREVIOUS CAMPAIGNS
        // --------------------------------------------------------

        const campaigns = await getCampaignFilter();

        if (!cancelled) {
          setPreviousCampaigns(campaigns);
        }
        console.log("UCMO Zerodose data fetched successfully:", {
          currentCampaignId: campaign?._id || null,
          previousCampaigns: campaigns.length,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("UCMO Zerodose fetch error:", error);

        setError(error?.message || "Failed to load Zerodose data.");

        setCurrentCampaign(null);
        setPreviousCampaigns([]);
        setSelectedPreviousCampaign(null);

        setZerodoses([]);
        setPreviousZerodoses([]);

        setUnionCouncilName("-");

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

        setPreviousSummary({
          recorded: 0,
          visited: 0,
          covered: 0,
        });

        setPreviousVaccinationStatus({
          total: {
            recorded: 0,
            visited: 0,
            covered: 0,
          },
          teams: [],
        });
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

      const response = await getUCZerodose({
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
          total: {
            recorded: 0,
            visited: 0,
            covered: 0,
          },
          teams: [],
        },
      );
    } catch (error) {
      console.error("UCMO current Zerodose filter error:", error);

      setError(error?.message || "Failed to load Zerodose data.");

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
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PREVIOUS CAMPAIGN SELECT
  // ============================================================

  const handlePreviousCampaignSelect = async (
    campaignId,
    filter = "recorded",
  ) => {
    if (!campaignId) {
      setSelectedPreviousCampaign(null);
      setPreviousZerodoses([]);

      setPreviousSummary({
        recorded: 0,
        visited: 0,
        covered: 0,
      });

      setPreviousVaccinationStatus({
        total: {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
        teams: [],
      });

      return;
    }

    const selectedCampaign =
      previousCampaigns.find(
        (campaign) => String(campaign?._id) === String(campaignId),
      ) || null;

    setSelectedPreviousCampaign(selectedCampaign);
    setPreviousZerodoses([]);
    setPreviousLoading(true);
    setError("");

    try {
      const response = await getUCZerodose({
        campaignId,
        filter,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch previous campaign Zerodose.",
        );
      }

      const previousData = Array.isArray(response.data) ? response.data : [];

      setPreviousZerodoses(previousData);

      setPreviousSummary(
        response.summary || {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
      );

      setPreviousVaccinationStatus(
        response.vaccinationStatus || {
          total: {
            recorded: 0,
            visited: 0,
            covered: 0,
          },
          teams: [],
        },
      );
    } catch (error) {
      console.error("UCMO previous campaign Zerodose error:", error);

      setError(error?.message || "Failed to load previous campaign data.");

      setPreviousZerodoses([]);

      setPreviousSummary({
        recorded: 0,
        visited: 0,
        covered: 0,
      });

      setPreviousVaccinationStatus({
        total: {
          recorded: 0,
          visited: 0,
          covered: 0,
        },
        teams: [],
      });
    } finally {
      setPreviousLoading(false);
    }
  };

  // ============================================================
  // PREVIOUS CAMPAIGN FILTER
  // ============================================================

  const handlePreviousFilterChange = async (filter) => {
    if (!selectedPreviousCampaign?._id) {
      return;
    }

    await handlePreviousCampaignSelect(selectedPreviousCampaign._id, filter);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative min-h-full">
      <ApprovalPageHeader
        title="Zerodose"
        description="View campaign-wise Zerodose records and team details"
        onBack={() => window.history.back()}
        rightContent={
          <div className="border-primary/10 bg-primary-light text-primary dark:border-primary/30 dark:bg-primary/10 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
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
          designation="ucmo"
        />
      )}

      {activeTab === "previous" && (
        <PreviousCampaignsZerodose
          campaigns={previousCampaigns}
          selectedCampaign={selectedPreviousCampaign}
          data={previousZerodoses}
          unionCouncilName={unionCouncilName}
          loading={previousLoading}
          summary={previousSummary}
          vaccinationStatus={previousVaccinationStatus}
          onCampaignSelect={handlePreviousCampaignSelect}
          onFilterChange={handlePreviousFilterChange}
          designation="ucmo"
        />
      )}
    </div>
  );
}
