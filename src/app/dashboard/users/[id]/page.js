"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteUser, getUser } from "@/api/userApi";

import AdminSignupForm from "@/components/auth/AdminSignupForm";
import DeleteConfirmModal from "@/components/admin/ui/DeleteConfirmModal";
import ActionButtons from "@/components/admin/ui/ActionButtons";
import TopHeader from "@/components/admin/ui/TopHeader";

export default function UserViewPage() {
  const router = useRouter();
  const params = useParams();

  const [user, setUser] = useState(null);
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
      const loggedInUser = JSON.parse(authUser);

      setIsAdmin(loggedInUser?.designation === "admin");
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

  // =====================================================
  // Delete User
  // =====================================================

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteUser(user._id);

      toast.success("User deleted successfully.");

      setDeleteModalOpen(false);

      router.push("/dashboard/users");
    } catch (error) {
      console.error("Delete user error:", error);

      toast.error(error?.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          Header
      ===================================================== */}

      {/* <div className="mb-6 flex items-center justify-between gap-3"> */}
        {/* Left Side */}

        <TopHeader
          title="View User"
          description="View user account and access details."
          onBack={() => router.back()}
          actions={
            !loading && user && isAdmin ? (
              <ActionButtons
                showEdit={false}
                onDelete={() => setDeleteModalOpen(true)}
              />
            ) : null
          }
        />

        {/* Right Side */}

      {/* </div> */}

      {/* =====================================================
          User Form
      ===================================================== */}

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

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={user?.name || ""}
        itemLabel="User"
        loading={deleting}
      />
    </div>
  );
}
