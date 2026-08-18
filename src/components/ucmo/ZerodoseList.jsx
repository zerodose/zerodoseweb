"use client";

import { Package } from "lucide-react";

export default function ZerodoseList({ data = [], formatDate }) {
  if (!data.length) {
    return (
      <div className="bg-background border-border rounded-xl border p-5 text-center">
        <Package size={25} className="text-text-secondary mx-auto mb-2" />

        <p className="text-text text-sm font-medium">No Zerodose Records</p>

        <p className="text-text-secondary mt-1 text-xs">
          No Zerodose records are available for this supervisor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const zerodoseId =
          item?._id?.toString() || item?.id?.toString() || `zerodose-${index}`;

        const status =
          item.vaccinationStatus || item.clientStatus || "Recorded";

        return (
          <div
            key={zerodoseId}
            className="bg-background border-border flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Package size={15} />
              </div>

              <div className="min-w-0">
                <p className="text-text truncate text-sm font-medium">
                  {item.childName || item.name || "Zerodose Record"}
                </p>

                <div className="text-text-secondary mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {item.recordDate && (
                    <span>{formatDate(item.recordDate)}</span>
                  )}

                  {item.teamNumber !== undefined &&
                    item.teamNumber !== null && (
                      <>
                        <span>•</span>

                        <span>Team {item.teamNumber}</span>
                      </>
                    )}
                </div>
              </div>
            </div>

            <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize">
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
