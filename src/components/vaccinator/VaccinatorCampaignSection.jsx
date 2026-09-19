// // // "use client";

// // // import { useEffect, useState } from "react";

// // // import CampaignTabs from "@/components/supervisor/CampaignTabs";
// // // import VaccinatorCurrentCampaignSummery from "@/components/vaccinator/VaccinatorCurrentCampaignSummery";
// // // import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

// // // import { getUCSupervisorSummary } from "@/api/dashboardApi";

// // // import { getCurrentCampaign } from "@/api/campaignApi";

// // // export default function VaccinatorCampaignSection({ authUser }) {
// // //   const [activeTab, setActiveTab] = useState("current");
// // //   const [currentCampaign, setCurrentCampaign] = useState(null);
// // //   const [zerodoseData, setZerodoseData] = useState([]);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     let cancelled = false;

// // //     const loadCurrentCampaign = async () => {
// // //       try {
// // //         setLoading(true);

// // //         const response = await getCurrentCampaign();

// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         const data = response?.data || {};
// // //         const campaign = data?.currentCampaign || null;

// // //         setCurrentCampaign(campaign);
// // //       } catch (error) {
// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         setCurrentCampaign(null);
// // //         setZerodoseData([]);
// // //       }
// // //     };

// // //     loadCurrentCampaign();

// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //   }, []);

// // //   useEffect(() => {
// // //     let cancelled = false;

// // //     const loadSupervisorSummary = async () => {
// // //       if (!currentCampaign) {
// // //         return;
// // //       }

// // //       const campaignId = currentCampaign._id;

// // //       if (!campaignId) {
// // //         console.warn("Current campaign ID is missing.");

// // //         setZerodoseData([]);
// // //         setLoading(false);

// // //         return;
// // //       }

// // //       try {
// // //         setLoading(true);

// // //         const response = await getUCSupervisorSummary(campaignId);

// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         const data = response?.data || {};

// // //         setZerodoseData(
// // //           Array.isArray(data?.supervisors) ? data.supervisors : [],
// // //         );
// // //       } catch (error) {
// // //         if (cancelled) {
// // //           return;
// // //         }

// // //         // console.error("Failed to fetch supervisor summary:", error);

// // //         setZerodoseData([]);
// // //       } finally {
// // //         if (!cancelled) {
// // //           setLoading(false);
// // //         }
// // //       }
// // //     };

// // //     loadSupervisorSummary();

// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //   }, [currentCampaign]);

// // //   const previousCampaigns = [];

// // //   return (
// // //     <div className="w-full space-y-6">
// // //       <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

// // //       {activeTab === "current" && (
// // //         <VaccinatorCurrentCampaignSummery
// // //           campaign={currentCampaign}
// // //           data={zerodoseData}
// // //           loading={loading}
// // //           authUser={authUser}
// // //         />
// // //       )}

// // //       {activeTab === "previous" && (
// // //         <PreviousCampaignsSummery
// // //           campaigns={previousCampaigns}
// // //           data={[]}
// // //           loading={loading}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useEffect, useState } from "react";

// // import CampaignTabs from "@/components/supervisor/CampaignTabs";
// // import VaccinatorCurrentCampaignSummery from "@/components/vaccinator/VaccinatorCurrentCampaignSummery";
// // import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

// // import { getUCSupervisorSummary } from "@/api/dashboardApi";
// // import { getCurrentCampaign } from "@/api/campaignApi";

// // export default function VaccinatorCampaignSection({ authUser }) {
// //   const [activeTab, setActiveTab] = useState("current");
// //   const [currentCampaign, setCurrentCampaign] = useState(null);
// //   const [zerodoseData, setZerodoseData] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     let cancelled = false;

// //     const loadCurrentCampaign = async () => {
// //       try {
// //         setLoading(true);

// //         const response = await getCurrentCampaign();

// //         if (cancelled) {
// //           return;
// //         }

// //         const data = response?.data || {};
// //         const campaign = data?.currentCampaign || null;

// //         setCurrentCampaign(campaign);

// //         if (!campaign) {
// //           setZerodoseData([]);
// //           setLoading(false);
// //         }
// //       } catch (error) {
// //         if (cancelled) {
// //           return;
// //         }

// //         setCurrentCampaign(null);
// //         setZerodoseData([]);
// //         setLoading(false);
// //       }
// //     };

// //     loadCurrentCampaign();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, []);

// //   useEffect(() => {
// //     let cancelled = false;

// //     const loadSupervisorSummary = async () => {
// //       if (!currentCampaign) {
// //         return;
// //       }

// //       const campaignId = currentCampaign?._id;

// //       if (!campaignId) {
// //         console.warn("Current campaign ID is missing.");

// //         setZerodoseData([]);
// //         setLoading(false);

// //         return;
// //       }

// //       try {
// //         setLoading(true);

// //         const response = await getUCSupervisorSummary(campaignId);

// //         if (cancelled) {
// //           return;
// //         }

// //         const data = response?.data || {};

// //         setZerodoseData(
// //           Array.isArray(data?.supervisors) ? data.supervisors : [],
// //         );
// //       } catch (error) {
// //         if (cancelled) {
// //           return;
// //         }

// //         setZerodoseData([]);
// //       } finally {
// //         if (!cancelled) {
// //           setLoading(false);
// //         }
// //       }
// //     };

// //     loadSupervisorSummary();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [currentCampaign]);

// //   const previousCampaigns = [];

// //   return (
// //     <div className="w-full space-y-6">
// //       <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />
// //       {activeTab === "current" && (
// //         <VaccinatorCurrentCampaignSummery
// //           campaign={currentCampaign}
// //           data={zerodoseData}
// //           loading={loading}
// //           authUser={authUser}
// //         />
// //       )}
// //       {activeTab === "previous" && (
// //         <PreviousCampaignsSummery
// //           campaigns={previousCampaigns}
// //           data={[]}
// //           loading={loading}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";

// import CampaignTabs from "@/components/supervisor/CampaignTabs";
// import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

// import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";

// import { getUCSupervisorSummary } from "@/api/dashboardApi";
// import CurrentCampaignSummery from "../supervisor/CurrentCampaignSummery";

// export default function VaccinatorCampaignSection( { authUser } ) {
//   const [activeTab, setActiveTab] = useState("current");

//   const [campaigns, setCampaigns] = useState([]);
//   const [currentCampaign, setCurrentCampaign] = useState(null);

//   const [zerodoseData, setZerodoseData] = useState([]);
//   const [previousZerodoseData, setPreviousZerodoseData] = useState([]);

//   const [selectedPreviousCampaignId, setSelectedPreviousCampaignId] =
//     useState("");

//   const [loading, setLoading] = useState(true);
//   const [previousLoading, setPreviousLoading] = useState(false);

//   // ============================================================
//   // GET CURRENT CAMPAIGN
//   // ============================================================

//   useEffect(() => {
//     let cancelled = false;

//     const loadCurrentCampaign = async () => {
//       try {
//         setLoading(true);

//         const response = await getCurrentCampaign();

//         if (cancelled) {
//           return;
//         }

//         const data = response?.data || {};
//         const campaign = data?.currentCampaign || null;

//         setCurrentCampaign(campaign);

//         if (!campaign?._id) {
//           setZerodoseData([]);
//           setLoading(false);

//           return;
//         }
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         console.error("Get current campaign error:", error);

//         setCurrentCampaign(null);
//         setZerodoseData([]);
//         setLoading(false);
//       }
//     };

//     loadCurrentCampaign();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // ============================================================
//   // GET CURRENT VACCINATOR SUPERVISOR SUMMARY
//   // ============================================================

//   useEffect(() => {
//     let cancelled = false;

//     const loadSupervisorSummary = async () => {
//       if (!currentCampaign?._id) {
//         return;
//       }

//       try {
//         setLoading(true);

//         const response = await getUCSupervisorSummary(
//           currentCampaign._id,
//         );

//         if (cancelled) {
//           return;
//         }

//         const data = response?.data || {};

//         console.log("Current Vaccinator Summary ==>", data);

//         setZerodoseData(
//           Array.isArray(data?.supervisors) ? data.supervisors : [],
//         );
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         console.error(
//           "Get current vaccinator supervisor summary error:",
//           error,
//         );

//         setZerodoseData([]);
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     loadSupervisorSummary();

//     return () => {
//       cancelled = true;
//     };
//   }, [currentCampaign]);

//   // ============================================================
//   // TAB CHANGE
//   // ============================================================

//   const handleTabChange = async (tab) => {
//     setActiveTab(tab);

//     if (tab !== "previous") {
//       return;
//     }

//     // Campaigns already loaded
//     if (campaigns.length > 0) {
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await getCampaignFilter();

//       const campaignList = Array.isArray(response)
//         ? response
//         : Array.isArray(response?.data)
//           ? response.data
//           : [];

//       setCampaigns(campaignList);
//     } catch (error) {
//       console.error("Get previous campaigns error:", error);

//       setCampaigns([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // PREVIOUS CAMPAIGN SELECT
//   // ============================================================

//   const handlePreviousCampaignSelect = async (campaignId) => {
//     if (!campaignId) {
//       setSelectedPreviousCampaignId("");
//       setPreviousZerodoseData([]);

//       return;
//     }

//     setSelectedPreviousCampaignId(campaignId);
//     setPreviousZerodoseData([]);
//     setPreviousLoading(true);

//     try {
//       const response = await getUCSupervisorSummary(campaignId);

//       const data = response?.data || {};

//       console.log("Previous Vaccinator Summary ==>", data);

//       setPreviousZerodoseData(
//         Array.isArray(data?.supervisors) ? data.supervisors : [],
//       );
//     } catch (error) {
//       console.error("Get previous vaccinator supervisor summary error:", error);

//       setPreviousZerodoseData([]);
//     } finally {
//       setPreviousLoading(false);
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
//   // UI
//   // ============================================================

//   return (
//     <div className="w-full space-y-6">
//       {/* ======================================================
// CAMPAIGN TABS
// ====================================================== */}

//       <CampaignTabs activeTab={activeTab} setActiveTab={handleTabChange} />

//       {/* ======================================================
//       CURRENT CAMPAIGN
//   ====================================================== */}

//       {activeTab === "current" && (
//         <CurrentCampaignSummery
//           campaign={currentCampaign}
//           data={zerodoseData}
//           loading={loading}
//           mode={authUser?.designation}
//           authUser={authUser}
//         />
//       )}

//       {/* ======================================================
//       PREVIOUS CAMPAIGNS
//   ====================================================== */}

//       {activeTab === "previous" && (
//         <PreviousCampaignsSummery
//           campaigns={campaigns}
//           selectedCampaign={selectedPreviousCampaign}
//           data={previousZerodoseData}
//           loading={previousLoading}
//           onCampaignSelect={handlePreviousCampaignSelect}
//           mode={authUser?.designation}
//           authUser={authUser}
//         />
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";

import CampaignTabs from "@/components/supervisor/CampaignTabs";
import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

import { getCampaignFilter, getCurrentCampaign } from "@/api/campaignApi";

import { getUCSupervisorSummary } from "@/api/dashboardApi";
import CurrentCampaignSummery from "../supervisor/CurrentCampaignSummery";

export default function VaccinatorCampaignSection({ authUser }) {
const [activeTab, setActiveTab] = useState("current");

const [campaigns, setCampaigns] = useState([]);
const [currentCampaign, setCurrentCampaign] = useState(null);

const [zerodoseData, setZerodoseData] = useState([]);
const [currentTotal, setCurrentTotal] = useState({
numberOfTeams: 0,
recordCount: 0,
visitCount: 0,
coveredCount: 0,
});

const [previousZerodoseData, setPreviousZerodoseData] = useState([]);
const [previousTotal, setPreviousTotal] = useState({
numberOfTeams: 0,
recordCount: 0,
visitCount: 0,
coveredCount: 0,
});

const [selectedPreviousCampaignId, setSelectedPreviousCampaignId] =
useState("");

const [loading, setLoading] = useState(true);
const [previousLoading, setPreviousLoading] = useState(false);

// ============================================================
// GET CURRENT CAMPAIGN
// ============================================================

useEffect(() => {
let cancelled = false;


const loadCurrentCampaign = async () => {
  try {
    setLoading(true);

    const response = await getCurrentCampaign();

    if (cancelled) {
      return;
    }

    const data = response?.data || {};
    const campaign = data?.currentCampaign || null;

    setCurrentCampaign(campaign);

    if (!campaign?._id) {
      setZerodoseData([]);

      setCurrentTotal({
        numberOfTeams: 0,
        recordCount: 0,
        visitCount: 0,
        coveredCount: 0,
      });

      setLoading(false);

      return;
    }
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error("Get current campaign error:", error);

    setCurrentCampaign(null);
    setZerodoseData([]);

    setCurrentTotal({
      numberOfTeams: 0,
      recordCount: 0,
      visitCount: 0,
      coveredCount: 0,
    });

    setLoading(false);
  }
};

loadCurrentCampaign();

return () => {
  cancelled = true;
};


}, []);

// ============================================================
// GET CURRENT VACCINATOR SUPERVISOR SUMMARY
// ============================================================

useEffect(() => {
let cancelled = false;


const loadSupervisorSummary = async () => {
  if (!currentCampaign?._id) {
    return;
  }

  try {
    setLoading(true);

    const response = await getUCSupervisorSummary(
      currentCampaign._id,
    );

    if (cancelled) {
      return;
    }

    const data = response?.data || {};

    console.log("Current Vaccinator Summary ==>", data);

    setZerodoseData(
      Array.isArray(data?.supervisors)
        ? data.supervisors
        : [],
    );

    setCurrentTotal({
      numberOfTeams: Number(
        data?.total?.numberOfTeams || 0,
      ),
      recordCount: Number(
        data?.total?.recordCount || 0,
      ),
      visitCount: Number(
        data?.total?.visitCount || 0,
      ),
      coveredCount: Number(
        data?.total?.coveredCount || 0,
      ),
    });
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error(
      "Get current vaccinator supervisor summary error:",
      error,
    );

    setZerodoseData([]);

    setCurrentTotal({
      numberOfTeams: 0,
      recordCount: 0,
      visitCount: 0,
      coveredCount: 0,
    });
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
};

loadSupervisorSummary();

return () => {
  cancelled = true;
};


}, [currentCampaign]);

// ============================================================
// TAB CHANGE
// ============================================================

const handleTabChange = async (tab) => {
setActiveTab(tab);


if (tab !== "previous") {
  return;
}

if (campaigns.length > 0) {
  return;
}

try {
  setLoading(true);

  const response = await getCampaignFilter();

  const campaignList = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  setCampaigns(campaignList);
} catch (error) {
  console.error("Get previous campaigns error:", error);

  setCampaigns([]);
} finally {
  setLoading(false);
}


};

// ============================================================
// PREVIOUS CAMPAIGN SELECT
// ============================================================

const handlePreviousCampaignSelect = async (campaignId) => {
if (!campaignId) {
setSelectedPreviousCampaignId("");
setPreviousZerodoseData([]);


  setPreviousTotal({
    numberOfTeams: 0,
    recordCount: 0,
    visitCount: 0,
    coveredCount: 0,
  });

  return;
}

setSelectedPreviousCampaignId(campaignId);
setPreviousZerodoseData([]);

setPreviousTotal({
  numberOfTeams: 0,
  recordCount: 0,
  visitCount: 0,
  coveredCount: 0,
});

setPreviousLoading(true);

try {
  const response =
    await getUCSupervisorSummary(campaignId);

  const data = response?.data || {};

  console.log("Previous Vaccinator Summary ==>", data);

  setPreviousZerodoseData(
    Array.isArray(data?.supervisors)
      ? data.supervisors
      : [],
  );

  setPreviousTotal({
    numberOfTeams: Number(
      data?.total?.numberOfTeams || 0,
    ),
    recordCount: Number(
      data?.total?.recordCount || 0,
    ),
    visitCount: Number(
      data?.total?.visitCount || 0,
    ),
    coveredCount: Number(
      data?.total?.coveredCount || 0,
    ),
  });
} catch (error) {
  console.error(
    "Get previous vaccinator supervisor summary error:",
    error,
  );

  setPreviousZerodoseData([]);

  setPreviousTotal({
    numberOfTeams: 0,
    recordCount: 0,
    visitCount: 0,
    coveredCount: 0,
  });
} finally {
  setPreviousLoading(false);
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
// UI
// ============================================================

return ( <div className="w-full space-y-6">
{/* ======================================================
CAMPAIGN TABS
====================================================== */}


  <CampaignTabs
    activeTab={activeTab}
    setActiveTab={handleTabChange}
  />

  {/* ======================================================
      CURRENT CAMPAIGN
  ====================================================== */}

  {activeTab === "current" && (
    <CurrentCampaignSummery
      campaign={currentCampaign}
      data={zerodoseData}
      total={currentTotal}
      loading={loading}
      mode={authUser?.designation}
    />
  )}

  {/* ======================================================
      PREVIOUS CAMPAIGNS
  ====================================================== */}

  {activeTab === "previous" && (
    <PreviousCampaignsSummery
      campaigns={campaigns}
      selectedCampaign={selectedPreviousCampaign}
      data={previousZerodoseData}
      total={previousTotal}
      loading={previousLoading}
      onCampaignSelect={handlePreviousCampaignSelect}
      mode={authUser?.designation}
    />
  )}
</div>


);
}
