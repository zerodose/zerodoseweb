"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteDistrict, getDistrict } from "@/api/districtApi";
import DeleteConfirmModal from "@/components/admin/ui/DeleteConfirmModal";
import DistrictForm from "@/components/admin/districts/DistrictForm";
import ActionButtons from "@/components/admin/ui/ActionButtons";

export default function DistrictViewPage() {
  const router = useRouter();
  const params = useParams();

  const [district, setDistrict] = useState(null);
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

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteDistrict(district._id);

      toast.success("District deleted successfully.");

      setDeleteModalOpen(false);

      router.push("/dashboard/districts");
    } catch (error) {
      console.error("Delete district error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete district.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-text text-xl font-bold sm:text-2xl">
              View District
            </h1>

            <p className="text-text-secondary mt-1 text-sm">
              View district details.
            </p>
          </div>
        </div>

        {!loading && district && isAdmin && (
          <ActionButtons
            onEdit={() =>
              router.push(`/dashboard/districts/${district._id}/update`)
            }
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}
      </div>

      {/* Form */}
      {loading ? (
        <div className="bg-background border-border rounded-2xl border shadow-sm">
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
            {[1, 2].map((item) => (
              <div key={item}>
                <div className="bg-surface mb-2 h-4 w-24 animate-pulse rounded" />

                <div className="bg-surface h-12 w-full animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ) : district ? (
        <DistrictForm mode="view" district={district} />
      ) : null}

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={district?.name || ""}
        itemLabel="District"
        loading={deleting}
      />
    </div>
  );
}
