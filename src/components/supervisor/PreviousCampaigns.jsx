"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Filter, Layers3 } from "lucide-react";

import CampaignHeader from "./CampaignHeader";
import ZerodoseTable from "./ZerodoseTable";
import SupervisorZerodoseTableSkeleton from "./SupervisorZerodoseTableSkeleton";

export default function PreviousCampaigns({
  campaigns = [],
  data = [],
  loading = false,
}) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  // ============================================================
  // SAFE ID
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
  // UNIQUE CAMPAIGNS
  // ============================================================

  // const uniqueCampaigns = useMemo(() => {
  //   const map = new Map();

  //   campaigns.forEach((item) => {
  //     const campaign = item?.campaign;

  //     if (!campaign) {
  //       return;
  //     }

  //     const campaignId = getId(campaign);

  //     if (!campaignId) {
  //       return;
  //     }

  //     if (!map.has(campaignId)) {
  //       map.set(campaignId, campaign);
  //     }
  //   });

  //   return Array.from(map.values());
  // }, [campaigns]);

  const uniqueCampaigns = useMemo(() => {
    const map = new Map();

    campaigns.forEach((campaign) => {
      const campaignId = getId(campaign);

      if (!campaignId) {
        return;
      }

      if (!map.has(campaignId)) {
        map.set(campaignId, campaign);
      }
    });

    return Array.from(map.values());
  }, [campaigns]);

  // ============================================================
  // SORTED CAMPAIGNS
  // ============================================================

  const sortedCampaigns = useMemo(() => {
    return [...uniqueCampaigns].sort((a, b) => {
      const dateA = new Date(a?.startDate || 0).getTime();
      const dateB = new Date(b?.startDate || 0).getTime();

      return dateB - dateA;
    });
  }, [uniqueCampaigns]);

  // ============================================================
  // YEARS
  // ============================================================

  const years = useMemo(() => {
    return [
      ...new Set(
        uniqueCampaigns
          .map((campaign) => campaign?.year)
          .filter((year) => year !== null && year !== undefined && year !== ""),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns]);

  // ============================================================
  // MONTHS
  // ============================================================

  const months = useMemo(() => {
    if (!selectedYear) {
      return [];
    }

    return [
      ...new Set(
        uniqueCampaigns
          .filter((campaign) => String(campaign?.year) === String(selectedYear))
          .map((campaign) => campaign?.month)
          .filter(
            (month) => month !== null && month !== undefined && month !== "",
          ),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns, selectedYear]);

  // ============================================================
  // CAMPAIGN OPTIONS
  // ============================================================

  const campaignOptions = useMemo(() => {
    if (!selectedYear || !selectedMonth) {
      return [];
    }

    return uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) === String(selectedYear) &&
          String(campaign?.month) === String(selectedMonth),
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();
        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });
  }, [uniqueCampaigns, selectedYear, selectedMonth]);

  // ============================================================
  // DEFAULT LATEST PREVIOUS CAMPAIGN
  // ============================================================

  useEffect(() => {
    if (!sortedCampaigns.length) {
      setSelectedYear("");
      setSelectedMonth("");
      setSelectedCampaignId("");
      return;
    }

    const latestCampaign = sortedCampaigns[0];

    const latestCampaignId = getId(latestCampaign);

    if (!latestCampaignId) {
      return;
    }

    setSelectedYear(
      latestCampaign?.year !== null && latestCampaign?.year !== undefined
        ? String(latestCampaign.year)
        : "",
    );

    setSelectedMonth(
      latestCampaign?.month !== null && latestCampaign?.month !== undefined
        ? String(latestCampaign.month)
        : "",
    );

    setSelectedCampaignId(latestCampaignId);
  }, [sortedCampaigns]);

  // ============================================================
  // SELECTED CAMPAIGN
  // ============================================================

  const selectedCampaign = useMemo(() => {
    if (!selectedCampaignId) {
      return null;
    }

    return (
      uniqueCampaigns.find(
        (campaign) => String(getId(campaign)) === String(selectedCampaignId),
      ) || null
    );
  }, [uniqueCampaigns, selectedCampaignId]);

  // ============================================================
  // SELECTED CAMPAIGN RAW DATA
  // ============================================================

  const selectedRawData = useMemo(() => {
    if (!selectedCampaignId) {
      return [];
    }

    return data.filter((item) => {
      const campaignId = getId(
        item?.campaign || item?.campaignId || item?.campaign?._id,
      );

      return campaignId && String(campaignId) === String(selectedCampaignId);
    });
  }, [data, selectedCampaignId]);

  // ============================================================
  // TEAM-WISE DATA
  // ============================================================

  // ============================================================
  // TEAM-WISE DATA
  // ============================================================

  const teamData = useMemo(() => {
    const teamsMap = new Map();

    selectedRawData.forEach((item) => {
      const rawTeamNumber = item?.teamNumber;

      if (
        rawTeamNumber === null ||
        rawTeamNumber === undefined ||
        rawTeamNumber === ""
      ) {
        return;
      }

      const teamNumber = Number(rawTeamNumber);

      if (!Number.isInteger(teamNumber)) {
        return;
      }

      if (!teamsMap.has(teamNumber)) {
        teamsMap.set(teamNumber, {
          teamNumber,
          teamLeader: item?.teamLeader || null,
          teamMember: item?.teamMember || null,
          recorded: 0,
          visited: 0,
          covered: 0,
        });
      }

      const team = teamsMap.get(teamNumber);

      team.recorded += 1;

      if (item?.visitDate || item?.vaccinationStatus === "visited") {
        team.visited += 1;
      }

      if (item?.coveredDate || item?.vaccinationStatus === "covered") {
        team.covered += 1;
      }

      // Historical team assignment
      if (item?.teamLeader) {
        team.teamLeader = item.teamLeader;
      }

      if (item?.teamMember) {
        team.teamMember = item.teamMember;
      }
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
    );
  }, [selectedRawData]);

  // ============================================================
  // TOTALS
  // ============================================================

  const totalRecorded = useMemo(() => {
    return teamData.reduce(
      (total, team) => total + Number(team.recorded || 0),
      0,
    );
  }, [teamData]);

  const totalCovered = useMemo(() => {
    return teamData.reduce(
      (total, team) => total + Number(team.covered || 0),
      0,
    );
  }, [teamData]);

  // ============================================================
  // YEAR CHANGE
  // ============================================================

  const handleYearChange = (value) => {
    setSelectedYear(value);

    if (!value) {
      setSelectedMonth("");
      setSelectedCampaignId("");
      return;
    }

    const campaignsOfYear = uniqueCampaigns
      .filter((campaign) => String(campaign?.year) === String(value))
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });

    const firstCampaign = campaignsOfYear[0];

    if (!firstCampaign) {
      setSelectedMonth("");
      setSelectedCampaignId("");
      return;
    }

    setSelectedMonth(
      firstCampaign?.month !== null && firstCampaign?.month !== undefined
        ? String(firstCampaign.month)
        : "",
    );

    setSelectedCampaignId(getId(firstCampaign) || "");
  };

  // ============================================================
  // MONTH CHANGE
  // ============================================================

  const handleMonthChange = (value) => {
    setSelectedMonth(value);

    if (!value) {
      setSelectedCampaignId("");
      return;
    }

    const campaignsOfMonth = uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) === String(selectedYear) &&
          String(campaign?.month) === String(value),
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });

    setSelectedCampaignId(getId(campaignsOfMonth[0]) || "");
  };

  // ============================================================
  // CAMPAIGN CHANGE
  // ============================================================

  const handleCampaignChange = (value) => {
    setSelectedCampaignId(value);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <SupervisorZerodoseTableSkeleton />;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Layers3 size={18} />
          </div>

          <div>
            <h3 className="text-text text-base font-semibold md:text-lg">
              Previous Campaigns
            </h3>

            <p className="text-text-secondary mt-0.5 text-xs md:text-sm">
              Select a campaign to view team-wise Zerodose records.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          FILTER CARD
      ====================================================== */}

      <div className="border-border relative mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* Top accent */}
        <div className="from-primary via-primary-dark to-primary h-1 w-full bg-gradient-to-r" />

        <div className="p-4 md:p-5">
          {/* Filter heading */}
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Filter size={18} />
            </div>

            <div>
              <h4 className="text-text text-sm font-semibold md:text-base">
                Campaign Filter
              </h4>

              <p className="text-text-secondary mt-0.5 text-xs">
                Choose year, month and campaign
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* ==================================================
                YEAR
            ================================================== */}

            <div>
              <label className="text-text mb-2 block text-xs font-semibold">
                Year
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />

                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4"
                >
                  <option value="">Select Year</option>

                  {years.map((year) => (
                    <option key={`year-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
            </div>

            {/* ==================================================
                MONTH
            ================================================== */}

            <div>
              <label className="text-text mb-2 block text-xs font-semibold">
                Month
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />

                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  disabled={!selectedYear}
                  className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Month</option>

                  {months.map((month) => (
                    <option
                      key={`month-${selectedYear}-${month}`}
                      value={month}
                    >
                      {month}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
            </div>

            {/* ==================================================
                CAMPAIGN
            ================================================== */}

            <div>
              <label className="text-text mb-2 block text-xs font-semibold">
                Campaign
              </label>

              <div className="relative">
                <Layers3
                  size={17}
                  className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />

                <select
                  value={selectedCampaignId}
                  onChange={(e) => handleCampaignChange(e.target.value)}
                  disabled={!selectedMonth}
                  className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Campaign</option>

                  {campaignOptions.map((campaign) => {
                    const campaignId = getId(campaign);

                    if (!campaignId) {
                      return null;
                    }

                    return (
                      <option key={`campaign-${campaignId}`} value={campaignId}>
                        {campaign.name}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown
                  size={17}
                  className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SELECTED CAMPAIGN
      ====================================================== */}

      {selectedCampaign && (
        <>
          <CampaignHeader
            campaign={selectedCampaign}
            label="PREVIOUS CAMPAIGN"
            teams={teamData.length}
            recorded={totalRecorded}
            covered={totalCovered}
          />

          {/* Team heading */}

          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-text text-base font-semibold md:text-lg">
                Previous Campaign Zerodose
              </h3>

              <p className="text-text-secondary mt-1 text-xs">
                Team-wise Zerodose record for selected campaign
              </p>
            </div>

            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
              {teamData.length} Teams
            </span>
          </div>

          <ZerodoseTable data={teamData} />
        </>
      )}

      {/* ======================================================
          NO DATA
      ====================================================== */}

      {selectedCampaign && selectedRawData.length === 0 && (
        <div className="border-border bg-surface rounded-xl border p-6 text-center">
          <p className="text-text font-medium">No Zerodose records found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No records are available for this campaign.
          </p>
        </div>
      )}
    </section>
  );
}

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { ChevronDown } from "lucide-react";

// import CampaignHeader from "./CampaignHeader";
// import ZerodoseTable from "./ZerodoseTable";
// import SupervisorZerodoseTableSkeleton from "./SupervisorZerodoseTableSkeleton";

// export default function PreviousCampaigns({ campaigns = [], loading = false }) {
//   const [selectedYear, setSelectedYear] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedCampaignId, setSelectedCampaignId] = useState("");

//   // ============================================================
//   // SAFE ID
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
//   // UNIQUE CAMPAIGNS
//   // ============================================================

//   const uniqueCampaigns = useMemo(() => {
//     const map = new Map();

//     campaigns.forEach((item) => {
//       const campaign = item?.campaign;

//       if (!campaign) {
//         return;
//       }

//       const campaignId = getId(campaign);

//       if (!campaignId) {
//         return;
//       }

//       if (!map.has(campaignId)) {
//         map.set(campaignId, campaign);
//       }
//     });

//     return Array.from(map.values());
//   }, [campaigns]);

//   // ============================================================
//   // SORTED PREVIOUS CAMPAIGNS
//   //
//   // Latest campaign first
//   // ============================================================

//   const sortedCampaigns = useMemo(() => {
//     return [...uniqueCampaigns].sort((a, b) => {
//       const dateA = new Date(a?.startDate || 0).getTime();
//       const dateB = new Date(b?.startDate || 0).getTime();

//       return dateB - dateA;
//     });
//   }, [uniqueCampaigns]);

//   // ============================================================
//   // YEARS
//   // ============================================================

//   const years = useMemo(() => {
//     return [
//       ...new Set(
//         uniqueCampaigns
//           .map((campaign) => campaign?.year)
//           .filter((year) => year !== null && year !== undefined && year !== ""),
//       ),
//     ].sort((a, b) => Number(b) - Number(a));
//   }, [uniqueCampaigns]);

//   // ============================================================
//   // MONTHS
//   // ============================================================

//   const months = useMemo(() => {
//     if (!selectedYear) {
//       return [];
//     }

//     return [
//       ...new Set(
//         uniqueCampaigns
//           .filter((campaign) => String(campaign?.year) === String(selectedYear))
//           .map((campaign) => campaign?.month)
//           .filter(
//             (month) => month !== null && month !== undefined && month !== "",
//           ),
//       ),
//     ].sort((a, b) => Number(b) - Number(a));
//   }, [uniqueCampaigns, selectedYear]);

//   // ============================================================
//   // CAMPAIGN OPTIONS
//   // ============================================================

//   const campaignOptions = useMemo(() => {
//     if (!selectedYear || !selectedMonth) {
//       return [];
//     }

//     return uniqueCampaigns
//       .filter(
//         (campaign) =>
//           String(campaign?.year) === String(selectedYear) &&
//           String(campaign?.month) === String(selectedMonth),
//       )
//       .sort((a, b) => {
//         const dateA = new Date(a?.startDate || 0).getTime();

//         const dateB = new Date(b?.startDate || 0).getTime();

//         return dateB - dateA;
//       });
//   }, [uniqueCampaigns, selectedYear, selectedMonth]);

//   // ============================================================
//   // DEFAULT LATEST PREVIOUS CAMPAIGN
//   //
//   // Page open hote hi latest campaign select hogi.
//   //
//   // ============================================================

//   useEffect(() => {
//     if (!sortedCampaigns.length) {
//       setSelectedYear("");
//       setSelectedMonth("");
//       setSelectedCampaignId("");
//       return;
//     }

//     const latestCampaign = sortedCampaigns[0];

//     const latestCampaignId = getId(latestCampaign);

//     const latestYear = latestCampaign?.year;
//     const latestMonth = latestCampaign?.month;

//     if (!latestCampaignId) {
//       return;
//     }

//     setSelectedYear(
//       latestYear !== null && latestYear !== undefined ? String(latestYear) : "",
//     );

//     setSelectedMonth(
//       latestMonth !== null && latestMonth !== undefined
//         ? String(latestMonth)
//         : "",
//     );

//     setSelectedCampaignId(latestCampaignId);
//   }, [sortedCampaigns]);

//   // ============================================================
//   // SELECTED CAMPAIGN
//   // ============================================================

//   const selectedCampaign = useMemo(() => {
//     if (!selectedCampaignId) {
//       return null;
//     }

//     return (
//       uniqueCampaigns.find(
//         (campaign) => String(getId(campaign)) === String(selectedCampaignId),
//       ) || null
//     );
//   }, [uniqueCampaigns, selectedCampaignId]);

//   // ============================================================
//   // SELECTED CAMPAIGN RAW DATA
//   // ============================================================

//   const selectedRawData = useMemo(() => {
//     if (!selectedCampaignId) {
//       return [];
//     }

//     return campaigns.filter((item) => {
//       const campaignId = getId(item?.campaign);

//       return campaignId && String(campaignId) === String(selectedCampaignId);
//     });
//   }, [campaigns, selectedCampaignId]);

//   // ============================================================
//   // TEAM-WISE DATA
//   // ============================================================

//   const teamData = useMemo(() => {
//     const teamsMap = new Map();

//     selectedRawData.forEach((item) => {
//       const rawTeamNumber = item?.teamNumber;

//       if (
//         rawTeamNumber === null ||
//         rawTeamNumber === undefined ||
//         rawTeamNumber === ""
//       ) {
//         return;
//       }

//       const teamNumber = Number(rawTeamNumber);

//       if (!Number.isInteger(teamNumber)) {
//         return;
//       }

//       // --------------------------------------------------------
//       // CREATE TEAM
//       // --------------------------------------------------------

//       if (!teamsMap.has(teamNumber)) {
//         teamsMap.set(teamNumber, {
//           teamNumber,
//           teamLeader: null,
//           teamMember: null,
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });
//       }

//       const team = teamsMap.get(teamNumber);

//       // --------------------------------------------------------
//       // RECORDED
//       // --------------------------------------------------------

//       team.recorded += 1;

//       // --------------------------------------------------------
//       // VISITED
//       // --------------------------------------------------------

//       if (item?.visitDate || item?.vaccinationStatus === "visited") {
//         team.visited += 1;
//       }

//       // --------------------------------------------------------
//       // COVERED
//       // --------------------------------------------------------

//       if (item?.coveredDate || item?.vaccinationStatus === "covered") {
//         team.covered += 1;
//       }

//       // --------------------------------------------------------
//       // WORKER
//       // --------------------------------------------------------

//       const worker = item?.user;

//       if (worker?.workerRole === "teamLeader") {
//         team.teamLeader = worker;
//       }

//       if (worker?.workerRole === "teamMember") {
//         team.teamMember = worker;
//       }

//       // --------------------------------------------------------
//       // DIRECT WORKER
//       // --------------------------------------------------------

//       if (!team.teamLeader && item?.worker?.workerRole === "teamLeader") {
//         team.teamLeader = item.worker;
//       }

//       if (!team.teamMember && item?.worker?.workerRole === "teamMember") {
//         team.teamMember = item.worker;
//       }
//     });

//     return Array.from(teamsMap.values()).sort(
//       (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
//     );
//   }, [selectedRawData]);

//   // ============================================================
//   // TOTAL RECORDED
//   // ============================================================

//   const totalRecorded = useMemo(() => {
//     return teamData.reduce(
//       (total, team) => total + Number(team.recorded || 0),
//       0,
//     );
//   }, [teamData]);

//   // ============================================================
//   // TOTAL COVERED
//   // ============================================================

//   const totalCovered = useMemo(() => {
//     return teamData.reduce(
//       (total, team) => total + Number(team.covered || 0),
//       0,
//     );
//   }, [teamData]);

//   // ============================================================
//   // YEAR CHANGE
//   // ============================================================

//   const handleYearChange = (value) => {
//     setSelectedYear(value);

//     if (!value) {
//       setSelectedMonth("");
//       setSelectedCampaignId("");
//       return;
//     }

//     const campaignsOfYear = uniqueCampaigns
//       .filter((campaign) => String(campaign?.year) === String(value))
//       .sort((a, b) => {
//         const dateA = new Date(a?.startDate || 0).getTime();

//         const dateB = new Date(b?.startDate || 0).getTime();

//         return dateB - dateA;
//       });

//     const firstCampaign = campaignsOfYear[0];

//     if (!firstCampaign) {
//       setSelectedMonth("");
//       setSelectedCampaignId("");
//       return;
//     }

//     const month = firstCampaign?.month;
//     const campaignId = getId(firstCampaign);

//     setSelectedMonth(
//       month !== null && month !== undefined ? String(month) : "",
//     );

//     setSelectedCampaignId(campaignId || "");
//   };

//   // ============================================================
//   // MONTH CHANGE
//   // ============================================================

//   const handleMonthChange = (value) => {
//     setSelectedMonth(value);

//     if (!value) {
//       setSelectedCampaignId("");
//       return;
//     }

//     const campaignsOfMonth = uniqueCampaigns
//       .filter(
//         (campaign) =>
//           String(campaign?.year) === String(selectedYear) &&
//           String(campaign?.month) === String(value),
//       )
//       .sort((a, b) => {
//         const dateA = new Date(a?.startDate || 0).getTime();

//         const dateB = new Date(b?.startDate || 0).getTime();

//         return dateB - dateA;
//       });

//     const firstCampaign = campaignsOfMonth[0];

//     setSelectedCampaignId(getId(firstCampaign) || "");
//   };

//   // ============================================================
//   // CAMPAIGN CHANGE
//   // ============================================================

//   const handleCampaignChange = (value) => {
//     setSelectedCampaignId(value);
//   };

//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (loading) {
//     return <SupervisorZerodoseTableSkeleton />;
//   }

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <section>
//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="mb-5">
//         <h3 className="text-text text-base font-semibold md:text-lg">
//           Previous Campaigns
//         </h3>

//         <p className="text-text-secondary mt-1 text-xs md:text-sm">
//           Select year, month and campaign to view previous Zerodose records.
//         </p>
//       </div>

//       {/* ======================================================
//           FILTERS
//       ====================================================== */}

//       <div className="bg-surface border-border mb-5 rounded-xl border p-4 md:rounded-2xl md:p-5">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           {/* YEAR */}

//           <div>
//             <label className="text-text mb-1.5 block text-xs font-medium">
//               Year
//             </label>

//             <div className="relative">
//               <select
//                 value={selectedYear}
//                 onChange={(e) => handleYearChange(e.target.value)}
//                 className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
//               >
//                 <option value="">Select Year</option>

//                 {years.map((year) => (
//                   <option key={`year-${year}`} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>

//               <ChevronDown
//                 size={16}
//                 className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
//               />
//             </div>
//           </div>

//           {/* MONTH */}

//           <div>
//             <label className="text-text mb-1.5 block text-xs font-medium">
//               Month
//             </label>

//             <div className="relative">
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => handleMonthChange(e.target.value)}
//                 disabled={!selectedYear}
//                 className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none disabled:opacity-50"
//               >
//                 <option value="">Select Month</option>

//                 {months.map((month) => (
//                   <option key={`month-${selectedYear}-${month}`} value={month}>
//                     {month}
//                   </option>
//                 ))}
//               </select>

//               <ChevronDown
//                 size={16}
//                 className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
//               />
//             </div>
//           </div>

//           {/* CAMPAIGN */}

//           <div>
//             <label className="text-text mb-1.5 block text-xs font-medium">
//               Campaign
//             </label>

//             <div className="relative">
//               <select
//                 value={selectedCampaignId}
//                 onChange={(e) => handleCampaignChange(e.target.value)}
//                 disabled={!selectedMonth}
//                 className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none disabled:opacity-50"
//               >
//                 <option value="">Select Campaign</option>

//                 {campaignOptions.map((campaign) => {
//                   const campaignId = getId(campaign);

//                   if (!campaignId) {
//                     return null;
//                   }

//                   return (
//                     <option key={`campaign-${campaignId}`} value={campaignId}>
//                       {campaign.name}
//                     </option>
//                   );
//                 })}
//               </select>

//               <ChevronDown
//                 size={16}
//                 className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ======================================================
//           SELECTED CAMPAIGN
//       ====================================================== */}

//       {selectedCampaign && (
//         <>
//           <CampaignHeader
//             campaign={selectedCampaign}
//             label="PREVIOUS CAMPAIGN"
//             teams={teamData.length}
//             recorded={totalRecorded}
//             covered={totalCovered}
//           />

//           {/* TEAM HEADING */}

//           <div className="mb-3 flex items-center justify-between">
//             <div>
//               <h3 className="text-text text-base font-semibold md:text-lg">
//                 Previous Campaign Zerodose
//               </h3>

//               <p className="text-text-secondary mt-1 text-xs">
//                 Team-wise Zerodose record for selected campaign
//               </p>
//             </div>

//             <span className="text-text-secondary text-xs">
//               {teamData.length} Teams
//             </span>
//           </div>

//           {/* TEAM TABLE */}

//           <ZerodoseTable data={teamData} />
//         </>
//       )}

//       {/* ======================================================
//           NO DATA
//       ====================================================== */}

//       {selectedCampaign && selectedRawData.length === 0 && (
//         <div className="bg-surface border-border rounded-xl border p-6 text-center">
//           <p className="text-text font-medium">No Zerodose records found.</p>

//           <p className="text-text-secondary mt-1 text-sm">
//             No records are available for this campaign.
//           </p>
//         </div>
//       )}
//     </section>
//   );
// }
