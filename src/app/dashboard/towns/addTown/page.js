"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import TownForm from "@/components/admin/town/TownForm";

export default function AddTownPage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-text text-xl font-bold sm:text-2xl">Add Town</h1>

          <p className="text-text-secondary mt-1 text-sm">
            Create a new town in Zerodose.
          </p>
        </div>
      </div>

      {/* Form */}

      <TownForm
        mode="add"
        onSuccess={() => {
          router.push("/dashboard/towns");
        }}
      />
    </div>
  );
}
