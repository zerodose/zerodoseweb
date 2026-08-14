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

import { getGlobalCount } from "@/api/dashboardApi";

export default async function DashboardPage() {
  let counts = {
    supervisors: 0,
    teams: 0,
    zerodose: 0,
  };

  try {
    const response = await getGlobalCount("supervisors,teams,zerodose");

    const data = response?.data || {};

    counts = {
      supervisors: data.supervisors ?? 0,
      teams: data.teams ?? 0,
      zerodose: data.zerodose ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard counts:", error);
  }

  return (
    <div>
      {/* =================================================
          Dashboard Stats
      ================================================= */}

      <DashboardStats
        stats={{
          campaigns: 0,
          districts: 0,
          supervisors: counts.supervisors,
          teams: counts.teams,
          zerodose: counts.zerodose,
          covered: 0,
        }}
      />

      {/* =================================================
          Charts
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Campaign */}
        <ChartAnimation delay={100}>
          <CampaignChart />
        </ChartAnimation>

        {/* District */}
        <ChartAnimation delay={250}>
          <DistrictChart />
        </ChartAnimation>

        {/* Status */}
        <ChartAnimation delay={400}>
          <StatusChart />
        </ChartAnimation>

        {/* Team */}
        <ChartAnimation delay={550}>
          <TeamChart />
        </ChartAnimation>

        {/* Recorded vs Covered */}
        <ChartAnimation delay={700}>
          <RecordedCoveredChart />
        </ChartAnimation>

        {/* Campaign Comparison */}
        <ChartAnimation delay={850}>
          <CampaignComparisonChart />
        </ChartAnimation>

        {/* Activity */}
        <ChartAnimation delay={1000}>
          <ActivityChart />
        </ChartAnimation>

        {/* Zerodose Trend */}
        <ChartAnimation delay={1150}>
          <ZerodoseTrendChart />
        </ChartAnimation>

        {/* User Designation */}
        <ChartAnimation delay={1300}>
          <UserDesignationChart />
        </ChartAnimation>

        {/* Coverage */}
        <ChartAnimation delay={1450}>
          <CoverageChart />
        </ChartAnimation>
      </div>
    </div>
  );
}
