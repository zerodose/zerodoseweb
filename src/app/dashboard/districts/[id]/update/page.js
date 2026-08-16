"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getDistrict } from "@/api/districtApi";
import DistrictForm from "@/components/admin/districts/DistrictForm";

export default function UpdateDistrictPage() {
  const router = useRouter();
  const params = useParams();

  const [district, setDistrict] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDistrict = async () => {
      try {
        setLoading(true);

        const response = await getDistrict(params.id);

        const data = response?.data;

        if (!data) {
          toast.error("District not found.");
          router.back();
          return;
        }

        setDistrict(data);
      } catch (error) {
        console.error("Get district error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load district.",
        );

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadDistrict();
    }
  }, [params?.id, router]);

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
            Update District
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            Update district details.
          </p>
        </div>
      </div>

      <DistrictForm
        mode="edit"
        district={district}
        onSuccess={() => {
          router.push(`/dashboard/districts/${params.id}`);
        }}
      />
    </div>
  );
}
