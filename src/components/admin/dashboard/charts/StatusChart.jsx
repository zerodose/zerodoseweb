"use client";

import { useEffect, useState } from "react";

const data = [
  {
    name: "Recorded",
    value: 420,
    color: "var(--primary)",
  },
  {
    name: "Covered",
    value: 310,
    color: "#22c55e",
  },
  {
    name: "Pending",
    value: 180,
    color: "#f59e0b",
  },
  {
    name: "Rejected",
    value: 90,
    color: "#ef4444",
  },
];

export default function StatusChart() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(1);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentAngle = -90;

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-text-secondary text-xs">Zerodose Distribution</p>

        <h2 className="text-text mt-1 text-lg font-bold">Status Overview</h2>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        <div className="relative h-52 w-52 shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {data.map((item) => {
              const angle = (item.value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle * progress;

              currentAngle += angle;

              const radius = 75;
              const center = 100;

              const startX =
                center + radius * Math.cos((startAngle * Math.PI) / 180);

              const startY =
                center + radius * Math.sin((startAngle * Math.PI) / 180);

              const endX =
                center + radius * Math.cos((endAngle * Math.PI) / 180);

              const endY =
                center + radius * Math.sin((endAngle * Math.PI) / 180);

              const largeArc = angle > 180 ? 1 : 0;

              const path = `
                M ${center} ${center}
                L ${startX} ${startY}
                A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
                Z
              `;

              return (
                <path
                  key={item.name}
                  d={path}
                  fill={item.color}
                  stroke="var(--background)"
                  strokeWidth="2"
                />
              );
            })}

            <circle cx="100" cy="100" r="45" fill="var(--background)" />

            <text
              x="100"
              y="96"
              textAnchor="middle"
              className="fill-text text-[20px] font-bold"
            >
              {total}
            </text>

            <text
              x="100"
              y="116"
              textAnchor="middle"
              className="fill-text-secondary text-[10px]"
            >
              Total
            </text>
          </svg>
        </div>

        <div className="w-full space-y-3 sm:max-w-[180px]">
          {data.map((item) => {
            const percentage = Math.round((item.value / total) * 100);

            return (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="text-text text-sm">{item.name}</span>
                </div>

                <span className="text-text-secondary text-xs">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
