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
  // Filters
  //
  // Example:
  //
  // filterOptions={[
  //   {
  //     key: "designation",
  //     label: "Role",
  //     type: "select",
  //     column: "designation",
  //   },
  //   {
  //     key: "district",
  //     label: "District",
  //     type: "select",
  //     column: "district",
  //   },
  //   {
  //     key: "dateRange",
  //     label: "Date",
  //     type: "dateRange",
  //     column: "createdAt",
  //   },
  // ]}
  //
  // ============================================================

  filterOptions = [],

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
  // ============================================================
  // States
  // ============================================================

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
  // Date Parser
  // ============================================================

  const parseDate = (value) => {
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
  // Filter Data
  // ============================================================

  const filteredData = useMemo(() => {
    let result = [...searchedData];

    filterOptions.forEach((filter) => {
      const value = filterValues[filter.key];

      // --------------------------------------------------------
      // Select Filter
      // --------------------------------------------------------

      if (filter.type === "select") {
        if (!Array.isArray(value) || value.length === 0) {
          return;
        }

        result = result.filter((row) => {
          const rowValue = formatValue(row[filter.column]);

          return value.includes(rowValue);
        });
      }

      // --------------------------------------------------------
      // Date Range Filter
      // --------------------------------------------------------

      if (filter.type === "dateRange") {
        if (!value) {
          return;
        }

        const from = value.from ? new Date(`${value.from}T00:00:00`) : null;

        const to = value.to ? new Date(`${value.to}T23:59:59.999`) : null;

        if (!from && !to) {
          return;
        }

        result = result.filter((row) => {
          const rowDate = parseDate(row[filter.column]);

          if (!rowDate) {
            return false;
          }

          if (from && rowDate < from) {
            return false;
          }

          if (to && rowDate > to) {
            return false;
          }

          return true;
        });
      }
    });

    return result;
  }, [searchedData, filterOptions, filterValues]);

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
  // Current Page Selected
  // ============================================================

  const currentPageIds = paginatedData.map((row, index) =>
    getRowId(row, (currentPage - 1) * pageSize + index),
  );

  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedRows.includes(id));

  // ============================================================
  // Select All Current Page
  // ============================================================

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedRows((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );

      return;
    }

    setSelectedRows((prev) => [...new Set([...prev, ...currentPageIds])]);
  };

  // ============================================================
  // Get Selected Rows
  // ============================================================

  const selectedData = useMemo(() => {
    if (!selectedRows.length) {
      return [];
    }

    return data.filter((row, index) => {
      const id = getRowId(row, index);

      return selectedRows.includes(id);
    });
  }, [data, selectedRows]);

  // ============================================================
  // Data To Download
  //
  // Selected rows have priority.
  //
  // If nothing is selected:
  // current filtered data is downloaded.
  // ============================================================

  const dataToDownload = selectedRows.length > 0 ? selectedData : sortedData;

  // ============================================================
  // Filter Helpers
  // ============================================================

  const getUniqueFilterValues = (filter) => {
    const values = data
      .map((row) => formatValue(row[filter.column]))
      .filter((value) => value !== "-" && value.trim() !== "");

    return [...new Set(values)].sort((a, b) =>
      String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  };

  // ============================================================
  // Set Select Filter
  // ============================================================

  const toggleFilterValue = (filterKey, value) => {
    setFilterValues((prev) => {
      const current = prev[filterKey] || [];

      const exists = current.includes(value);

      const next = exists
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [filterKey]: next,
      };
    });

    setPage(1);
  };

  // ============================================================
  // Set Date Range
  // ============================================================

  const setDateRange = (filterKey, field, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: {
        ...(prev[filterKey] || {}),
        [field]: value,
      },
    }));

    setPage(1);
  };

  // ============================================================
  // Remove Filter
  // ============================================================

  const removeFilter = (filter) => {
    setFilterValues((prev) => {
      const next = {
        ...prev,
      };

      delete next[filter.key];

      return next;
    });

    setPage(1);
  };

  // ============================================================
  // Clear All Filters
  // ============================================================

  const clearFilters = () => {
    setFilterValues({});
    setActiveFilter(null);
    setPage(1);
  };

  // ============================================================
  // Active Filter Count
  // ============================================================

  const activeFilterCount = useMemo(() => {
    return filterOptions.reduce((count, filter) => {
      const value = filterValues[filter.key];

      if (
        filter.type === "select" &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        return count + 1;
      }

      if (filter.type === "dateRange" && value && (value.from || value.to)) {
        return count + 1;
      }

      return count;
    }, 0);
  }, [filterOptions, filterValues]);

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
    <div className="bg-background border-border min-h-screen overflow-hidden rounded-lg border shadow-sm">
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
          {/* Selected */}

          {selectedRows.length > 0 && (
            <div className="bg-primary-light text-primary flex h-10 min-w-28 items-center justify-center rounded-lg px-3 text-xs font-medium">
              {selectedRows.length} selected
            </div>
          )}

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
              Active Filter Buttons
          ================================================= */}

          {filterOptions.map((filter) => {
            const value = filterValues[filter.key];

            // ---------------------------------------------
            // Select Filter Button
            // ---------------------------------------------

            if (filter.type === "select") {
              if (!Array.isArray(value) || value.length === 0) {
                return null;
              }

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className="text-text hover:bg-surface border-border flex h-10 max-w-48 min-w-28 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition"
                >
                  <span className="truncate">{filter.label}</span>

                  <span className="text-text-secondary">{value.length}</span>

                  <X
                    size={14}
                    onClick={(event) => {
                      event.stopPropagation();

                      removeFilter(filter);
                    }}
                  />
                </button>
              );
            }

            // ---------------------------------------------
            // Date Range Buttons
            // ---------------------------------------------

            if (filter.type === "dateRange") {
              if (!value || (!value.from && !value.to)) {
                return null;
              }

              return (
                <div key={filter.key} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className="text-text hover:bg-surface border-border flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition"
                  >
                    <Calendar size={15} />

                    <span>{value.from || "Start Date"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className="text-text hover:bg-surface border-border flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition"
                  >
                    <Calendar size={15} />

                    <span>{value.to || "End Date"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFilter(filter)}
                    className="text-text-secondary hover:text-text"
                    aria-label="Remove date filter"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            }

            return null;
          })}

          {/* =================================================
              Filter
          ================================================= */}

          {filterOptions.length > 0 && (
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
                <div className="border-border bg-background absolute top-12 right-0 z-50 w-72 rounded-xl border p-2 shadow-xl">
                  <div className="flex items-center justify-between px-2 py-2">
                    <p className="text-text text-sm font-semibold">
                      Filter Data
                    </p>

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

                  <div className="max-h-[420px] space-y-2 overflow-y-auto">
                    {filterOptions.map((filter) => {
                      const isActive = activeFilter === filter.key;

                      return (
                        <div key={filter.key}>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveFilter(isActive ? null : filter.key)
                            }
                            className="text-text hover:bg-surface border-border flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-medium transition"
                          >
                            <span className="truncate">{filter.label}</span>

                            <ChevronDown
                              size={15}
                              className={`shrink-0 transition-transform ${
                                isActive ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* =================================
                                Select Options
                            ================================= */}

                          {isActive && filter.type === "select" && (
                            <div className="bg-surface mt-1 max-h-52 space-y-2 overflow-y-auto rounded-lg p-3">
                              {getUniqueFilterValues(filter).map((option) => {
                                const selected =
                                  filterValues[filter.key]?.includes(option);

                                return (
                                  <label
                                    key={option}
                                    className="text-text flex cursor-pointer items-center gap-2 text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(selected)}
                                      onChange={() =>
                                        toggleFilterValue(filter.key, option)
                                      }
                                      className="accent-primary h-4 w-4"
                                    />

                                    <span className="truncate">{option}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* =================================
                                Date Range
                            ================================= */}

                          {isActive && filter.type === "dateRange" && (
                            <div className="bg-surface mt-1 space-y-3 rounded-lg p-3">
                              <div>
                                <label className="text-text-secondary mb-1 block text-xs">
                                  Start Date
                                </label>

                                <input
                                  type="date"
                                  value={filterValues[filter.key]?.from || ""}
                                  onChange={(event) =>
                                    setDateRange(
                                      filter.key,
                                      "from",
                                      event.target.value,
                                    )
                                  }
                                  className="border-border bg-background text-text h-10 w-full rounded-lg border px-3 text-sm outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-text-secondary mb-1 block text-xs">
                                  End Date
                                </label>

                                <input
                                  type="date"
                                  value={filterValues[filter.key]?.to || ""}
                                  onChange={(event) =>
                                    setDateRange(
                                      filter.key,
                                      "to",
                                      event.target.value,
                                    )
                                  }
                                  className="border-border bg-background text-text h-10 w-full rounded-lg border px-3 text-sm outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

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
                      className="hover:text-text flex items-center gap-2 transition"
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
