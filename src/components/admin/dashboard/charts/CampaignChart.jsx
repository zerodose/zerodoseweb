"use client";

import { useEffect, useRef, useState } from "react";

const data = [
  { month: "Jan", value: 420 },
  { month: "Feb", value: 580 },
  { month: "Mar", value: 690 },
  { month: "Apr", value: 820 },
  { month: "May", value: 960 },
  { month: "Jun", value: 1120 },
  { month: "Jul", value: 1280 },
];

export default function CampaignChart() {
  const [progress, setProgress] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    let start;

    const animate = (timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const elapsed = timestamp - start;
      const next = Math.min(elapsed / 1200, 1);

      setProgress(next);

      if (next < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const width = 700;
  const height = 280;
  const padding = 45;

  const max = Math.max(...data.map((item) => item.value));
  const min = 0;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);

    const y =
      height -
      padding -
      ((item.value - min) / (max - min)) * (height - padding * 2);

    return { ...item, x, y };
  });

  const animatedPoints = points.map((point) => ({
    ...point,
    y: height - padding + (point.y - (height - padding)) * progress,
  }));

  const linePoints = animatedPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints = [
    `${animatedPoints[0].x},${height - padding}`,
    ...animatedPoints.map((point) => `${point.x},${point.y}`),
    `${animatedPoints[animatedPoints.length - 1].x},${height - padding}`,
  ].join(" ");

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-text-secondary text-xs">Campaign Performance</p>

        <h2 className="text-text mt-1 text-lg font-bold">Zerodose Trend</h2>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full min-w-[600px]"
        >
          <defs>
            <linearGradient id="campaignArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((item) => {
            const y = padding + (item / 4) * (height - padding * 2);

            return (
              <line
                key={item}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="4 5"
              />
            );
          })}

          <polygon points={areaPoints} fill="url(#campaignArea)" />

          <polyline
            points={linePoints}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {animatedPoints.map((point) => (
            <g key={point.month}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="var(--background)"
                stroke="var(--primary)"
                strokeWidth="3"
              />

              <text
                x={point.x}
                y={height - 15}
                textAnchor="middle"
                className="fill-text-secondary text-[12px]"
              >
                {point.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
