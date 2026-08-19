"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Users, Syringe, Eye, CheckCircle2 } from "lucide-react";

import ZerodoseDetailsTable from "./ZerodoseDetailsTable";

export default function ZerodoseTeamSummary({
  data = [],
  title = "Zerodose",
  description = "Team-wise Zerodose records.",
}) {
  const [openTeams, setOpenTeams] = useState({});

  // ============================================================
  // TEAM DATA
  // ============================================================

  const teamData = useMemo(() => {
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
          records: [],
          recorded: 0,
          visited: 0,
          covered: 0,
        });
      }

      const team = teamsMap.get(teamNumber);

      team.records.push(item);

      team.recorded += 1;

      if (item?.visitDate || item?.vaccinationStatus === "visited") {
        team.visited += 1;
      }

      if (item?.coveredDate || item?.vaccinationStatus === "covered") {
        team.covered += 1;
      }

      // --------------------------------------------------------
      // Worker data
      // --------------------------------------------------------

      if (item?.teamLeader) {
        team.teamLeader = item.teamLeader;
      }

      if (item?.teamMember) {
        team.teamMember = item.teamMember;
      }

      if (!team.teamLeader && item?.user?.workerRole === "teamLeader") {
        team.teamLeader = item.user;
      }

      if (!team.teamMember && item?.user?.workerRole === "teamMember") {
        team.teamMember = item.user;
      }

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
  // TOGGLE
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
  // TOTALS
  // ============================================================

  const totals = useMemo(() => {
    return teamData.reduce(
      (acc, team) => {
        acc.recorded += team.recorded;
        acc.visited += team.visited;
        acc.covered += team.covered;

        return acc;
      },
      {
        recorded: 0,
        visited: 0,
        covered: 0,
      },
    );
  }, [teamData]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-text text-base font-semibold md:text-lg">
            {title}
          </h3>

          <p className="text-text-secondary mt-1 text-xs md:text-sm">
            {description}
          </p>
        </div>

        <span className="bg-primary/10 text-primary shrink-0 rounded-full px-3 py-1 text-xs font-semibold">
          {teamData.length} Teams
        </span>
      </div>

      {/* ======================================================
          TOTAL SUMMARY
      ====================================================== */}

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="border-border bg-background rounded-xl border p-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Syringe size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-text-secondary truncate text-[10px] sm:text-xs">
                Recorded
              </p>

              <p className="text-text text-base font-bold sm:text-lg">
                {totals.recorded}
              </p>
            </div>
          </div>
        </div>

        <div className="border-border bg-background rounded-xl border p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Eye size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-text-secondary truncate text-[10px] sm:text-xs">
                Visited
              </p>

              <p className="text-text text-base font-bold sm:text-lg">
                {totals.visited}
              </p>
            </div>
          </div>
        </div>

        <div className="border-border bg-background rounded-xl border p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-text-secondary truncate text-[10px] sm:text-xs">
                Covered
              </p>

              <p className="text-text text-base font-bold sm:text-lg">
                {totals.covered}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          NO DATA
      ====================================================== */}

      {teamData.length === 0 && (
        <div className="border-border bg-surface rounded-xl border p-8 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full">
            <Syringe size={20} />
          </div>

          <p className="text-text font-medium">No Zerodose records found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No records are available for this campaign.
          </p>
        </div>
      )}

      {/* ======================================================
          TEAM LIST
      ====================================================== */}

      <div className="space-y-3">
        {teamData.map((team) => {
          const isOpen = Boolean(openTeams[team.teamNumber]);

          return (
            <div
              key={team.teamNumber}
              className="border-border overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              {/* ==================================================
                  TEAM HEADER
              ================================================== */}

              <button
                type="button"
                onClick={() => toggleTeam(team.teamNumber)}
                className="hover:bg-surface flex w-full items-center justify-between gap-3 p-4 text-left transition"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white">
                    {team.teamNumber}
                  </div>

                  <div className="min-w-0">
                    <p className="text-text text-sm font-semibold">
                      Team {team.teamNumber}
                    </p>

                    <div className="mt-0.5 flex max-w-full flex-wrap gap-x-3 gap-y-0.5 text-xs">
                      <span className="text-text-secondary">
                        Leader:{" "}
                        <span className="text-text font-medium">
                          {getWorkerName(team.teamLeader)}
                        </span>
                      </span>

                      <span className="text-text-secondary">
                        Member:{" "}
                        <span className="text-text font-medium">
                          {getWorkerName(team.teamMember)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[11px] font-semibold">
                      {team.recorded} Recorded
                    </span>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
                      {team.covered} Covered
                    </span>
                  </div>

                  <ChevronDown
                    size={19}
                    className={`text-text-secondary transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* ==================================================
                  MOBILE STATS
              ================================================== */}

              <div className="border-border border-t px-4 py-2.5 sm:hidden">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    {team.recorded} Recorded
                  </span>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                    {team.visited} Visited
                  </span>

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
                    {team.covered} Covered
                  </span>
                </div>
              </div>

              {/* ==================================================
                  DETAILS
              ================================================== */}

              {isOpen && (
                <div className="border-border border-t p-3 sm:p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users size={17} className="text-primary" />

                    <h4 className="text-text text-sm font-semibold">
                      Team {team.teamNumber} Zerodose Details
                    </h4>
                  </div>

                  <ZerodoseDetailsTable data={team.records} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
