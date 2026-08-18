"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

export default function SupervisorApprovalCard({
  supervisor,
  expanded,
  processing,
  onToggle,
  onApprove,
  onReject,
}) {
  return (
    <div
      className={`group overflow-hidden rounded-2xl border transition-all duration-200 ${
        expanded
          ? "border-primary/30 bg-white shadow-md"
          : "border-border bg-white hover:border-primary/40 hover:bg-primary-light shadow-sm hover:shadow-md"
      }`}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition md:px-5 ${
          expanded
            ? "bg-primary/10 hover:bg-primary/15"
            : "hover:bg-primary-light"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          {/* Avatar */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              expanded
                ? "bg-primary text-white shadow-sm"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Users size={19} />
          </div>

          {/* Name + Meta */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-text truncate text-sm font-semibold md:text-base">
                {supervisor?.name || "-"}
              </p>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                <Clock3 size={10} />
                Pending
              </span>
            </div>

            <div className="text-text-secondary mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-medium">
                {supervisor?.supervisorCode || "No code"}
              </span>

              {supervisor?.unionCouncil?.name && (
                <>
                  <span className="text-gray-300">•</span>

                  <span>{supervisor.unionCouncil.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div
          className={`bg-surface text-text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
            expanded ? "bg-primary/15 text-primary" : ""
          }`}
        >
          <ChevronRight
            size={18}
            className={`transition-transform duration-300 ${
              expanded ? "rotate-90" : "rotate-0"
            }`}
          />
        </div>
      </button>

      {/* ========================================================
          DETAILS
      ======================================================== */}

      {/* ========================================================
    DETAILS
======================================================== */}

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-border border-t">
            <div className="p-4 md:p-5">
              {/* Section title */}
              <div className="mb-4 flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <UserCheck size={16} />
                </div>

                <div>
                  <p className="text-text text-sm font-semibold">
                    Supervisor Information
                  </p>

                  <p className="text-text-secondary text-xs">
                    Registration details
                  </p>
                </div>
              </div>

              {/* Detail Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={supervisor?.email}
                />

                <DetailItem
                  icon={Phone}
                  label="Contact Number"
                  value={supervisor?.contactNumber}
                />

                <DetailItem
                  icon={UserCheck}
                  label="Supervisor Code"
                  value={supervisor?.supervisorCode}
                />

                <DetailItem
                  label="District"
                  value={supervisor?.district?.name}
                />

                <DetailItem label="Town" value={supervisor?.town?.name} />

                <DetailItem
                  icon={MapPin}
                  label="Union Council"
                  value={supervisor?.unionCouncil?.name}
                />
              </div>
            </div>

            {/* Actions */}
            <div className=" border-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end md:px-5">
              <button
                type="button"
                disabled={processing}
                onClick={onReject}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={17} />

                {processing ? "Processing..." : "Reject"}
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={onApprove}
                className="bg-primary hover:bg-primary-dark inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={17} />

                {processing ? "Processing..." : "Approve Supervisor"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="group bg-white border-border hover:border-primary/30 relative overflow-hidden rounded-xl border p-3.5 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
      {/* Left accent */}
      <div className="bg-primary absolute top-0 bottom-0 left-0 w-0.5 opacity-60" />

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          {Icon ? (
            <Icon size={15} />
          ) : (
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-text-secondary mb-1 text-[11px] font-medium">
            {label}
          </p>

          <p className="text-text truncate text-sm font-semibold">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
