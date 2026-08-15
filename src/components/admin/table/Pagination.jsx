"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useMemo } from "react";

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  maxPageSize = 50,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // ============================================================
  // Pagination Items
  // ============================================================

  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }

      return items;
    }

    items.push(1);

    if (safeCurrentPage > 3) {
      items.push("...");
    }

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (safeCurrentPage < totalPages - 2) {
      items.push("...");
    }

    items.push(totalPages);

    return items;
  }, [safeCurrentPage, totalPages]);

  // ============================================================
  // Page Change
  // ============================================================

  const changePage = (newPage) => {
    const page = Math.max(1, Math.min(newPage, totalPages));

    if (page === safeCurrentPage) {
      return;
    }

    onPageChange?.(page);
  };

  // ============================================================
  // Page Size
  // ============================================================

  const handlePageSize = (value) => {
    const newSize = Math.min(Number(value), maxPageSize);

    onPageSizeChange?.(newSize);
  };

  // ============================================================
  // Results Range
  // ============================================================

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;

  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  return (
    <div className="border-border flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* ======================================================
          Results
      ====================================================== */}

      <div className="text-text-secondary text-xs sm:text-sm">
        {totalItems > 0 ? (
          <>
            Showing <span className="text-text font-medium">{startItem}</span>{" "}
            to <span className="text-text font-medium">{endItem}</span> of{" "}
            <span className="text-text font-medium">{totalItems}</span>
          </>
        ) : (
          "0 results"
        )}
      </div>

      {/* ======================================================
          Controls
      ====================================================== */}

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {/* Page Size */}

        <div className="flex items-center gap-2">
          <span className="text-text-secondary hidden text-xs sm:inline">
            Rows
          </span>

          <select
            value={pageSize}
            onChange={(event) => handlePageSize(event.target.value)}
            className="border-border bg-background text-text h-9 rounded-lg border px-2 text-sm outline-none"
          >
            {pageSizeOptions
              .filter((size) => size <= maxPageSize)
              .map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
          </select>
        </div>

        {/* Pagination */}

        <div className="flex items-center gap-1">
          {/* First */}

          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => changePage(1)}
            className="text-text hover:bg-surface flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <ChevronsLeft size={17} />
          </button>

          {/* Previous */}

          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => changePage(safeCurrentPage - 1)}
            className="text-text hover:bg-surface flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <ChevronLeft size={17} />
          </button>

          {/* Page Numbers */}

          <div className="hidden items-center gap-1 sm:flex">
            {paginationItems.map((item, index) =>
              item === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="text-text-secondary flex h-9 w-9 items-center justify-center text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => changePage(item)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                    safeCurrentPage === item
                      ? "bg-primary text-white"
                      : "text-text hover:bg-surface"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          {/* Mobile Page */}

          <span className="text-text px-2 text-sm sm:hidden">
            {safeCurrentPage} / {totalPages}
          </span>

          {/* Next */}

          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => changePage(safeCurrentPage + 1)}
            className="text-text hover:bg-surface flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <ChevronRight size={17} />
          </button>

          {/* Last */}

          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => changePage(totalPages)}
            className="text-text hover:bg-surface flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <ChevronsRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
