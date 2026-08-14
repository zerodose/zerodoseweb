"use client";

export default function ChartAnimation({ children, delay = 0 }) {
  return (
    <div
      className="animate-[dashboardChart_1.5s_ease-out_forwards] opacity-0"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
