
"use client";

import Select from "@/components/ui/Select";
import { UserRound } from "lucide-react";

export default function SupervisorSelection({
  supervisors,
  fromSupervisor,
  toSupervisor,
  onFromChange,
  onToChange,
}) {
  const supervisorOptions = supervisors.map((supervisor) => {
    const id = supervisor._id || supervisor.id;

    return {
      value: id,
      label: supervisor.name,
    };
  });

  const fromSupervisorOptions = supervisors.map((supervisor) => {
    const id = supervisor._id || supervisor.id;

    return {
      value: id,
      label: supervisor.name,
      disabled: String(id) === String(toSupervisor),
    };
  });

  const toSupervisorOptions = supervisors.map((supervisor) => {
    const id = supervisor._id || supervisor.id;

    return {
      value: id,
      label: supervisor.name,
      disabled: String(id) === String(fromSupervisor),
    };
  });

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

      <div className="relative z-50 grid grid-cols-1 gap-4 overflow-visible md:grid-cols-2">
        <Select
          name="fromSupervisor"
          label="From Supervisor"
          value={fromSupervisor}
          onChange={(e) => onFromChange(e.target.value)}
          options={fromSupervisorOptions}
          placeholder="Select supervisor"
          searchable
          searchPlaceholder="Search supervisor..."
          clearable
        />

        <Select
          name="toSupervisor"
          label="To Supervisor"
          value={toSupervisor}
          onChange={(e) => onToChange(e.target.value)}
          options={toSupervisorOptions}
          placeholder="Select supervisor"
          searchable
          searchPlaceholder="Search supervisor..."
          clearable
        />
      </div>
    </div>
  );
}
