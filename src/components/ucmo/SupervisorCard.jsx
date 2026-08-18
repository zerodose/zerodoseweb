"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import ZerodoseList from "./ZerodoseList";

export default function SupervisorCard({
  supervisor,
  formatDate,
  previous = false,
}) {
  const [expanded, setExpanded] = useState(false);

  const zerodose = supervisor?.zerodose || [];

  const supervisorName = supervisor?.name || "Unnamed Supervisor";

  const status = supervisor?.status || "active";

  return (
    <div className="bg-surface border-border overflow-hidden rounded-2xl border">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="hover:bg-background flex w-full items-center justify-between gap-3 p-4 text-left transition md:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Users size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-text truncate text-sm font-semibold md:text-base">
              {supervisorName}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              {status === "active" ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600">
                  <CheckCircle2 size={12} />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-red-500">
                  <XCircle size={12} />
                  Inactive
                </span>
              )}

              <span className="text-text-secondary text-[11px]">•</span>

              <span className="text-text-secondary text-[11px]">
                {zerodose.length} Zerodose
              </span>

              {supervisor?.unionCouncil?.name && (
                <>
                  <span className="text-text-secondary hidden text-[11px] sm:inline">
                    •
                  </span>

                  <span className="text-text-secondary hidden text-[11px] sm:inline">
                    {supervisor.unionCouncil.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {expanded ? (
          <ChevronDown size={19} className="text-text-secondary shrink-0" />
        ) : (
          <ChevronRight size={19} className="text-text-secondary shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-border border-t p-3 md:p-4">
          <ZerodoseList data={zerodose} formatDate={formatDate} />
        </div>
      )}
    </div>
  );
}
