"use client";

import { Users, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SupervisorActions() {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => router.push("/supervisor/addworker")}
        className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition"
      >
        <UserPlus size={17} />
        Add Workers
      </button>

      <button
        type="button"
        onClick={() => router.push("/supervisor/workers")}
        className="border-border bg-surface text-text hover:bg-background flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition"
      >
        <Users size={17} />
        Workers
      </button>
    </div>
  );
}