"use client";

const data = [
  { name: "Team 01", value: 240 },
  { name: "Team 02", value: 215 },
  { name: "Team 03", value: 190 },
  { name: "Team 04", value: 170 },
  { name: "Team 05", value: 145 },
  { name: "Team 06", value: 120 },
];

export default function TeamChart() {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-text-secondary text-xs">Team Activity</p>

        <h2 className="text-text mt-1 text-lg font-bold">
          Top Performing Teams
        </h2>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;

          return (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-text text-sm">{item.name}</span>

                <span className="text-text-secondary text-xs">
                  {item.value}
                </span>
              </div>

              <div className="bg-surface flex h-7 overflow-hidden rounded-lg">
                <div
                  className="bg-primary h-full rounded-lg transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
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
