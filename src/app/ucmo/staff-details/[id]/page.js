"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getUser, updateUserStatus } from "@/api/userApi";

import AdminSignupForm from "@/components/auth/AdminSignupForm";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";

export default function UserViewPage() {
  const router = useRouter();
  const params = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUCMO, setIsUCMO] = useState(false);

  // =====================================================
  // Check Admin
  // =====================================================

  useEffect(() => {
    const authUser = localStorage.getItem("authUser");

    if (!authUser) {
      return;
    }

    try {
      const loggedInUser = JSON.parse(authUser);

      setIsUCMO(loggedInUser?.designation === "ucmo");
    } catch (error) {
      console.error("Auth user parse error:", error);
    }
  }, []);

  // =====================================================
  // Load User
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        const response = await getUser(params.id);

        const data = response?.data;

        if (!data) {
          toast.error("User not found.");
          router.back();
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Get user error:", error);

        toast.error(error?.response?.data?.message || "Failed to load user.");

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadUser();
    }
  }, [params?.id, router]);

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      const newIsActive = !user.isActive;

      const newApprovalStatus = newIsActive ? "approved" : "pending";

      await updateUserStatus(user._id, {
        isActive: newIsActive,
        approvalStatus: newApprovalStatus,
      });

      setUser((previous) => ({
        ...previous,
        isActive: newIsActive,
        approvalStatus: newApprovalStatus,
      }));

      toast.success(
        newIsActive
          ? "User activated and approved successfully."
          : "User deactivated and moved to pending.",
      );
    } catch (error) {
      console.error("Update user status error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update user status.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          Header
      ===================================================== */}

      {/* <div className="mb-6 flex items-center justify-between gap-3"> */}
      {/* Left Side */}

      <ApprovalPageHeader
        title="User Details"
        description="Review and manage details."
        onBack={() => router.back()}
      />

      {/* Right Side */}

      {/* </div> */}

      {/* =====================================================
          User Form
      ===================================================== */}
      {isUCMO && user && (
        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={handleToggleStatus}
            className="bg-primary hover:bg-gray-dark rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            {user.isActive ? "Deactivate & Set Pending" : "Activate & Approve"}
          </button>
        </div>
      )}

      {loading ? (
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
      ) : user ? (
        <AdminSignupForm mode="view" userId={user._id} user={user} />
      ) : null}

      {/* =====================================================
          Delete Modal
      ===================================================== */}
    </div>
  );
}
