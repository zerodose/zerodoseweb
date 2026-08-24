"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleUserRound,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getUser } from "@/api/userApi";

export default function UCMOViewPage() {
  const router = useRouter();
  const params = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // Load UCMO
  // ============================================================

  useEffect(() => {
    const loadUCMO = async () => {
      try {
        setLoading(true);

        const storedUser = localStorage.getItem("authUser");

        if (!storedUser) {
          router.replace("/auth/login");
          return;
        }

        const authUser = JSON.parse(storedUser);

        // ======================================================
        // Check TownFP
        // ======================================================

        if (
          String(authUser?.designation || "").toLowerCase() !== "townfp"
        ) {
          router.replace("/dashboard");
          return;
        }

        // ======================================================
        // Current Town ID
        // ======================================================

        const currentTownId =
          authUser?.town?._id ||
          authUser?.town?.id ||
          authUser?.town ||
          "";

        if (!currentTownId) {
          toast.error("Town information not found.");
          router.back();
          return;
        }

        // ======================================================
        // Get User
        // ======================================================

        const response = await getUser(params.id);

        const data = response?.data;

        if (!data) {
          toast.error("UCMO not found.");
          router.back();
          return;
        }

        // ======================================================
        // Validate UCMO
        // ======================================================

        const designation = String(data?.designation || "").toLowerCase();

        if (designation !== "ucmo") {
          toast.error("This user is not a UCMO.");
          router.back();
          return;
        }

        // ======================================================
        // Validate Active + Approved
        // ======================================================

        if (
          data?.isActive !== true ||
          String(data?.approvalStatus || "").toLowerCase() !== "approved"
        ) {
          toast.error("This UCMO is not active and approved.");
          router.back();
          return;
        }

        // ======================================================
        // Validate Same Town
        // ======================================================

        const userTownId =
          data?.town?._id ||
          data?.town?.id ||
          data?.town ||
          "";

        if (String(userTownId) !== String(currentTownId)) {
          toast.error("This UCMO does not belong to your town.");
          router.back();
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Get UCMO error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load UCMO.",
        );

        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadUCMO();
    }
  }, [params?.id, router]);

  // ============================================================
  // Detail Item
  // ============================================================

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }) => (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <span className="text-sm font-medium text-text-secondary">
          {label}
        </span>
      </div>

      <p className="break-words text-sm font-semibold text-text">
        {value || "-"}
      </p>
    </div>
  );

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}

        <div className="mb-6 flex items-center gap-3">
          <div className="bg-surface h-10 w-10 animate-pulse rounded-xl" />

          <div>
            <div className="bg-surface mb-2 h-6 w-40 animate-pulse rounded" />
            <div className="bg-surface h-4 w-64 animate-pulse rounded" />
          </div>
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-border bg-background shadow-sm">
          <div className="border-b border-border p-6">
            <div className="bg-surface mb-3 h-6 w-48 animate-pulse rounded" />
            <div className="bg-surface h-4 w-72 animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index}>
                <div className="bg-surface mb-2 h-4 w-24 animate-pulse rounded" />
                <div className="bg-surface h-12 w-full animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // No User
  // ============================================================

  if (!user) {
    return null;
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* ========================================================
          Header
      ======================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-text-secondary shadow-sm transition hover:border-primary hover:bg-primary-light hover:text-primary"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-text sm:text-2xl">
            UCMO Details
          </h1>

          <p className="text-sm text-text-secondary">
            View UCMO account and assignment details.
          </p>
        </div>
      </div>

      {/* ========================================================
          Main Card
      ======================================================== */}

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        {/* ======================================================
            Summary Header
        ====================================================== */}

        <div className="border-b border-border bg-surface/50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light">
                <CircleUserRound className="h-7 w-7 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-text sm:text-xl">
                  {user.name || "-"}
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Union Council Medical Officer
                </p>
              </div>
            </div>

            {/* Status */}

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Active
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <BadgeCheck className="h-4 w-4" />
                Approved
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            Account Information
        ====================================================== */}

        <div className="p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-text">
              Account Information
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Basic information of the UCMO.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              icon={User}
              label="Name"
              value={user.name}
            />

            <DetailItem
              icon={Mail}
              label="Email"
              value={user.email}
            />

            <DetailItem
              icon={Phone}
              label="Contact Number"
              value={user.contactNumber}
            />

            <DetailItem
              icon={ShieldCheck}
              label="Designation"
              value={user.designation?.toUpperCase()}
            />

            <DetailItem
              icon={Hash}
              label="User ID"
              value={user._id}
            />

            <DetailItem
              icon={BadgeCheck}
              label="Approval Status"
              value={user.approvalStatus}
            />
          </div>
        </div>

        {/* ======================================================
            Location / Assignment
        ====================================================== */}

        <div className="border-t border-border p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-text">
              Assignment Details
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              District, town and union council assigned to this UCMO.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              icon={MapPin}
              label="District"
              value={user.district?.name}
            />

            <DetailItem
              icon={Building2}
              label="Town"
              value={user.town?.name}
            />

            <DetailItem
              icon={Building2}
              label="Union Council"
              value={user.unionCouncil?.name}
            />
          </div>
        </div>

        {/* ======================================================
            Account Status
        ====================================================== */}

        <div className="border-t border-border p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-text">
              Account Status
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Current account and approval status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
                  {user.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-text-secondary" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-text">
                    Active Account
                  </p>

                  <p className="text-xs text-text-secondary">
                    Account activation status
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold text-text">
                {user.isActive ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text">
                    Approval Status
                  </p>

                  <p className="text-xs text-text-secondary">
                    Account approval status
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold capitalize text-text">
                {user.approvalStatus || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}