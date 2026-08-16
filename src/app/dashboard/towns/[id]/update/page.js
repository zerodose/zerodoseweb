"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getTown } from "@/api/townApi";
import TownForm from "@/components/admin/town/TownForm";

export default function UpdateTownPage() {
  const router = useRouter();
  const params = useParams();

  const [town, setTown] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Get Town
  // =====================================================

  useEffect(() => {
    const loadTown = async () => {
      try {
        setLoading(true);

        const response = await getTown(params.id);

        const data = response?.data;

        if (!data) {
          toast.error("Town not found.");
          router.back();
          return;
        }

        setTown(data);
      } catch (error) {
        console.error("Get town error:", error);

        toast.error(error?.response?.data?.message || "Failed to load town.");

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadTown();
    }
  }, [params?.id, router]);

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-surface h-10 w-10 animate-pulse rounded-xl" />

          <div>
            <div className="bg-surface h-6 w-40 animate-pulse rounded" />

            <div className="bg-surface mt-2 h-4 w-64 animate-pulse rounded" />
          </div>
        </div>

        <div className="bg-background border-border rounded-2xl border shadow-sm">
          <div className="border-border border-b p-6">
            <div className="bg-surface h-6 w-48 animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
            {[1, 2].map((item) => (
              <div key={item}>
                <div className="bg-surface mb-2 h-4 w-24 animate-pulse rounded" />

                <div className="bg-surface h-12 w-full animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // Page
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-7xl">
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
            Update Town
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            Update town details.
          </p>
        </div>
      </div>

      <TownForm
        mode="edit"
        town={town}
        onSuccess={() => {
          router.push(`/dashboard/towns/${params.id}`);
        }}
      />
    </div>
  );
}
