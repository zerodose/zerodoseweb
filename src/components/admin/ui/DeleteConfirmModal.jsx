"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  itemName = "",
  itemLabel = "item",
  loading = false,
}) {
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    if (open) {
      setConfirmation("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const isMatch =
    confirmation.trim().toLowerCase() === itemName.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!isMatch || loading) {
      return;
    }

    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border-border w-full max-w-md rounded-2xl border shadow-xl">
        {/* Header */}
        <div className="border-border flex items-start justify-between border-b p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <h2 className="text-text text-lg font-semibold">
                Delete {itemLabel}
              </h2>

              <p className="text-text-secondary mt-1 text-sm">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-text-secondary hover:bg-surface hover:text-text flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <p className="text-text text-sm leading-6">
            To confirm deletion, type{" "}
            <span className="font-semibold">"{itemName}"</span> in the field
            below.
          </p>

          <input
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={loading}
            placeholder={`Type "${itemName}"`}
            autoFocus
            className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light mt-4 w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {confirmation && !isMatch && (
            <p className="mt-2 text-xs text-red-600">
              The name does not match.
            </p>
          )}

          {isMatch && (
            <p className="mt-2 text-xs text-green-600">
              Name matched. You can now delete this {itemLabel}.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="border-border bg-background text-text hover:bg-surface rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isMatch || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete {itemLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
