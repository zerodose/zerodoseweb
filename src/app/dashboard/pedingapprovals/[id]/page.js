"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getPendingApprovalUser, updateUserApproval } from "@/api/userApi";

import TopHeader from "@/components/admin/ui/TopHeader";
import ApprovalConfirmModal from "@/components/admin/ui/ApprovalConfirmModal";

export default function PendingApprovalViewPage() {
  const router = useRouter();
  const params = useParams();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);

  // ============================================================
  // Load Pending Approval
  // ============================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        const response = await getPendingApprovalUser(params.id);

        if (!response?.success || !response?.data) {
          toast.error(response?.message || "Pending approval not found.");

          router.back();
          return;
        }

        setUser(response.data);
      } catch (error) {
        console.error("Get pending approval error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load pending approval.",
        );

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadUser();
    }
  }, [params?.id, router]);

  // ============================================================
  // Approval Action
  // ============================================================

  const handleApproval = async (status) => {
    if (!user || updating) {
      return;
    }

    setApprovalAction(status);
    setConfirmationModalOpen(true);
  };
  const confirmApproval = async () => {
    if (!user || !approvalAction || updating) {
      return;
    }

    const status = approvalAction;
    const actionText = status === "approved" ? "approve" : "reject";

    try {
      setUpdating(true);

      const response = await updateUserApproval(user._id, status);

      if (!response?.success) {
        toast.error(response?.message || `Failed to ${actionText} user.`);
        return;
      }

      if (status === "approved") {
        toast.success("District Focal Person approved successfully.");
      } else {
        toast.success("District Focal Person rejected successfully.");
      }

      setConfirmationModalOpen(false);
      setApprovalAction(null);

      router.push("/dashboard/pedingapprovals");
    } catch (error) {
      console.error("Approval update error:", error);

      toast.error(
        error?.response?.data?.message || `Failed to ${actionText} user.`,
      );
    } finally {
      setUpdating(false);
    }
  };

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <TopHeader
          title="Pending Approval"
          description="Review District Focal Person registration."
          onBack={() => router.back()}
        />

        <div className="bg-background border-border rounded-2xl border shadow-sm">
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
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

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* ============================================================
          Header
      ============================================================ */}

      <TopHeader
        title="Pending Approval"
        description="Review District Focal Person registration."
        onBack={() => router.back()}
      />

      {/* ============================================================
          User Information
      ============================================================ */}

      <div className="bg-background border-border rounded-2xl border shadow-sm">
        <div className="border-border border-b p-6">
          <h2 className="text-text text-lg font-semibold">
            Registration Information
          </h2>

          <p className="text-text-secondary mt-1 text-sm">
            Review the applicant details before approving or rejecting the
            registration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          {/* Name */}

          <InfoField label="Full Name" value={user.name} />

          {/* Email */}

          <InfoField label="Email" value={user.email} />

          {/* Contact */}

          <InfoField label="Contact Number" value={user.contactNumber} />

          {/* Designation */}

          <InfoField label="Designation" value="District Focal Person" />

          {/* District */}

          <InfoField label="District" value={user.district?.name || "-"} />

          {/* Town */}

          {/* <InfoField label="Town" value={user.town?.name || "-"} /> */}

          {/* Union Council */}

          {/* <InfoField
            label="Union Council"
            value={user.unionCouncil?.name || "-"}
          /> */}

          {/* Approval Status */}

          <InfoField
            label="Approval Status"
            value={user.approvalStatus || "pending"}
          />
        </div>

        {/* ==========================================================
            Actions
        ========================================================== */}

        <div className="border-border flex flex-col gap-3 border-t p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => handleApproval("rejected")}
            disabled={updating}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />

            {updating ? "Processing..." : "Reject"}
          </button>

          <button
            type="button"
            onClick={() => handleApproval("approved")}
            disabled={updating}
            className="bg-primary text-primary-foreground hover:bg-primary-dark flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={18} />

            {updating ? "Processing..." : "Approve"}
          </button>
        </div>
      </div>
      <ApprovalConfirmModal
        open={confirmationModalOpen}
        action={approvalAction === "approved" ? "approve" : "reject"}
        userName={user?.name || ""}
        loading={updating}
        onConfirm={confirmApproval}
        onClose={() => {
          if (!updating) {
            setConfirmationModalOpen(false);
            setApprovalAction(null);
          }
        }}
      />
    </div>
  );
}

// ============================================================
// Info Field
// ============================================================

function InfoField({ label, value }) {
  return (
    <div>
      <label className="text-text-secondary mb-2 block text-sm font-medium">
        {label}
      </label>

      <div className="bg-input-background border-border text-text rounded-lg border px-4 py-3 text-sm">
        {value || "-"}
      </div>
    </div>
  );
}
