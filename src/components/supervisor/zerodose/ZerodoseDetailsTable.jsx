"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
  MapPin,
  Search,
  Syringe,
} from "lucide-react";

export default function ZerodoseDetailsTable({ data = [] }) {
  const [search, setSearch] = useState("");

  // ============================================================
  // HELPERS
  // ============================================================

  const getWorkerName = (worker) => {
    if (!worker) {
      return "-";
    }

    if (typeof worker === "string") {
      return worker;
    }

    return worker?.name || "-";
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (item) => {
    if (item?.vaccinationStatus) {
      return item.vaccinationStatus;
    }

    if (item?.coveredDate) {
      return "covered";
    }

    if (item?.visitDate) {
      return "visited";
    }

    return "recorded";
  };

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return data;
    }

    return data.filter((item) => {
      const values = [
        item?.childName,
        item?.fatherName,
        item?.contactNo,
        item?.address,
        item?.vaccinationStatus,
        item?.teamNumber,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [data, search]);

  // ============================================================
  // EMPTY
  // ============================================================

  if (!data.length) {
    return (
      <div className="border-border bg-surface rounded-xl border p-6 text-center">
        <p className="text-text text-sm font-medium">
          No Zerodose records found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="mb-3">
        <div className="relative">
          <Search
            size={17}
            className="text-text-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search child, father, contact..."
            className="border-border bg-surface text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/10 w-full rounded-xl border py-2.5 pr-3 pl-10 text-sm transition outline-none focus:ring-4"
          />
        </div>
      </div>

      {/* ======================================================
          DESKTOP TABLE
      ====================================================== */}

      <div className="border-border hidden overflow-hidden rounded-xl border md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead>
              <tr className="bg-surface border-border border-b">
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  #
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Child
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Father
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Age
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Contact
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Status
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Record Date
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Visit Date
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Covered Date
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Address
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => {
                const status = getStatus(item);

                return (
                  <tr
                    key={item?._id || item?.id || `${item?.childName}-${index}`}
                    className="border-border hover:bg-surface border-b last:border-b-0"
                  >
                    <td className="text-text px-4 py-3 text-sm font-medium">
                      {index + 1}
                    </td>

                    <td className="text-text px-4 py-3 text-sm font-semibold">
                      {item?.childName || "-"}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {item?.fatherName || "-"}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {item?.age ?? "-"}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {item?.contactNo || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {formatDate(item?.recordDate)}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {formatDate(item?.visitDate)}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {formatDate(item?.coveredDate)}
                    </td>

                    <td className="text-text-secondary max-w-[220px] px-4 py-3 text-sm">
                      <span className="block truncate">
                        {item?.address || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="bg-surface p-6 text-center">
            <p className="text-text text-sm font-medium">
              No matching records found.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          MOBILE CARDS
      ====================================================== */}

      <div className="space-y-3 md:hidden">
        {filteredData.map((item, index) => {
          const status = getStatus(item);

          return (
            <div
              key={item?._id || item?.id || `${item?.childName}-${index}`}
              className="border-border rounded-xl border bg-white p-4"
            >
              {/* Header */}

              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Syringe size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-text truncate text-sm font-semibold">
                      {item?.childName || "-"}
                    </p>

                    <p className="text-text-secondary text-xs">
                      Record #{index + 1}
                    </p>
                  </div>
                </div>

                <StatusBadge status={status} />
              </div>

              {/* Details */}

              <div className="grid grid-cols-2 gap-3">
                <Detail label="Father" value={item?.fatherName} />

                <Detail label="Age" value={item?.age} />

                <Detail label="Contact" value={item?.contactNo} />

                <Detail
                  label="Record Date"
                  value={formatDate(item?.recordDate)}
                />

                <Detail
                  label="Visit Date"
                  value={formatDate(item?.visitDate)}
                />

                <Detail
                  label="Covered Date"
                  value={formatDate(item?.coveredDate)}
                />
              </div>

              {/* Address */}

              <div className="border-border mt-3 border-t pt-3">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-primary mt-0.5 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-text-secondary text-[11px]">Address</p>

                    <p className="text-text mt-0.5 text-xs">
                      {item?.address || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <div className="border-border bg-surface rounded-xl border p-6 text-center">
            <p className="text-text text-sm font-medium">
              No matching records found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DETAIL
// ============================================================

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-text-secondary text-[11px]">{label}</p>

      <p className="text-text mt-0.5 truncate text-xs font-medium">
        {value || "-"}
      </p>
    </div>
  );
}

// ============================================================
// STATUS
// ============================================================

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "recorded").toLowerCase();

  if (normalizedStatus === "covered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
        <CheckCircle2 size={12} />
        Covered
      </span>
    );
  }

  if (normalizedStatus === "visited") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
        <Eye size={12} />
        Visited
      </span>
    );
  }

  return (
    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
      <FileText size={12} />
      Recorded
    </span>
  );
}
