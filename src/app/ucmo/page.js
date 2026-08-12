"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock3,
  Users,
  Package,
  CalendarDays,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";

const currentCampaign = {
  name: "Campaign 2026 - August",
  startDate: "01 Aug 2026",
  endDate: "31 Aug 2026",
};

const currentSupervisors = [
  {
    id: 1,
    name: "Ahmed Khan",
    status: "active",
    zerodose: [
      { id: "ZD-1001", name: "Zerodose 001", status: "Assigned" },
      { id: "ZD-1002", name: "Zerodose 002", status: "Assigned" },
      { id: "ZD-1003", name: "Zerodose 003", status: "Assigned" },
    ],
  },
  {
    id: 2,
    name: "Muhammad Ali",
    status: "active",
    zerodose: [
      { id: "ZD-1004", name: "Zerodose 004", status: "Assigned" },
      { id: "ZD-1005", name: "Zerodose 005", status: "Assigned" },
    ],
  },
  {
    id: 3,
    name: "Usman Raza",
    status: "active",
    zerodose: [{ id: "ZD-1006", name: "Zerodose 006", status: "Assigned" }],
  },
];

const previousCampaigns = [
  {
    id: 1,
    name: "Campaign 2026 - July",
    startDate: "01 Jul 2026",
    endDate: "31 Jul 2026",
    supervisors: [
      {
        id: 11,
        name: "Ahmed Khan",
        status: "active",
        zerodose: ["ZD-0901", "ZD-0902", "ZD-0903"],
      },
      {
        id: 12,
        name: "Muhammad Ali",
        status: "inactive",
        zerodose: ["ZD-0904", "ZD-0905"],
      },
      {
        id: 13,
        name: "Bilal Ahmed",
        status: "inactive",
        zerodose: ["ZD-0906", "ZD-0907", "ZD-0908"],
      },
    ],
  },
  {
    id: 2,
    name: "Campaign 2026 - June",
    startDate: "01 Jun 2026",
    endDate: "30 Jun 2026",
    supervisors: [
      {
        id: 21,
        name: "Ahmed Khan",
        status: "active",
        zerodose: ["ZD-0801", "ZD-0802"],
      },
      {
        id: 22,
        name: "Bilal Ahmed",
        status: "inactive",
        zerodose: ["ZD-0803", "ZD-0804", "ZD-0805"],
      },
    ],
  },
];

export default function Page() {
  const [expandedSupervisors, setExpandedSupervisors] = useState({});
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [activeTab, setActiveTab] = useState("current");

  const toggleSupervisor = (id) => {
    setExpandedSupervisors((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleCampaign = (id) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentZerodoseCount = currentSupervisors.reduce(
    (total, supervisor) => total + supervisor.zerodose.length,
    0,
  );

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 md:mb-7">
        <h1 className="text-text text-2xl font-bold md:text-3xl">UCMO</h1>

        <p className="text-text-secondary mt-1 text-sm">
          Manage campaign-wise Zerodose assigned through supervisors
        </p>
      </div>

      {/* UCMO Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        <div className="bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5">
          <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <Users size={20} />
          </div>

          <p className="text-text-secondary text-xs">Active Supervisors</p>

          <p className="text-text mt-1 text-xl font-bold md:text-2xl">
            {currentSupervisors.length}
          </p>
        </div>

        <div className="bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5">
          <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <Package size={20} />
          </div>

          <p className="text-text-secondary text-xs">Current Zerodose</p>

          <p className="text-text mt-1 text-xl font-bold md:text-2xl">
            {currentZerodoseCount}
          </p>
        </div>

        <div className="bg-surface border-border col-span-2 rounded-xl border p-4 md:col-span-1 md:rounded-2xl md:p-5">
          <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <History size={20} />
          </div>

          <p className="text-text-secondary text-xs">Previous Campaigns</p>

          <p className="text-text mt-1 text-xl font-bold md:text-2xl">
            {previousCampaigns.length}
          </p>
        </div>
      </div>

      {/* Campaign Tabs */}
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
                  <p className="text-xs text-white/70">Supervisors</p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {currentSupervisors.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Zerodose</p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {currentZerodoseCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Supervisors */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-text text-base font-semibold md:text-lg">
                Active Supervisors
              </h3>

              <span className="text-text-secondary text-xs">
                {currentSupervisors.length} Supervisors
              </span>
            </div>

            <div className="space-y-3">
              {currentSupervisors.map((supervisor) => {
                const expanded =
                  expandedSupervisors[`current-${supervisor.id}`];

                return (
                  <div
                    key={supervisor.id}
                    className="bg-surface border-border overflow-hidden rounded-xl border"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleSupervisor(`current-${supervisor.id}`)
                      }
                      className="hover:bg-background flex w-full items-center justify-between gap-3 p-4 text-left transition"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Users size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text truncate text-sm font-semibold">
                            {supervisor.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 size={12} />
                              Active
                            </span>

                            <span className="text-text-secondary text-xs">
                              •
                            </span>

                            <span className="text-text-secondary text-xs">
                              {supervisor.zerodose.length} Zerodose
                            </span>
                          </div>
                        </div>
                      </div>

                      {expanded ? (
                        <ChevronDown
                          size={19}
                          className="text-text-secondary shrink-0"
                        />
                      ) : (
                        <ChevronRight
                          size={19}
                          className="text-text-secondary shrink-0"
                        />
                      )}
                    </button>

                    {expanded && (
                      <div className="border-border border-t p-3">
                        <div className="space-y-2">
                          {supervisor.zerodose.map((item) => (
                            <div
                              key={item.id}
                              className="bg-background border-border flex items-center justify-between rounded-lg border px-3 py-2.5"
                            >
                              <div className="flex items-center gap-3">
                                <Package size={16} className="text-primary" />

                                <div>
                                  <p className="text-text text-sm font-medium">
                                    {item.name}
                                  </p>

                                  <p className="text-text-secondary text-[11px]">
                                    {item.id}
                                  </p>
                                </div>
                              </div>

                              <span className="text-primary bg-primary/10 rounded-full px-2.5 py-1 text-[11px] font-medium">
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Previous Campaigns */}
      {activeTab === "previous" && (
        <section>
          <div className="mb-4">
            <h3 className="text-text text-base font-semibold md:text-lg">
              Campaign History
            </h3>

            <p className="text-text-secondary mt-1 text-xs md:text-sm">
              Previous campaigns include both active and inactive supervisors.
            </p>
          </div>

          <div className="space-y-4">
            {previousCampaigns.map((campaign) => {
              const expanded = expandedCampaigns[campaign.id];

              const totalZerodose = campaign.supervisors.reduce(
                (total, supervisor) => total + supervisor.zerodose.length,
                0,
              );

              return (
                <div
                  key={campaign.id}
                  className="bg-surface border-border overflow-hidden rounded-2xl border"
                >
                  {/* Campaign Header */}
                  <button
                    type="button"
                    onClick={() => toggleCampaign(campaign.id)}
                    className="hover:bg-background flex w-full items-center justify-between gap-4 p-4 text-left transition md:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                        <History size={20} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-text truncate text-sm font-semibold md:text-base">
                          {campaign.name}
                        </h4>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-text-secondary flex items-center gap-1 text-xs">
                            <CalendarDays size={12} />
                            {campaign.startDate} - {campaign.endDate}
                          </span>

                          <span className="text-text-secondary hidden sm:inline">
                            •
                          </span>

                          <span className="text-text-secondary text-xs">
                            {campaign.supervisors.length} Supervisors
                          </span>

                          <span className="text-text-secondary hidden sm:inline">
                            •
                          </span>

                          <span className="text-text-secondary text-xs">
                            {totalZerodose} Zerodose
                          </span>
                        </div>
                      </div>
                    </div>

                    {expanded ? (
                      <ChevronDown
                        size={20}
                        className="text-text-secondary shrink-0"
                      />
                    ) : (
                      <ChevronRight
                        size={20}
                        className="text-text-secondary shrink-0"
                      />
                    )}
                  </button>

                  {/* Campaign Supervisors */}
                  {expanded && (
                    <div className="border-border border-t p-3 md:p-4">
                      <div className="space-y-2">
                        {campaign.supervisors.map((supervisor) => {
                          const supervisorKey = `previous-${campaign.id}-${supervisor.id}`;

                          const supervisorExpanded =
                            expandedSupervisors[supervisorKey];

                          return (
                            <div
                              key={supervisor.id}
                              className="border-border overflow-hidden rounded-xl border"
                            >
                              <button
                                type="button"
                                onClick={() => toggleSupervisor(supervisorKey)}
                                className="hover:bg-background flex w-full items-center justify-between gap-3 p-3 text-left transition"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                    <Users size={17} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-text truncate text-sm font-medium">
                                      {supervisor.name}
                                    </p>

                                    <div className="mt-1 flex items-center gap-2">
                                      {supervisor.status === "active" ? (
                                        <span className="flex items-center gap-1 text-[11px] text-green-600">
                                          <CheckCircle2 size={11} />
                                          Active
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-[11px] text-red-500">
                                          <XCircle size={11} />
                                          Inactive
                                        </span>
                                      )}

                                      <span className="text-text-secondary text-[11px]">
                                        •
                                      </span>

                                      <span className="text-text-secondary text-[11px]">
                                        {supervisor.zerodose.length} Zerodose
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {supervisorExpanded ? (
                                  <ChevronDown
                                    size={18}
                                    className="text-text-secondary shrink-0"
                                  />
                                ) : (
                                  <ChevronRight
                                    size={18}
                                    className="text-text-secondary shrink-0"
                                  />
                                )}
                              </button>

                              {supervisorExpanded && (
                                <div className="border-border border-t p-3">
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {supervisor.zerodose.map((zerodose) => (
                                      <div
                                        key={zerodose}
                                        className="bg-background border-border flex items-center gap-2 rounded-lg border px-3 py-2.5"
                                      >
                                        <Package
                                          size={15}
                                          className="text-primary shrink-0"
                                        />

                                        <span className="text-text truncate text-xs font-medium">
                                          {zerodose}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
