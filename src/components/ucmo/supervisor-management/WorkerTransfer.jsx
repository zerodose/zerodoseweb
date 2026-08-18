

"use client";

import { ArrowLeftRight, ArrowRightLeft, Users } from "lucide-react";

export default function WorkerTransfer({
  fromSupervisorName,
  toSupervisorName,
  fromWorkers = [],
  toWorkers = [],
  selectedWorkers = [],
  transferredWorkers = [],

  onToggleLeft,
  onToggleRight,
  onMoveRight,
  onMoveLeft,

  transferDetails = {},
  onTransferDetailChange,
}) {
  const getWorkerId = (worker) => {
    return String(worker?._id || worker?.id || "");
  };

  const getTeamNumber = (worker) => {
    return worker?.teamNumber || worker?.team?.teamNumber || "-";
  };

  const getWorkerRole = (worker) => {
    return worker?.workerRole || "-";
  };

  const getWorkerName = (worker) => {
    return worker?.name || "Worker";
  };

  const renderRoleLabel = (role) => {
    if (role === "teamLeader") return "Team Leader";
    if (role === "teamMember") return "Team Member";

    return "-";
  };

  return (
    <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-lg">
          <Users className="text-primary h-5 w-5" />
        </div>

        <div>
          <h2 className="text-text font-semibold">Transfer Workers</h2>

          <p className="text-text-secondary text-sm">
            Select individual workers and configure their team and role before
            transferring them.
          </p>
        </div>
      </div>

      {/* Transfer Area */}
      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* ====================================================== */}
        {/* FROM SUPERVISOR */}
        {/* ====================================================== */}

        <div className="border-border overflow-hidden rounded-xl border">
          <div className="border-border bg-surface border-b px-4 py-3">
            <p className="text-text text-sm font-semibold">
              {fromSupervisorName || "From Supervisor"}
            </p>

            <p className="text-text-secondary mt-0.5 text-xs">
              {fromWorkers.length} worker
              {fromWorkers.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!fromWorkers.length ? (
              <div className="text-text-secondary px-4 py-10 text-center text-sm">
                Select a supervisor first.
              </div>
            ) : (
              fromWorkers.map((worker) => {
                const workerId = getWorkerId(worker);

                const isSelected = selectedWorkers.includes(workerId);

                const isMoved = transferredWorkers.includes(workerId);

                if (isMoved) {
                  return null;
                }

                return (
                  <label
                    key={workerId}
                    className="border-border hover:bg-surface flex cursor-pointer items-start gap-3 border-b px-4 py-3 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleLeft(workerId)}
                      className="border-border text-primary focus:ring-primary mt-1 h-4 w-4 rounded"
                    />

                    <div className="flex min-w-0 items-end gap-3">
                      <p className="text-text min-w-[50] text-sm font-medium capitalize">
                        {getWorkerName(worker)}
                      </p>

                      <div className="text-text-secondary flex min-w-[50] flex-wrap gap-x-3 gap-y-1 text-xs">
                        <span>
                          Team:{" "}
                          <strong className="text-text">
                            {getTeamNumber(worker)}
                          </strong>
                        </span>

                        <span>
                          Role:{" "}
                          <strong className="text-text">
                            {renderRoleLabel(getWorkerRole(worker))}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* ====================================================== */}
        {/* CENTER BUTTONS */}
        {/* ====================================================== */}

        <div className="flex flex-row justify-center gap-2 lg:flex-col">
          <button
            type="button"
            onClick={onMoveRight}
            disabled={!selectedWorkers.length}
            className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
            title="Move selected workers"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onMoveLeft}
            disabled={!transferredWorkers.length}
            className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
            title="Move workers back"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
        </div>

        {/* ====================================================== */}
        {/* TO SUPERVISOR */}
        {/* ====================================================== */}

        <div className="border-border overflow-hidden rounded-xl border">
          <div className="border-border bg-surface border-b px-4 py-3">
            <p className="text-text text-sm font-semibold">
              {toSupervisorName || "To Supervisor"}
            </p>

            <p className="text-text-secondary mt-0.5 text-xs">
              {toWorkers.length} selected worker
              {toWorkers.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!toSupervisorName ? (
              <div className="text-text-secondary px-4 py-10 text-center text-sm">
                Select a supervisor first.
              </div>
            ) : !toWorkers.length ? (
              <div className="text-text-secondary px-4 py-10 text-center text-sm">
                Select workers to transfer.
              </div>
            ) : (
              toWorkers.map((worker) => {
                const workerId = getWorkerId(worker);

                const details = transferDetails?.[workerId] || {};

                const teamNumber = details.teamNumber ?? getTeamNumber(worker);

                const workerRole = details.workerRole ?? getWorkerRole(worker);

                return (
                  <div
                    key={workerId}
                    className="border-border border-b p-4 last:border-b-0"
                  >
                    {/* Worker Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={transferredWorkers.includes(workerId)}
                          onChange={() => onToggleRight(workerId)}
                          className="border-border text-primary focus:ring-primary mt-1 h-4 w-4 rounded"
                        />

                        <div className="flex min-w-0 items-end gap-3">
                          <p className="text-text text-sm font-semibold capitalize">
                            {getWorkerName(worker)}
                          </p>

                          <p className="text-text-secondary mt-0.5 text-xs">
                            Current: Team {getTeamNumber(worker)} ·{" "}
                            {renderRoleLabel(getWorkerRole(worker))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transfer Configuration */}
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Team Number */}
                      <div>
                        <label className="text-text mb-1.5 block text-xs font-medium">
                          Team Number
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={teamNumber === "-" ? "" : teamNumber}
                          onChange={(e) =>
                            onTransferDetailChange?.(
                              workerId,
                              "teamNumber",
                              e.target.value,
                            )
                          }
                          placeholder="Enter team number"
                          className="border-border bg-background text-text focus:border-primary focus:ring-primary-light w-full [appearance:textfield] rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Worker Role */}
                      <div>
                        <label className="text-text mb-1.5 block text-xs font-medium">
                          Worker Role
                        </label>

                        <select
                          value={workerRole === "-" ? "" : workerRole}
                          onChange={(e) =>
                            onTransferDetailChange?.(
                              workerId,
                              "workerRole",
                              e.target.value,
                            )
                          }
                          className="border-border bg-background text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2"
                        >
                          <option value="">Select role</option>
                          <option value="teamLeader">Team Leader</option>
                          <option value="teamMember">Team Member</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
