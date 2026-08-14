"use client";

import { useEffect, useState } from "react";

const coverageData = [
  {
    label: "District A",
    recorded: 820,
    covered: 690,
  },
  {
    label: "District B",
    recorded: 760,
    covered: 610,
  },
  {
    label: "District C",
    recorded: 940,
    covered: 820,
  },
  {
    label: "District D",
    recorded: 680,
    covered: 520,
  },
  {
    label: "District E",
    recorded: 880,
    covered: 750,
  },
];

export default function CoverageChart() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...coverageData.map((item) => item.recorded));

  const totalRecorded = coverageData.reduce(
    (sum, item) => sum + item.recorded,
    0,
  );

  const totalCovered = coverageData.reduce(
    (sum, item) => sum + item.covered,
    0,
  );

  const overallCoverage =
    totalRecorded > 0 ? Math.round((totalCovered / totalRecorded) * 100) : 0;

  return (
    <div className="bg-background border-border rounded-2xl border p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-xs font-medium">Performance</p>

          <h2 className="text-text mt-1 text-lg font-bold">
            Coverage by District
          </h2>
        </div>

        <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-xl">
          <span className="text-primary text-sm font-bold">%</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl p-3">
          <p className="text-text-secondary text-[10px]">Recorded</p>

          <p className="text-text mt-1 text-lg font-bold">
            {totalRecorded.toLocaleString()}
          </p>
        </div>

        <div className="bg-surface rounded-xl p-3">
          <p className="text-text-secondary text-[10px]">Covered</p>

          <p className="text-text mt-1 text-lg font-bold">
            {totalCovered.toLocaleString()}
          </p>
        </div>

        <div className="bg-primary-light rounded-xl p-3">
          <p className="text-primary text-[10px]">Coverage</p>

          <p className="text-primary mt-1 text-lg font-bold">
            {overallCoverage}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-5">
        {coverageData.map((item, index) => {
          const recordedWidth = (item.recorded / maxValue) * 100;

          const coveredWidth = (item.covered / maxValue) * 100;

          const coveragePercentage =
            item.recorded > 0
              ? Math.round((item.covered / item.recorded) * 100)
              : 0;

          return (
            <div key={item.label}>
              {/* Label */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-text text-xs font-medium">
                  {item.label}
                </span>

                <span className="text-text-secondary text-xs">
                  {coveragePercentage}% covered
                </span>
              </div>

              {/* Recorded */}
              <div className="bg-surface relative h-3 overflow-hidden rounded-full">
                <div
                  className="bg-primary-soft absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${recordedWidth}%` : "0%",
                    transitionDelay: `${index * 100}ms`,
                  }}
                />
              </div>

              {/* Covered */}
              <div className="bg-surface relative mt-1.5 h-3 overflow-hidden rounded-full">
                <div
                  className="bg-primary absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${coveredWidth}%` : "0%",
                    transitionDelay: `${index * 100 + 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-border mt-6 flex items-center justify-center gap-6 border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary-soft h-3 w-3 rounded-full" />

          <span className="text-text-secondary text-xs">Recorded</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-primary h-3 w-3 rounded-full" />

          <span className="text-text-secondary text-xs">Covered</span>
        </div>
      </div>
    </div>
  );
}
