"use client";

import { Users, UserPlus, Syringe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SupervisorActions() {
  const router = useRouter();

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:flex md:flex-wrap">
      {/* Add Workers */}

      <button
        type="button"
        onClick={() => router.push("/supervisor/addworker")}
        className="bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition md:justify-start"
      >
        <UserPlus size={17} />

        <span>Add Workers</span>
      </button>

      {/* Workers */}

      <button
        type="button"
        onClick={() => router.push("/supervisor/workers")}
        className="border-border bg-surface text-text hover:bg-background flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition md:justify-start"
      >
        <Users size={17} />

        <span>Workers</span>
      </button>

      {/* Zerodose List */}

      <button
        type="button"
        onClick={() => router.push("/supervisor/zerodose")}
        className="border-border bg-surface text-text hover:bg-background col-span-2 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition md:col-span-1 md:justify-start"
      >
        <Syringe size={17} />

        <span>Zerodose List</span>
      </button>
    </div>
  );
}