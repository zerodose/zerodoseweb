
// "use client";

// import { useEffect, useState } from "react";

// import ActivityChart from "@/components/admin/dashboard/charts/ActivityChart";
// import CampaignChart from "@/components/admin/dashboard/charts/CampaignChart";
// import CampaignComparisonChart from "@/components/admin/dashboard/charts/CampaignComparisonChart";
// import ChartAnimation from "@/components/admin/dashboard/charts/ChartAnimation";
// import DistrictChart from "@/components/admin/dashboard/charts/DistrictChart";
// import RecordedCoveredChart from "@/components/admin/dashboard/charts/RecordedCoveredChart";
// import StatusChart from "@/components/admin/dashboard/charts/StatusChart";
// import TeamChart from "@/components/admin/dashboard/charts/TeamChart";
// import ZerodoseTrendChart from "@/components/admin/dashboard/charts/ZerodoseTrendChart";
// import UserDesignationChart from "@/components/admin/dashboard/charts/UserDesignationChart";
// import CoverageChart from "@/components/admin/dashboard/charts/CoverageChart";

// import DashboardStats from "@/components/admin/dashboard/DashboardStats";

// import {
//   getCampaignTrend,
//   getDistrictCount,
//   getDistrictSummary,
// } from "@/api/dashboardApi";

// export default function DistrictFPDashboard() {
//   // ============================================================
//   // State
//   // ============================================================

//   const [districtId, setDistrictId] = useState(null);

//   const [counts, setCounts] = useState({
//     districts: 0,
//     towns: 0,
//     unionCouncils: 0,
//     campaigns: 0,

//     ucmos: 0,
//     supervisors: 0,
//     workers: 0,
//     vaccinators: 0,
//     otherstaff: 0,
//     townfp: 0,
//     districtfp: 0,

//     teams: 0,
//     zerodose: 0,

//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   const [campaignTrend, setCampaignTrend] = useState([]);

//   // ============================================================
//   // Get Logged-in District FP
//   // ============================================================

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem("authUser");

//       if (!storedUser) {
//         console.warn("authUser not found.");
//         return;
//       }

//       const authUser = JSON.parse(storedUser);

//       const id =
//         authUser?.district?._id ||
//         authUser?.district?.id ||
//         authUser?.districtId ||
//         (typeof authUser?.district === "string" ? authUser.district : null);

//       if (!id) {
//         console.warn("District ID not found for District FP.");
//         return;
//       }

//       setDistrictId(id);
//     } catch (error) {
//       console.error("Failed to get District FP user:", error);
//     }
//   }, []);

//   // ============================================================
//   // Fetch District Dashboard Data
//   // ============================================================

//   useEffect(() => {
//     if (!districtId) {
//       return;
//     }

//     let cancelled = false;

//     const loadDashboard = async () => {
//       // ========================================================
//       // Campaign Trend
//       // ========================================================

//       try {
//         const response = await getCampaignTrend({
//           district: districtId,
//         });

//         if (!cancelled) {
//           setCampaignTrend(response?.data?.data || []);
//         }
//       } catch (error) {
//         console.error("Failed to fetch District FP campaign trend:", error);

//         if (!cancelled) {
//           setCampaignTrend([]);
//         }
//       }

//       // ========================================================
//       // District Scoped Counts
//       // ========================================================

//       try {
//         const response = await getDistrictCount(
//           districtId,
//           [
//             "towns",
//             "unionCouncils",
//             "ucmos",
//             "supervisors",
//             "workers",
//             "vaccinators",
//             "otherstaff",
//             "townfp",
//             "districtfp",
//             "teams",
//             "zerodose",
//             "recorded",
//             "visited",
//             "covered",
//           ].join(","),
//         );

//         const data = response?.data || {};

//         if (!cancelled) {
//           setCounts({
//             districts: data.districts ?? 0,
//             towns: data.towns ?? 0,
//             unionCouncils: data.unionCouncils ?? 0,
//             campaigns: data.campaigns ?? 0,

//             ucmos: data.ucmos ?? 0,
//             supervisors: data.supervisors ?? 0,
//             workers: data.workers ?? 0,
//             vaccinators: data.vaccinators ?? 0,
//             otherstaff: data.otherstaff ?? 0,
//             townfp: data.townfp ?? 0,
//             districtfp: data.districtfp ?? 0,

//             teams: data.teams ?? 0,
//             zerodose: data.zerodose ?? 0,

//             recorded: data.recorded ?? 0,
//             visited: data.visited ?? 0,
//             covered: data.covered ?? 0,
//           });
//         }
//       } catch (error) {
//         console.error("Failed to fetch District FP dashboard counts:", error);
//       }
//     };

//     loadDashboard();

//     return () => {
//       cancelled = true;
//     };
//   }, [districtId]);

//   // ============================================================
//   // Dashboard
//   // ============================================================

//   return (
//     <div>
//       {/* ========================================================
//           Dashboard Stats
//       ======================================================== */}

//       <DashboardStats
//         items={[
//           // {
//           //   key: "campaigns",
//           //   title: "Total Campaigns",
//           //   value: counts.campaigns,
//           //   icon: "BriefcaseBusiness",
//           // },
//           {
//             key: "towns",
//             title: "Total Towns",
//             value: counts.towns,
//             icon: "Map",
//           },
//           {
//             key: "unionCouncils",
//             title: "Total Union Councils",
//             value: counts.unionCouncils,
//             icon: "Map",
//           },
//           {
//             key: "ucmos",
//             title: "Total UCMOs",
//             value: counts.ucmos,
//             icon: "UsersRound",
//           },
//           {
//             key: "supervisors",
//             title: "Total Supervisors",
//             value: counts.supervisors,
//             icon: "ShieldCheck",
//           },
//           {
//             key: "teams",
//             title: "Total Teams",
//             value: counts.teams,
//             icon: "Users",
//           },
//           {
//             key: "zerodose",
//             title: "Total Zerodose",
//             value: counts.zerodose,
//             icon: "ClipboardList",
//           },
//         ]}
//       />

//       {/* ========================================================
//           Charts
//       ======================================================== */}

//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//         {/* Campaign */}

//         <ChartAnimation delay={100}>
//           <CampaignChart counts={counts} trendData={campaignTrend} />
//         </ChartAnimation>

//         {/* Status */}

//         <ChartAnimation delay={400}>
//           <StatusChart counts={counts} trendData={campaignTrend} />
//         </ChartAnimation>

//         {/* Recorded vs Covered */}

//         <ChartAnimation delay={700}>
//           <RecordedCoveredChart counts={counts} trendData={campaignTrend} />
//         </ChartAnimation>

//         {/* District / Town */}

//         <ChartAnimation delay={250}>
//           <DistrictChart counts={counts} />
//         </ChartAnimation>

//         {/* User Designation */}

//         <ChartAnimation delay={1300}>
//           <UserDesignationChart counts={counts} />
//         </ChartAnimation>

//         {/* Team */}

//         <ChartAnimation delay={550}>
//           <TeamChart counts={counts} />
//         </ChartAnimation>

//         {/* Campaign Comparison */}

//         <ChartAnimation delay={850}>
//           <CampaignComparisonChart counts={counts} />
//         </ChartAnimation>

//         {/* Activity */}

//         <ChartAnimation delay={1000}>
//           <ActivityChart counts={counts} />
//         </ChartAnimation>

//         {/* Zerodose Trend */}

//         <ChartAnimation delay={1150}>
//           <ZerodoseTrendChart counts={counts} trendData={campaignTrend} />
//         </ChartAnimation>

//         {/* Coverage */}

//         <ChartAnimation delay={1450}>
//           <CoverageChart counts={counts} />
//         </ChartAnimation>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

import ActivityChart from "@/components/admin/dashboard/charts/ActivityChart";
import CampaignChart from "@/components/admin/dashboard/charts/CampaignChart";
import CampaignComparisonChart from "@/components/admin/dashboard/charts/CampaignComparisonChart";
import ChartAnimation from "@/components/admin/dashboard/charts/ChartAnimation";
import DistrictChart from "@/components/admin/dashboard/charts/DistrictChart";
import RecordedCoveredChart from "@/components/admin/dashboard/charts/RecordedCoveredChart";
import StatusChart from "@/components/admin/dashboard/charts/StatusChart";
import TeamChart from "@/components/admin/dashboard/charts/TeamChart";
import ZerodoseTrendChart from "@/components/admin/dashboard/charts/ZerodoseTrendChart";
import UserDesignationChart from "@/components/admin/dashboard/charts/UserDesignationChart";
import CoverageChart from "@/components/admin/dashboard/charts/CoverageChart";

import DashboardStats from "@/components/admin/dashboard/DashboardStats";

import {
  getCampaignTrend,
  getDistrictCount,
  getDistrictSummary,
} from "@/api/dashboardApi";

export default function DistrictFPDashboard() {
  // ============================================================
  // State
  // ============================================================

  const [districtId, setDistrictId] = useState(null);

  const [counts, setCounts] = useState({
    districts: 0,
    towns: 0,
    unionCouncils: 0,
    campaigns: 0,

    ucmos: 0,
    supervisors: 0,
    workers: 0,
    vaccinators: 0,
    otherstaff: 0,
    townfp: 0,
    districtfp: 0,

    teams: 0,
    zerodose: 0,

    recorded: 0,
    visited: 0,
    covered: 0,
  });

  const [campaignTrend, setCampaignTrend] = useState([]);

  // ============================================================
  // Get Logged-in District FP
  // ============================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");

      if (!storedUser) {
        console.warn("authUser not found.");
        return;
      }

      const authUser = JSON.parse(storedUser);

      const id =
        authUser?.district?._id ||
        authUser?.district?.id ||
        authUser?.districtId ||
        (typeof authUser?.district === "string"
          ? authUser.district
          : null);

      if (!id) {
        console.warn("District ID not found for District FP.");
        return;
      }

      setDistrictId(id);
    } catch (error) {
      console.error("Failed to get District FP user:", error);
    }
  }, []);

  // ============================================================
  // Fetch District Dashboard Data
  // ============================================================

  useEffect(() => {
    if (!districtId) {
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      // ========================================================
      // Campaign Trend
      // ========================================================

      try {
        const response = await getCampaignTrend({
          district: districtId,
        });

        if (!cancelled) {
          setCampaignTrend(response?.data?.data || []);
        }
      } catch (error) {
        console.error(
          "Failed to fetch District FP campaign trend:",
          error,
        );

        if (!cancelled) {
          setCampaignTrend([]);
        }
      }

      // ========================================================
      // District Scoped Counts
      //
      // General dashboard counts remain unchanged.
      // UCMO, Supervisor and Team counts are later replaced
      // with the dedicated District Summary values.
      // ========================================================

      try {
        const response = await getDistrictCount(
          districtId,
          [
            "towns",
            "unionCouncils",
            "ucmos",
            "supervisors",
            "workers",
            "vaccinators",
            "otherstaff",
            "townfp",
            "districtfp",
            "teams",
            "zerodose",
            "recorded",
            "visited",
            "covered",
          ].join(","),
        );

        const data = response?.data || {};

        if (!cancelled) {
          setCounts({
            districts: data.districts ?? 0,
            towns: data.towns ?? 0,
            unionCouncils: data.unionCouncils ?? 0,
            campaigns: data.campaigns ?? 0,

            ucmos: data.ucmos ?? 0,
            supervisors: data.supervisors ?? 0,
            workers: data.workers ?? 0,
            vaccinators: data.vaccinators ?? 0,
            otherstaff: data.otherstaff ?? 0,
            townfp: data.townfp ?? 0,
            districtfp: data.districtfp ?? 0,

            teams: data.teams ?? 0,
            zerodose: data.zerodose ?? 0,

            recorded: data.recorded ?? 0,
            visited: data.visited ?? 0,
            covered: data.covered ?? 0,
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch District FP dashboard counts:",
          error,
        );
      }

      // ========================================================
      // District Summary
      //
      // This specifically provides:
      // 1. Active + approved UCMOs
      // 2. Active + approved Supervisors
      // 3. Active Teams
      //
      // These values replace the corresponding generic counts.
      // ========================================================

      try {
        const response = await getDistrictSummary(districtId);

        const data = response?.data || {};

        if (!cancelled) {
          setCounts((previous) => ({
            ...previous,

            ucmos: data.totalUCMOs ?? 0,
            supervisors: data.totalSupervisors ?? 0,
            teams: data.activeTeams ?? 0,
          }));
        }
      } catch (error) {
        console.error(
          "Failed to fetch District FP summary:",
          error,
        );
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [districtId]);

  // ============================================================
  // Dashboard
  // ============================================================

  return (
    <div>
      {/* ========================================================
          Dashboard Stats
      ======================================================== */}

      <DashboardStats
        items={[
          // {
          //   key: "campaigns",
          //   title: "Total Campaigns",
          //   value: counts.campaigns,
          //   icon: "BriefcaseBusiness",
          // },
          {
            key: "towns",
            title: "Total Towns",
            value: counts.towns,
            icon: "Map",
          },
          {
            key: "unionCouncils",
            title: "Total Union Councils",
            value: counts.unionCouncils,
            icon: "Map",
          },
          {
            key: "ucmos",
            title: "Total UCMOs",
            value: counts.ucmos,
            icon: "UsersRound",
          },
          {
            key: "supervisors",
            title: "Total Supervisors",
            value: counts.supervisors,
            icon: "ShieldCheck",
          },
          {
            key: "teams",
            title: "Total Teams",
            value: counts.teams,
            icon: "Users",
          },
          {
            key: "zerodose",
            title: "Total Zerodose",
            value: counts.zerodose,
            icon: "ClipboardList",
          },
        ]}
      />

      {/* ========================================================
          Charts
      ======================================================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Campaign */}

        <ChartAnimation delay={100}>
          <CampaignChart
            counts={counts}
            trendData={campaignTrend}
          />
        </ChartAnimation>

        {/* Status */}

        <ChartAnimation delay={400}>
          <StatusChart
            counts={counts}
            trendData={campaignTrend}
          />
        </ChartAnimation>

        {/* Recorded vs Covered */}

        <ChartAnimation delay={700}>
          <RecordedCoveredChart
            counts={counts}
            trendData={campaignTrend}
          />
        </ChartAnimation>

        {/* District / Town */}

        <ChartAnimation delay={250}>
          <DistrictChart counts={counts} />
        </ChartAnimation>

        {/* User Designation */}

        <ChartAnimation delay={1300}>
          <UserDesignationChart counts={counts} />
        </ChartAnimation>

        {/* Team */}

        <ChartAnimation delay={550}>
          <TeamChart counts={counts} />
        </ChartAnimation>

        {/* Campaign Comparison */}

        <ChartAnimation delay={850}>
          <CampaignComparisonChart counts={counts} />
        </ChartAnimation>

        {/* Activity */}

        <ChartAnimation delay={1000}>
          <ActivityChart counts={counts} />
        </ChartAnimation>

        {/* Zerodose Trend */}

        <ChartAnimation delay={1150}>
          <ZerodoseTrendChart
            counts={counts}
            trendData={campaignTrend}
          />
        </ChartAnimation>

        {/* Coverage */}

        <ChartAnimation delay={1450}>
          <CoverageChart counts={counts} />
        </ChartAnimation>
      </div>
    </div>
  );
}
