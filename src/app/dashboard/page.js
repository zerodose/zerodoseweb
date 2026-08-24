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
import { getCampaignTrend, getGlobalCount } from "@/api/dashboardApi";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";

export default async function DashboardPage() {
  // ============================================================
  // Default Dashboard Counts
  // ============================================================

  let counts = {
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
  };
  // ============================================================
  // Get Complete Zerodose Trend Data
  // ============================================================

  let campaignTrend = [];

  try {
    const response = await getCampaignTrend();

    campaignTrend = response?.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch campaign trend:", error);
  }

  // ============================================================
  // Get All Global Dashboard Counts
  // ============================================================

  try {
    const response = await getGlobalCount(
      [
        "districts",
        "towns",
        "unionCouncils",
        "campaigns",

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

    counts = {
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
    };
  } catch (error) {
    console.error("Failed to fetch dashboard counts:", error);
  }

  // ============================================================
  // Dashboard
  // ============================================================

  return (
    <div>
      {/* =================================================
          Dashboard Stats
      ================================================= */}

      <DashboardStats
        stats={{
          campaigns: counts.campaigns,
          districts: counts.districts,
          supervisors: counts.supervisors,
          teams: counts.teams,
          zerodose: counts.zerodose,
          covered: counts.covered,
        }}
      />

      {/* =================================================
          Charts
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Campaign */}
        <ChartAnimation delay={100}>
          <CampaignChart counts={counts} trendData={campaignTrend} />
        </ChartAnimation>

        {/* Status */}
        <ChartAnimation delay={400}>
          <StatusChart counts={counts} trendData={campaignTrend} />
        </ChartAnimation>

        {/* Recorded vs Covered */}
        <ChartAnimation delay={700}>
          <RecordedCoveredChart counts={counts} trendData={campaignTrend} />
        </ChartAnimation>

        {/* District */}
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
          <ZerodoseTrendChart counts={counts} />
        </ChartAnimation>

        {/* Coverage */}
        <ChartAnimation delay={1450}>
          <CoverageChart counts={counts} />
        </ChartAnimation>
      </div>
    </div>
  );
}
