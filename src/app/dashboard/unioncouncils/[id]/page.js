"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getUnionCouncil, deleteUnionCouncil } from "@/api/unionCouncilApi";
import DeleteConfirmModal from "@/components/admin/ui/DeleteConfirmModal";
import UnionCouncilForm from "@/components/admin/unioncouncil/UnionCouncilForm";
import ActionButtons from "@/components/admin/ui/ActionButtons";

export default function UnionCouncilViewPage() {
  const router = useRouter();
  const params = useParams();

  const [unionCouncil, setUnionCouncil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // =====================================================
  // Check Admin
  // =====================================================

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
  // Delete
  // =====================================================

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteUnionCouncil(unionCouncil._id);

      toast.success("Union Council deleted successfully.");

      setDeleteModalOpen(false);

      router.push("/dashboard/unioncouncils");
    } catch (error) {
      console.error("Delete Union Council error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete Union Council.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between gap-3">
        {/* Left */}

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
              View Union Council
            </h1>

            <p className="text-text-secondary mt-1 text-sm">
              View Union Council details.
            </p>
          </div>
        </div>

        {/* Right */}

        {!loading && unionCouncil && isAdmin && (
          <ActionButtons
            onEdit={() =>
              router.push(
                `/dashboard/unioncouncils/${unionCouncil._id}/update`,
              )
            }
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}
      </div>

      {/* =====================================================
          Form
      ===================================================== */}

      {loading ? (
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
      ) : unionCouncil ? (
        <UnionCouncilForm mode="view" unionCouncil={unionCouncil} />
      ) : null}

      {/* =====================================================
          Delete Modal
      ===================================================== */}

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={unionCouncil?.name || ""}
        itemLabel="Union Council"
        loading={deleting}
      />
    </div>
  );
}
