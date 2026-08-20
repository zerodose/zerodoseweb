"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const YEARS = [2026, 2025, 2024, 2023];

const LINE_CONFIG = {
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

export default function CampaignChart({ counts = {}, trendData = [] }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [view, setView] = useState("month");

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const [progress, setProgress] = useState(0);

  const animationRef = useRef(null);

  // ============================================================
  // Days In Selected Month
  // ============================================================

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // ============================================================
  // Normalize Date
  // ============================================================

  const getDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  // ============================================================
  // Complete Trend Data
  //
  // Sort everything first.
  // Then Month / Quarter / Year views are generated from this.
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

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return aDate.getTime() - bDate.getTime();
    });
  }, [trendData]);

  // ============================================================
  // Build Complete Daily Data
  //
  // Every record contributes to the appropriate status.
  //
  // recorded -> recordDate
  // visited  -> visitDate
  // covered  -> coveredDate
  //
  // Cumulative values are used so the chart shows trend.
  // ============================================================

  const dailyData = useMemo(() => {
    const dailyMap = new Map();

    sortedTrendData.forEach((item) => {
      // --------------------------------------------------------
      // Recorded
      // --------------------------------------------------------

      if (item?.vaccinationStatus === "recorded" || item?.recordDate) {
        const date = getDate(item?.recordDate);

        if (date) {
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();

          const key = `${year}-${month}-${day}`;

          if (!dailyMap.has(key)) {
            dailyMap.set(key, {
              year,
              month,
              day,
              recorded: 0,
              visited: 0,
              covered: 0,
            });
          }

          dailyMap.get(key).recorded += 1;
        }
      }

      // --------------------------------------------------------
      // Visited
      // --------------------------------------------------------

      if (item?.visitDate) {
        const date = getDate(item.visitDate);

        if (date) {
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();

          const key = `${year}-${month}-${day}`;

          if (!dailyMap.has(key)) {
            dailyMap.set(key, {
              year,
              month,
              day,
              recorded: 0,
              visited: 0,
              covered: 0,
            });
          }

          dailyMap.get(key).visited += 1;
        }
      }

      // --------------------------------------------------------
      // Covered
      // --------------------------------------------------------

      if (item?.coveredDate) {
        const date = getDate(item.coveredDate);

        if (date) {
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();

          const key = `${year}-${month}-${day}`;

          if (!dailyMap.has(key)) {
            dailyMap.set(key, {
              year,
              month,
              day,
              recorded: 0,
              visited: 0,
              covered: 0,
            });
          }

          dailyMap.get(key).covered += 1;
        }
      }
    });

    return [...dailyMap.values()].sort((a, b) => {
      const aDate = new Date(a.year, a.month, a.day);
      const bDate = new Date(b.year, b.month, b.day);

      return aDate - bDate;
    });
  }, [sortedTrendData]);

  // ============================================================
  // Month Data
  //
  // Filter complete daily data for selected month.
  // Then make it cumulative.
  // ============================================================

  const monthData = useMemo(() => {
    const filtered = dailyData
      .filter(
        (item) => item.year === selectedYear && item.month === selectedMonth,
      )
      .sort((a, b) => a.day - b.day);

    let recorded = 0;
    let visited = 0;
    let covered = 0;

    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const item = filtered.find((entry) => entry.day === day);

      recorded += item?.recorded || 0;
      visited += item?.visited || 0;
      covered += item?.covered || 0;

      result.push({
        label: String(day),
        recorded,
        visited,
        covered,
      });
    }

    return result;
  }, [dailyData, selectedYear, selectedMonth, daysInMonth]);

  // ============================================================
  // Quarter Data
  //
  // Filter selected year + selected quarter.
  // Aggregate daily data into months.
  // ============================================================

  // ============================================================
  // Quarter Data
  //
  // Q1 = Jan, Feb, Mar
  // Q2 = Apr, May, Jun
  // Q3 = Jul, Aug, Sep
  // Q4 = Oct, Nov, Dec
  //
  // Each month includes the complete month's data.
  // Values are cumulative across the selected quarter.
  // ============================================================

  // ============================================================
  // Quarter Data
  //
  // Q1 = 01-Jan to 31-Mar
  // Q2 = 01-Apr to 30-Jun
  // Q3 = 01-Jul to 30-Sep
  // Q4 = 01-Oct to 31-Dec
  //
  // Complete daily data is used.
  // Nothing from the selected quarter is skipped.
  // ============================================================

  const quarterData = useMemo(() => {
    const startMonth = (selectedQuarter - 1) * 3;
    const endMonth = startMonth + 2;

    const filtered = dailyData
      .filter(
        (item) =>
          item.year === selectedYear &&
          item.month >= startMonth &&
          item.month <= endMonth,
      )
      .sort((a, b) => {
        const aDate = new Date(a.year, a.month, a.day);
        const bDate = new Date(b.year, b.month, b.day);

        return aDate - bDate;
      });

    // Complete quarter date range
    const startDate = new Date(selectedYear, startMonth, 1);
    const endDate = new Date(selectedYear, endMonth + 1, 0);

    const result = [];

    let recorded = 0;
    let visited = 0;
    let covered = 0;

    // ----------------------------------------------------------
    // Add every day from quarter start to quarter end
    // ----------------------------------------------------------

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      const item = filtered.find(
        (entry) =>
          entry.year === year && entry.month === month && entry.day === day,
      );

      recorded += item?.recorded || 0;
      visited += item?.visited || 0;
      covered += item?.covered || 0;

      result.push({
        label: `${day}`,
        month,
        day,
        recorded,
        visited,
        covered,
      });
    }

    return result;
  }, [dailyData, selectedYear, selectedQuarter]);

  // ============================================================
  // Year Data
  //
  // Filter selected year.
  // Aggregate complete daily data into months.
  // ============================================================

  const yearData = useMemo(() => {
    return MONTHS.map((month, monthIndex) => {
      const monthItems = dailyData.filter(
        (item) => item.year === selectedYear && item.month === monthIndex,
      );

      const recorded = monthItems.reduce(
        (total, item) => total + item.recorded,
        0,
      );

      const visited = monthItems.reduce(
        (total, item) => total + item.visited,
        0,
      );

      const covered = monthItems.reduce(
        (total, item) => total + item.covered,
        0,
      );

      return {
        label: month,
        recorded,
        visited,
        covered,
      };
    });
  }, [dailyData, selectedYear]);

  // ============================================================
  // Chart Data
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
  // Animation
  // ============================================================

  useEffect(() => {
    setProgress(0);

    let start;

    const animate = (timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const elapsed = timestamp - start;

      const next = Math.min(elapsed / 1000, 1);

      setProgress(next);

      if (next < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [view, selectedYear, selectedMonth, selectedQuarter, trendData]);

  // ============================================================
  // Chart Dimensions
  // ============================================================

  const width = 700;
  const height = 280;

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;

  const chartHeight = height - paddingTop - paddingBottom;

  // ============================================================
  // Maximum Value
  // ============================================================

  const maxValue = Math.max(
    ...data.flatMap((item) => [item.recorded, item.visited, item.covered]),
    1,
  );

  // ============================================================
  // Points
  // ============================================================

  const points = useMemo(() => {
    return data.map((item, index) => {
      const denominator = Math.max(data.length - 1, 1);

      const x = paddingLeft + (index / denominator) * chartWidth;

      return {
        ...item,

        x,

        recordedY:
          paddingTop + chartHeight - (item.recorded / maxValue) * chartHeight,

        visitedY:
          paddingTop + chartHeight - (item.visited / maxValue) * chartHeight,

        coveredY:
          paddingTop + chartHeight - (item.covered / maxValue) * chartHeight,
      };
    });
  }, [data, maxValue, chartWidth, chartHeight]);

  // ============================================================
  // Animation Helper
  // ============================================================

  const getAnimatedY = (y) => {
    const bottom = paddingTop + chartHeight;

    return bottom + (y - bottom) * progress;
  };

  // ============================================================
  // Line Points
  // ============================================================

  const recordedPoints = points
    .map((point) => `${point.x},${getAnimatedY(point.recordedY)}`)
    .join(" ");

  const visitedPoints = points
    .map((point) => `${point.x},${getAnimatedY(point.visitedY)}`)
    .join(" ");

  const coveredPoints = points
    .map((point) => `${point.x},${getAnimatedY(point.coveredY)}`)
    .join(" ");

  // ============================================================
  // Covered Area
  // ============================================================

  const coveredAreaPoints = [
    `${points[0]?.x || paddingLeft},${paddingTop + chartHeight}`,

    ...points.map((point) => `${point.x},${getAnimatedY(point.coveredY)}`),

    `${
      points[points.length - 1]?.x || width - paddingRight
    },${paddingTop + chartHeight}`,
  ].join(" ");

  // ============================================================
  // Header Description
  // ============================================================

  const getDescription = () => {
    if (view === "month") {
      return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    }

    if (view === "quarter") {
      return `Q${selectedQuarter} ${selectedYear}`;
    }

    return `${selectedYear}`;
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
            Campaign Performance
          </p>

          <h2 className="text-text mt-1 text-lg leading-normal font-bold">
            Zerodose Trend
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
          Legend
      ====================================================== */}

      <div className="mb-2 flex h-5 shrink-0 items-center gap-4">
        {Object.entries(LINE_CONFIG).map(([key, item]) => (
          <div key={key} className="flex h-5 items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span className="text-text-secondary text-xs leading-normal">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* ======================================================
          Chart
      ====================================================== */}

      <div className="flex min-h-0 w-full flex-1 items-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-full w-full"
        >
          {/* ==================================================
              Grid
          ================================================== */}

          {[0, 1, 2, 3, 4].map((item) => {
            const y = paddingTop + (item / 4) * chartHeight;

            return (
              <line
                key={item}
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="4 5"
              />
            );
          })}

          {/* ==================================================
              Area
          ================================================== */}

          <polygon
            points={coveredAreaPoints}
            fill="var(--primary)"
            opacity="0.06"
          />

          {/* ==================================================
              Recorded
          ================================================== */}

          <polyline
            points={recordedPoints}
            fill="none"
            stroke={LINE_CONFIG.recorded.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ==================================================
              Visited
          ================================================== */}

          <polyline
            points={visitedPoints}
            fill="none"
            stroke={LINE_CONFIG.visited.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ==================================================
              Covered
          ================================================== */}

          <polyline
            points={coveredPoints}
            fill="none"
            stroke={LINE_CONFIG.covered.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ==================================================
              Points + Labels
          ================================================== */}

          {points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              {/* Recorded */}

              <circle
                cx={point.x}
                cy={getAnimatedY(point.recordedY)}
                r="3.5"
                fill="var(--background)"
                stroke={LINE_CONFIG.recorded.color}
                strokeWidth="2"
              />

              {/* Visited */}

              <circle
                cx={point.x}
                cy={getAnimatedY(point.visitedY)}
                r="3.5"
                fill="var(--background)"
                stroke={LINE_CONFIG.visited.color}
                strokeWidth="2"
              />

              {/* Covered */}

              <circle
                cx={point.x}
                cy={getAnimatedY(point.coveredY)}
                r="3.5"
                fill="var(--background)"
                stroke={LINE_CONFIG.covered.color}
                strokeWidth="2"
              />

              {/* X Axis Label */}

              <text
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-text-secondary text-[15px] font-semibold text-black/50"
              >
                {view === "quarter"
                  ? point.day === 1
                    ? MONTHS[point.month]
                    : point.day ===
                        new Date(point.year, point.month + 1, 0).getDate()
                      ? MONTHS[point.month]
                      : ""
                  : point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
