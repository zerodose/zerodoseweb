"use client";

import { useEffect, useMemo, useState } from "react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_CONFIG = {
  recorded: {
    name: "Recorded",
    color: "var(--primary)",
  },

  covered: {
    name: "Covered",
    color: "#22c55e",
  },

  pending: {
    name: "Pending",
    color: "#f59e0b",
  },

  rejected: {
    name: "Rejected",
    color: "#ef4444",
  },
};

export default function StatusChart({ counts = {}, trendData = [] }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [view, setView] = useState("month");

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const [progress, setProgress] = useState(0);

  // ============================================================
  // Years
  // ============================================================

  const YEARS = useMemo(() => {
    const years = new Set();

    years.add(currentYear);

    if (Array.isArray(trendData)) {
      trendData.forEach((item) => {
        const dates = [item?.recordDate, item?.visitDate, item?.coveredDate];

        dates.forEach((value) => {
          if (!value) return;

          const date = new Date(value);

          if (!Number.isNaN(date.getTime())) {
            years.add(date.getFullYear());
          }
        });
      });
    }

    return [...years].sort((a, b) => b - a);
  }, [trendData, currentYear]);

  // ============================================================
  // Normalize Date
  // ============================================================

  const getDate = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  // ============================================================
  // Sort Complete Trend Data
  // ============================================================

  const sortedTrendData = useMemo(() => {
    if (!Array.isArray(trendData)) {
      return [];
    }

    return [...trendData].sort((a, b) => {
      const aDate =
        getDate(a?.recordDate) ||
        getDate(a?.visitDate) ||
        getDate(a?.coveredDate);

      const bDate =
        getDate(b?.recordDate) ||
        getDate(b?.visitDate) ||
        getDate(b?.coveredDate);

      if (!aDate && !bDate) {
        return 0;
      }

      if (!aDate) {
        return 1;
      }

      if (!bDate) {
        return -1;
      }

      return aDate.getTime() - bDate.getTime();
    });
  }, [trendData]);

  // ============================================================
  // Get Status Counts For One Record
  // ============================================================

  const getRecordStatus = (item) => {
    const result = {
      recorded: 0,
      covered: 0,
      pending: 0,
      rejected: 0,
    };

    // ----------------------------------------------------------
    // Recorded
    // ----------------------------------------------------------

    if (item?.recordDate) {
      result.recorded = 1;
    }

    // ----------------------------------------------------------
    // Covered
    // ----------------------------------------------------------

    if (item?.coveredDate) {
      result.covered = 1;
    }

    // ----------------------------------------------------------
    // Pending
    // ----------------------------------------------------------

    if (
      item?.status === "pending" ||
      item?.approvalStatus === "pending" ||
      item?.vaccinationStatus === "pending"
    ) {
      result.pending = 1;
    }

    // ----------------------------------------------------------
    // Rejected
    // ----------------------------------------------------------

    if (
      item?.status === "rejected" ||
      item?.approvalStatus === "rejected" ||
      item?.vaccinationStatus === "rejected"
    ) {
      result.rejected = 1;
    }

    return result;
  };

  // ============================================================
  // Month Data
  //
  // Complete selected month:
  // 01 -> last day
  // ============================================================

  const monthData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      let recorded = 0;
      let covered = 0;
      let pending = 0;
      let rejected = 0;

      sortedTrendData.forEach((item) => {
        const recordDate = getDate(item?.recordDate);

        const visitDate = getDate(item?.visitDate);

        const coveredDate = getDate(item?.coveredDate);

        // ------------------------------------------------------
        // Recorded
        // ------------------------------------------------------

        if (
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === selectedMonth &&
          recordDate.getDate() === day
        ) {
          recorded += 1;
        }

        // ------------------------------------------------------
        // Covered
        // ------------------------------------------------------

        if (
          coveredDate &&
          coveredDate.getFullYear() === selectedYear &&
          coveredDate.getMonth() === selectedMonth &&
          coveredDate.getDate() === day
        ) {
          covered += 1;
        }

        // ------------------------------------------------------
        // Pending / Rejected
        //
        // If API provides these statuses, they are counted
        // against their respective date.
        // ------------------------------------------------------

        const status = getRecordStatus(item);

        if (
          status.pending &&
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === selectedMonth &&
          recordDate.getDate() === day
        ) {
          pending += 1;
        }

        if (
          status.rejected &&
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === selectedMonth &&
          recordDate.getDate() === day
        ) {
          rejected += 1;
        }

        // Keep visitDate intentionally available for live
        // status-based data if required by the API.
        void visitDate;
      });

      result.push({
        label: String(day),
        recorded,
        covered,
        pending,
        rejected,
      });
    }

    return result;
  }, [sortedTrendData, selectedYear, selectedMonth]);

  // ============================================================
  // Quarter Data
  //
  // Q1 = Jan 01 - Mar 31
  // Q2 = Apr 01 - Jun 30
  // Q3 = Jul 01 - Sep 30
  // Q4 = Oct 01 - Dec 31
  // ============================================================

  const quarterData = useMemo(() => {
    const startMonth = (selectedQuarter - 1) * 3;

    return MONTHS.slice(startMonth, startMonth + 3).map((month, index) => {
      const monthNumber = startMonth + index;

      let recorded = 0;
      let covered = 0;
      let pending = 0;
      let rejected = 0;

      sortedTrendData.forEach((item) => {
        const recordDate = getDate(item?.recordDate);

        const coveredDate = getDate(item?.coveredDate);

        // ----------------------------------------------------
        // Recorded
        // ----------------------------------------------------

        if (
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === monthNumber
        ) {
          recorded += 1;
        }

        // ----------------------------------------------------
        // Covered
        // ----------------------------------------------------

        if (
          coveredDate &&
          coveredDate.getFullYear() === selectedYear &&
          coveredDate.getMonth() === monthNumber
        ) {
          covered += 1;
        }

        // ----------------------------------------------------
        // Pending / Rejected
        // ----------------------------------------------------

        const status = getRecordStatus(item);

        if (
          status.pending &&
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === monthNumber
        ) {
          pending += 1;
        }

        if (
          status.rejected &&
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === monthNumber
        ) {
          rejected += 1;
        }
      });

      return {
        label: month,
        recorded,
        covered,
        pending,
        rejected,
      };
    });
  }, [sortedTrendData, selectedYear, selectedQuarter]);

  // ============================================================
  // Year Data
  //
  // January through December
  // ============================================================

  const yearData = useMemo(() => {
    return MONTHS.map((month, monthIndex) => {
      let recorded = 0;
      let covered = 0;
      let pending = 0;
      let rejected = 0;

      sortedTrendData.forEach((item) => {
        const recordDate = getDate(item?.recordDate);

        const coveredDate = getDate(item?.coveredDate);

        // ------------------------------------------------------
        // Recorded
        // ------------------------------------------------------

        if (
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === monthIndex
        ) {
          recorded += 1;
        }

        // ------------------------------------------------------
        // Covered
        // ------------------------------------------------------

        if (
          coveredDate &&
          coveredDate.getFullYear() === selectedYear &&
          coveredDate.getMonth() === monthIndex
        ) {
          covered += 1;
        }

        // ------------------------------------------------------
        // Pending / Rejected
        // ------------------------------------------------------

        const status = getRecordStatus(item);

        if (
          status.pending &&
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === monthIndex
        ) {
          pending += 1;
        }

        if (
          status.rejected &&
          recordDate &&
          recordDate.getFullYear() === selectedYear &&
          recordDate.getMonth() === monthIndex
        ) {
          rejected += 1;
        }
      });

      return {
        label: month,
        recorded,
        covered,
        pending,
        rejected,
      };
    });
  }, [sortedTrendData, selectedYear]);

  // ============================================================
  // Selected Chart Data
  // ============================================================

  const data = useMemo(() => {
    if (view === "month") {
      return monthData;
    }

    if (view === "quarter") {
      return quarterData;
    }

    return yearData;
  }, [view, monthData, quarterData, yearData]);

  // ============================================================
  // Current Status Summary
  //
  // For Month:
  // selected month total
  //
  // Quarter:
  // selected quarter total
  //
  // Year:
  // selected year total
  // ============================================================

  const statusData = useMemo(() => {
    return [
      {
        ...STATUS_CONFIG.recorded,
        value: data.reduce((sum, item) => sum + item.recorded, 0),
      },

      {
        ...STATUS_CONFIG.covered,
        value: data.reduce((sum, item) => sum + item.covered, 0),
      },

      {
        ...STATUS_CONFIG.pending,
        value: data.reduce((sum, item) => sum + item.pending, 0),
      },

      {
        ...STATUS_CONFIG.rejected,
        value: data.reduce((sum, item) => sum + item.rejected, 0),
      },
    ];
  }, [data]);

  // ============================================================
  // Fallback To Global Counts
  //
  // If trendData is not supplied, use counts so the chart
  // remains live with the dashboard counts.
  // ============================================================

  const finalStatusData = useMemo(() => {
    const hasTrendData = Array.isArray(trendData) && trendData.length > 0;

    if (hasTrendData) {
      return statusData;
    }

    return [
      {
        ...STATUS_CONFIG.recorded,
        value: Number(counts?.recorded ?? 0),
      },

      {
        ...STATUS_CONFIG.covered,
        value: Number(counts?.covered ?? 0),
      },

      {
        ...STATUS_CONFIG.pending,
        value: Number(counts?.pending ?? 0),
      },

      {
        ...STATUS_CONFIG.rejected,
        value: Number(counts?.rejected ?? 0),
      },
    ];
  }, [
    trendData,
    statusData,
    counts?.recorded,
    counts?.covered,
    counts?.pending,
    counts?.rejected,
  ]);

  // ============================================================
  // Total
  // ============================================================

  const total = useMemo(() => {
    return finalStatusData.reduce((sum, item) => sum + item.value, 0);
  }, [finalStatusData]);

  // ============================================================
  // Animation
  // ============================================================

  useEffect(() => {
    setProgress(0);

    let start;

    let animationFrame;

    const animate = (timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const elapsed = timestamp - start;

      const next = Math.min(elapsed / 1000, 1);

      setProgress(next);

      if (next < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [view, selectedYear, selectedMonth, selectedQuarter, finalStatusData]);

  // ============================================================
  // Description
  // ============================================================

  const getDescription = () => {
    if (view === "month") {
      return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    }

    if (view === "quarter") {
      const startMonth = (selectedQuarter - 1) * 3;

      const endMonth = startMonth + 2;

      return `${MONTH_NAMES[startMonth]} - ${MONTH_NAMES[endMonth]} ${selectedYear}`;
    }

    return `${selectedYear}`;
  };

  // ============================================================
  // Percentage
  // ============================================================

  const getPercentage = (value) => {
    if (!total) {
      return 0;
    }

    return Math.round((value / total) * 100);
  };

  // ============================================================
  // Pie
  // ============================================================

  let currentAngle = -90;

  const radius = 75;

  const center = 100;

  return (
    <div className="bg-background border-border flex h-[430px] min-w-0 flex-col overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-6">
      {/* ======================================================
          Header
      ====================================================== */}

      <div className="mb-3 flex h-[82px] shrink-0 items-start justify-between gap-4">
        {/* ==================================================
            Title
        ================================================== */}

        <div className="min-w-0 flex-1 pt-1">
          <p className="text-text-secondary text-xs leading-normal">
            Zerodose Distribution
          </p>

          <h2 className="text-text mt-1 text-lg leading-normal font-bold">
            Status Overview
          </h2>

          <p className="text-text-secondary mt-1 text-xs leading-normal">
            {getDescription()}
          </p>
        </div>

        {/* ==================================================
            Right Controls
        ================================================== */}

        <div className="flex w-auto shrink-0 flex-col items-end gap-2">
          {/* ==================================================
              View Tabs
          ================================================== */}

          <div className="bg-surface border-border flex h-9 shrink-0 items-center rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`h-7 rounded-md px-3 text-xs leading-none font-medium transition ${
                view === "month"
                  ? "bg-primary text-surface shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() => setView("quarter")}
              className={`h-7 rounded-md px-3 text-xs leading-none font-medium transition ${
                view === "quarter"
                  ? "bg-primary text-surface shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              Quarter
            </button>

            <button
              type="button"
              onClick={() => setView("year")}
              className={`h-7 rounded-md px-3 text-xs leading-none font-medium transition ${
                view === "year"
                  ? "bg-primary text-surface shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              Year
            </button>
          </div>

          {/* ==================================================
              Selectors
          ================================================== */}

          <div className="flex h-9 items-center gap-2">
            {/* Year */}

            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="border-border bg-background text-text h-9 min-w-[72px] rounded-lg border px-2 text-xs outline-none"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Month */}

            {view === "month" && (
              <select
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(Number(event.target.value))
                }
                className="border-border bg-background text-text h-9 min-w-[95px] rounded-lg border px-2 text-xs outline-none"
              >
                {MONTH_NAMES.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            )}

            {/* Quarter */}

            {view === "quarter" && (
              <select
                value={selectedQuarter}
                onChange={(event) =>
                  setSelectedQuarter(Number(event.target.value))
                }
                className="border-border bg-background text-text h-9 min-w-[82px] rounded-lg border px-2 text-xs outline-none"
              >
                <option value={1}>Q1</option>

                <option value={2}>Q2</option>

                <option value={3}>Q3</option>

                <option value={4}>Q4</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          Chart Content
      ====================================================== */}

      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
        <div className="flex w-full items-center justify-center gap-8">
          {/* ==================================================
              Pie Chart
          ================================================== */}

          <div className="relative h-52 w-52 shrink-0">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              {/* ==================================================
                  Empty State
              ================================================== */}

              {total === 0 && (
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="var(--surface)"
                  stroke="var(--border)"
                  strokeWidth="2"
                />
              )}

              {/* ==================================================
                  Pie Segments
              ================================================== */}

              {total > 0 &&
                finalStatusData.map((item) => {
                  if (item.value <= 0) {
                    return null;
                  }

                  const angle = (item.value / total) * 360;

                  const startAngle = currentAngle;

                  const animatedAngle = angle * progress;

                  const endAngle = startAngle + animatedAngle;

                  currentAngle += angle;

                  // ========================================================
                  // Full Circle Fix
                  // ========================================================
                  // SVG arc cannot reliably draw a complete 360° arc
                  // when start and end points are exactly the same.
                  // So when the segment reaches 100%, use a circle.
                  // ========================================================

                  if (animatedAngle >= 359.99) {
                    return (
                      <circle
                        key={item.name}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill={item.color}
                        stroke="var(--background)"
                        strokeWidth="2"
                      />
                    );
                  }

                  const startX =
                    center + radius * Math.cos((startAngle * Math.PI) / 180);

                  const startY =
                    center + radius * Math.sin((startAngle * Math.PI) / 180);

                  const endX =
                    center + radius * Math.cos((endAngle * Math.PI) / 180);

                  const endY =
                    center + radius * Math.sin((endAngle * Math.PI) / 180);

                  const largeArc = animatedAngle > 180 ? 1 : 0;

                  const path = `
      M ${center} ${center}
      L ${startX} ${startY}
      A ${radius} ${radius}
        0 ${largeArc} 1
        ${endX} ${endY}
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

              {/* ==================================================
                  Center
              ================================================== */}

              <circle cx="100" cy="100" r="45" fill="var(--background)" />

              <text
                x="100"
                y="96"
                textAnchor="middle"
                className="fill-text text-[20px] font-bold"
              >
                {Math.round(total * progress)}
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

          {/* ==================================================
              Legend
          ================================================== */}

          <div className="w-full max-w-[180px] space-y-3">
            {finalStatusData.map((item) => {
              const percentage = getPercentage(item.value);

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
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
    </div>
  );
}
