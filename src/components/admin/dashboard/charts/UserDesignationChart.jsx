"use client";

import { useEffect, useMemo, useState } from "react";

const colors = [
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export default function UserDesignationChart({ counts = {} }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // Live User Designation Data
  // Admin intentionally excluded
  // ============================================================

  const designationData = useMemo(
    () => [
      {
        label: "UCMO",
        value: Number(counts?.ucmos ?? 0),
      },
      {
        label: "Supervisor",
        value: Number(counts?.supervisors ?? 0),
      },
      {
        label: "Vaccinator",
        value: Number(counts?.vaccinators ?? 0),
      },
      {
        label: "Other Staff",
        value: Number(counts?.otherStaff ?? 0),
      },
      {
        label: "Town Focal Person",
        value: Number(counts?.townFP ?? 0),
      },
      {
        label: "District Focal Person",
        value: Number(counts?.districtFP ?? 0),
      },
      {
        label: "Worker",
        value: Number(counts?.workers ?? 0),
      },
    ],
    [
      counts?.ucmos,
      counts?.supervisors,
      counts?.vaccinators,
      counts?.otherStaff,
      counts?.townFP,
      counts?.districtFP,
      counts?.workers,
    ],
  );

  const total = designationData.reduce((sum, item) => sum + item.value, 0);

  let currentOffset = 0;

  return (
    <div className="bg-background border-border rounded-2xl border p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-xs font-medium">
            User Distribution
          </p>

          <h2 className="text-text mt-1 text-lg font-bold">
            Users by Designation
          </h2>
        </div>

        <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-xl">
          <span className="text-primary text-sm font-bold">US</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-7 sm:flex-row">
        {/* Donut */}
        <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className={`h-full w-full transition-transform duration-1000 ${
              animated ? "rotate-0" : "-rotate-90"
            }`}
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-surface"
            />

            {designationData.map((item, index) => {
              if (item.value <= 0 || total <= 0) {
                return null;
              }

              const circumference = 2 * Math.PI * 38;
              const segment = (item.value / total) * circumference;

              const offset = currentOffset;

              currentOffset += segment;

              return (
                <circle
                  key={item.label}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${segment} ${circumference}`}
                  strokeDashoffset={animated ? -offset : circumference}
                  strokeLinecap="butt"
                  className={[
                    "transition-all duration-1000",
                    index === 0
                      ? "text-primary"
                      : index === 1
                        ? "text-emerald-500"
                        : index === 2
                          ? "text-amber-500"
                          : index === 3
                            ? "text-purple-500"
                            : index === 4
                              ? "text-blue-500"
                              : index === 5
                                ? "text-pink-500"
                                : "text-cyan-500",
                  ].join(" ")}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                  }}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-text text-3xl font-bold">{total}</p>

            <p className="text-text-secondary text-xs">Total Users</p>
          </div>
        </div>

        {/* Legend */}
        {/* Legend */}
        <div className="w-full space-y-4">
          {designationData.map((item, index) => {
            const percentage =
              total > 0 ? Math.round((item.value / total) * 100) : 0;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                {/* Designation */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ${colors[index]}`}
                  />

                  <span className="text-text truncate text-sm font-medium">
                    {item.label}
                  </span>
                </div>

                {/* Count + Percentage Columns */}
                <div className="grid w-[90px] shrink-0 grid-cols-2 items-center text-right">
                  {/* Count */}
                  <span className="text-text text-sm font-bold">
                    {item.value}
                  </span>

                  {/* Percentage */}
                  <span className="text-text-secondary text-xs">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
