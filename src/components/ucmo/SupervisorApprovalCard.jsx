"use client";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

// ============================================================
// DESIGNATION LABEL
// ============================================================

const getDesignationLabel = (designation) => {
  switch (designation) {
    case "supervisor":
      return "Supervisor";

    case "vaccinator":
      return "Vaccinator";

    case "otherstaff":
      return "Other Staff";

    default:
      return "User";
  }
};

// ============================================================
// DETAIL SECTION
// ============================================================

function DetailSection({ icon: Icon, title, description, children }) {
  return (
    <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      {/* Section Header */}

      <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-text font-semibold">{title}</h2>

          <p className="text-text-secondary mt-0.5 text-xs">{description}</p>
        </div>
      </div>

      {/* Section Content */}

      <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:grid-cols-2 md:p-5">
        {children}
      </div>
    </section>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({ icon: Icon, label, value }) {
  const displayValue =
    value !== null && value !== undefined && value !== "" ? value : "-";

  return (
    <div>
      <div className="text-text-secondary flex items-center gap-1.5 text-xs">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}

        <span>{label}</span>
      </div>

      <p className="text-text mt-1.5 text-sm font-medium break-words capitalize">
        {displayValue}
      </p>
    </div>
  );
}

// ============================================================
// APPROVAL CARD
// ============================================================

export default function SupervisorApprovalCard({
  supervisor,
  expanded,
  processing,
  onToggle,
  onApprove,
  onReject,
}) {
  const designation = supervisor?.approvalDesignation;

  const designationLabel = getDesignationLabel(designation);

  const isSupervisor = designation === "supervisor";

  return (
    <div
      className={`group overflow-hidden rounded-2xl border transition-all duration-200 ${
        expanded
          ? "border-primary/30 bg-background shadow-md"
          : "border-border bg-background hover:border-primary/40 hover:bg-primary-light shadow-sm hover:shadow-md"
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
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-primary-light text-primary"
            }`}
          >
            <Users size={19} />
          </div>

          {/* Name + Meta */}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-text truncate text-sm font-semibold md:text-base capitalize">
                {supervisor?.name || "-"}
              </p>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Clock3 size={10} />
                Pending
              </span>
            </div>

            <div className="text-text-secondary mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {/* Designation */}

              <span className="font-medium">{designationLabel}</span>

              {/* Supervisor Code - Supervisor Only */}

              {isSupervisor && supervisor?.supervisorCode && (
                <>
                  <span className="text-gray dark:text-gray-dark">•</span>

                  <span>{supervisor.supervisorCode}</span>
                </>
              )}

              {/* Union Council */}

              {supervisor?.unionCouncil?.name && (
                <>
                  <span className="text-gray dark:text-gray-dark ">•</span>

                  <span>{supervisor.unionCouncil.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}

        <div
          className={`bg-surface text-text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
            expanded ? "bg-primary-light text-primary" : ""
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

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-border border-t">
            <div className="p-4 md:p-5">
              {/* ==================================================
                  USER INFORMATION
              ================================================== */}

              <DetailSection
                icon={UserCheck}
                title={`${designationLabel} Information`}
                description="Registration details"
              >
                {/* Email */}

                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={supervisor?.email}
                />

                {/* Contact Number */}

                <DetailItem
                  icon={Phone}
                  label="Contact Number"
                  value={supervisor?.contactNumber}
                />

                {/* Supervisor Code - Supervisor Only */}

                {isSupervisor && (
                  <DetailItem
                    icon={UserCheck}
                    label="Supervisor Code"
                    value={supervisor?.supervisorCode}
                  />
                )}

                {/* District */}

                <DetailItem
                  label="District"
                  value={supervisor?.district?.name}
                />

                {/* Town */}

                <DetailItem label="Town" value={supervisor?.town?.name} />

                {/* Union Council */}

                <DetailItem
                  icon={MapPin}
                  label="Union Council"
                  value={supervisor?.unionCouncil?.name}
                />
              </DetailSection>
            </div>

            {/* ====================================================
                ACTIONS
            ==================================================== */}

            <div className="border-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end md:px-5">
              {/* Approve */}
              <button
                type="button"
                disabled={processing}
                onClick={onApprove}
                className="bg-primary hover:bg-primary-dark text-primary-foreground inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={17} />

                {processing ? "Processing..." : `Approve ${designationLabel}`}
              </button>

              {/* Reject */}
              <button
                type="button"
                disabled={processing}
                onClick={onReject}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-900/40"
              >
                <XCircle size={17} />

                {processing ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
