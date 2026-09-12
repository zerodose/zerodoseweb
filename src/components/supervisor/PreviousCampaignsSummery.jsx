// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { CalendarDays, ChevronDown, Filter, Layers3 } from "lucide-react";

// import CampaignHeader from "./CampaignHeader";
// import ZerodoseTable from "./ZerodoseTable";

// export default function PreviousCampaignsSummery({
//   campaigns = [],
//   data = [],
// }) {
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

//   const uniqueCampaigns = useMemo(() => {
//     const map = new Map();

//     campaigns.forEach((campaign) => {
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
//   // SORTED CAMPAIGNS
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

//     if (!latestCampaignId) {
//       return;
//     }

//     setSelectedYear(
//       latestCampaign?.year !== null && latestCampaign?.year !== undefined
//         ? String(latestCampaign.year)
//         : "",
//     );

//     setSelectedMonth(
//       latestCampaign?.month !== null && latestCampaign?.month !== undefined
//         ? String(latestCampaign.month)
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

//     return data.filter((item) => {
//       const campaignId = getId(
//         item?.campaign || item?.campaignId || item?.campaign?._id,
//       );

//       return campaignId && String(campaignId) === String(selectedCampaignId);
//     });
//   }, [data, selectedCampaignId]);

//   // ============================================================
//   // TEAM-WISE DATA
//   // ============================================================

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

//       if (!teamsMap.has(teamNumber)) {
//         teamsMap.set(teamNumber, {
//           teamNumber,
//           teamLeader: item?.teamLeader || null,
//           teamMember: item?.teamMember || null,
//           recorded: 0,
//           visited: 0,
//           covered: 0,
//         });
//       }

//       const team = teamsMap.get(teamNumber);

//       team.recorded += 1;

//       if (item?.visitDate || item?.vaccinationStatus === "visited") {
//         team.visited += 1;
//       }

//       if (item?.coveredDate || item?.vaccinationStatus === "covered") {
//         team.covered += 1;
//       }

//       // Historical team assignment
//       if (item?.teamLeader) {
//         team.teamLeader = item.teamLeader;
//       }

//       if (item?.teamMember) {
//         team.teamMember = item.teamMember;
//       }
//     });

//     return Array.from(teamsMap.values()).sort(
//       (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
//     );
//   }, [selectedRawData]);

//   // ============================================================
//   // TOTALS
//   // ============================================================

//   const totalRecorded = useMemo(() => {
//     return teamData.reduce(
//       (total, team) => total + Number(team.recorded || 0),
//       0,
//     );
//   }, [teamData]);

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

//     setSelectedMonth(
//       firstCampaign?.month !== null && firstCampaign?.month !== undefined
//         ? String(firstCampaign.month)
//         : "",
//     );

//     setSelectedCampaignId(getId(firstCampaign) || "");
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

//     setSelectedCampaignId(getId(campaignsOfMonth[0]) || "");
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

//   // if (loading) {
//   //   return <SupervisorZerodoseTableSkeleton />;
//   // }

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <section>
//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="mb-5">
//         <div className="flex items-center gap-2">
//           <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
//             <Layers3 size={18} />
//           </div>

//           <div>
//             <h3 className="text-text text-base font-semibold md:text-lg">
//               Previous Campaigns
//             </h3>

//             <p className="text-text-secondary mt-0.5 text-xs md:text-sm">
//               Select a campaign to view team-wise Zerodose records.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ======================================================
//           FILTER CARD
//       ====================================================== */}

//       <div className=" relative mb-6 overflow-hidden rounded-2xl border-border border shadow-sm">
//         {/* Top accent */}
//         <div className="from-primary via-primary-dark to-primary h-1 w-full bg-gradient-to-r" />

//         <div className="p-4 md:p-5">
//           {/* Filter heading */}
//           <div className="mb-5 flex items-center gap-3">
//             <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
//               <Filter size={18} />
//             </div>

//             <div>
//               <h4 className="text-text text-sm font-semibold md:text-base">
//                 Campaign Filter
//               </h4>

//               <p className="text-text-secondary mt-0.5 text-xs">
//                 Choose year, month and campaign
//               </p>
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             {/* ==================================================
//                 YEAR
//             ================================================== */}

//             <div>
//               <label className="text-text mb-2 block text-xs font-semibold">
//                 Year
//               </label>

//               <div className="relative">
//                 <CalendarDays
//                   size={17}
//                   className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
//                 />

//                 <select
//                   value={selectedYear}
//                   onChange={(e) => handleYearChange(e.target.value)}
//                   className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4"
//                 >
//                   <option value="">Select Year</option>

//                   {years.map((year) => (
//                     <option key={`year-${year}`} value={year}>
//                       {year}
//                     </option>
//                   ))}
//                 </select>

//                 <ChevronDown
//                   size={17}
//                   className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
//                 />
//               </div>
//             </div>

//             {/* ==================================================
//                 MONTH
//             ================================================== */}

//             <div>
//               <label className="text-text mb-2 block text-xs font-semibold">
//                 Month
//               </label>

//               <div className="relative">
//                 <CalendarDays
//                   size={17}
//                   className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
//                 />

//                 <select
//                   value={selectedMonth}
//                   onChange={(e) => handleMonthChange(e.target.value)}
//                   disabled={!selectedYear}
//                   className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   <option value="">Select Month</option>

//                   {months.map((month) => (
//                     <option
//                       key={`month-${selectedYear}-${month}`}
//                       value={month}
//                     >
//                       {month}
//                     </option>
//                   ))}
//                 </select>

//                 <ChevronDown
//                   size={17}
//                   className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
//                 />
//               </div>
//             </div>

//             {/* ==================================================
//                 CAMPAIGN
//             ================================================== */}

//             <div>
//               <label className="text-text mb-2 block text-xs font-semibold">
//                 Campaign
//               </label>

//               <div className="relative">
//                 <Layers3
//                   size={17}
//                   className="text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
//                 />

//                 <select
//                   value={selectedCampaignId}
//                   onChange={(e) => handleCampaignChange(e.target.value)}
//                   disabled={!selectedMonth}
//                   className="border-border bg-surface text-text hover:border-primary/40 focus:border-primary focus:ring-primary/10 w-full appearance-none rounded-xl border py-3 pr-10 pl-10 text-sm font-medium transition-all outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   <option value="">Select Campaign</option>

//                   {campaignOptions.map((campaign) => {
//                     const campaignId = getId(campaign);

//                     if (!campaignId) {
//                       return null;
//                     }

//                     return (
//                       <option key={`campaign-${campaignId}`} value={campaignId}>
//                         {campaign.name}
//                       </option>
//                     );
//                   })}
//                 </select>

//                 <ChevronDown
//                   size={17}
//                   className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ======================================================
//           SELECTED CAMPAIGN
//       ====================================================== */}

//          {selectedCampaign && selectedRawData.length > 0 &&  (
//         <>
//           <CampaignHeader
//             campaign={selectedCampaign}
//             label="PREVIOUS CAMPAIGN"
//             teams={teamData.length}
//             recorded={totalRecorded}
//             covered={totalCovered}
//           />

//           {/* Team heading */}

//           <div className="mb-3 flex items-center justify-between">
//             <div>
//               <h3 className="text-text text-base font-semibold md:text-lg">
//                 Previous Campaign Zerodose
//               </h3>

//               <p className="text-text-secondary mt-1 text-xs">
//                 Team-wise Zerodose record for selected campaign
//               </p>
//             </div>

//             <span className="bg-primary/10  text-primary rounded-full px-3 py-1 text-xs font-semibold">
//               {teamData.length} Teams
//             </span>
//           </div>

//           <ZerodoseTable data={teamData} />
//         </>
//       )}

//       {/* ======================================================
//           NO DATA
//       ====================================================== */}

//       {selectedCampaign && selectedRawData.length === 0 && (
//         <div className="border-border bg-surface rounded-2xl border p-6 text-center">
//           <p className="text-text font-medium">No Zerodose records found.</p>

//           <p className="text-text-secondary mt-1 text-sm">
//             No records are available for this campaign.
//           </p>
//         </div>
//       )}
//     </section>
//   );
// }

"use client";

import { useMemo, useState } from "react";
import { Filter, Layers3 } from "lucide-react";

import CampaignHeader from "./CampaignHeader";
import ZerodoseTable from "./ZerodoseTable";
import Select from "../ui/Select";

export default function PreviousCampaignsSummery({
  campaigns = [],
  data = [],
}) {
  // ============================================================
  // SELECTION STATE
  // ============================================================
  // null means user has not manually changed any filter yet.
  // In that case latest previous campaign will be used automatically.
  // ============================================================

  const [selection, setSelection] = useState(null);

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
  // LATEST PREVIOUS CAMPAIGN
  // ============================================================

  const latestPreviousCampaign = useMemo(() => {
    if (!sortedCampaigns.length) {
      return {
        year: "",
        month: "",
        campaignId: "",
      };
    }

    const latestCampaign = sortedCampaigns[0];
    const latestCampaignId = getId(latestCampaign);

    if (!latestCampaignId) {
      return {
        year: "",
        month: "",
        campaignId: "",
      };
    }

    return {
      year:
        latestCampaign?.year !== null &&
        latestCampaign?.year !== undefined
          ? String(latestCampaign.year)
          : "",

      month:
        latestCampaign?.month !== null &&
        latestCampaign?.month !== undefined
          ? String(latestCampaign.month)
          : "",

      campaignId: latestCampaignId,
    };
  }, [sortedCampaigns]);

  // ============================================================
  // ACTIVE SELECTION
  // ============================================================
  // If user has not manually selected anything,
  // latest previous campaign is automatically active.
  //
  // Once user selects something, their selection is preserved.
  // ============================================================

  const activeSelection = selection || latestPreviousCampaign;

  const selectedYear = activeSelection.year || "";
  const selectedMonth = activeSelection.month || "";
  const selectedCampaignId = activeSelection.campaignId || "";

  // ============================================================
  // YEARS
  // ============================================================

  const years = useMemo(() => {
    return [
      ...new Set(
        uniqueCampaigns
          .map((campaign) => campaign?.year)
          .filter(
            (year) =>
              year !== null &&
              year !== undefined &&
              year !== "",
          ),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns]);

  // ============================================================
  // YEAR OPTIONS
  // ============================================================

  const yearOptions = useMemo(() => {
    return years.map((year) => ({
      value: String(year),
      label: String(year),
    }));
  }, [years]);

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
          .filter(
            (campaign) =>
              String(campaign?.year) === String(selectedYear),
          )
          .map((campaign) => campaign?.month)
          .filter(
            (month) =>
              month !== null &&
              month !== undefined &&
              month !== "",
          ),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns, selectedYear]);

  // ============================================================
  // MONTH NAME
  // ============================================================

  const getMonthLabel = (month) => {
    const monthNumber = Number(month);

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      return String(month);
    }

    return new Date(
      2000,
      monthNumber - 1,
      1,
    ).toLocaleString("en-US", {
      month: "long",
    });
  };

  // ============================================================
  // MONTH OPTIONS
  // ============================================================

  const monthOptions = useMemo(() => {
    return months.map((month) => ({
      value: String(month),
      label: getMonthLabel(month),
    }));
  }, [months]);

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
        const dateA = new Date(
          a?.startDate || 0,
        ).getTime();

        const dateB = new Date(
          b?.startDate || 0,
        ).getTime();

        return dateB - dateA;
      });
  }, [
    uniqueCampaigns,
    selectedYear,
    selectedMonth,
  ]);

  // ============================================================
  // CAMPAIGN SELECT OPTIONS
  // ============================================================

  const campaignSelectOptions = useMemo(() => {
    return campaignOptions
      .map((campaign) => {
        const campaignId = getId(campaign);

        if (!campaignId) {
          return null;
        }

        return {
          value: campaignId,
          label: campaign?.name || "Unnamed Campaign",
        };
      })
      .filter(Boolean);
  }, [campaignOptions]);

  // ============================================================
  // SELECTED CAMPAIGN
  // ============================================================

  const selectedCampaign = useMemo(() => {
    if (!selectedCampaignId) {
      return null;
    }

    return (
      uniqueCampaigns.find(
        (campaign) =>
          String(getId(campaign)) ===
          String(selectedCampaignId),
      ) || null
    );
  }, [
    uniqueCampaigns,
    selectedCampaignId,
  ]);

  // ============================================================
  // SELECTED CAMPAIGN RAW DATA
  // ============================================================

  const selectedRawData = useMemo(() => {
    if (!selectedCampaignId) {
      return [];
    }

    return data.filter((item) => {
      const campaignId = getId(
        item?.campaign ||
          item?.campaignId ||
          item?.campaign?._id,
      );

      return (
        campaignId &&
        String(campaignId) ===
          String(selectedCampaignId)
      );
    });
  }, [data, selectedCampaignId]);

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

      // --------------------------------------------------------
      // Recorded
      // --------------------------------------------------------

      team.recorded += 1;

      // --------------------------------------------------------
      // Visited
      // --------------------------------------------------------

      if (
        item?.visitDate ||
        item?.vaccinationStatus === "visited"
      ) {
        team.visited += 1;
      }

      // --------------------------------------------------------
      // Covered
      // --------------------------------------------------------

      if (
        item?.coveredDate ||
        item?.vaccinationStatus === "covered"
      ) {
        team.covered += 1;
      }

      // --------------------------------------------------------
      // Historical team assignment
      // --------------------------------------------------------

      if (item?.teamLeader) {
        team.teamLeader = item.teamLeader;
      }

      if (item?.teamMember) {
        team.teamMember = item.teamMember;
      }
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) =>
        Number(a.teamNumber) -
        Number(b.teamNumber),
    );
  }, [selectedRawData]);

  // ============================================================
  // TOTAL RECORDED
  // ============================================================

  const totalRecorded = useMemo(() => {
    return teamData.reduce(
      (total, team) =>
        total + Number(team.recorded || 0),
      0,
    );
  }, [teamData]);

  // ============================================================
  // TOTAL COVERED
  // ============================================================

  const totalCovered = useMemo(() => {
    return teamData.reduce(
      (total, team) =>
        total + Number(team.covered || 0),
      0,
    );
  }, [teamData]);

  // ============================================================
  // YEAR CHANGE
  // ============================================================

  const handleYearChange = (value) => {
    const normalizedYear = value
      ? String(value)
      : "";

    // ----------------------------------------------------------
    // Clear selection
    // ----------------------------------------------------------

    if (!normalizedYear) {
      setSelection({
        year: "",
        month: "",
        campaignId: "",
      });

      return;
    }

    // ----------------------------------------------------------
    // Find latest campaign of selected year
    // ----------------------------------------------------------

    const campaignsOfYear = uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) ===
          normalizedYear,
      )
      .sort((a, b) => {
        const dateA = new Date(
          a?.startDate || 0,
        ).getTime();

        const dateB = new Date(
          b?.startDate || 0,
        ).getTime();

        return dateB - dateA;
      });

    const firstCampaign = campaignsOfYear[0];

    // ----------------------------------------------------------
    // No campaign in selected year
    // ----------------------------------------------------------

    if (!firstCampaign) {
      setSelection({
        year: normalizedYear,
        month: "",
        campaignId: "",
      });

      return;
    }

    // ----------------------------------------------------------
    // Select latest campaign of selected year
    // ----------------------------------------------------------

    setSelection({
      year: normalizedYear,

      month:
        firstCampaign?.month !== null &&
        firstCampaign?.month !== undefined
          ? String(firstCampaign.month)
          : "",

      campaignId:
        getId(firstCampaign) || "",
    });
  };

  // ============================================================
  // MONTH CHANGE
  // ============================================================

  const handleMonthChange = (value) => {
    const normalizedMonth = value
      ? String(value)
      : "";

    // ----------------------------------------------------------
    // Clear month
    // ----------------------------------------------------------

    if (!normalizedMonth) {
      setSelection({
        year: selectedYear,
        month: "",
        campaignId: "",
      });

      return;
    }

    // ----------------------------------------------------------
    // Find latest campaign of selected year + month
    // ----------------------------------------------------------

    const campaignsOfMonth = uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) ===
            String(selectedYear) &&
          String(campaign?.month) ===
            normalizedMonth,
      )
      .sort((a, b) => {
        const dateA = new Date(
          a?.startDate || 0,
        ).getTime();

        const dateB = new Date(
          b?.startDate || 0,
        ).getTime();

        return dateB - dateA;
      });

    const latestCampaign =
      campaignsOfMonth[0];

    // ----------------------------------------------------------
    // Update selection
    // ----------------------------------------------------------

    setSelection({
      year: selectedYear,
      month: normalizedMonth,
      campaignId:
        getId(latestCampaign) || "",
    });
  };

  // ============================================================
  // CAMPAIGN CHANGE
  // ============================================================

  const handleCampaignChange = (value) => {
    const normalizedCampaignId = value
      ? String(value)
      : "";

    // ----------------------------------------------------------
    // Find selected campaign
    // ----------------------------------------------------------

    const campaign = uniqueCampaigns.find(
      (item) =>
        String(getId(item)) ===
        normalizedCampaignId,
    );

    // ----------------------------------------------------------
    // Update full selection
    // ----------------------------------------------------------

    setSelection({
      year:
        campaign?.year !== null &&
        campaign?.year !== undefined
          ? String(campaign.year)
          : selectedYear,

      month:
        campaign?.month !== null &&
        campaign?.month !== undefined
          ? String(campaign.month)
          : selectedMonth,

      campaignId: normalizedCampaignId,
    });
  };

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
              Select a campaign to view team-wise
              Zerodose records.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          FILTER CARD
      ====================================================== */}

      <div className="border-border relative mb-6 overflow-hidden rounded-2xl border shadow-sm">
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

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* ==================================================
                YEAR
            ================================================== */}

            <Select
              label="Year"
              name="year"
              value={selectedYear}
              onChange={(event) =>
                handleYearChange(
                  event.target.value,
                )
              }
              options={yearOptions}
              placeholder="Select Year"
            />

            {/* ==================================================
                MONTH
            ================================================== */}

            <Select
              label="Month"
              name="month"
              value={selectedMonth}
              onChange={(event) =>
                handleMonthChange(
                  event.target.value,
                )
              }
              options={monthOptions}
              placeholder="Select Month"
              disabled={!selectedYear}
            />

            {/* ==================================================
                CAMPAIGN
            ================================================== */}

            <Select
              label="Campaign"
              name="campaign"
              value={selectedCampaignId}
              onChange={(event) =>
                handleCampaignChange(
                  event.target.value,
                )
              }
              options={campaignSelectOptions}
              placeholder="Select Campaign"
              disabled={!selectedMonth}
              searchable
              searchPlaceholder="Search campaign..."
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          SELECTED CAMPAIGN
      ====================================================== */}

      {selectedCampaign &&
        selectedRawData.length > 0 && (
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
                  Team-wise Zerodose record for selected
                  campaign
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

      {selectedCampaign &&
        selectedRawData.length === 0 && (
          <div className="border-border bg-surface rounded-2xl border p-6 text-center">
            <p className="text-text font-medium">
              No Zerodose records found.
            </p>

            <p className="text-text-secondary mt-1 text-sm">
              No records are available for this
              campaign.
            </p>
          </div>
        )}
    </section>
  );
}