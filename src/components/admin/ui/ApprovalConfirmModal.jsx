"use client";

import { AlertTriangle, Check } from "lucide-react";

export default function ApprovalConfirmModal({
  open,
  action = "approve",
  userName = "",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="bg-background border-border w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
        {/* ======================================================
            Header / Icon
        ====================================================== */}

        <div className="flex flex-col items-center px-6 pt-7 sm:px-8">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isApprove
                ? "bg-primary-light text-primary"
                : "bg-red-50 text-red-500"
            }`}
          >
            {isApprove ? (
              <Check size={30} strokeWidth={2.5} />
            ) : (
              <AlertTriangle size={30} strokeWidth={2.3} />
            )}
          </div>

          {/* ====================================================
              Content
          ==================================================== */}

          <div className="mt-5 text-center">
            <h2 className="text-text text-xl font-semibold tracking-tight">
              {isApprove
                ? "Approve District Focal Person?"
                : "Reject District Focal Person?"}
            </h2>

            <p className="text-text-secondary mt-2.5 text-sm leading-6">
              Are you sure you want to{" "}
              <span className="text-text font-medium">
                {isApprove ? "approve" : "reject"}
              </span>{" "}
              this registration?
            </p>

            {userName && (
              <div className="bg-surface border-border mt-4 rounded-xl border px-4 py-3">
                <p className="text-text text-sm font-semibold">{userName}</p>
                <p className="text-text-secondary mt-0.5 text-xs">
                  District Focal Person
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            Actions
        ====================================================== */}

        <div className="border-border bg-surface/50 mt-7 flex gap-3 border-t px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="border-border text-text hover:bg-background w-1/2 rounded-lg border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-1/2 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isApprove
                ? "bg-primary text-primary-foreground hover:bg-primary-dark"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {loading
              ? "Processing..."
              : isApprove
                ? "Yes, Approve"
                : "Yes, Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
