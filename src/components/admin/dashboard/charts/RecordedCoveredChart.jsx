"use client";

const data = [
  { category: "Jan", recorded: 420, covered: 350 },
  { category: "Feb", recorded: 510, covered: 430 },
  { category: "Mar", recorded: 620, covered: 520 },
  { category: "Apr", recorded: 710, covered: 610 },
  { category: "May", recorded: 840, covered: 720 },
  { category: "Jun", recorded: 960, covered: 830 },
];

export default function RecordedCoveredChart() {
  const max = Math.max(
    ...data.flatMap((item) => [item.recorded, item.covered]),
  );

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-text-secondary text-xs">Monthly Comparison</p>

          <h2 className="text-text mt-1 text-lg font-bold">
            Recorded vs Covered
          </h2>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-primary h-3 w-3 rounded-sm" />
            <span className="text-text-secondary">Recorded</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-green-500" />
            <span className="text-text-secondary">Covered</span>
          </div>
        </div>
      </div>

      <div className="flex h-64 items-end gap-3 sm:gap-5">
        {data.map((item) => (
          <div
            key={item.category}
            className="flex h-full flex-1 items-end justify-center gap-1.5"
          >
            <div className="flex h-full flex-1 items-end justify-center">
              <div
                className="bg-primary w-full max-w-8 rounded-t-lg transition-all duration-1000"
                style={{
                  height: `${(item.recorded / max) * 100}%`,
                }}
                title={`Recorded: ${item.recorded}`}
              />
            </div>

            <div className="flex h-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t-lg bg-green-500 transition-all duration-1000"
                style={{
                  height: `${(item.covered / max) * 100}%`,
                }}
                title={`Covered: ${item.covered}`}
              />
            </div>

            <span className="text-text-secondary absolute mt-[285px] text-xs">
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
