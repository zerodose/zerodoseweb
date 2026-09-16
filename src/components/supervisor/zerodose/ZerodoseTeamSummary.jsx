"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Syringe, Eye, CheckCircle2 } from "lucide-react";

import ZerodoseDetailsTable from "./ZerodoseDetailsTable";
import ZerodoseTeamSummarySkeleton from "./ZerodoseTeamSummarySkeleton";

export default function ZerodoseTeamSummary({
  data = [],
  title = "Zerodose",
  description = "Team-wise Zerodose records.",
  vaccinationStatus = {
    teams: [],
    total: {},
  },
  onFilterChange,
  loading,
}) {
  const [openTeams, setOpenTeams] = useState({});
  const [statusFilter, setStatusFilter] = useState("recorded");

  // ============================================================
  // TEAM DATA
  // ============================================================

  const teamData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    const teamsMap = new Map();

    data.forEach((item) => {
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
          supervisor: item?.supervisor || null,
          supervisorId:
            item?.supervisor?._id ||
            item?.supervisor?.id ||
            item?.supervisor ||
            null,
          records: [],
          recorded: 0,
          visited: 0,
          covered: 0,
        });
      }

      const team = teamsMap.get(teamNumber);

      if (item?.supervisor) {
        team.supervisor = item.supervisor;

        team.supervisorId =
          item?.supervisor?._id ||
          item?.supervisor?.id ||
          item?.supervisor ||
          null;
      }

      team.records.push(item);

      const status = String(item?.vaccinationStatus || "").toLowerCase();

      if (status === "recorded") {
        team.recorded += 1;
      }

      if (status === "visited") {
        team.visited += 1;
      }

      if (status === "covered") {
        team.covered += 1;
      }

      // --------------------------------------------------------
      // Team Leader
      // --------------------------------------------------------

      if (item?.teamLeader) {
        team.teamLeader = item.teamLeader;
      }

      // --------------------------------------------------------
      // Team Member
      // --------------------------------------------------------

      if (item?.teamMember) {
        team.teamMember = item.teamMember;
      }

      // --------------------------------------------------------
      // Fallback user
      // --------------------------------------------------------

      if (!team.teamLeader && item?.user?.workerRole === "teamLeader") {
        team.teamLeader = item.user;
      }

      if (!team.teamMember && item?.user?.workerRole === "teamMember") {
        team.teamMember = item.user;
      }

      // --------------------------------------------------------
      // Fallback worker
      // --------------------------------------------------------

      if (!team.teamLeader && item?.worker?.workerRole === "teamLeader") {
        team.teamLeader = item.worker;
      }

      if (!team.teamMember && item?.worker?.workerRole === "teamMember") {
        team.teamMember = item.worker;
      }
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
    );
  }, [data]);

  // ============================================================
  // FILTER CHANGE
  // ============================================================

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);

    if (typeof onFilterChange === "function") {
      onFilterChange(filter);
    }
  };

  // ============================================================
  // TOGGLE TEAM
  // ============================================================

  const toggleTeam = (teamNumber) => {
    setOpenTeams((prev) => ({
      ...prev,
      [teamNumber]: !prev[teamNumber],
    }));
  };

  // ============================================================
  // WORKER NAME
  // ============================================================

  const getWorkerName = (worker) => {
    if (!worker) {
      return "-";
    }

    if (typeof worker === "string") {
      return worker;
    }

    return worker?.name || "-";
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-text text-base font-semibold md:text-lg">
              {title}
            </h3>

            <p className="text-text-secondary mt-1 text-xs md:text-sm">
              {description}
            </p>
          </div>

          <p className="text-text-secondary text-xs text-nowrap">
            <span className="border-border bg-primary/5 mr-1 h-10 w-10 rounded-full border p-1 font-semibold">
              {teamData.length}
            </span>
            Teams
          </p>
        </div>

        {/* ======================================================
      STATUS FILTER BUTTONS
  ====================================================== */}

        {(data.length > 0 ||
          vaccinationStatus.recorded > 0 ||
          vaccinationStatus.visited > 0 ||
          vaccinationStatus.covered > 0) && (
          <div className="border-border bg-surface mb-4 rounded-xl border p-2">
            <div className="grid grid-cols-3 gap-2">
              {/* RECORDED */}

              <button
                type="button"
                onClick={() => handleStatusFilterChange("recorded")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                  statusFilter === "recorded"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Syringe size={16} />

                <span>Recorded</span>

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    statusFilter === "recorded"
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {Number(
                    vaccinationStatus?.total?.recorded || 0,
                  ).toLocaleString()}
                </span>
              </button>

              {/* VISITED */}

              <button
                type="button"
                onClick={() => handleStatusFilterChange("visited")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                  statusFilter === "visited"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Eye size={16} />

                <span>Visited</span>

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    statusFilter === "visited"
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {Number(
                    vaccinationStatus?.total?.visited || 0,
                  ).toLocaleString()}
                </span>
              </button>

              {/* COVERED */}

              <button
                type="button"
                onClick={() => handleStatusFilterChange("covered")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                  statusFilter === "covered"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <CheckCircle2 size={16} />

                <span>Covered</span>

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    statusFilter === "covered"
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {Number(
                    vaccinationStatus?.total?.covered || 0,
                  ).toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
      NO DATA
  ====================================================== */}

        {teamData.length === 0 && (
          <div className="border-border bg-surface rounded-xl border p-8 text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full">
              <Syringe size={20} />
            </div>

            <p className="text-text font-medium">
              No {statusFilter} Zerodose records found.
            </p>

            <p className="text-text-secondary mt-1 text-sm">
              No records are available for this status.
            </p>
          </div>
        )}

        {/* ======================================================
      TEAM LIST
  ====================================================== */}

        <div className="space-y-3">
          {teamData.map((team) => {
            const isOpen = Boolean(openTeams[team.teamNumber]);

            const teamStats =
              vaccinationStatus?.teams?.find(
                (statusTeam) =>
                  String(statusTeam?.teamNumber) === String(team?.teamNumber),
              ) || {};

            return (
              <div
                key={team.teamNumber}
                className="border-border overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-slate-900"
              >
                {/* ==================================================
        TEAM HEADER
    ================================================== */}

                <button
                  type="button"
                  onClick={() => toggleTeam(team.teamNumber)}
                  className="hover:bg-surface flex w-full items-center justify-between gap-4 p-4 text-left transition-colors duration-200"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white">
                      {team.teamNumber}
                    </div>

                    <div className="min-w-0">
                      <p className="text-text text-sm font-semibold">
                        Team {team.teamNumber}
                      </p>

                      <div className="mt-1 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span className="text-text-secondary whitespace-nowrap">
                          Leader:{" "}
                          <span className="text-text font-medium capitalize">
                            {getWorkerName(team.teamLeader)}
                          </span>
                        </span>

                        <span className="text-text-secondary whitespace-nowrap">
                          Member:{" "}
                          <span className="text-text font-medium capitalize">
                            {getWorkerName(team.teamMember)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Stats + Arrow */}

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden items-center gap-1.5 sm:flex">
                      <span className="bg-primary/10 text-primary rounded-lg px-2.5 py-1.5 text-[11px] font-semibold">
                        {Number(teamStats?.recorded || 0).toLocaleString()}{" "}
                        Recorded
                      </span>

                      <span className="bg-primary/10 text-primary rounded-lg px-2.5 py-1.5 text-[11px] font-semibold">
                        {Number(teamStats?.visited || 0).toLocaleString()}{" "}
                        Visited
                      </span>

                      <span className="bg-primary/10 text-primary rounded-lg px-2.5 py-1.5 text-[11px] font-semibold">
                        {Number(teamStats?.covered || 0).toLocaleString()}{" "}
                        Covered
                      </span>
                    </div>

                    <div className="bg-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <ChevronDown
                        size={18}
                        className={`text-text-secondary transition-transform duration-300 ease-in-out ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* ==================================================
        MOBILE STATS
    ================================================== */}

                <div className="border-border border-t px-4 py-3 sm:hidden">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-primary/5 rounded-lg px-2.5 py-2">
                      <p className="text-primary text-[10px] font-medium">
                        Recorded
                      </p>

                      <p className="text-text mt-0.5 text-sm font-bold">
                        {Number(teamStats?.recorded || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-primary/5 rounded-lg px-2.5 py-2">
                      <p className="text-primary text-[10px] font-medium">
                        Visited
                      </p>

                      <p className="text-text mt-0.5 text-sm font-bold">
                        {Number(teamStats?.visited || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-primary/5 rounded-lg px-2.5 py-2">
                      <p className="text-primary text-[10px] font-medium">
                        Covered
                      </p>

                      <p className="text-text mt-0.5 text-sm font-bold">
                        {Number(teamStats?.covered || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
        DETAILS
    ================================================== */}

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className={`border-border border-t p-3 transition-all duration-300 ease-in-out sm:p-4 ${
                        isOpen
                          ? "translate-y-0 opacity-100"
                          : "-translate-y-2 opacity-0"
                      }`}
                    >
                      {loading ? (
                        <ZerodoseTeamSummarySkeleton />
                      ) : (
                        <ZerodoseDetailsTable data={team.records} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
