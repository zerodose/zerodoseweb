"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getPendingSupervisorApprovals,
  updateSupervisorApproval,
} from "@/api/supervisorApprovalApi";

import SupervisorApprovalCard from "@/components/ucmo/SupervisorApprovalCard";
import ClientPageHeader from "@/components/ui/ClientPageHeader";

export default function Page() {
  const router = useRouter();

  const [supervisors, setSupervisors] = useState([]);
  const [expandedSupervisors, setExpandedSupervisors] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // GET ID
  // ============================================================

  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "object") {
      return (
        value._id?.toString() ||
        value.id?.toString() ||
        value.value?.toString() ||
        null
      );
    }

    return value.toString();
  };

  // ============================================================
  // AUTH USER
  // ============================================================

  const getAuthUser = () => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "{}");
    } catch {
      return {};
    }
  };

  // ============================================================
  // GET UCMO UNION COUNCIL
  // ============================================================

  const getAuthUnionCouncil = (authUser) => {
    if (!authUser) return null;

    return (
      getId(authUser.unionCouncil) || getId(authUser.unionCouncilId) || null
    );
  };

  // ============================================================
  // FETCH APPROVALS
  // ============================================================

  const fetchApprovals = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const authUser = getAuthUser();

      if (!authUser?.id) {
        throw new Error("UCMO authentication data not found.");
      }

      const unionCouncilId = getAuthUnionCouncil(authUser);

      if (!unionCouncilId) {
        throw new Error(
          "Union Council information not found in UCMO authentication data.",
        );
      }

      const response = await getPendingSupervisorApprovals(unionCouncilId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch supervisor approvals.",
        );
      }

      setSupervisors(response.data || []);
    } catch (error) {
      console.error("Supervisor approvals fetch error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load supervisor approvals.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // ============================================================
  // TOGGLE SUPERVISOR
  // ============================================================

  const toggleSupervisor = (id) => {
    setExpandedSupervisors((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ============================================================
  // APPROVE / REJECT
  // ============================================================

  const handleApproval = async (supervisor, status) => {
    const supervisorId = getId(supervisor);

    if (!supervisorId) {
      toast.error("Invalid supervisor ID.");
      return;
    }

    try {
      setProcessingId(supervisorId);

      const response = await updateSupervisorApproval(supervisorId, status);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to update supervisor approval.",
        );
      }

      toast.success(
        status === "approved"
          ? "Supervisor approved successfully."
          : "Supervisor rejected successfully.",
      );

      setSupervisors((prev) =>
        prev.filter((item) => getId(item) !== supervisorId),
      );

      setExpandedSupervisors((prev) => {
        const updated = { ...prev };
        delete updated[supervisorId];
        return updated;
      });
    } catch (error) {
      console.error("Supervisor approval update error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update supervisor approval.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // LOADING SKELETON
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-full">
        <div className="mx-auto w-full max-w-7xl">
          {/* Header */}
          <div className="border-border mb-6 border-b pb-6">
            <div className="bg-surface mb-5 h-8 w-32 animate-pulse rounded-lg" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-surface h-11 w-11 shrink-0 animate-pulse rounded-xl" />

                <div>
                  <div className="bg-surface h-8 w-64 animate-pulse rounded-lg" />

                  <div className="bg-surface mt-3 h-4 w-80 animate-pulse rounded" />
                </div>
              </div>

              <div className="bg-surface h-10 w-28 animate-pulse rounded-xl" />
            </div>
          </div>

          {/* Section */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="bg-surface h-6 w-52 animate-pulse rounded" />

              <div className="bg-surface mt-2 h-4 w-72 animate-pulse rounded" />
            </div>

            <div className="bg-surface h-7 w-24 animate-pulse rounded-full" />
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="border-border bg-surface h-20 animate-pulse rounded-xl border"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-7xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="border-border mb-6 flex justify-between border-b pb-6">
          {/* Back */}
          <ClientPageHeader
            title="Supervisor Approvals"
            description="Review and manage pending supervisor registration requests."
            onBack={() => router.back()}
          />
          <button
            type="button"
            onClick={() => fetchApprovals(true)}
            disabled={refreshing}
            className="border-border text-text hover:border-primary/30 hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </header>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 overflow-hidden rounded-xl border border-red-200 bg-red-50">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Unable to load approvals
                  </p>

                  <p className="mt-0.5 text-xs text-red-600">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchApprovals(true)}
                disabled={refreshing}
                className="w-fit rounded-lg bg-red-100 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            SECTION HEADER
        ====================================================== */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-text text-lg font-bold tracking-tight">
                Pending Requests
              </h2>

              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
                {supervisors.length}
              </span>
            </div>

            <p className="text-text-secondary mt-1 text-xs md:text-sm">
              Review registration details and take the appropriate action.
            </p>
          </div>

          {supervisors.length > 0 && (
            <div className="text-text-secondary flex items-center gap-1.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {supervisors.length}{" "}
              {supervisors.length === 1 ? "request" : "requests"} waiting
            </div>
          )}
        </div>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {supervisors.length === 0 && !error && (
          <div className="border-border relative overflow-hidden rounded-xl border bg-white px-5 py-14 text-center shadow-sm">
            <div className="bg-primary/5 absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-2xl" />

            <div className="relative">
              <div className="bg-primary/10 text-primary mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl">
                <CheckCircle2 size={28} strokeWidth={1.8} />
              </div>

              <h3 className="text-text text-lg font-bold">All Caught Up</h3>

              <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                There are currently no supervisor registration requests waiting
                for your approval.
              </p>

              <button
                type="button"
                onClick={() => fetchApprovals(true)}
                disabled={refreshing}
                className="bg-primary hover:bg-primary-dark mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />

                <span>{refreshing ? "Checking..." : "Check Again"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            SUPERVISOR LIST
        ====================================================== */}

        {supervisors.length > 0 && (
          <div className="space-y-3">
            {supervisors.map((supervisor) => {
              const supervisorId = getId(supervisor);

              return (
                <SupervisorApprovalCard
                  key={supervisorId}
                  supervisor={supervisor}
                  expanded={!!expandedSupervisors[supervisorId]}
                  processing={processingId === supervisorId}
                  onToggle={() => toggleSupervisor(supervisorId)}
                  onApprove={() => handleApproval(supervisor, "approved")}
                  onReject={() => handleApproval(supervisor, "rejected")}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
