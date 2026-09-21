
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
