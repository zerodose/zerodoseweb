"use client";

const data = [
  { team: "T1", x: 20, y: 80 },
  { team: "T2", x: 30, y: 110 },
  { team: "T3", x: 40, y: 145 },
  { team: "T4", x: 50, y: 170 },
  { team: "T5", x: 60, y: 210 },
  { team: "T6", x: 70, y: 240 },
  { team: "T7", x: 80, y: 280 },
  { team: "T8", x: 90, y: 315 },
];

export default function ActivityChart() {
  const width = 700;
  const height = 280;
  const padding = 50;

  const maxX = 100;
  const maxY = 350;

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-text-secondary text-xs">Team Activity</p>

        <h2 className="text-text mt-1 text-lg font-bold">Visits vs Zerodose</h2>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px]"
        >
          {[0, 25, 50, 75, 100].map((value) => {
            const x = padding + (value / maxX) * (width - padding * 2);

            return (
              <line
                key={`x-${value}`}
                x1={x}
                x2={x}
                y1={padding}
                y2={height - padding}
                stroke="var(--border)"
                strokeDasharray="4 5"
              />
            );
          })}

          {[0, 100, 200, 300].map((value) => {
            const y =
              height - padding - (value / maxY) * (height - padding * 2);

            return (
              <line
                key={`y-${value}`}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="4 5"
              />
            );
          })}

          {data.map((item) => {
            const cx = padding + (item.x / maxX) * (width - padding * 2);

            const cy =
              height - padding - (item.y / maxY) * (height - padding * 2);

            return (
              <g key={item.team}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="var(--primary)"
                  opacity="0.85"
                />

                <text
                  x={cx}
                  y={cy - 13}
                  textAnchor="middle"
                  className="fill-text-secondary text-[10px]"
                >
                  {item.team}
                </text>
              </g>
            );
          })}

          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-text-secondary text-[11px]"
          >
            Visits
          </text>

          <text
            x="15"
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${height / 2})`}
            className="fill-text-secondary text-[11px]"
          >
            Zerodose
          </text>
        </svg>
      </div>
    </div>
  );
}
