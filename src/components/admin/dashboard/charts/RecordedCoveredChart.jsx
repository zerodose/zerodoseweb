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

const BAR_CONFIG = {
  recorded: {
    label: "Recorded",
    color: "var(--primary)",
  },

  visited: {
    label: "Visited",
    color: "#f59e0b",
  },

  covered: {
    label: "Covered",
    color: "#22c55e",
  },
};

export default function RecordedCoveredChart({ counts = {}, trendData = [] }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [view, setView] = useState("month");

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const [showVisited, setShowVisited] = useState(false);

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
  // Sorted Trend Data
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
  // Month Data
  //
  // Complete selected month:
  // 01 -> last day
  // ============================================================

  const monthData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    let recorded = 0;
    let visited = 0;
    let covered = 0;

    sortedTrendData.forEach((item) => {
      const recordDate = getDate(item?.recordDate);
      const visitDate = getDate(item?.visitDate);
      const coveredDate = getDate(item?.coveredDate);

      // --------------------------------------------------------
      // Recorded
      // --------------------------------------------------------

      if (
        recordDate &&
        recordDate.getFullYear() === selectedYear &&
        recordDate.getMonth() === selectedMonth
      ) {
        recorded += 1;
      }

      // --------------------------------------------------------
      // Visited
      // --------------------------------------------------------

      if (
        visitDate &&
        visitDate.getFullYear() === selectedYear &&
        visitDate.getMonth() === selectedMonth
      ) {
        visited += 1;
      }

      // --------------------------------------------------------
      // Covered
      // --------------------------------------------------------

      if (
        coveredDate &&
        coveredDate.getFullYear() === selectedYear &&
        coveredDate.getMonth() === selectedMonth
      ) {
        covered += 1;
      }
    });

    return [
      {
        label: MONTHS[selectedMonth],
        recorded,
        visited,
        covered,
        daysInMonth,
      },
    ];
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
      let visited = 0;
      let covered = 0;

      sortedTrendData.forEach((item) => {
        const recordDate = getDate(item?.recordDate);
        const visitDate = getDate(item?.visitDate);
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
        // Visited
        // ----------------------------------------------------

        if (
          visitDate &&
          visitDate.getFullYear() === selectedYear &&
          visitDate.getMonth() === monthNumber
        ) {
          visited += 1;
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
      });

      return {
        label: month,
        recorded,
        visited,
        covered,
      };
    });
  }, [sortedTrendData, selectedYear, selectedQuarter]);

  // ============================================================
  // Year Data
  //
  // January -> December
  // ============================================================

  const yearData = useMemo(() => {
    return MONTHS.map((month, monthIndex) => {
      let recorded = 0;
      let visited = 0;
      let covered = 0;

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
          recordDate.getMonth() === monthIndex
        ) {
          recorded += 1;
        }

        // ------------------------------------------------------
        // Visited
        // ------------------------------------------------------

        if (
          visitDate &&
          visitDate.getFullYear() === selectedYear &&
          visitDate.getMonth() === monthIndex
        ) {
          visited += 1;
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
      });

      return {
        label: month,
        recorded,
        visited,
        covered,
      };
    });
  }, [sortedTrendData, selectedYear]);

  // ============================================================
  // Selected Chart Data
  // ============================================================

  const chartData = useMemo(() => {
    if (view === "month") {
      return monthData;
    }

    if (view === "quarter") {
      return quarterData;
    }

    return yearData;
  }, [view, monthData, quarterData, yearData]);

  // ============================================================
  // Fallback To Global Counts
  //
  // If trendData is unavailable, keep chart live using counts.
  // ============================================================

  const finalChartData = useMemo(() => {
    const hasTrendData = Array.isArray(trendData) && trendData.length > 0;

    if (hasTrendData) {
      return chartData;
    }

    if (view === "month") {
      return [
        {
          label: MONTHS[selectedMonth],
          recorded: Number(counts?.recorded ?? 0),
          visited: Number(counts?.visited ?? 0),
          covered: Number(counts?.covered ?? 0),
        },
      ];
    }

    if (view === "quarter") {
      return [
        {
          label: "Q",
          recorded: Number(counts?.recorded ?? 0),
          visited: Number(counts?.visited ?? 0),
          covered: Number(counts?.covered ?? 0),
        },
      ];
    }

    return [
      {
        label: String(selectedYear),
        recorded: Number(counts?.recorded ?? 0),
        visited: Number(counts?.visited ?? 0),
        covered: Number(counts?.covered ?? 0),
      },
    ];
  }, [
    trendData,
    chartData,
    view,
    selectedMonth,
    selectedYear,
    counts?.recorded,
    counts?.visited,
    counts?.covered,
  ]);

  // ============================================================
  // Maximum Value
  // ============================================================

  const maxValue = useMemo(() => {
    const values = finalChartData.flatMap((item) => {
      const result = [Number(item.recorded || 0), Number(item.covered || 0)];

      if (showVisited) {
        result.push(Number(item.visited || 0));
      }

      return result;
    });

    return Math.max(...values, 1);
  }, [finalChartData, showVisited]);

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

      const next = Math.min(elapsed / 900, 1);

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
  }, [
    view,
    selectedYear,
    selectedMonth,
    selectedQuarter,
    showVisited,
    finalChartData,
  ]);

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
  // Bars
  // ============================================================

  const getBars = (item) => {
    const bars = [
      {
        key: "recorded",
        ...BAR_CONFIG.recorded,
        value: Number(item.recorded || 0),
      },
    ];

    if (showVisited) {
      bars.push({
        key: "visited",
        ...BAR_CONFIG.visited,
        value: Number(item.visited || 0),
      });
    }

    bars.push({
      key: "covered",
      ...BAR_CONFIG.covered,
      value: Number(item.covered || 0),
    });

    return bars;
  };

  // ============================================================
  // UI
  // ============================================================

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
            Zerodose Comparison
          </p>

          <h2 className="text-text mt-1 text-lg leading-normal font-bold">
            Recorded vs Covered
          </h2>

          <p className="text-text-secondary mt-1 text-xs leading-normal">
            {getDescription()}
          </p>
        </div>

        {/* ==================================================
            Controls
        ================================================== */}

        <div className="flex w-auto shrink-0 flex-col items-end gap-2">
          {/* View Tabs */}

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

          {/* Selectors */}

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
          Legend + Visit Checkbox
      ====================================================== */}

      <div className="mb-2 flex min-h-5 shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Recorded */}

          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: BAR_CONFIG.recorded.color,
              }}
            />

            <span className="text-text-secondary text-xs">Recorded</span>
          </div>

          {/* Covered */}

          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: BAR_CONFIG.covered.color,
              }}
            />

            <span className="text-text-secondary text-xs">Covered</span>
          </div>

          {/* Visited */}

          {showVisited && (
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: BAR_CONFIG.visited.color,
                }}
              />

              <span className="text-text-secondary text-xs">Visited</span>
            </div>
          )}
        </div>

        {/* Visit Checkbox */}

        <label className="text-text-secondary flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={showVisited}
            onChange={(event) => setShowVisited(event.target.checked)}
            className="accent-primary h-3.5 w-3.5 cursor-pointer"
          />
          Show Visited
        </label>
      </div>

      {/* ======================================================
          Chart
      ====================================================== */}

      <div className="flex min-h-0 w-full flex-1 items-end overflow-hidden">
        <div className="flex h-full w-full items-end gap-2 sm:gap-4">
          {finalChartData.map((item) => {
            const bars = getBars(item);

            return (
              <div
                key={item.label}
                className="relative flex h-full min-w-0 flex-1 items-end justify-center"
              >
                {/* ==================================================
                    Bars
                ================================================== */}

                <div className="flex h-full w-full max-w-[130px] items-end justify-center gap-1.5 sm:gap-2">
                  {bars.map((bar) => {
                    const targetHeight = (bar.value / maxValue) * 100;

                    const animatedHeight = targetHeight * progress;

                    return (
                      <div
                        key={bar.key}
                        className="flex h-full flex-1 items-end justify-center"
                      >
                        <div
                          className="w-full rounded-t-lg transition-[height] duration-100 ease-out"
                          style={{
                            height: `${animatedHeight}%`,
                            backgroundColor: bar.color,
                            maxWidth: "36px",
                            minHeight:
                              bar.value > 0 && progress > 0 ? "2px" : "0px",
                          }}
                          title={`${bar.label}: ${bar.value}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* ==================================================
                    X Axis Label
                ================================================== */}

                <span className="text-text-secondary absolute bottom-0 translate-y-full pt-2 text-xs">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          Bottom Space For Labels
      ====================================================== */}

      <div className="h-6 shrink-0" />
    </div>
  );
}
