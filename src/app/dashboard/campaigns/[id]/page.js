"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCampaign, getCampaign } from "@/api/campaignApi";
import CampaignForm from "@/components/admin/CampaignForm";
import DeleteConfirmModal from "@/components/admin/ui/DeleteConfirmModal";
import ActionButtons from "@/components/admin/ui/ActionButtons";

export default function CampaignViewPage() {
  const router = useRouter();
  const params = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const authUser = localStorage.getItem("authUser");

    if (!authUser) {
      return;
    }

    try {
      const user = JSON.parse(authUser);

      setIsAdmin(user?.designation === "admin");
    } catch (error) {
      console.error("Auth user parse error:", error);
    }
  }, []);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);

        const response = await getCampaign(params.id);
        const data = response?.data;

        if (!data) {
          toast.error("Campaign not found.");
          router.back();
          return;
        }

        setCampaign(data);
      } catch (error) {
        console.error("Get campaign error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load campaign.",
        );

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadCampaign();
    }
  }, [params?.id, router]);

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteCampaign(campaign._id);

      toast.success("Campaign deleted successfully.");

      setDeleteModalOpen(false);

      router.push("/dashboard/campaigns");
    } catch (error) {
      console.error("Delete campaign error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete campaign.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-text text-xl font-bold sm:text-2xl">
              View Campaign
            </h1>

            <p className="text-text-secondary mt-1 text-sm">
              View campaign details.
            </p>
          </div>
        </div>

        {!loading && campaign && isAdmin && (
          <ActionButtons
            onEdit={() =>
              router.push(`/dashboard/campaigns/${campaign._id}/update`)
            }
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}
      </div>

      {loading ? (
        <div className="bg-background border-border rounded-2xl border shadow-sm">
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div key={item}>
                <div className="bg-surface mb-2 h-4 w-24 animate-pulse rounded" />

                <div className="bg-surface h-12 w-full animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ) : campaign ? (
        <CampaignForm mode="view" campaign={campaign} />
      ) : null}

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={campaign?.name || ""}
        itemLabel="Campaign"
        loading={deleting}
      />
    </div>
  );
}
