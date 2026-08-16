"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getTown,
  deleteTown,
} from "@/api/townApi";

import TownForm from "@/components/admin/town/TownForm";
import DeleteConfirmModal from "@/components/admin/ui/DeleteConfirmModal";
import ActionButtons from "@/components/admin/ui/ActionButtons";

export default function TownViewPage() {
  const router = useRouter();
  const params = useParams();

  const [town, setTown] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  // =====================================================
  // Admin Check
  // =====================================================

  useEffect(() => {
    const authUser =
      localStorage.getItem("authUser");

    if (!authUser) {
      return;
    }

    try {
      const user = JSON.parse(authUser);

      setIsAdmin(
        user?.designation === "admin",
      );
    } catch (error) {
      console.error(
        "Auth user parse error:",
        error,
      );
    }
  }, []);

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
        console.error(
          "Get town error:",
          error,
        );

        toast.error(
          error?.response?.data?.message ||
            "Failed to load town.",
        );

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
  // Delete
  // =====================================================

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteTown(town._id);

      toast.success(
        "Town deleted successfully.",
      );

      setDeleteModalOpen(false);

      router.push("/dashboard/towns");
    } catch (error) {
      console.error(
        "Delete town error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete town.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =================================================
          Header
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-text text-xl font-bold sm:text-2xl">
              View Town
            </h1>

            <p className="text-text-secondary mt-1 text-sm">
              View town details.
            </p>
          </div>
        </div>

        {/* Actions */}

        {!loading && town && isAdmin && (
          <div className="w-full sm:w-auto">
            <ActionButtons
              onEdit={() =>
                router.push(
                  `/dashboard/towns/${town._id}/update`,
                )
              }
              onDelete={() =>
                setDeleteModalOpen(true)
              }
            />
          </div>
        )}
      </div>

      {/* =================================================
          Form
      ================================================= */}

      {loading ? (
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
      ) : town ? (
        <TownForm
          mode="view"
          town={town}
        />
      ) : null}

      {/* =================================================
          Delete Modal
      ================================================= */}

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() =>
          setDeleteModalOpen(false)
        }
        onConfirm={handleDelete}
        itemName={town?.name || ""}
        itemLabel="Town"
        loading={deleting}
      />
    </div>
  );
}