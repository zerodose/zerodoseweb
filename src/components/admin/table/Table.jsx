"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Pagination from "./Pagination";

export default function Table({
  data = [],
  hiddenColumns = [],
  columnTitles = {},
  onRowClick,
  rowKey = "_id",

  searchable = true,
  searchPlaceholder = "Search...",

  loading = false,
  emptyMessage = "No data found",

  // ============================================================
  // Pagination
  // ============================================================

  pageSizeOptions = [10, 20, 30, 50],
  defaultPageSize = 10,

  // ============================================================
  // Add Button
  // ============================================================

  addButton = false,
  addButtonText = "Add",
  onAdd,

  // ============================================================
  // Export
  // ============================================================

  exportButton = true,
  onExportPDF,
  onExportExcel,

  // ============================================================
  // Extra Actions
  // ============================================================

  actions = [],
}) {
  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(Math.min(defaultPageSize, 50));

  const [selectedRows, setSelectedRows] = useState([]);

  const [filterOpen, setFilterOpen] = useState(false);

  const [downloadOpen, setDownloadOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState(null);

  const [filterValues, setFilterValues] = useState({});

  // ============================================================
  // Columns
  // ============================================================

  const columns = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const keys = [...new Set(data.flatMap((item) => Object.keys(item)))];

    return keys.filter((key) => !hiddenColumns.includes(key));
  }, [data, hiddenColumns]);

  // ============================================================
  // Column Title
  // ============================================================

  const getColumnTitle = (key) => {
    if (columnTitles[key]) {
      return columnTitles[key];
    }

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  };

  // ============================================================
  // Format Value
  // ============================================================

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // ============================================================
  // Detect Date Column
  // ============================================================

  const dateColumns = useMemo(() => {
    return columns.filter((column) => {
      const key = column.toLowerCase();

      return (
        key.includes("date") ||
        key.includes("createdat") ||
        key.includes("updatedat")
      );
    });
  }, [columns]);

  // ============================================================
  // Get Unique Values
  // ============================================================

  const getUniqueValues = (column) => {
    const values = data
      .map((row) => row[column])
      .filter(
        (value) =>
          value !== null && value !== undefined && String(value).trim() !== "",
      )
      .map((value) => String(value));

    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  };

  // ============================================================
  // Detect Filterable Columns
  // ============================================================

  const filterableColumns = useMemo(() => {
    return columns.filter((column) => {
      const uniqueValues = getUniqueValues(column);

      return uniqueValues.length > 0;
    });
  }, [columns, data]);

  // ============================================================
  // Available Years
  // ============================================================

  const availableYears = useMemo(() => {
    const years = [];

    dateColumns.forEach((column) => {
      data.forEach((row) => {
        const value = row[column];

        if (!value) {
          return;
        }

        const date = new Date(value);

        if (!Number.isNaN(date.getTime())) {
          years.push(date.getFullYear());
        }
      });
    });

    return [...new Set(years)].sort((a, b) => b - a);
  }, [data, dateColumns]);

  // ============================================================
  // Months
  // ============================================================

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // ============================================================
  // Search
  // ============================================================

  const searchedData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }

    const query = search.toLowerCase().trim();

    return data.filter((row) =>
      columns.some((column) => {
        const value = formatValue(row[column]).toLowerCase();

        return value.includes(query);
      }),
    );
  }, [data, search, columns]);

  // ============================================================
  // Apply Filters
  // ============================================================

  const filteredData = useMemo(() => {
    return searchedData.filter((row) => {
      // ----------------------------------------------------------
      // Normal column filters
      // ----------------------------------------------------------

      for (const column of filterableColumns) {
        const selectedValues = filterValues[column];

        if (Array.isArray(selectedValues) && selectedValues.length > 0) {
          const rowValue = String(row[column] ?? "");

          if (!selectedValues.includes(rowValue)) {
            return false;
          }
        }
      }

      // ----------------------------------------------------------
      // Date Range
      // ----------------------------------------------------------

      const dateRange = filterValues.__dateRange;

      if (dateRange?.column) {
        const value = row[dateRange.column];

        if (!value) {
          return false;
        }

        const rowDate = new Date(value);

        if (Number.isNaN(rowDate.getTime())) {
          return false;
        }

        if (dateRange.from) {
          const fromDate = new Date(`${dateRange.from}T00:00:00`);

          if (rowDate < fromDate) {
            return false;
          }
        }

        if (dateRange.to) {
          const toDate = new Date(`${dateRange.to}T23:59:59`);

          if (rowDate > toDate) {
            return false;
          }
        }
      }

      // ----------------------------------------------------------
      // Year
      // ----------------------------------------------------------

      const selectedYear = filterValues.__year;

      if (
        selectedYear !== undefined &&
        selectedYear !== null &&
        selectedYear !== ""
      ) {
        const yearColumn = filterValues.__yearColumn;

        if (yearColumn) {
          const value = row[yearColumn];

          if (!value) {
            return false;
          }

          const date = new Date(value);

          if (
            Number.isNaN(date.getTime()) ||
            date.getFullYear() !== Number(selectedYear)
          ) {
            return false;
          }
        }
      }

      // ----------------------------------------------------------
      // Months
      // ----------------------------------------------------------

      const selectedMonths = filterValues.__months;

      if (Array.isArray(selectedMonths) && selectedMonths.length > 0) {
        const monthColumn = filterValues.__monthColumn;

        if (monthColumn) {
          const value = row[monthColumn];

          if (!value) {
            return false;
          }

          const date = new Date(value);

          if (Number.isNaN(date.getTime())) {
            return false;
          }

          if (!selectedMonths.includes(date.getMonth())) {
            return false;
          }
        }
      }

      return true;
    });
  }, [searchedData, filterableColumns, filterValues]);

  // ============================================================
  // Sorting
  // ============================================================

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }

    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      const first = a[sortConfig.key];
      const second = b[sortConfig.key];

      if (first === null || first === undefined) {
        return 1;
      }

      if (second === null || second === undefined) {
        return -1;
      }

      const firstNumber = Number(first);
      const secondNumber = Number(second);

      let comparison;

      if (
        !Number.isNaN(firstNumber) &&
        !Number.isNaN(secondNumber) &&
        first !== "" &&
        second !== ""
      ) {
        comparison = firstNumber - secondNumber;
      } else {
        comparison = String(first).localeCompare(String(second), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // ============================================================
  // Pagination
  // ============================================================

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // ============================================================
  // Sorting
  // ============================================================

  const handleSort = (column) => {
    setPage(1);

    setSortConfig((prev) => {
      if (prev.key !== column) {
        return {
          key: column,
          direction: "asc",
        };
      }

      if (prev.direction === "asc") {
        return {
          key: column,
          direction: "desc",
        };
      }

      return {
        key: null,
        direction: null,
      };
    });
  };

  // ============================================================
  // Row ID
  // ============================================================

  const getRowId = (row, index) => {
    return row[rowKey] ?? index;
  };

  // ============================================================
  // Select Row
  // ============================================================

  const toggleRow = (row, index) => {
    const id = getRowId(row, index);

    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  // ============================================================
  // Current Page Selection
  // ============================================================

  const currentPageIds = paginatedData.map((row, index) =>
    getRowId(row, (currentPage - 1) * pageSize + index),
  );

  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedRows.includes(id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedRows((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  // ============================================================
  // Selected Data
  // ============================================================

  const selectedData = useMemo(() => {
    if (!selectedRows.length) {
      return [];
    }

    return sortedData.filter((row, index) => {
      const id = getRowId(row, index);

      return selectedRows.includes(id);
    });
  }, [sortedData, selectedRows]);

  // ============================================================
  // Download Data
  // ============================================================

  const dataToDownload = selectedRows.length > 0 ? selectedData : sortedData;

  // ============================================================
  // Filter Helpers
  // ============================================================

  const setColumnFilter = (column, values) => {
    setFilterValues((prev) => ({
      ...prev,
      [column]: values,
    }));

    setPage(1);
  };

  const toggleMonth = (month) => {
    setFilterValues((prev) => {
      const current = prev.__months || [];

      const exists = current.includes(month);

      return {
        ...prev,
        __months: exists
          ? current.filter((item) => item !== month)
          : [...current, month],
      };
    });

    setPage(1);
  };

  const clearFilters = () => {
    setFilterValues({});
    setActiveFilter(null);
    setPage(1);
  };

  // ============================================================
  // Active Filter Count
  // ============================================================

  const activeFilterCount = useMemo(() => {
    return Object.entries(filterValues).filter(([key, value]) => {
      if (key === "__dateRange") {
        return value?.from || value?.to;
      }

      if (key === "__year") {
        return value !== undefined && value !== "";
      }

      if (key === "__months") {
        return Array.isArray(value) && value.length > 0;
      }

      return Array.isArray(value) && value.length > 0;
    }).length;
  }, [filterValues]);

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="bg-background border-border flex h-64 items-center justify-center rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />

          <span className="text-text-secondary text-sm">Loading data...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="bg-background border-border overflow-hidden rounded-lg border shadow-sm">
      {/* ======================================================
          Toolbar
      ====================================================== */}

      <div className="border-border flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}

        {searchable ? (
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="border-border bg-background text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary-light h-10 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
            />
          </div>
        ) : (
          <div />
        )}

        {/* ==================================================
            Actions
        ================================================== */}

        <div className="flex flex-wrap items-center gap-2">
          {/* =================================================
              Add
          ================================================= */}

          {addButton && (
            <button
              type="button"
              onClick={onAdd}
              className="bg-primary text-primary-foreground hover:bg-primary-dark flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition"
            >
              <Plus size={16} />

              <span>{addButtonText}</span>
            </button>
          )}

          {/* =================================================
              Extra Actions
          ================================================= */}

          {actions.map((action, index) => (
            <button
              key={action.id || index}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className="text-text hover:bg-surface border-border flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action.icon}

              <span>{action.label}</span>
            </button>
          ))}

          {/* =================================================
              Filter
          ================================================= */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFilterOpen((prev) => !prev);
                setDownloadOpen(false);
              }}
              className="text-text hover:bg-surface border-border flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition"
            >
              <SlidersHorizontal size={16} />

              <span>Filter</span>

              {activeFilterCount > 0 && (
                <span className="bg-primary flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}

              <ChevronDown
                size={15}
                className={`transition-transform ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {filterOpen && (
              <div className="border-border bg-background absolute top-12 right-0 z-50 w-80 rounded-xl border p-3 shadow-xl">
                {/* Filter Header */}

                <div className="mb-3 flex items-center justify-between">
                  <p className="text-text text-sm font-semibold">Filter Data</p>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Filter Options */}

                <div className="max-h-[420px] space-y-2 overflow-y-auto">
                  {/* Date Range */}

                  {dateColumns.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter(
                          activeFilter === "date" ? null : "date",
                        );
                      }}
                      className="border-border text-text hover:bg-surface flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar size={16} />
                        Date Range
                      </span>

                      <ChevronDown
                        size={15}
                        className={`transition-transform ${
                          activeFilter === "date" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

                  {activeFilter === "date" && (
                    <div className="bg-surface space-y-3 rounded-lg p-3">
                      <div>
                        <label className="text-text-secondary mb-1 block text-xs">
                          Date Column
                        </label>

                        <select
                          value={filterValues.__dateRange?.column || ""}
                          onChange={(event) =>
                            setFilterValues((prev) => ({
                              ...prev,
                              __dateRange: {
                                ...prev.__dateRange,
                                column: event.target.value,
                              },
                            }))
                          }
                          className="border-border bg-background text-text h-9 w-full rounded-lg border px-2 text-sm outline-none"
                        >
                          <option value="">Select date column</option>

                          {dateColumns.map((column) => (
                            <option key={column} value={column}>
                              {getColumnTitle(column)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-text-secondary mb-1 block text-xs">
                          From Date
                        </label>

                        <input
                          type="date"
                          value={filterValues.__dateRange?.from || ""}
                          onChange={(event) =>
                            setFilterValues((prev) => ({
                              ...prev,
                              __dateRange: {
                                ...prev.__dateRange,
                                from: event.target.value,
                              },
                            }))
                          }
                          className="border-border bg-background text-text h-9 w-full rounded-lg border px-2 text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-text-secondary mb-1 block text-xs">
                          To Date
                        </label>

                        <input
                          type="date"
                          value={filterValues.__dateRange?.to || ""}
                          onChange={(event) =>
                            setFilterValues((prev) => ({
                              ...prev,
                              __dateRange: {
                                ...prev.__dateRange,
                                to: event.target.value,
                              },
                            }))
                          }
                          className="border-border bg-background text-text h-9 w-full rounded-lg border px-2 text-sm outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Year */}

                  {dateColumns.length > 0 && availableYears.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter(
                          activeFilter === "year" ? null : "year",
                        );
                      }}
                      className="border-border text-text hover:bg-surface flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                    >
                      <span>Year</span>

                      <ChevronDown
                        size={15}
                        className={`transition-transform ${
                          activeFilter === "year" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

                  {activeFilter === "year" && (
                    <div className="bg-surface space-y-3 rounded-lg p-3">
                      <select
                        value={filterValues.__yearColumn || ""}
                        onChange={(event) =>
                          setFilterValues((prev) => ({
                            ...prev,
                            __yearColumn: event.target.value,
                          }))
                        }
                        className="border-border bg-background text-text h-9 w-full rounded-lg border px-2 text-sm outline-none"
                      >
                        <option value="">Select date column</option>

                        {dateColumns.map((column) => (
                          <option key={column} value={column}>
                            {getColumnTitle(column)}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filterValues.__year || ""}
                        onChange={(event) => {
                          setFilterValues((prev) => ({
                            ...prev,
                            __year: event.target.value,
                          }));

                          setPage(1);
                        }}
                        className="border-border bg-background text-text h-9 w-full rounded-lg border px-2 text-sm outline-none"
                      >
                        <option value="">Select Year</option>

                        {availableYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Month */}

                  {dateColumns.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter(
                          activeFilter === "month" ? null : "month",
                        );
                      }}
                      className="border-border text-text hover:bg-surface flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                    >
                      <span>Month</span>

                      <ChevronDown
                        size={15}
                        className={`transition-transform ${
                          activeFilter === "month" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

                  {activeFilter === "month" && (
                    <div className="bg-surface space-y-3 rounded-lg p-3">
                      <select
                        value={filterValues.__monthColumn || ""}
                        onChange={(event) =>
                          setFilterValues((prev) => ({
                            ...prev,
                            __monthColumn: event.target.value,
                          }))
                        }
                        className="border-border bg-background text-text h-9 w-full rounded-lg border px-2 text-sm outline-none"
                      >
                        <option value="">Select date column</option>

                        {dateColumns.map((column) => (
                          <option key={column} value={column}>
                            {getColumnTitle(column)}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        {months.map((month) => {
                          const selected = filterValues.__months?.includes(
                            month.value,
                          );

                          return (
                            <label
                              key={month.value}
                              className="border-border bg-background text-text flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(selected)}
                                onChange={() => toggleMonth(month.value)}
                                className="accent-primary h-3.5 w-3.5"
                              />

                              {month.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Normal Columns */}

                  {filterableColumns.map((column) => {
                    if (dateColumns.includes(column)) {
                      return null;
                    }

                    const values = getUniqueValues(column);

                    if (!values.length) {
                      return null;
                    }

                    const selected = filterValues[column] || [];

                    return (
                      <button
                        type="button"
                        key={column}
                        onClick={() => {
                          setActiveFilter(
                            activeFilter === column ? null : column,
                          );
                        }}
                        className="border-border text-text hover:bg-surface flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                      >
                        <span className="truncate">
                          {getColumnTitle(column)}
                        </span>

                        <ChevronDown
                          size={15}
                          className={`shrink-0 transition-transform ${
                            activeFilter === column ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    );
                  })}

                  {/* Normal Column Values */}

                  {activeFilter &&
                    filterableColumns.includes(activeFilter) &&
                    !dateColumns.includes(activeFilter) && (
                      <div className="bg-surface max-h-56 space-y-2 overflow-y-auto rounded-lg p-3">
                        {getUniqueValues(activeFilter).map((value) => {
                          const selected =
                            filterValues[activeFilter]?.includes(value);

                          return (
                            <label
                              key={value}
                              className="text-text flex cursor-pointer items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(selected)}
                                onChange={() => {
                                  const current =
                                    filterValues[activeFilter] || [];

                                  const next = current.includes(value)
                                    ? current.filter((item) => item !== value)
                                    : [...current, value];

                                  setColumnFilter(activeFilter, next);
                                }}
                                className="accent-primary h-4 w-4"
                              />

                              <span className="truncate">{value}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              Download
          ================================================= */}

          {exportButton && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDownloadOpen((prev) => !prev);

                  setFilterOpen(false);
                }}
                className="text-text hover:bg-surface border-border flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition"
              >
                <Download size={16} />

                <span>Download</span>

                <ChevronDown
                  size={15}
                  className={`transition-transform ${
                    downloadOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {downloadOpen && (
                <div className="border-border bg-background absolute top-12 right-0 z-50 w-52 rounded-xl border p-2 shadow-xl">
                  <div className="text-text-secondary border-border mb-2 border-b px-3 pb-2 text-xs">
                    {selectedRows.length > 0
                      ? `${selectedRows.length} selected records`
                      : `${sortedData.length} filtered records`}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDownloadOpen(false);

                      onExportPDF?.(dataToDownload);
                    }}
                    className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                  >
                    <FileText size={17} className="text-red-500" />

                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDownloadOpen(false);

                      onExportExcel?.(dataToDownload);
                    }}
                    className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                  >
                    <FileSpreadsheet size={17} className="text-green-600" />

                    <span>Download Excel</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          Table
      ====================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="bg-surface border-border border-b">
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={toggleSelectAll}
                  className="accent-primary h-4 w-4 cursor-pointer"
                  aria-label="Select all"
                />
              </th>

              {columns.map((column) => {
                const isSorted = sortConfig.key === column;

                return (
                  <th
                    key={column}
                    className="text-text-secondary px-4 py-3 text-left text-xs font-semibold whitespace-nowrap uppercase"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="hover:text-text group flex items-center gap-2 transition"
                    >
                      <span>{getColumnTitle(column)}</span>

                      <span className="flex flex-col">
                        <ArrowUp
                          size={11}
                          strokeWidth={2.5}
                          className={
                            isSorted && sortConfig.direction === "asc"
                              ? "text-primary"
                              : "text-text-secondary opacity-70"
                          }
                        />

                        <ArrowDown
                          size={11}
                          strokeWidth={2.5}
                          className={
                            isSorted && sortConfig.direction === "desc"
                              ? "text-primary"
                              : "text-text-secondary opacity-70"
                          }
                        />
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => {
                const absoluteIndex = (currentPage - 1) * pageSize + index;

                const id = getRowId(row, absoluteIndex);

                const selected = selectedRows.includes(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={`border-border border-b transition last:border-b-0 ${
                      onRowClick
                        ? "hover:bg-surface cursor-pointer"
                        : "hover:bg-surface"
                    } ${selected ? "bg-primary-light/40" : ""}`}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(row, absoluteIndex)}
                        className="accent-primary h-4 w-4 cursor-pointer"
                        aria-label={`Select row ${absoluteIndex + 1}`}
                      />
                    </td>

                    {columns.map((column) => (
                      <td
                        key={column}
                        className="text-text max-w-xs px-4 py-3 text-sm"
                      >
                        <div className="truncate">
                          {formatValue(row[column])}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-text-secondary px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-surface flex h-12 w-12 items-center justify-center rounded-full">
                      <Search size={20} />
                    </div>

                    <p className="text-text text-sm font-medium">
                      {emptyMessage}
                    </p>

                    {search && (
                      <p className="text-xs">Try changing your search.</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          Pagination
      ====================================================== */}

      <Pagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(Math.min(newSize, 50));

          setPage(1);
        }}
        pageSizeOptions={pageSizeOptions}
        maxPageSize={50}
      />
    </div>
  );
}
