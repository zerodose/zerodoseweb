"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CheckCircle2, FileEdit, RefreshCw } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getPendingZerodoseUpdates,
  updateZerodoseApproval,
} from "@/api/zerodoseApprovalApi";

import ClientPageHeader from "@/components/ui/ClientPageHeader";
import Loader from "@/components/ui/Loader";
import ZerodoseApprovalCard from "@/components/supervisor/ZerodoseApprovalCard";

export default function Page() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [requests, setRequests] = useState([]);
  const [expandedRequests, setExpandedRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [pageReady, setPageReady] = useState(false);

  // ============================================================
  // PAGE ANIMATION
  // ============================================================

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 80);

      return () => clearTimeout(timer);
    }

    setPageReady(false);
  }, [loading]);

  // ============================================================
  // GET ID
  // ============================================================

  const getId = useCallback((value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      if (value?._id) {
        return String(value._id);
      }

      if (value?.id) {
        return String(value.id);
      }

      if (value?.value) {
        return String(value.value);
      }

      return null;
    }

    return String(value);
  }, []);

  // ============================================================
  // AUTH USER
  // ============================================================

  const getAuthUser = useCallback(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      return JSON.parse(localStorage.getItem("authUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  // ============================================================
  // FORMAT DATE TIME
  // ============================================================

  const formatDateTime = useCallback((value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // ============================================================
  // FIELD LABEL
  // ============================================================

  const getFieldLabel = useCallback((field) => {
    const labels = {
      houseNumber: "House Number",
      childName: "Child Name",
      fatherName: "Father Name",
      age: "Age",
      address: "Address",
      contactNo: "Contact Number",
      gender: "Gender",
      visitDate: "Visit Date",
      coveredDate: "Covered Date",
      clientStatus: "Client Status",
      vaccinationStatus: "Vaccination Status",
    };

    return (
      labels[field] ||
      field
        ?.replace(/([A-Z])/g, " $1")
        ?.replace(/^./, (char) => char.toUpperCase()) ||
      field
    );
  }, []);

  // ============================================================
  // FIELD ICON
  // ============================================================

  const getFieldIcon = useCallback((field) => {
    const icons = {
      childName: CheckCircle2,
      fatherName: CheckCircle2,
      age: CheckCircle2,
      address: CheckCircle2,
      contactNo: CheckCircle2,
      location: CheckCircle2,
      gender: CheckCircle2,
      houseNumber: FileEdit,
      visitDate: FileEdit,
      coveredDate: FileEdit,
      clientStatus: FileEdit,
      vaccinationStatus: FileEdit,
    };

    return icons[field] || FileEdit;
  }, []);

  // ============================================================
  // GET ZERODOSE OBJECT
  // ============================================================

  const getZerodoseData = useCallback((request) => {
    if (!request || typeof request !== "object") {
      return {};
    }

    if (
      request.zerodose &&
      typeof request.zerodose === "object" &&
      !Array.isArray(request.zerodose)
    ) {
      return request.zerodose;
    }

    /*
     * Alternative structure.
     */

    if (
      request.zerodoseData &&
      typeof request.zerodoseData === "object" &&
      !Array.isArray(request.zerodoseData)
    ) {
      return request.zerodoseData;
    }

    /*
     * Alternative oldData structure.
     */

    if (
      request.oldData &&
      typeof request.oldData === "object" &&
      !Array.isArray(request.oldData)
    ) {
      return request.oldData;
    }

    /*
     * Alternative data structure.
     */

    if (
      request.data &&
      typeof request.data === "object" &&
      !Array.isArray(request.data)
    ) {
      return request.data;
    }

    /*
     * If request itself is the Zerodose document.
     */

    return request;
  }, []);

  // ============================================================
  // GET REQUESTED / NEW DATA
  // ============================================================

  const getRequestedData = useCallback((request) => {
    if (!request || typeof request !== "object") {
      return {};
    }

    if (
      request.requestedData &&
      typeof request.requestedData === "object" &&
      !Array.isArray(request.requestedData)
    ) {
      return request.requestedData;
    }

    if (
      request.updateData &&
      typeof request.updateData === "object" &&
      !Array.isArray(request.updateData)
    ) {
      return request.updateData;
    }

    if (
      request.newData &&
      typeof request.newData === "object" &&
      !Array.isArray(request.newData)
    ) {
      return request.newData;
    }

    if (
      request.changedData &&
      typeof request.changedData === "object" &&
      !Array.isArray(request.changedData)
    ) {
      return request.changedData;
    }

    return {};
  }, []);

  // ============================================================
  // GET REQUEST ID
  // ============================================================

  const getRequestId = useCallback(
    (request) => {
      if (!request) {
        return null;
      }

      return (
        getId(request?._id) ||
        getId(request?.id) ||
        getId(request?.requestId) ||
        getId(request?.zerodoseId)
      );
    },
    [getId],
  );

  // ============================================================
  // GET ZERODOSE ID
  // ============================================================

  const getZerodoseId = useCallback(
    (request) => {
      if (!request) {
        return null;
      }

      const zerodose = getZerodoseData(request);

      return (
        getId(request?.zerodoseId) ||
        getId(request?.zerodose?._id) ||
        getId(request?.zerodose?.id) ||
        getId(zerodose?._id) ||
        getId(zerodose?.id)
      );
    },
    [getId, getZerodoseData],
  );

  // ============================================================
  // FORMAT LOCATION
  // ============================================================

  const formatLocation = useCallback((value) => {
    if (!value) {
      return "—";
    }

    if (typeof value === "object") {
      const latitude = value?.latitude;
      const longitude = value?.longitude;

      if (latitude !== undefined || longitude !== undefined) {
        return (
          <div className="space-y-1">
            <p>
              <span className="text-text-secondary">Latitude:</span>{" "}
              {latitude ?? "—"}
            </p>

            <p>
              <span className="text-text-secondary">Longitude:</span>{" "}
              {longitude ?? "—"}
            </p>
          </div>
        );
      }
    }

    return String(value);
  }, []);

  // ============================================================
  // FORMAT VALUE
  // ============================================================

  const formatValue = useCallback(
    (field, value) => {
      if (value === undefined || value === null || value === "") {
        return "—";
      }

      if (field === "age") {
        return `${value} months`;
      }

      if (field === "location") {
        return formatLocation(value);
      }

      if (
        field === "visitDate" ||
        field === "coveredDate" ||
        field === "recordDate"
      ) {
        return formatDateTime(value);
      }

      if (typeof value === "object") {
        if (value?.name) {
          return value.name;
        }

        if (value?.latitude !== undefined || value?.longitude !== undefined) {
          return formatLocation(value);
        }

        if (value?._id) {
          return String(value._id);
        }

        return JSON.stringify(value);
      }

      return String(value);
    },
    [formatDateTime, formatLocation],
  );

  // ============================================================
  // NORMALIZE VALUE
  // ============================================================

  const normalizeValue = useCallback((value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    if (typeof value === "object") {
      /*
       * Location comparison.
       */

      if (value?.latitude !== undefined || value?.longitude !== undefined) {
        return {
          latitude:
            value?.latitude === undefined ? null : Number(value.latitude),

          longitude:
            value?.longitude === undefined ? null : Number(value.longitude),
        };
      }

      /*
       * Mongo ObjectId / populated object.
       */

      if (value?._id) {
        return String(value._id);
      }

      /*
       * Populated object.
       */

      if (value?.name) {
        return String(value.name);
      }

      return JSON.stringify(value);
    }

    /*
     * Normalize numeric strings and numbers.
     */

    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }

    return value;
  }, []);

  // ============================================================
  // GET CHANGED FIELDS
  // ============================================================

  const getChangedFields = useCallback(
    (request) => {
      const current = getZerodoseData(request);
      const requested = getRequestedData(request);

      /*
       * Only these fields are editable by worker.
       */

      const editableFields = [
        "houseNumber",
        "childName",
        "fatherName",
        "age",
        "gender",
        "address",
        "contactNo",
      ];

      return editableFields.filter((field) => {
        if (requested?.[field] === undefined) {
          return false;
        }

        const currentValue = normalizeValue(current?.[field]);

        const requestedValue = normalizeValue(requested?.[field]);

        return JSON.stringify(currentValue) !== JSON.stringify(requestedValue);
      });
    },
    [getRequestedData, getZerodoseData, normalizeValue],
  );

  // ============================================================
  // WORKER ROLE
  // ============================================================

  const getWorkerRoleLabel = useCallback((worker) => {
    if (worker?.workerRole === "teamLeader") {
      return "Team Leader";
    }

    if (worker?.workerRole === "teamMember") {
      return "Team Member";
    }

    return worker?.workerRole || "Worker";
  }, []);

  // ============================================================
  // GET WORKER
  // ============================================================

  const getWorker = useCallback(
    (request) => {
      const zerodose = getZerodoseData(request);

      return (
        request?.user ||
        request?.requestedBy ||
        request?.worker ||
        zerodose?.user ||
        zerodose?.requestedBy ||
        zerodose?.worker ||
        null
      );
    },
    [getZerodoseData],
  );

  // ============================================================
  // FETCH REQUESTS
  // ============================================================

  const fetchRequests = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const authUser = getAuthUser();

        const supervisorId =
          getId(authUser?.id) || getId(authUser?._id) || null;

        if (!supervisorId) {
          throw new Error("Supervisor authentication data not found.");
        }

        const response = await getPendingZerodoseUpdates(supervisorId);

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to fetch Zerodose requests.",
          );
        }

        const pendingRequests = Array.isArray(response?.data)
          ? response.data
          : [];

        setRequests(pendingRequests);

        /*
         * Preserve expanded cards after refresh.
         */

        setExpandedRequests((previous) => {
          const next = {};

          pendingRequests.forEach((item) => {
            const id = getRequestId(item);

            if (id && previous[id]) {
              next[id] = true;
            }
          });

          return next;
        });
      } catch (error) {
        console.error("Zerodose approval fetch error:", error);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load Zerodose approval requests.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getAuthUser, getId, getRequestId],
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ============================================================
  // TOGGLE REQUEST
  // ============================================================

  const toggleRequest = useCallback((id) => {
    if (!id) {
      return;
    }

    setExpandedRequests((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }, []);

  // ============================================================
  // APPROVE / REJECT
  // ============================================================

  const handleApproval = useCallback(
    async (request, action) => {
      const requestId = getRequestId(request);
      const zerodoseId = getZerodoseId(request);

      if (!requestId) {
        toast.error("Invalid approval request ID.");
        return;
      }

      if (!zerodoseId) {
        toast.error("Invalid Zerodose ID.");
        return;
      }

      if (!["approve", "reject"].includes(action)) {
        toast.error("Invalid approval action.");
        return;
      }

      try {
        /*
         * processingId uses REQUEST ID.
         * API receives ZERODOSE ID.
         */

        setProcessingId(requestId);

        const authUser = getAuthUser();

        const supervisorId = getId(authUser?.id) || getId(authUser?._id);

        if (!supervisorId) {
          throw new Error("Supervisor authentication data not found.");
        }

        const approvalStatus = action === "approve" ? "approved" : "rejected";

        const response = await updateZerodoseApproval(
          zerodoseId,
          approvalStatus,
          supervisorId,
        );

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to update Zerodose approval.",
          );
        }

        if (action === "approve") {
          toast.success("Zerodose update approved successfully.");
        } else {
          toast.success("Zerodose update rejected successfully.");
        }

        /*
         * Remove processed request.
         */

        setRequests((previous) =>
          previous.filter((item) => getRequestId(item) !== requestId),
        );

        setExpandedRequests((previous) => {
          const updated = {
            ...previous,
          };

          delete updated[requestId];

          return updated;
        });
      } catch (error) {
        console.error("Zerodose approval error:", error);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to process Zerodose approval.",
        );
      } finally {
        setProcessingId(null);
      }
    },
    [getAuthUser, getId, getRequestId, getZerodoseId],
  );

  // ============================================================
  // REQUEST CARD
  // ============================================================

  const renderRequestCard = useCallback(
    (request, index) => {
      const requestId = getRequestId(request);

      if (!requestId) {
        return null;
      }

      const zerodose = getZerodoseData(request);

      const worker = getWorker(request);

      const workerName =
        worker?.name ||
        request?.requestedByName ||
        zerodose?.requestedByName ||
        "Unknown Worker";

      const workerContact =
        worker?.contactNumber ||
        worker?.contactNo ||
        request?.contactNumber ||
        request?.contactNo ||
        "—";

      const workerRole = getWorkerRoleLabel(worker);

      const teamNumber =
        worker?.teamNumber ??
        request?.teamNumber ??
        zerodose?.teamNumber ??
        "—";

      const changedFields = getChangedFields(request);

      const expanded = !!expandedRequests[requestId];

      const processing = processingId === requestId;

      const requestedAt =
        request?.updateRequestedAt ||
        request?.requestedAt ||
        request?.createdAt;

      return (
        <div
          key={requestId}
          className={`transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pageReady
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-10 scale-[0.98] opacity-0"
          }`}
          style={{
            transitionDelay: `${100 + index * 70}ms`,
          }}
        >
          <ZerodoseApprovalCard
            request={request}
            expanded={expanded}
            processing={processing}
            changedFields={changedFields}
            workerName={workerName}
            workerContact={workerContact}
            workerRole={workerRole}
            teamNumber={teamNumber}
            requestedAt={requestedAt}
            getFieldLabel={getFieldLabel}
            getFieldIcon={getFieldIcon}
            formatValue={formatValue}
            getZerodoseData={getZerodoseData}
            getRequestedData={getRequestedData}
            onToggle={() => toggleRequest(requestId)}
            onApprove={() => handleApproval(request, "approve")}
            onReject={() => handleApproval(request, "reject")}
          />
        </div>
      );
    },
    [
      expandedRequests,
      formatValue,
      getChangedFields,
      getFieldIcon,
      getFieldLabel,
      getRequestId,
      getRequestedData,
      getWorker,
      getWorkerRoleLabel,
      getZerodoseData,
      handleApproval,
      pageReady,
      processingId,
      toggleRequest,
    ],
  );

  // ============================================================
  // TOTAL CHANGES
  // ============================================================

  const totalChanges = useMemo(() => {
    return requests.reduce(
      (total, item) => total + getChangedFields(item).length,
      0,
    );
  }, [requests, getChangedFields]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <Loader />;
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

        <header
          className={`border-border relative mb-5 flex transform items-center justify-between overflow-hidden border-b pb-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pageReady
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-10 scale-[0.98] opacity-0"
          }`}
        >
          <div className="bg-primary/10 pointer-events-none absolute -top-20 left-10 h-40 w-72 rounded-full blur-3xl" />

          <div className="bg-primary/5 pointer-events-none absolute -right-20 -bottom-20 h-40 w-64 rounded-full blur-3xl" />

          <div className="relative">
            <ClientPageHeader
              title="Zerodose Approvals"
              description="Review and manage pending worker Zerodose update requests."
              onBack={() => router.back()}
            />
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="border-border bg-surface text-primary hover:border-primary hover:bg-primary-light relative inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </header>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  Unable to load Zerodose requests
                </p>

                <p className="mt-1 text-xs">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => fetchRequests(true)}
                disabled={refreshing}
                className="w-fit rounded-lg bg-red-100 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            EMPTY
        ====================================================== */}

        {requests.length === 0 && !error && (
          <div
            className={`border-border bg-surface relative transform overflow-hidden rounded-2xl border px-5 py-16 text-center shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              pageReady
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-10 scale-[0.98] opacity-0"
            }`}
          >
            <div className="bg-primary/5 pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full blur-2xl" />

            <div className="relative">
              <div className="bg-primary-light text-primary ring-primary/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1">
                <CheckCircle2 size={30} strokeWidth={1.8} />
              </div>

              <h3 className="text-text text-lg font-bold">All Caught Up</h3>

              <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                There are currently no Zerodose update requests waiting for your
                approval.
              </p>

              <button
                type="button"
                onClick={() => fetchRequests(true)}
                disabled={refreshing}
                className="bg-primary text-primary-foreground hover:bg-primary-dark mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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
            REQUESTS
        ====================================================== */}

        {requests.length > 0 && (
          <section>
            {/* SECTION HEADER */}

            <div className="border-border bg-surface relative mb-4 overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5">
              <div className="bg-primary/10 pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-2xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="bg-primary-light text-primary ring-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1">
                    <FileEdit size={19} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-text text-base font-bold tracking-tight sm:text-lg">
                        Pending Zerodose Updates
                      </h2>

                      <span className="bg-primary-light text-primary ring-primary/10 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1">
                        {requests.length}
                      </span>
                    </div>

                    <p className="text-text-secondary mt-1 text-xs leading-5 sm:text-sm">
                      Review only the fields changed by the worker before
                      approving or rejecting.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="border-border bg-background text-text-secondary flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />

                    <span>
                      {requests.length}{" "}
                      {requests.length === 1 ? "request" : "requests"} waiting
                    </span>
                  </div>

                  {totalChanges > 0 && (
                    <div className="bg-primary-light text-primary ring-primary/10 flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1">
                      <FileEdit size={12} />
                      {totalChanges} total{" "}
                      {totalChanges === 1 ? "change" : "changes"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARDS */}

            <div className="bg-surface border-border space-y-3 rounded-2xl border p-2 sm:p-2.5">
              {requests.map((request, index) =>
                renderRequestCard(request, index),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
