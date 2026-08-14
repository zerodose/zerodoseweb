"use client";

import { useEffect, useState } from "react";

const data = [
  {
    campaign: "Campaign 1",
    supervisors: 18,
    teams: 35,
  },
  {
    campaign: "Campaign 2",
    supervisors: 22,
    teams: 42,
  },
  {
    campaign: "Campaign 3",
    supervisors: 27,
    teams: 51,
  },
  {
    campaign: "Campaign 4",
    supervisors: 31,
    teams: 64,
  },
  {
    campaign: "Campaign 5",
    supervisors: 38,
    teams: 76,
  },
];

export default function CampaignComparisonChart() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame;
    let start;

    const animate = (timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const value = Math.min((timestamp - start) / 1300, 1);

      setProgress(value);

      if (value < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  const width = 700;
  const height = 280;
  const padding = 45;

  const max = 80;

  const createPoints = (key) =>
    data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);

      const targetY =
        height - padding - (item[key] / max) * (height - padding * 2);

      const y = height - padding + (targetY - (height - padding)) * progress;

      return { x, y };
    });

  const supervisorPoints = createPoints("supervisors");

  const teamPoints = createPoints("teams");

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-text-secondary text-xs">Campaign Comparison</p>

          <h2 className="text-text mt-1 text-lg font-bold">
            Supervisors & Teams
          </h2>
        </div>

        <div className="flex gap-4 text-xs">
          <span className="text-primary">● Supervisors</span>

          <span className="text-green-500">● Teams</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px]"
        >
          {[0, 20, 40, 60, 80].map((value) => {
            const y = height - padding - (value / max) * (height - padding * 2);

            return (
              <g key={value}>
                <line
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 5"
                />

                <text
                  x="10"
                  y={y + 4}
                  className="fill-text-secondary text-[10px]"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <polyline
            points={supervisorPoints
              .map((point) => `${point.x},${point.y}`)
              .join(" ")}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <polyline
            points={teamPoints
              .map((point) => `${point.x},${point.y}`)
              .join(" ")}
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {data.map((item, index) => (
            <text
              key={item.campaign}
              x={supervisorPoints[index].x}
              y={height - 15}
              textAnchor="middle"
              className="fill-text-secondary text-[10px]"
            >
              {item.campaign.replace("Campaign ", "C")}
            </text>
          ))}

          {supervisorPoints.map((point, index) => (
            <circle
              key={`supervisor-${index}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="var(--background)"
              stroke="var(--primary)"
              strokeWidth="3"
            />
          ))}

          {teamPoints.map((point, index) => (
            <circle
              key={`team-${index}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="var(--background)"
              stroke="#22c55e"
              strokeWidth="3"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
