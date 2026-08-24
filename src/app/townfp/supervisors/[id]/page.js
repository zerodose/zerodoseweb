"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { toast } from "sonner";

import TopHeader from "@/components/admin/ui/TopHeader";

export default function SupervisorSummaryViewPage() {
  const router = useRouter();
  const params = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Load UCMO + Supervisors
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      if (!params?.id) {
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `/api/users/town-supervisor-summary/${params.id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message || "Failed to load UCMO and supervisor details.",
          );
        }

        setData(result.data);
      } catch (error) {
        console.error("Get UCMO supervisor details error:", error);

        toast.error(error?.message || "Failed to load supervisor details.");

        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params?.id, router]);

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <TopHeader
          title="UCMO & Supervisors"
          description="View UCMO and supervisor details."
          onBack={() => router.back()}
        />

        <div className="space-y-6">
          <div className="bg-background border-border animate-pulse rounded-2xl border shadow-sm">
            <div className="p-6">
              <div className="bg-surface mb-4 h-6 w-48 rounded" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item}>
                    <div className="bg-surface mb-2 h-4 w-24 rounded" />
                    <div className="bg-surface h-11 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-background border-border animate-pulse rounded-2xl border shadow-sm">
            <div className="p-6">
              <div className="bg-surface mb-4 h-6 w-56 rounded" />

              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-surface h-20 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // No Data
  // =====================================================

  if (!data) {
    return null;
  }

  const ucmo = data?.ucmo;
  const supervisors = data?.supervisors || [];

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          Header
      ===================================================== */}

      <TopHeader
        title={ucmo?.name || "UCMO & Supervisors"}
        description="View UCMO and assigned supervisor details."
        onBack={() => router.back()}
      />

      <div className="space-y-6">
        {/* =====================================================
            Location / UC Summary
        ===================================================== */}

        <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border border-b p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-light text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-text text-lg font-semibold">
                  Union Council Details
                </h2>

                <p className="text-text-secondary text-sm">
                  Location and UCMO assignment information.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            <DetailItem
              icon={Building2}
              label="District"
              value={data?.district?.name}
            />

            <DetailItem
              icon={Building2}
              label="Town"
              value={data?.town?.name}
            />

            <DetailItem
              icon={MapPin}
              label="Union Council"
              value={data?.unionCouncil?.name}
            />

            <DetailItem
              icon={MapPin}
              label="UC Code"
              value={data?.unionCouncil?.code}
            />

            <DetailItem icon={Users} label="UCMO" value={ucmo?.name} />

            <DetailItem
              icon={Users}
              label="Supervisors"
              value={supervisors.length}
            />
          </div>
        </div>

        {/* =====================================================
            UCMO Details
        ===================================================== */}

        <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border border-b p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-light text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                <User className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-text text-lg font-semibold">
                  UCMO Details
                </h2>

                <p className="text-text-secondary text-sm">
                  Complete information about the UCMO.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            <DetailItem icon={User} label="Name" value={ucmo?.name} />

            <DetailItem icon={Mail} label="Email" value={ucmo?.email} />

            <DetailItem
              icon={Phone}
              label="Contact"
              value={ucmo?.contactNumber}
            />

            <DetailItem
              icon={ShieldCheck}
              label="Designation"
              value={ucmo?.designation}
            />

            <DetailItem
              icon={CheckCircle2}
              label="Approval Status"
              value={ucmo?.approvalStatus}
            />

            <DetailItem
              icon={CheckCircle2}
              label="Status"
              value={ucmo?.isActive ? "Active" : "Inactive"}
            />
          </div>
        </div>

        {/* =====================================================
            Supervisors
        ===================================================== */}

        <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border border-b p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary-light text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-text text-lg font-semibold">
                    Supervisors
                  </h2>

                  <p className="text-text-secondary text-sm">
                    Active and approved supervisors under this UCMO.
                  </p>
                </div>
              </div>

              <div className="bg-primary-light text-primary rounded-xl px-4 py-2 text-sm font-semibold">
                {supervisors.length}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {supervisors.length === 0 ? (
              <div className="border-border text-text-secondary rounded-xl border border-dashed p-8 text-center">
                No active approved supervisors found.
              </div>
            ) : (
              <div className="space-y-4">
                {supervisors.map((supervisor) => (
                  <div
                    key={supervisor._id}
                    className="border-border bg-surface/40 hover:border-primary/40 rounded-2xl border p-5 transition-all hover:shadow-sm"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <DetailItem
                        icon={User}
                        label="Name"
                        value={supervisor?.name}
                      />

                      <DetailItem
                        icon={ShieldCheck}
                        label="Supervisor Code"
                        value={supervisor?.supervisorCode}
                      />

                      <DetailItem
                        icon={Phone}
                        label="Contact"
                        value={supervisor?.contactNumber}
                      />

                      <DetailItem
                        icon={Mail}
                        label="Email"
                        value={supervisor?.email}
                      />
                    </div>

                    <div className="border-border mt-5 grid grid-cols-1 gap-5 border-t pt-5 sm:grid-cols-3">
                      <DetailItem
                        icon={Building2}
                        label="District"
                        value={supervisor?.district?.name}
                      />

                      <DetailItem
                        icon={Building2}
                        label="Town"
                        value={supervisor?.town?.name}
                      />

                      <DetailItem
                        icon={MapPin}
                        label="Union Council"
                        value={supervisor?.unionCouncil?.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Detail Item
// =====================================================

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-text-secondary mb-1.5 flex items-center gap-2 text-xs font-medium">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>

      <div className="text-text truncate text-sm font-semibold">
        {value || "-"}
      </div>
    </div>
  );
}
