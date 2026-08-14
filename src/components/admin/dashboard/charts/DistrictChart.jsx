"use client";

import { useEffect, useState } from "react";

const data = [
  { name: "Karachi", value: 820 },
  { name: "Lahore", value: 690 },
  { name: "Faisalabad", value: 560 },
  { name: "Multan", value: 430 },
  { name: "Hyderabad", value: 380 },
  { name: "Sukkur", value: 290 },
];

export default function DistrictChart() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(1);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-text-secondary text-xs">District Performance</p>

        <h2 className="text-text mt-1 text-lg font-bold">
          Zerodose by District
        </h2>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;

          return (
            <div key={item.name}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-text text-sm font-medium">
                  {item.name}
                </span>

                <span className="text-text-secondary text-xs">
                  {item.value}
                </span>
              </div>

              <div className="bg-surface h-3 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage * progress}%`,
                    transitionDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
