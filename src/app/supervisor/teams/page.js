
"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { getUsers } from "@/api/userApi";
import WorkersSkeleton from "@/components/supervisor/WorkersSkeleton";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";

export default function SupervisorWorkersPage() {
  const router = useRouter();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 80);

      return () => clearTimeout(timer);
    }

    setPageReady(false);
  }, [loading]);

  // ============================================================
  // FETCH SUPERVISOR WORKERS
  // ============================================================

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        setError("");

        const storedAuthUser = JSON.parse(
          localStorage.getItem("authUser") || "{}",
        );

        if (!storedAuthUser?.id) {
          throw new Error("Supervisor authentication data not found.");
        }

        const response = await getUsers({
          page: 1,
          limit: 100,
          designation: "worker",
          status: "active",
          supervisor: String(storedAuthUser.id),
        });

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to fetch supervisor workers.",
          );
        }

        setWorkers(response.data || []);
      } catch (error) {
        console.error("Supervisor workers fetch error:", error);

        setError(error?.message || "Failed to load workers.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // ============================================================
  // GROUP WORKERS BY TEAM
  // ============================================================

  const teams = useMemo(() => {
    const teamMap = new Map();

    workers.forEach((worker) => {
      if (
        worker.teamNumber === null ||
        worker.teamNumber === undefined ||
        worker.teamNumber === ""
      ) {
        return;
      }

      const teamNumber = String(worker.teamNumber);

      if (!teamMap.has(teamNumber)) {
        teamMap.set(teamNumber, {
          teamNumber,
          teamLeader: null,
          teamMember: null,
          workers: [],
        });
      }

      const team = teamMap.get(teamNumber);

      team.workers.push(worker);

      if (worker.workerRole === "teamLeader") {
        team.teamLeader = worker;
      }

      if (worker.workerRole === "teamMember") {
        team.teamMember = worker;
      }
    });

    return Array.from(teamMap.values()).sort(
      (a, b) => Number(a.teamNumber) - Number(b.teamNumber),
    );
  }, [workers]);

  // ============================================================
  // HELPER
  // ============================================================

  const getName = (worker) => {
    return worker?.name || "-";
  };

  const getContact = (worker) => {
    return worker?.contactNumber || worker?.contactNo || "-";
  };

  const getDistrict = (worker) => {
    return worker?.district?.name || "-";
  };

  const getTown = (worker) => {
    return worker?.town?.name || "-";
  };

  const getUnionCouncil = (worker) => {
    return worker?.unionCouncil?.name || "-";
  };

  const getSupervisor = (worker) => {
    return worker?.supervisor?.name || "-";
  };

  // ============================================================
  // RENDER
  // ============================================================

  {
    /* ======================================================
        LOADING
    ====================================================== */
  }

  if (loading) {
    return (
      <div className="w-full">
        <WorkersSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* ======================================================
        HEADER
    ====================================================== */}

      <ApprovalPageHeader
        title="Teams"
        description="Manage your teams and assigned workers"
        onBack={() => router.back()}
        rightContent={
          <div className="border-primary/20 bg-primary-light text-primary dark:bg-primary/10 dark:border-primary/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm">
            <Users size={18} />

            <span>
              {teams.length} {teams.length === 1 ? "Team" : "Teams"}
            </span>
          </div>
        }
      />

      {/* ======================================================
        ERROR
    ====================================================== */}

      {error && (
        <div className="mb-6 flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ======================================================
        EMPTY
    ====================================================== */}

      {!loading && !error && teams.length === 0 && (
        <div className="border-border bg-background rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-primary-light dark:bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Users size={26} className="text-primary" />
          </div>

          <h2 className="text-text text-lg font-semibold">No Teams Found</h2>

          <p className="text-text-secondary mx-auto mt-1 max-w-md text-sm">
            No active workers or teams are currently assigned to you.
          </p>
        </div>
      )}

      {/* ======================================================
        TEAMS
    ====================================================== */}

      {!loading && teams.length > 0 && (
        <div className="space-y-6">
          {teams.map((team) => {
            const leader = team.teamLeader;
            const member = team.teamMember;

            const locationWorker = leader || member;

            return (
              <div
                key={team.teamNumber}
                className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md dark:shadow-black/20"
              >
                {/* ==================================================
                  TEAM HEADER
              ================================================== */}

                <div className="border-border relative overflow-hidden border-b bg-gradient-to-r from-[#eaf6ff] via-[#f5faff] to-white px-4 py-3 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                  {/* Decorative circle */}
                  <div className="bg-primary/5 dark:bg-primary/10 pointer-events-none absolute -top-10 -right-6 h-28 w-28 rounded-full" />

                  <div className="relative flex items-center justify-between gap-3">
                    {/* TEAM INFO */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm">
                        {team.teamNumber}
                      </div>

                      <div className="min-w-0">
                        <p className="text-text-secondary text-[10px] font-semibold tracking-wider uppercase">
                          Team
                        </p>

                        <h2 className="text-text truncate text-base font-bold">
                          Team {team.teamNumber}
                        </h2>
                      </div>
                    </div>

                    {/* META */}
                    <div className="border-primary/20 bg-background text-primary dark:border-primary/30 flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm dark:bg-slate-800">
                      <span>{team.workers.length}</span>
                      <span>
                        {team.workers.length === 1 ? "Worker" : "Workers"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                  TEAM DATA
              ================================================== */}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-border bg-surface-blue border-b dark:bg-slate-800/70">
                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          Role
                        </th>

                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          Name
                        </th>

                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          Contact Number
                        </th>

                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          Designation
                        </th>

                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          District
                        </th>

                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          Town
                        </th>

                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          Union Council
                        </th>

                        <th className="text-text-secondary px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* TEAM LEADER */}
                      {leader && (
                        <tr className="group border-border hover:bg-primary-light/40 dark:hover:bg-primary/5 border-b transition-colors">
                          <td className="px-3 py-3">
                            <span className="bg-primary-light text-primary border-primary/10 dark:bg-primary/10 dark:border-primary/20 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold">
                              Team Leader
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <span className="text-text truncate text-sm font-semibold capitalize">
                                {getName(leader)}
                              </span>
                            </div>
                          </td>

                          <td className="text-text px-3 py-3 text-sm font-medium">
                            {getContact(leader)}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm capitalize">
                            {leader.designation || "worker"}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm">
                            {getDistrict(leader)}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm">
                            {getTown(leader)}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm">
                            {getUnionCouncil(leader)}
                          </td>

                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 dark:bg-green-950/40 dark:text-green-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400" />
                              {leader.status || "active"}
                            </span>
                          </td>
                        </tr>
                      )}

                      {/* TEAM MEMBER */}
                      {member && (
                        <tr className="group border-border border-b transition-colors last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Team Member
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <span className="text-text truncate text-sm font-semibold capitalize">
                                {getName(member)}
                              </span>
                            </div>
                          </td>

                          <td className="text-text px-3 py-3 text-sm font-medium">
                            {getContact(member)}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm capitalize">
                            {member.designation || "worker"}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm">
                            {getDistrict(member)}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm">
                            {getTown(member)}
                          </td>

                          <td className="text-text-secondary px-3 py-3 text-sm">
                            {getUnionCouncil(member)}
                          </td>

                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 dark:bg-green-950/40 dark:text-green-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400" />
                              {member.status || "active"}
                            </span>
                          </td>
                        </tr>
                      )}

                      {/* NO WORKER */}
                      {!leader && !member && (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-text-secondary px-3 py-6 text-center text-sm"
                          >
                            No worker assigned to this team.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ==================================================
                  TEAM FOOTER
              ================================================== */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
