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
  processingAction = null,
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
      className={`border-border bg-background overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${
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
          <div className="flex items-start gap-3">
            {/* WORKER ICON */}

            <div className="bg-primary-light text-primary ring-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1">
              <User size={21} strokeWidth={2} />
            </div>

            {/* WORKER INFO */}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-text text-sm font-bold sm:text-base">
                  {workerName}
                </h3>

                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                  Pending Approval
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {/* ROLE */}

                <span className="text-text-secondary flex items-center gap-1 text-xs font-medium">
                  <UserRound size={12} />
                  {workerRole}
                </span>

                {/* TEAM */}

                <span className="text-text-secondary flex items-center gap-1 text-xs">
                  <Hash size={12} />
                  Team {teamNumber}
                </span>

                {/* CONTACT */}

                <span className="text-text-secondary flex items-center gap-1 text-xs">
                  <Phone size={12} />
                  {workerContact}
                </span>
              </div>

              {/* REQUEST META */}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-text-secondary flex items-center gap-1.5 text-[11px]">
                  <Clock3 size={12} />
                  {formatDateTime(requestedAt)}
                </span>

                <span className="text-primary flex items-center gap-1.5 text-[11px] font-bold">
                  <FileEdit size={12} />
                  {changedFields.length}
                  {changedFields.length === 1 ? "change" : "changes"}
                </span>
              </div>
            </div>

            {/* DROPDOWN */}

            <div
              className={`border-border bg-surface text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                expanded
                  ? "bg-primary-light text-primary border-primary/20"
                  : ""
              }`}
            >
              <ChevronDown
                size={17}
                className={`transition-transform duration-300 ease-in-out ${
                  expanded ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
          </div>
        </div>
      </button>

      {/* ============================================================
          EXPANDED CONTENT
          Smooth slide animation
      ============================================================ */}

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`border-border border-t transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              expanded
                ? "translate-y-0 opacity-100"
                : "-translate-y-3 opacity-0"
            }`}
          >
            {/* ========================================================
                WORKER INFORMATION
            ======================================================== */}

            {/* ========================================================
    WORKER INFORMATION
======================================================== */}

            {/* <div className="p-4 sm:p-5">
              <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">

                <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-text font-semibold">
                      Worker Information
                    </h2>

                    <p className="text-text-secondary mt-0.5 text-xs">
                      Worker details associated with this update request.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:grid-cols-2 md:p-5">

                  <DetailItem icon={User} label="Worker" value={workerName} />

                  <DetailItem
                    icon={UserRound}
                    label="Role"
                    value={workerRole}
                  />

                  <DetailItem
                    icon={Phone}
                    label="Contact Number"
                    value={workerContact}
                  />

                  <DetailItem
                    icon={Hash}
                    label="Team Number"
                    value={teamNumber}
                  />
                </div>
              </section>
            </div> */}
            {/* ========================================================
                REQUESTED CHANGES
            ======================================================== */}

            <div className="border-border border-t p-4 sm:p-5">
              {/* SECTION HEADER */}

              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary-light text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
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

                <span className="bg-primary-light text-primary ring-primary/10 rounded-full px-3 py-1.5 text-[10px] font-bold text-nowrap ring-1">
                  {changedFields.length}{" "}
                  {changedFields.length === 1 ? "Change" : "Changes"}
                </span>
              </div>

              {/* NO CHANGES */}

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
                        className="border-primary/30 bg-primary/[0.025] overflow-hidden rounded-2xl border"
                      >
                        {/* FIELD HEADER */}

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

                        {/* BEFORE / AFTER */}

                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:p-5">
                          {/* BEFORE */}

                          <div>
                            <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                              <span>Before</span>
                            </div>

                            <p className="text-text mt-1.5 text-sm font-medium break-words capitalize">
                              {formatValue(field, currentValue)}
                            </p>
                          </div>

                          {/* AFTER */}

                          <div>
                            <div className="text-primary flex items-center gap-1.5 text-xs">
                              <span>After</span>
                            </div>

                            <p className="text-text mt-1.5 text-sm font-semibold break-words capitalize">
                              {formatValue(field, requestedValue)}
                            </p>
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
                {/* APPROVE */}

                <button
                  type="button"
                  onClick={onApprove}
                  disabled={processing}
                  className="bg-primary text-primary-foreground hover:bg-primary-dark inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing && processingAction === "approve" ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}

                  <span>
                    {processing && processingAction === "approve"
                      ? "Processing..."
                      : "Approve Update"}
                  </span>
                </button>

                {/* REJECT */}

                <button
                  type="button"
                  onClick={onReject}
                  disabled={processing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing && processingAction === "reject" ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}

                  <span>
                    {processing && processingAction === "reject"
                      ? "Processing..."
                      : "Reject Request"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// function DetailItem({ icon: Icon, label, value }) {
//   const displayValue =
//     typeof value === "number" && value >= 0 && value < 10
//       ? `0${value}`
//       : value !== null && value !== undefined && value !== ""
//         ? value
//         : "-";

//   return (
//     <div>
//       <div className="text-text-secondary flex items-center gap-1.5 text-xs">
//         {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}

//         <span>{label}</span>
//       </div>

//       <p className="text-text mt-1.5 text-sm font-medium break-words capitalize">
//         {displayValue}
//       </p>
//     </div>
//   );
// }
