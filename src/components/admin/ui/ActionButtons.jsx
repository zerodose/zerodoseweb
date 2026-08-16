"use client";

import { Edit, Trash2 } from "lucide-react";

export default function ActionButtons({
  showEdit = true,
  showDelete = true,
  onEdit,
  onDelete,
  editText = "Edit",
  deleteText = "Delete",
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Edit */}
      {showEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="bg-primary hover:bg-primary-dark text-primary-foreground inline-flex h-10 w-28 items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Edit className="h-4 w-4" />

          <span>{editText}</span>
        </button>
      )}

      {/* Delete */}
      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="inline-flex h-10 w-28 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />

          <span>{deleteText}</span>
        </button>
      )}
    </div>
  );
}
