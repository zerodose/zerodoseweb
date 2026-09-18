// "use client";

// import { useEffect, useState } from "react";

// import CampaignTabs from "@/components/supervisor/CampaignTabs";
// import VaccinatorCurrentCampaignSummery from "@/components/vaccinator/VaccinatorCurrentCampaignSummery";
// import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

// import { getOtherStaffSupervisorSummary } from "@/api/dashboardApi";

// import { getCurrentCampaign } from "@/api/campaignApi";

// export default function OtherStaffCampaignSection({ authUser }) {
//   const [activeTab, setActiveTab] = useState("current");
//   const [currentCampaign, setCurrentCampaign] = useState(null);
//   const [zerodoseData, setZerodoseData] = useState([]);
//   const [loading, setLoading] = useState(true);

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
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         // console.error("Failed to fetch current campaign:", error);

//         setCurrentCampaign(null);
//         setZerodoseData([]);
//       }
//     };

//     loadCurrentCampaign();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   useEffect(() => {
//     let cancelled = false;

//     const loadSupervisorSummary = async () => {
//       if (!currentCampaign) {
//         return;
//       }

//       const campaignId = currentCampaign._id;

//       if (!campaignId) {
//         console.warn("Current campaign ID is missing.");

//         setZerodoseData([]);
//         setLoading(false);

//         return;
//       }

//       try {
//         setLoading(true);

//         const response = await getOtherStaffSupervisorSummary(campaignId);

//         if (cancelled) {
//           return;
//         }

//         const data = response?.data || {};

//         setZerodoseData(
//           Array.isArray(data?.supervisors) ? data.supervisors : [],
//         );
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         // console.error("Failed to fetch supervisor summary:", error);

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

//   const previousCampaigns = [];

//   return (
//     <div className="w-full space-y-6">
//       <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

//       {activeTab === "current" && (
//         <VaccinatorCurrentCampaignSummery
//           campaign={currentCampaign}
//           data={zerodoseData}
//           loading={loading}
//           authUser={authUser}
//         />
//       )}

//       {activeTab === "previous" && (
//         <PreviousCampaignsSummery
//           campaigns={previousCampaigns}
//           data={[]}
//           loading={loading}
//         />
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";

import CampaignTabs from "@/components/supervisor/CampaignTabs";
import VaccinatorCurrentCampaignSummery from "@/components/vaccinator/VaccinatorCurrentCampaignSummery";
import PreviousCampaignsSummery from "@/components/supervisor/PreviousCampaignsSummery";

import { getOtherStaffSupervisorSummary } from "@/api/dashboardApi";
import { getCurrentCampaign } from "@/api/campaignApi";

export default function OtherStaffCampaignSection({ authUser }) {
const [activeTab, setActiveTab] = useState("current");
const [currentCampaign, setCurrentCampaign] = useState(null);
const [zerodoseData, setZerodoseData] = useState([]);
const [loading, setLoading] = useState(true);

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

    if (!campaign) {
      setZerodoseData([]);
      setLoading(false);
    }
  } catch (error) {
    if (cancelled) {
      return;
    }

    setCurrentCampaign(null);
    setZerodoseData([]);
    setLoading(false);
  }
};

loadCurrentCampaign();

return () => {
  cancelled = true;
};


}, []);

useEffect(() => {
let cancelled = false;


const loadSupervisorSummary = async () => {
  if (!currentCampaign) {
    return;
  }

  const campaignId = currentCampaign?._id;

  if (!campaignId) {
    console.warn("Current campaign ID is missing.");

    setZerodoseData([]);
    setLoading(false);

    return;
  }

  try {
    setLoading(true);

    const response =
      await getOtherStaffSupervisorSummary(campaignId);

    if (cancelled) {
      return;
    }

    const data = response?.data || {};

    setZerodoseData(
      Array.isArray(data?.supervisors)
        ? data.supervisors
        : [],
    );
  } catch (error) {
    if (cancelled) {
      return;
    }

    setZerodoseData([]);
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

const previousCampaigns = [];

return ( <div className="w-full space-y-6"> <CampaignTabs
     activeTab={activeTab}
     setActiveTab={setActiveTab}
   />


  {activeTab === "current" && (
    <VaccinatorCurrentCampaignSummery
      campaign={currentCampaign}
      data={zerodoseData}
      loading={loading}
      authUser={authUser}
    />
  )}

  {activeTab === "previous" && (
    <PreviousCampaignsSummery
      campaigns={previousCampaigns}
      data={[]}
      loading={loading}
    />
  )}
</div>


);
}
