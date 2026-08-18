"use client";

import { UserRound } from "lucide-react";

export default function SupervisorSelection({
  supervisors,
  fromSupervisor,
  toSupervisor,
  onFromChange,
  onToChange,
}) {
  return (
    <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-lg">
          <UserRound className="text-primary h-5 w-5" />
        </div>

        <div>
          <h2 className="text-text font-semibold">Select Supervisors</h2>

          <p className="text-text-secondary text-sm">
            Select the supervisor you want to transfer workers from and to.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-text mb-2 block text-sm font-medium">
            From Supervisor
          </label>

          <select
            value={fromSupervisor}
            onChange={(e) => onFromChange(e.target.value)}
            className="border-border bg-background text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
          >
            <option value="">Select supervisor</option>

            {supervisors.map((supervisor) => {
              const id = supervisor._id || supervisor.id;

              return (
                <option
                  key={id}
                  value={id}
                  disabled={String(id) === String(toSupervisor)}
                  className="capitalize"
                >
                  {supervisor.name}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="text-text mb-2 block text-sm font-medium">
            To Supervisor
          </label>

          <select
            value={toSupervisor}
            onChange={(e) => onToChange(e.target.value)}
            className="border-border bg-background text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
          >
            <option value="">Select supervisor</option>

            {supervisors.map((supervisor) => {
              const id = supervisor._id || supervisor.id;

              return (
                <option
                  key={id}
                  value={id}
                  disabled={String(id) === String(fromSupervisor)}
                    className="capitalize"
                >
                  {supervisor.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
