
"use client";

import { ArrowLeftRight, ArrowRightLeft, Users } from "lucide-react";

import WorkerList from "./WorkerList";
import TransferWorkerCard from "./TransferWorkerCard";

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
    return worker?.teamNumber || worker?.team?.teamNumber || "";
  };

  const getWorkerRole = (worker) => {
    return worker?.workerRole || "";
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
            Select workers and configure their team and role before
            transferring.
          </p>
        </div>
      </div>

      {/* Transfer Area */}
      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* FROM */}
        <WorkerList
          title={fromSupervisorName || "From Supervisor"}
          workers={fromWorkers}
          selectedWorkers={selectedWorkers}
          movedWorkers={transferredWorkers}
          onToggle={onToggleLeft}
          emptyMessage="Select a supervisor first."
        />

        {/* CENTER */}
        <div className="flex flex-row justify-center gap-2 lg:flex-col">
          <button
            type="button"
            onClick={onMoveRight}
            disabled={!selectedWorkers.length }
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

        {/* TO */}
        <div className="border-border overflow-hidden rounded-xl border">
          <div className="border-border bg-surface border-b px-4 py-3">
            <p className="text-text text-sm font-semibold capitalize">
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

                return (
                  <TransferWorkerCard
                    key={workerId}
                    worker={worker}
                    selected={transferredWorkers.includes(workerId)}
                    teamNumber={details.teamNumber ?? getTeamNumber(worker)}
                    workerRole={details.workerRole ?? getWorkerRole(worker)}
                    onToggle={onToggleRight}
                    onDetailChange={onTransferDetailChange}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
