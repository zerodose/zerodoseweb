"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getUnionCouncil } from "@/api/unionCouncilApi";

import UnionCouncilForm from "@/components/admin/unioncouncil/UnionCouncilForm";

export default function UpdateUnionCouncilPage() {
  const router = useRouter();
  const params = useParams();

  const [unionCouncil, setUnionCouncil] = useState(null);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // Load Union Council
  // =====================================================

  useEffect(() => {
    const loadUnionCouncil = async () => {
      try {
        setLoading(true);

        const response = await getUnionCouncil(params.id);

        const data = response?.data;

        if (!data) {
          toast.error("Union Council not found.");

          router.back();

          return;
        }

        setUnionCouncil(data);
      } catch (error) {
        console.error("Get Union Council error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load Union Council.",
        );

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadUnionCouncil();
    }
  }, [params?.id, router]);

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        {/* Header Skeleton */}

        <div className="mb-6 flex items-center gap-3">
          <div className="bg-surface h-10 w-10 animate-pulse rounded-xl" />

          <div>
            <div className="bg-surface h-6 w-48 animate-pulse rounded" />

            <div className="bg-surface mt-2 h-4 w-64 animate-pulse rounded" />
          </div>
        </div>

        {/* Form Skeleton */}

        <div className="bg-background border-border rounded-2xl border shadow-sm">
          <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
            <div className="bg-surface h-10 w-10 animate-pulse rounded-xl" />

            <div>
              <div className="bg-surface h-5 w-48 animate-pulse rounded" />

              <div className="bg-surface mt-2 h-3 w-64 animate-pulse rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item}>
                <div className="bg-surface mb-2 h-4 w-28 animate-pulse rounded" />

                <div className="bg-surface h-12 w-full animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

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
          <h1 className="text-text text-xl font-bold sm:text-2xl">
            Update Union Council
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            Update Union Council details.
          </p>
        </div>
      </div>

      {/* Form */}

      <UnionCouncilForm
        mode="edit"
        unionCouncil={unionCouncil}
        onSuccess={() => {
          router.push(`/dashboard/unioncouncils/${params.id}`);
        }}
      />
    </div>
  );
}
