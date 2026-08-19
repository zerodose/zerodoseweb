"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getZerodose } from "@/api/zerodoseApi";
import ZerodoseView from "@/components/worker/ZerodoseView";

export default function ZerodoseViewPage() {
  const router = useRouter();
  const params = useParams();

  const [zerodose, setZerodose] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // Load Zerodose
  // ============================================================

  useEffect(() => {
    const loadZerodose = async () => {
      try {
        setLoading(true);

        const response = await getZerodose(params.id);

        const data = response?.data;

        if (!data) {
          toast.error("Zerodose not found.");
          router.back();
          return;
        }

        setZerodose(data);
      } catch (error) {
        console.error("Get Zerodose error:", error);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load Zerodose.",
        );

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadZerodose();
    }
  }, [params?.id, router]);

  // ============================================================
  // Loading Skeleton
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        {/* Header Skeleton */}

        <div className="mb-6 flex items-center gap-3">
          <div className="bg-surface h-10 w-10 animate-pulse rounded-xl" />

          <div>
            <div className="bg-surface h-6 w-40 animate-pulse rounded" />

            <div className="bg-surface mt-2 h-4 w-56 animate-pulse rounded" />
          </div>
        </div>

        {/* Card Skeleton */}

        <div className="bg-background border-border overflow-hidden rounded-xl border shadow-sm">
          {[1, 2, 3, 4].map((section) => (
            <div
              key={section}
              className="border-border border-b p-5 last:border-b-0 sm:p-6"
            >
              {/* Section Heading */}

              <div className="mb-5 flex items-center gap-3">
                <div className="bg-surface h-10 w-10 animate-pulse rounded-lg" />

                <div>
                  <div className="bg-surface h-5 w-44 animate-pulse rounded" />

                  <div className="bg-surface mt-2 h-3 w-60 animate-pulse rounded" />
                </div>
              </div>

              {/* Fields */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[1, 2, 3, 4].map((field) => (
                  <div key={field}>
                    <div className="bg-surface mb-2 h-3 w-24 animate-pulse rounded" />

                    <div className="bg-surface h-11 w-full animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* ========================================================
          Header
      ======================================================== */}

      <div className="mb-6 flex items-center gap-3">
        {/* Back */}

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-background border-border text-text-secondary hover:bg-surface flex h-10 w-10 items-center justify-center rounded-xl border transition"
          title="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Heading */}

        <div>
          <h1 className="text-text text-xl font-bold sm:text-2xl">
            View Zerodose
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            View complete Zerodose details.
          </p>
        </div>
      </div>

      {/* ========================================================
          Zerodose Details
      ======================================================== */}

      {zerodose && <ZerodoseView data={zerodose} />}
    </div>
  );
}
