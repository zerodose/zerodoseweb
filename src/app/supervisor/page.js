"use client";

import { useState } from "react";
import {
  Users,
  UsersRound,
  Package,
  CheckCircle2,
  CalendarDays,
  UserPlus,
  History,
  ChevronDown,
} from "lucide-react";
import {
  currentCampaign,
  currentData,
  previousCampaigns,
} from "@/content/data";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("current");

  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [selectedCampaign, setSelectedCampaign] = useState("1");

  const recordedZerodose = currentData.reduce(
    (total, team) => total + team.recordedZerodose,
    0,
  );

  const coveredZerodose = currentData.reduce(
    (total, team) => total + team.coveredZerodose,
    0,
  );

  const visitZerodose = currentData.reduce(
    (total, team) => total + team.visitZerodose,
    0,
  );

  const selectedPreviousCampaign = previousCampaigns.find(
    (campaign) =>
      campaign.id.toString() === selectedCampaign &&
      campaign.year === selectedYear &&
      campaign.month === selectedMonth,
  );

  const previousData = selectedPreviousCampaign?.data || [];

  const previousRecorded = previousData.reduce(
    (total, team) => total + team.recordedZerodose,
    0,
  );

  const previousCovered = previousData.reduce(
    (total, team) => total + team.coveredZerodose,
    0,
  );

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 md:mb-7">
        <h1 className="text-text text-2xl font-bold md:text-3xl">Supervisor</h1>

        <p className="text-text-secondary mt-1 text-sm">
          Manage teams and campaign-wise Zerodose records
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {/* Current UC */}
        <div className="bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5">
          <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <Users size={20} />
          </div>

          <p className="text-text-secondary text-xs">Current UC</p>

          <p className="text-text mt-1 text-xl font-bold md:text-2xl">12</p>
        </div>

        {/* Total Teams */}
        <div className="bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5">
          <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <UsersRound size={20} />
          </div>

          <p className="text-text-secondary text-xs">Total Teams</p>

          <p className="text-text mt-1 text-xl font-bold md:text-2xl">
            {currentData.length}
          </p>
        </div>

        {/* Recorded */}
        <div className="bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5">
          <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <Package size={20} />
          </div>

          <p className="text-text-secondary text-xs">Recorded Zerodose</p>

          <p className="text-text mt-1 text-xl font-bold md:text-2xl">
            {recordedZerodose}
          </p>
        </div>

        {/* Covered */}
        <div className="bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5">
          <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <CheckCircle2 size={20} />
          </div>

          <p className="text-text-secondary text-xs">Covered Zerodose</p>

          <p className="text-text mt-1 text-xl font-bold md:text-2xl">
            {coveredZerodose}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push("/supervisor/addworker")}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition"
        >
          <UserPlus size={17} />
          Add Workers
        </button>

        <button
          type="button"
          onClick={() => router.push("/supervisor/workers")}
          className="border-border bg-surface text-text hover:bg-background flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition"
        >
          <Users size={17} />
          Workers
        </button>
      </div>

      {/* Tabs */}
      <div className="border-border mb-5 flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab("current")}
          className={`relative px-4 py-3 text-sm font-medium transition md:px-5 ${
            activeTab === "current"
              ? "text-primary"
              : "text-text-secondary hover:text-text"
          }`}
        >
          Current Campaign
          {activeTab === "current" && (
            <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("previous")}
          className={`relative px-4 py-3 text-sm font-medium transition md:px-5 ${
            activeTab === "previous"
              ? "text-primary"
              : "text-text-secondary hover:text-text"
          }`}
        >
          Previous Campaigns
          {activeTab === "previous" && (
            <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
          )}
        </button>
      </div>

      {/* Current Campaign */}
      {activeTab === "current" && (
        <section>
          {/* Campaign Header */}
          <div className="bg-primary mb-5 overflow-hidden rounded-2xl p-5 md:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-white" />

                  <span className="text-xs font-medium text-white/80">
                    CURRENT CAMPAIGN
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white md:text-2xl">
                  {currentCampaign.name}
                </h2>

                <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                  <CalendarDays size={15} />

                  <span>
                    {currentCampaign.startDate} - {currentCampaign.endDate}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Teams</p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {currentData.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Visit Zerodose</p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {visitZerodose}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Zerodose */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-text text-base font-semibold md:text-lg">
                Current Zerodose
              </h3>

              <p className="text-text-secondary mt-1 text-xs">
                Team-wise Zerodose record for current campaign
              </p>
            </div>

            <span className="text-text-secondary text-xs">
              {currentData.length} Teams
            </span>
          </div>

          {/* Excel Style Table */}
          <div className="bg-surface border-border overflow-hidden rounded-xl border md:rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="bg-background border-border border-b">
                    <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                      Team No.
                    </th>

                    <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                      Team Leader
                    </th>

                    <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                      Team Member
                    </th>

                    <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                      Recorded Zerodose
                    </th>

                    <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                      Recorded Date
                    </th>

                    <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                      Covered Zerodose
                    </th>

                    <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                      Covered Date
                    </th>

                    <th className="text-text-secondary px-4 py-3 text-center text-xs font-semibold">
                      Visit Zerodose
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((team) => (
                    <tr
                      key={team.teamNo}
                      className="border-border hover:bg-background border-b last:border-b-0"
                    >
                      <td className="text-text border-border border-r px-4 py-3 text-sm font-semibold">
                        {team.teamNo}
                      </td>

                      <td className="text-text border-border border-r px-4 py-3 text-sm">
                        {team.teamLeader}
                      </td>

                      <td className="text-text border-border border-r px-4 py-3 text-sm">
                        {team.teamMember}
                      </td>

                      <td className="border-border border-r px-4 py-3 text-center">
                        <span className="text-primary bg-primary/10 inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold">
                          {team.recordedZerodose}
                        </span>
                      </td>

                      <td className="text-text-secondary border-border border-r px-4 py-3 text-xs">
                        {team.recordedDate}
                      </td>

                      <td className="border-border border-r px-4 py-3 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                          {team.coveredZerodose}
                        </span>
                      </td>

                      <td className="text-text-secondary border-border border-r px-4 py-3 text-xs">
                        {team.coveredDate}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                          {team.visitZerodose}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="bg-background">
                    <td
                      colSpan={3}
                      className="text-text px-4 py-3 text-right text-xs font-semibold"
                    >
                      Total
                    </td>

                    <td className="text-text border-border border-r px-4 py-3 text-center text-sm font-bold">
                      {recordedZerodose}
                    </td>

                    <td className="border-border border-r" />

                    <td className="text-text border-border border-r px-4 py-3 text-center text-sm font-bold">
                      {coveredZerodose}
                    </td>

                    <td className="border-border border-r" />

                    <td className="text-text px-4 py-3 text-center text-sm font-bold">
                      {visitZerodose}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Previous Campaigns */}
      {activeTab === "previous" && (
        <section>
          <div className="mb-5">
            <h3 className="text-text text-base font-semibold md:text-lg">
              Previous Campaigns
            </h3>

            <p className="text-text-secondary mt-1 text-xs md:text-sm">
              Select year, month and campaign to view previous Zerodose records.
            </p>
          </div>

          {/* Campaign Filters */}
          <div className="bg-surface border-border mb-5 rounded-xl border p-4 md:rounded-2xl md:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Year */}
              <div>
                <label className="text-text mb-1.5 block text-xs font-medium">
                  Year
                </label>

                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);

                      const firstCampaign = previousCampaigns.find(
                        (campaign) => campaign.year === e.target.value,
                      );

                      if (firstCampaign) {
                        setSelectedMonth(firstCampaign.month);
                        setSelectedCampaign(firstCampaign.id.toString());
                      }
                    }}
                    className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
                  >
                    {[...new Set(previousCampaigns.map((item) => item.year))]
                      .sort()
                      .reverse()
                      .map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Month */}
              <div>
                <label className="text-text mb-1.5 block text-xs font-medium">
                  Month
                </label>

                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      const month = e.target.value;

                      setSelectedMonth(month);

                      const campaign = previousCampaigns.find(
                        (item) =>
                          item.year === selectedYear && item.month === month,
                      );

                      if (campaign) {
                        setSelectedCampaign(campaign.id.toString());
                      }
                    }}
                    className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
                  >
                    {previousCampaigns
                      .filter((campaign) => campaign.year === selectedYear)
                      .map((campaign) => (
                        <option key={campaign.month} value={campaign.month}>
                          {campaign.month}
                        </option>
                      ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Campaign */}
              <div>
                <label className="text-text mb-1.5 block text-xs font-medium">
                  Campaign
                </label>

                <div className="relative">
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
                  >
                    {previousCampaigns
                      .filter(
                        (campaign) =>
                          campaign.year === selectedYear &&
                          campaign.month === selectedMonth,
                      )
                      .map((campaign) => (
                        <option
                          key={campaign.id}
                          value={campaign.id.toString()}
                        >
                          {campaign.name}
                        </option>
                      ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selected Campaign Header */}
          {selectedPreviousCampaign && (
            <>
              <div className="bg-primary mb-5 overflow-hidden rounded-2xl p-5 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-white" />

                      <span className="text-xs font-medium text-white/80">
                        PREVIOUS CAMPAIGN
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white md:text-2xl">
                      {selectedPreviousCampaign.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                      <CalendarDays size={15} />

                      <span>
                        {selectedPreviousCampaign.startDate} -{" "}
                        {selectedPreviousCampaign.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-xl bg-white/10 px-4 py-3">
                      <p className="text-xs text-white/70">Recorded</p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {previousRecorded}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/10 px-4 py-3">
                      <p className="text-xs text-white/70">Covered</p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {previousCovered}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Campaign Table */}
              <div className="bg-surface border-border overflow-hidden rounded-xl border md:rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                      <tr className="bg-background border-border border-b">
                        <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                          Team No.
                        </th>

                        <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                          Team Leader
                        </th>

                        <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                          Team Member
                        </th>

                        <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                          Recorded Zerodose
                        </th>

                        <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                          Recorded Date
                        </th>

                        <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                          Covered Zerodose
                        </th>

                        <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                          Covered Date
                        </th>

                        <th className="text-text-secondary px-4 py-3 text-center text-xs font-semibold">
                          Visit Zerodose
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {previousData.map((team) => (
                        <tr
                          key={team.teamNo}
                          className="border-border hover:bg-background border-b last:border-b-0"
                        >
                          <td className="text-text border-border border-r px-4 py-3 text-sm font-semibold">
                            {team.teamNo}
                          </td>

                          <td className="text-text border-border border-r px-4 py-3 text-sm">
                            {team.teamLeader}
                          </td>

                          <td className="text-text border-border border-r px-4 py-3 text-sm">
                            {team.teamMember}
                          </td>

                          <td className="border-border border-r px-4 py-3 text-center">
                            <span className="text-primary bg-primary/10 inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold">
                              {team.recordedZerodose}
                            </span>
                          </td>

                          <td className="text-text-secondary border-border border-r px-4 py-3 text-xs">
                            {team.recordedDate}
                          </td>

                          <td className="border-border border-r px-4 py-3 text-center">
                            <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                              {team.coveredZerodose}
                            </span>
                          </td>

                          <td className="text-text-secondary border-border border-r px-4 py-3 text-xs">
                            {team.coveredDate}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                              {team.visitZerodose}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="bg-background">
                        <td
                          colSpan={3}
                          className="text-text px-4 py-3 text-right text-xs font-semibold"
                        >
                          Total
                        </td>

                        <td className="text-text border-border border-r px-4 py-3 text-center text-sm font-bold">
                          {previousRecorded}
                        </td>

                        <td className="border-border border-r" />

                        <td className="text-text border-border border-r px-4 py-3 text-center text-sm font-bold">
                          {previousCovered}
                        </td>

                        <td className="border-border border-r" />

                        <td className="text-text px-4 py-3 text-center text-sm font-bold">
                          {previousData.reduce(
                            (total, team) => total + team.visitZerodose,
                            0,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
