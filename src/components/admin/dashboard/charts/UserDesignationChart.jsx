"use client";

import { useEffect, useState } from "react";

const designationData = [
  {
    label: "UCMO",
    value: 12,
    percentage: 12,
  },
  {
    label: "Supervisor",
    value: 28,
    percentage: 28,
  },
  {
    label: "Vaccinator",
    value: 45,
    percentage: 45,
  },
  {
    label: "Other Staff",
    value: 15,
    percentage: 15,
  },
];

const colors = [
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
];

export default function UserDesignationChart() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

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
                          : "text-purple-500",
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
        <div className="w-full space-y-4">
          {designationData.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${colors[index]}`}
                />

                <span className="text-text truncate text-sm font-medium">
                  {item.label}
                </span>
              </div>

              <div className="ml-3 flex items-center gap-2">
                <span className="text-text text-sm font-bold">
                  {item.value}
                </span>

                <span className="text-text-secondary text-xs">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
