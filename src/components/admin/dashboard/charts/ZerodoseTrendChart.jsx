"use client";

import { useEffect, useState } from "react";

const chartData = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 580 },
  { label: "Mar", value: 760 },
  { label: "Apr", value: 690 },
  { label: "May", value: 920 },
  { label: "Jun", value: 1080 },
  { label: "Jul", value: 1240 },
  { label: "Aug", value: 1380 },
];

export default function ZerodoseTrendChart() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...chartData.map((item) => item.value));

  return (
    <div className="bg-background border-border rounded-2xl border p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-xs font-medium">
            Monthly Performance
          </p>

          <h2 className="text-text mt-1 text-lg font-bold">Zerodose Trend</h2>
        </div>

        <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-xl">
          <span className="text-primary text-sm font-bold">ZD</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="flex h-64 items-end gap-2 sm:gap-4">
          {chartData.map((item, index) => {
            const height = (item.value / maxValue) * 100;

            return (
              <div
                key={item.label}
                className="flex h-full flex-1 flex-col justify-end"
              >
                {/* Value */}
                <div className="text-text-secondary mb-1 text-center text-[10px]">
                  {item.value}
                </div>

                {/* Bar */}
                <div className="flex h-full items-end">
                  <div
                    className="bg-primary hover:bg-primary-dark w-full rounded-t-lg transition-all duration-1000 ease-out"
                    style={{
                      height: animated ? `${height}%` : "0%",
                      transitionDelay: `${index * 100}ms`,
                    }}
                  />
                </div>

                {/* Label */}
                <p className="text-text-secondary mt-2 text-center text-[10px] font-medium">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Horizontal Lines */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8">
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="border-border border-t border-dashed" />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-border mt-5 flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-text-secondary text-xs">Total Recorded</p>

          <p className="text-text mt-1 text-xl font-bold">
            {chartData
              .reduce((total, item) => total + item.value, 0)
              .toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="text-text-secondary text-xs">Current Month</p>

          <p className="text-primary mt-1 text-sm font-bold">
            {chartData[chartData.length - 1].value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
