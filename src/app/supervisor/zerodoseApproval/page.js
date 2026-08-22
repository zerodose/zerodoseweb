"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  Baby,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileEdit,
  Hash,
  MapPin,
  Phone,
  RefreshCw,
  User,
  UserRound,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getPendingZerodoseUpdates,
  updateZerodoseApproval,
} from "@/api/zerodoseApprovalApi";

import ClientPageHeader from "@/components/ui/ClientPageHeader";
import Loader from "@/components/ui/Loader";

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
      return (
        value?._id?.toString() ||
        value?.id?.toString() ||
        value?.value?.toString() ||
        null
      );
    }

    return value.toString();
  }, []);

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
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // FORMAT DATE TIME
  // ============================================================

  const formatDateTime = (value) => {
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
  };

  // ============================================================
  // FIELD LABEL
  // ============================================================

  const getFieldLabel = (field) => {
    const labels = {
      childName: "Child Name",
      fatherName: "Father Name",
      age: "Age",
      address: "Address",
      contactNo: "Contact Number",
      location: "Location",
      day: "Day",
      recordDate: "Record Date",
      visitDate: "Visit Date",
      coveredDate: "Covered Date",
      clientStatus: "Client Status",
      vaccinationStatus: "Vaccination Status",
      teamNumber: "Team Number",
    };

    return (
      labels[field] ||
      field
        ?.replace(/([A-Z])/g, " $1")
        ?.replace(/^./, (char) => char.toUpperCase()) ||
      field
    );
  };

  // ============================================================
  // FIELD ICON
  // ============================================================

  const getFieldIcon = (field) => {
    const icons = {
      childName: Baby,
      fatherName: UserRound,
      age: CalendarDays,
      address: MapPin,
      contactNo: Phone,
      location: MapPin,
      recordDate: CalendarDays,
      visitDate: CalendarDays,
      coveredDate: CalendarDays,
      teamNumber: Hash,
    };

    return icons[field] || FileEdit;
  };

  // ============================================================
  // GET ACTUAL ZERODOSE DATA
  // ============================================================
  //
  // Supports:
  //
  // 1. pendingRequest.zerodose
  // 2. pendingRequest.oldData
  // 3. pendingRequest.data
  // 4. pendingRequest itself
  //
  // This prevents the UI from breaking if the API returns
  // the temporary PendingZerodose structure.
  //
  // ============================================================

  const getZerodoseData = useCallback((request) => {
    if (!request || typeof request !== "object") {
      return {};
    }

    if (
      request?.zerodose &&
      typeof request.zerodose === "object" &&
      !Array.isArray(request.zerodose)
    ) {
      return request.zerodose;
    }

    if (
      request?.oldData &&
      typeof request.oldData === "object" &&
      !Array.isArray(request.oldData)
    ) {
      return request.oldData;
    }

    if (
      request?.data &&
      typeof request.data === "object" &&
      !Array.isArray(request.data)
    ) {
      return request.data;
    }

    return request;
  }, []);

  // ============================================================
  // GET REQUESTED DATA
  // ============================================================
  //
  // Supports both:
  //
  // requestedData
  // newData
  // updateData
  //
  // ============================================================

  const getRequestedData = useCallback((request) => {
    if (!request || typeof request !== "object") {
      return {};
    }

    if (
      request?.requestedData &&
      typeof request.requestedData === "object" &&
      !Array.isArray(request.requestedData)
    ) {
      return request.requestedData;
    }

    if (
      request?.newData &&
      typeof request.newData === "object" &&
      !Array.isArray(request.newData)
    ) {
      return request.newData;
    }

    if (
      request?.updateData &&
      typeof request.updateData === "object" &&
      !Array.isArray(request.updateData)
    ) {
      return request.updateData;
    }

    return {};
  }, []);

  // ============================================================
  // GET UPDATE DATA
  // ============================================================

  const getUpdateData = useCallback(
    (request) => {
      const requestedData = getRequestedData(request);

      const fields = [
        "childName",
        "fatherName",
        "age",
        "address",
        "contactNo",
        "location",
      ];

      const data = {};

      fields.forEach((field) => {
        if (requestedData[field] !== undefined) {
          data[field] = requestedData[field];
        }
      });

      return data;
    },
    [getRequestedData],
  );

  // ============================================================
  // FORMAT LOCATION
  // ============================================================

  const formatLocation = (value) => {
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
  };

  // ============================================================
  // FORMAT VALUE
  // ============================================================

  const formatValue = (field, value) => {
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
      field === "recordDate" ||
      field === "visitDate" ||
      field === "coveredDate"
    ) {
      return formatDate(value);
    }

    if (typeof value === "object") {
      if (value?.name) {
        return value.name;
      }

      if (value?.latitude !== undefined || value?.longitude !== undefined) {
        return formatLocation(value);
      }

      return JSON.stringify(value);
    }

    return String(value);
  };

  // ============================================================
  // CHANGED FIELDS
  // ============================================================

  const getChangedFields = useCallback(
    (request) => {
      const current = getZerodoseData(request);

      const requested = getRequestedData(request);

      const fields = [
        "childName",
        "fatherName",
        "age",
        "address",
        "contactNo",
        "location",
      ];

      return fields.filter((field) => {
        const currentValue = current?.[field] ?? null;

        const requestedValue = requested?.[field] ?? null;

        return JSON.stringify(currentValue) !== JSON.stringify(requestedValue);
      });
    },
    [getRequestedData, getZerodoseData],
  );

  // ============================================================
  // CHANGE COUNT
  // ============================================================

  const getChangeCount = useCallback(
    (request) => {
      return getChangedFields(request).length;
    },
    [getChangedFields],
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
          getId(authUser?.id) || getId(authUser?._id) || getId(authUser);

        if (!supervisorId) {
          throw new Error("Supervisor authentication data not found.");
        }

        const response = await getPendingZerodoseUpdates(supervisorId);

        console.log("========== PENDING ZERODOSE ==========");
        console.log("Supervisor ID:", supervisorId);
        console.log("Response:", response);
        console.log("Requests:", response?.data);
        console.log("======================================");

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to fetch Zerodose requests.",
          );
        }

        const pendingRequests = Array.isArray(response?.data)
          ? response.data
          : [];

        setRequests(pendingRequests);

        setExpandedRequests((previous) => {
          const next = {};

          pendingRequests.forEach((item) => {
            const id = getId(item);

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
    [getId],
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ============================================================
  // TOGGLE
  // ============================================================

  const toggleRequest = (id) => {
    if (!id) {
      return;
    }

    setExpandedRequests((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  // ============================================================
  // APPROVE / REJECT
  // ============================================================

  const handleApproval = async (zerodose, action) => {
    const zerodoseId = getId(zerodose);

    if (!zerodoseId) {
      toast.error("Invalid Zerodose ID.");

      return;
    }

    if (!["approve", "reject"].includes(action)) {
      toast.error("Invalid approval action.");

      return;
    }

    try {
      setProcessingId(zerodoseId);

      const response = await updateZerodoseApproval(zerodoseId, action);

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

      setRequests((previous) =>
        previous.filter((item) => getId(item) !== zerodoseId),
      );

      setExpandedRequests((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[zerodoseId];

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
  };

  // ============================================================
  // WORKER ROLE
  // ============================================================

  const getWorkerRoleLabel = (worker) => {
    if (worker?.workerRole === "teamLeader") {
      return "Team Leader";
    }

    if (worker?.workerRole === "teamMember") {
      return "Team Member";
    }

    return worker?.workerRole || "Worker";
  };

  // ============================================================
  // SIMPLE VALUE CARD
  // ============================================================

  const renderValueCard = ({ field, value, requested = false }) => {
    const Icon = getFieldIcon(field);

    return (
      <div
        className={`rounded-xl border p-3 ${
          requested
            ? "border-primary/30 bg-primary-light/50"
            : "border-border bg-surface"
        }`}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <Icon
            size={15}
            className={requested ? "text-primary" : "text-text-secondary"}
          />

          <p className="text-text-secondary text-[10px] font-semibold tracking-wide uppercase">
            {getFieldLabel(field)}
          </p>
        </div>

        <div className="text-text text-sm font-semibold break-words">
          {formatValue(field, value)}
        </div>
      </div>
    );
  };

  // ============================================================
  // CHANGED FIELD CARD
  // ============================================================

  const renderChangedField = (request, field) => {
    const currentData = getZerodoseData(request);

    const requestedData = getRequestedData(request);

    const currentValue = currentData?.[field];

    const requestedValue = requestedData?.[field];

    const Icon = getFieldIcon(field);

    return (
      <div
        key={field}
        className="border-primary/30 bg-primary-light/20 overflow-hidden rounded-2xl border"
      >
        {/* FIELD HEADER */}

        <div className="border-primary/20 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Icon size={15} />
            </div>

            <div>
              <p className="text-text text-xs font-bold">
                {getFieldLabel(field)}
              </p>

              <p className="text-primary mt-0.5 text-[10px] font-semibold">
                Changed
              </p>
            </div>
          </div>

          <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full">
            <ArrowRight size={14} />
          </div>
        </div>

        {/* CURRENT / REQUESTED */}

        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          <div>
            <p className="text-text-secondary mb-1.5 text-[10px] font-bold tracking-wide uppercase">
              Current Value
            </p>

            {renderValueCard({
              field,
              value: currentValue,
            })}
          </div>

          <div>
            <p className="text-primary mb-1.5 text-[10px] font-bold tracking-wide uppercase">
              Requested Value
            </p>

            {renderValueCard({
              field,
              value: requestedValue,
              requested: true,
            })}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // COMPLETE ZERODOSE DETAILS
  // ============================================================

  const renderZerodoseDetails = (request) => {
    const zerodose = getZerodoseData(request);

    const location = zerodose?.location;

    return (
      <div className="space-y-4">
        {/* ==================================================
              CHILD INFORMATION
          ================================================== */}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Baby size={15} />
            </div>

            <h4 className="text-text text-sm font-bold">Child Information</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {renderValueCard({
              field: "childName",
              value: zerodose?.childName,
            })}

            {renderValueCard({
              field: "fatherName",
              value: zerodose?.fatherName,
            })}

            {renderValueCard({
              field: "age",
              value: zerodose?.age,
            })}

            {renderValueCard({
              field: "contactNo",
              value: zerodose?.contactNo,
            })}

            {renderValueCard({
              field: "address",
              value: zerodose?.address,
            })}

            {renderValueCard({
              field: "location",
              value: location,
            })}
          </div>
        </div>

        {/* ==================================================
              CAMPAIGN
          ================================================== */}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <CalendarDays size={15} />
            </div>

            <h4 className="text-text text-sm font-bold">
              Campaign Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Campaign
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.campaign?.name || "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Year
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.campaign?.year || "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Start Date
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {formatDate(zerodose?.campaign?.startDate)}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                End Date
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {formatDate(zerodose?.campaign?.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
              ASSIGNMENT
          ================================================== */}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <User size={15} />
            </div>

            <h4 className="text-text text-sm font-bold">
              Assignment Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Team Number
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.teamNumber ?? "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Team Leader
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.teamLeader?.name || "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Team Member
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.teamMember?.name || "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Supervisor
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.supervisor?.name || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
              LOCATION
          ================================================== */}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <MapPin size={15} />
            </div>

            <h4 className="text-text text-sm font-bold">Location</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Latitude
              </p>

              <p className="text-text mt-1 text-sm font-semibold break-all">
                {location?.latitude ?? "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Longitude
              </p>

              <p className="text-text mt-1 text-sm font-semibold break-all">
                {location?.longitude ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
              STATUS
          ================================================== */}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <CheckCircle2 size={15} />
            </div>

            <h4 className="text-text text-sm font-bold">Zerodose Status</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Vaccination Status
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.vaccinationStatus || "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Client Status
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {zerodose?.clientStatus || "—"}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Record Date
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {formatDate(zerodose?.recordDate)}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Visit Date
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {formatDate(zerodose?.visitDate)}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
              CREATED / UPDATED
          ================================================== */}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Clock3 size={15} />
            </div>

            <h4 className="text-text text-sm font-bold">Record Information</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Created At
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {formatDateTime(request?.createdAt || zerodose?.createdAt)}
              </p>
            </div>

            <div className="border-border bg-surface rounded-xl border p-3">
              <p className="text-text-secondary text-[10px] font-semibold uppercase">
                Last Updated
              </p>

              <p className="text-text mt-1 text-sm font-semibold">
                {formatDateTime(request?.updatedAt || zerodose?.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // REQUEST CARD
  // ============================================================

  const renderRequestCard = (zerodose, index) => {
    const zerodoseId = getId(zerodose);

    // ========================================================
    // WORKER
    // ========================================================
    //
    // Worker can come from:
    //
    // zerodose.user
    // zerodose.requestedBy
    // zerodose.worker
    //
    // ========================================================

    const worker =
      zerodose?.user || zerodose?.requestedBy || zerodose?.worker || null;

    const workerName =
      worker?.name || zerodose?.requestedByName || "Unknown Worker";

    const workerContact =
      worker?.contactNumber ||
      worker?.contactNo ||
      zerodose?.contactNumber ||
      "—";

    const workerRole = getWorkerRoleLabel(worker);

    const teamNumber =
      worker?.teamNumber ??
      zerodose?.teamNumber ??
      getZerodoseData(zerodose)?.teamNumber ??
      "—";

    // ========================================================
    // CHANGES
    // ========================================================

    const changedFields = getChangedFields(zerodose);

    const changeCount = changedFields.length;

    const expanded = !!expandedRequests[zerodoseId];

    const processing = processingId === zerodoseId;

    return (
      <div
        key={zerodoseId}
        className={`transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
        style={{
          transitionDelay: `${100 + index * 70}ms`,
        }}
      >
        <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md">
          {/* ==================================================
              WORKER HEADER
          ================================================== */}

          <button
            type="button"
            onClick={() => toggleRequest(zerodoseId)}
            disabled={processing}
            className="w-full text-left"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                {/* Worker Icon */}

                <div className="bg-primary-light text-primary ring-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1">
                  <User size={21} />
                </div>

                {/* Worker Detail */}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-text text-sm font-bold sm:text-base">
                      {workerName}
                    </h3>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                      Pending Approval
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-text-secondary text-xs font-medium">
                      {workerRole}
                    </span>

                    <span className="text-text-secondary flex items-center gap-1 text-xs">
                      <Hash size={12} />
                      Team {teamNumber}
                    </span>

                    <span className="text-text-secondary flex items-center gap-1 text-xs">
                      <Phone size={12} />
                      {workerContact}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-text-secondary flex items-center gap-1.5 text-[11px]">
                      <Clock3 size={12} />

                      {formatDateTime(
                        zerodose?.updateRequestedAt ||
                          zerodose?.requestedAt ||
                          zerodose?.createdAt,
                      )}
                    </span>

                    {/* ==================================================
                        CHANGE COUNT
                    ================================================== */}

                    {changeCount > 0 ? (
                      <span className="text-primary flex items-center gap-1.5 text-[11px] font-bold">
                        <FileEdit size={12} />
                        {changeCount} {changeCount === 1 ? "change" : "changes"}
                      </span>
                    ) : (
                      <span className="text-text-secondary flex items-center gap-1.5 text-[11px]">
                        <FileEdit size={12} />
                        Update requested
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand */}

                <div className="border-border bg-surface text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                  {expanded ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* ==================================================
              EXPANDED
          ================================================== */}

          {expanded && (
            <div className="border-border border-t">
              {/* ==================================================
                  WORKER INFORMATION
              ================================================== */}

              <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                    <User size={15} />
                  </div>

                  <h4 className="text-text text-sm font-bold">
                    Worker Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border-border bg-surface rounded-xl border p-3">
                    <p className="text-text-secondary text-[10px] font-semibold uppercase">
                      Worker
                    </p>

                    <p className="text-text mt-1 text-sm font-semibold">
                      {workerName}
                    </p>
                  </div>

                  <div className="border-border bg-surface rounded-xl border p-3">
                    <p className="text-text-secondary text-[10px] font-semibold uppercase">
                      Role
                    </p>

                    <p className="text-text mt-1 text-sm font-semibold">
                      {workerRole}
                    </p>
                  </div>

                  <div className="border-border bg-surface rounded-xl border p-3">
                    <p className="text-text-secondary text-[10px] font-semibold uppercase">
                      Contact
                    </p>

                    <p className="text-text mt-1 text-sm font-semibold">
                      {workerContact}
                    </p>
                  </div>

                  <div className="border-border bg-surface rounded-xl border p-3">
                    <p className="text-text-secondary text-[10px] font-semibold uppercase">
                      Team Number
                    </p>

                    <p className="text-text mt-1 text-sm font-semibold">
                      {teamNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  CHANGED FIELDS
              ================================================== */}

              <div className="border-border border-t p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                      <FileEdit size={15} />
                    </div>

                    <div>
                      <h4 className="text-text text-sm font-bold">
                        Requested Changes
                      </h4>

                      <p className="text-text-secondary text-[11px]">
                        Only the fields amended by the worker are highlighted.
                      </p>
                    </div>
                  </div>

                  {changeCount > 0 && (
                    <span className="bg-primary-light text-primary ring-primary/10 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1">
                      {changeCount} {changeCount === 1 ? "Change" : "Changes"}
                    </span>
                  )}
                </div>

                {changeCount === 0 ? (
                  <div className="border-border bg-surface rounded-xl border p-5 text-center">
                    <FileEdit
                      size={22}
                      className="text-text-secondary mx-auto mb-2"
                    />

                    <p className="text-text text-sm font-semibold">
                      No change details available
                    </p>

                    <p className="text-text-secondary mt-1 text-xs">
                      This request is pending, but the submitted change data was
                      not stored in updateData.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {changedFields.map((field) =>
                      renderChangedField(zerodose, field),
                    )}
                  </div>
                )}
              </div>

              {/* ==================================================
                  COMPLETE ZERODOSE
              ================================================== */}

              <div className="border-border bg-surface border-t p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="bg-primary-light text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                    <Baby size={15} />
                  </div>

                  <div>
                    <h4 className="text-text text-sm font-bold">
                      Complete Zerodose Details
                    </h4>

                    <p className="text-text-secondary text-[11px]">
                      Complete record associated with this request.
                    </p>
                  </div>
                </div>

                {renderZerodoseDetails(zerodose)}
              </div>

              {/* ==================================================
                  REQUEST DATE
              ================================================== */}

              <div className="border-border border-t px-4 py-3 sm:px-5">
                <div className="text-text-secondary flex items-center gap-2 text-[11px]">
                  <CalendarDays size={13} />

                  <span>
                    Requested on{" "}
                    <span className="text-text font-semibold">
                      {formatDateTime(
                        zerodose?.requestedAt ||
                          zerodose?.updateRequestedAt ||
                          zerodose?.createdAt,
                      )}
                    </span>
                  </span>
                </div>
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="border-border bg-surface border-t p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  {/* REJECT */}

                  <button
                    type="button"
                    onClick={() => handleApproval(zerodose, "reject")}
                    disabled={processing}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <XCircle size={16} />
                    )}

                    <span>
                      {processing ? "Processing..." : "Reject Request"}
                    </span>
                  </button>

                  {/* APPROVE */}

                  <button
                    type="button"
                    onClick={() => handleApproval(zerodose, "approve")}
                    disabled={processing}
                    className="bg-primary text-primary-foreground hover:bg-primary-dark inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}

                    <span>
                      {processing ? "Processing..." : "Approve Update"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // TOTAL CHANGES
  // ============================================================

  const totalChanges = useMemo(() => {
    return requests.reduce((total, item) => total + getChangeCount(item), 0);
  }, [requests, getChangeCount]);

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
                      Review worker update requests and approve or reject the
                      requested changes.
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
              {requests.map((zerodose, index) =>
                renderRequestCard(zerodose, index),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
