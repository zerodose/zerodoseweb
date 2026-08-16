"use client";

import CampaignForm from "@/components/admin/CampaignForm";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddCampaignPage() {
  const router = useRouter();

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
            Add Campaign
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            Create a new NID or SNID campaign.
          </p>
        </div>
      </div>

      <CampaignForm
        mode="add"
        onSuccess={() => {
          router.push("/dashboard/campaigns");
        }}
      />
    </div>
  );
}
