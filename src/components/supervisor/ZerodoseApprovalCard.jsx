"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileEdit,
  Hash,
  Phone,
  RefreshCw,
  User,
  UserRound,
  XCircle,
} from "lucide-react";

export default function ZerodoseApprovalCard({
  request,
  expanded = false,
  processing = false,
  changedFields = [],
  workerName = "Unknown Worker",
  workerContact = "—",
  workerRole = "Worker",
  teamNumber = "—",
  requestedAt = null,
  getFieldLabel,
  getFieldIcon,
  formatValue,
  onToggle,
  onApprove,
  onReject,
  getZerodoseData,
  getRequestedData,
}) {
  const currentData = getZerodoseData(request);
  const requestedData = getRequestedData(request);

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`border-border bg-background overflow-hidden rounded-xl border shadow-sm transition-all duration-300 ${
        expanded ? "shadow-md" : "hover:shadow-md"
      }`}
    >
      {/* ============================================================
          CARD HEADER
      ============================================================ */}

      <button
        type="button"
        onClick={onToggle}
        disabled={processing}
        className="w-full text-left"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            {/* Worker Icon */}

            <div className="bg-primary-light text-primary ring-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1">
              <User size={19} strokeWidth={2} />
            </div>

            {/* Worker Info */}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-text truncate text-sm font-bold sm:text-base">
                  {workerName}
                </h3>

                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                  Pending Approval
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {/* Role */}

                <span className="text-text-secondary flex items-center gap-1.5 text-xs">
                  <UserRound size={12} />
                  {workerRole}
                </span>

                {/* Team */}

                <span className="text-text-secondary flex items-center gap-1.5 text-xs">
                  <Hash size={12} />
                  Team {teamNumber}
                </span>

                {/* Contact */}

                <span className="text-text-secondary flex items-center gap-1.5 text-xs">
                  <Phone size={12} />
                  {workerContact}
                </span>
              </div>

              {/* Request Meta */}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-text-secondary flex items-center gap-1.5 text-[11px]">
                  <Clock3 size={12} />

                  {formatDateTime(requestedAt)}
                </span>

                <span className="text-primary flex items-center gap-1.5 text-[11px] font-bold">
                  <FileEdit size={12} />
                  {changedFields.length}{" "}
                  {changedFields.length === 1 ? "change" : "changes"}
                </span>
              </div>
            </div>

            {/* Expand Button */}

            <div
              className={`border-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                expanded
                  ? "bg-primary-light text-primary border-primary/20"
                  : "bg-surface text-text-secondary"
              }`}
            >
              {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </div>
          </div>
        </div>
      </button>

      {/* ============================================================
          EXPANDED CONTENT
      ============================================================ */}

      {expanded && (
        <div className="border-border border-t">
          {/* ========================================================
              WORKER INFORMATION
          ======================================================== */}

          <div className="p-4 sm:p-5">
            <div className="border-border bg-background overflow-hidden rounded-xl border">
              {/* Section Header */}

              <div className="border-border flex items-center gap-3 border-b p-4">
                <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <User size={15} />
                </div>

                <div>
                  <h4 className="text-text text-sm font-bold">
                    Worker Information
                  </h4>

                  <p className="text-text-secondary mt-0.5 text-[11px]">
                    Worker details associated with this update request.
                  </p>
                </div>
              </div>

              {/* Information */}

              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Worker */}

                <div className="border-border bg-surface rounded-lg border p-3">
                  <div className="text-text-secondary flex items-center gap-1.5 text-[10px] font-semibold uppercase">
                    <User size={12} />
                    Worker
                  </div>

                  <p className="text-text mt-1.5 text-sm font-semibold">
                    {workerName}
                  </p>
                </div>

                {/* Role */}

                <div className="border-border bg-surface rounded-lg border p-3">
                  <div className="text-text-secondary flex items-center gap-1.5 text-[10px] font-semibold uppercase">
                    <UserRound size={12} />
                    Role
                  </div>

                  <p className="text-text mt-1.5 text-sm font-semibold">
                    {workerRole}
                  </p>
                </div>

                {/* Contact */}

                <div className="border-border bg-surface rounded-lg border p-3">
                  <div className="text-text-secondary flex items-center gap-1.5 text-[10px] font-semibold uppercase">
                    <Phone size={12} />
                    Contact Number
                  </div>

                  <p className="text-text mt-1.5 text-sm font-semibold">
                    {workerContact}
                  </p>
                </div>

                {/* Team */}

                <div className="border-border bg-surface rounded-lg border p-3">
                  <div className="text-text-secondary flex items-center gap-1.5 text-[10px] font-semibold uppercase">
                    <Hash size={12} />
                    Team Number
                  </div>

                  <p className="text-text mt-1.5 text-sm font-semibold">
                    {teamNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              REQUESTED CHANGES
          ======================================================== */}

          <div className="border-border border-t p-4 sm:p-5">
            {/* Section Header */}

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <FileEdit size={15} />
                </div>

                <div>
                  <h4 className="text-text text-sm font-bold">
                    Requested Changes
                  </h4>

                  <p className="text-text-secondary text-[11px]">
                    Before and after values submitted by the worker.
                  </p>
                </div>
              </div>

              <span className="bg-primary-light text-primary ring-primary/10 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1">
                {changedFields.length}{" "}
                {changedFields.length === 1 ? "Change" : "Changes"}
              </span>
            </div>

            {/* No Changes */}

            {changedFields.length === 0 ? (
              <div className="border-border bg-surface rounded-xl border p-5 text-center">
                <FileEdit
                  size={22}
                  className="text-text-secondary mx-auto mb-2"
                />

                <p className="text-text text-sm font-semibold">
                  No changes found
                </p>

                <p className="text-text-secondary mt-1 text-xs">
                  No edited fields were found in this request.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {changedFields.map((field) => {
                  const Icon = getFieldIcon(field);

                  const currentValue = currentData?.[field];
                  const requestedValue = requestedData?.[field];

                  return (
                    <div
                      key={field}
                      className="border-primary/30 bg-primary/[0.025] overflow-hidden rounded-xl border"
                    >
                      {/* Field Header */}

                      <div className="border-primary/20 flex items-center justify-between border-b px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                            <Icon size={14} />
                          </div>

                          <div>
                            <p className="text-text text-xs font-bold">
                              {getFieldLabel(field)}
                            </p>

                            <p className="text-primary mt-0.5 text-[10px] font-semibold">
                              Edited by Worker
                            </p>
                          </div>
                        </div>

                        <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full">
                          <ArrowRight size={14} />
                        </div>
                      </div>

                      {/* Before / After */}

                      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                        {/* Before */}

                        <div>
                          <p className="text-text-secondary mb-1.5 text-[10px] font-bold tracking-wide uppercase">
                            Before
                          </p>

                          <div className="border-border bg-background min-h-[58px] rounded-lg border p-3">
                            <div className="text-text text-sm font-semibold break-words">
                              {formatValue(field, currentValue)}
                            </div>
                          </div>
                        </div>

                        {/* After */}

                        <div>
                          <p className="text-primary mb-1.5 text-[10px] font-bold tracking-wide uppercase">
                            After
                          </p>

                          <div className="border-primary/30 bg-primary-light/30 min-h-[58px] rounded-lg border p-3">
                            <div className="text-text text-sm font-semibold break-words">
                              {formatValue(field, requestedValue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================
              REQUEST DATE
          ======================================================== */}

          <div className="border-border border-t px-4 py-3 sm:px-5">
            <div className="text-text-secondary flex items-center gap-2 text-[11px]">
              <Clock3 size={13} />

              <span>
                Requested on{" "}
                <span className="text-text font-semibold">
                  {formatDateTime(requestedAt)}
                </span>
              </span>
            </div>
          </div>

          {/* ========================================================
              ACTIONS
          ======================================================== */}

          <div className="border-border bg-surface border-t p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {/* Reject */}

              <button
                type="button"
                onClick={onReject}
                disabled={processing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <XCircle size={15} />
                )}

                <span>{processing ? "Processing..." : "Reject Request"}</span>
              </button>

              {/* Approve */}

              <button
                type="button"
                onClick={onApprove}
                disabled={processing}
                className="bg-primary text-primary-foreground hover:bg-primary-dark inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
                )}

                <span>{processing ? "Processing..." : "Approve Update"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
