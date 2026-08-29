"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, UserRound, Users } from "lucide-react";
import { toast } from "sonner";

import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";
import {
  getUsers,
  transferUser,
  transferWorkers,
  getUcmoDropdown,
} from "@/api/userApi";

import ClientPageHeader from "@/components/ui/ClientPageHeader";
import Select from "@/components/ui/Select";

export default function StaffManagementPage() {
  const router = useRouter();

  const [ucmoId, setUcmoId] = useState("");

  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");

  // Worker-specific states
  const [fromSupervisors, setFromSupervisors] = useState([]);
  const [fromSupervisor, setFromSupervisor] = useState("");
  const [fromSupervisorWorkers, setFromSupervisorWorkers] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);

  // Target states
  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [unionCouncils, setUnionCouncils] = useState([]);
  const [ucmos, setUcmos] = useState([]);
  const [targetSupervisors, setTargetSupervisors] = useState([]);

  const [targetDistrict, setTargetDistrict] = useState("");
  const [targetTown, setTargetTown] = useState("");
  const [targetUnionCouncil, setTargetUnionCouncil] = useState("");
  const [targetUcmo, setTargetUcmo] = useState("");
  const [targetSupervisor, setTargetSupervisor] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // ============================================================
  // Designation Options
  // ============================================================

  const designationOptions = [
    {
      value: "supervisor",
      label: "Supervisor",
    },
    {
      value: "vaccinator",
      label: "Vaccinator",
    },
    {
      value: "otherstaff",
      label: "Other Staff",
    },
    {
      value: "worker",
      label: "Worker",
    },
  ];

  // ============================================================
  // Current UCMO
  // ============================================================

  useEffect(() => {
    try {
      const authUser = localStorage.getItem("authUser");

      if (!authUser) {
        toast.error("UCMO session not found.");
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(authUser);
      const id = parsedUser?.id || parsedUser?._id;

      if (!id) {
        toast.error("UCMO ID not found.");
        setLoading(false);
        return;
      }

      setUcmoId(String(id));
    } catch (error) {
      console.error("Failed to read UCMO session:", error);

      toast.error("Invalid login session.");
      setLoading(false);
    }
  }, []);

  // ============================================================
  // Load Districts
  // ============================================================

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await getDistrictDropdown();

        setDistricts(response?.data || []);
      } catch (error) {
        setDistricts([]);

        toast.error("Failed to load districts.", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Please try again.",
        });
      }
    };

    loadDistricts();
  }, []);

  // ============================================================
  // Page Animation
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // Helpers
  // ============================================================

  const getUserId = (user) => {
    return String(user?._id || user?.id || "");
  };

  const getResponseData = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.users)) {
      return response.users;
    }

    if (Array.isArray(response?.data?.users)) {
      return response.data.users;
    }

    return [];
  };

  // ============================================================
  // Reset Everything
  // ============================================================

  const resetWorkerSelection = () => {
    setFromSupervisor("");
    setFromSupervisorWorkers([]);
    setSelectedWorkers([]);
    setFromSupervisors([]);
    setTargetSupervisor("");
    setTargetSupervisors([]);
  };

  const resetTarget = () => {
    setTargetDistrict("");
    setTargetTown("");
    setTargetUnionCouncil("");
    setTargetUcmo("");
    setTargetSupervisor("");

    setTowns([]);
    setUnionCouncils([]);
    setUcmos([]);
    setTargetSupervisors([]);
  };

  // ============================================================
  // Fetch Normal Staff
  // ============================================================

  const fetchStaff = async (isRefresh = false) => {
    try {
      if (!ucmoId || !selectedDesignation) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getUsers({
        page: 1,
        limit: 100,
        ucmo: ucmoId,
        designation: selectedDesignation,
        isActive: true,
      });

      const data = getResponseData(response);

      const filtered = data.filter(
        (user) =>
          user?.designation?.toLowerCase() ===
          selectedDesignation?.toLowerCase(),
      );

      setStaff(filtered);
    } catch (error) {
      console.error("Failed to load staff:", error);

      toast.error(error?.response?.data?.message || "Failed to load staff.");

      setStaff([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // Fetch Supervisors For Worker Mode
  // ============================================================

  const fetchFromSupervisors = async (isRefresh = false) => {
    try {
      if (!ucmoId) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getUsers({
        page: 1,
        limit: 100,
        designation: "supervisor",
        ucmo: ucmoId,
        isActive: true,
      });

      const data = getResponseData(response);

      const filtered = data.filter(
        (user) =>
          user?.designation?.toLowerCase() === "supervisor" &&
          user?.isActive !== false,
      );

      setFromSupervisors(filtered);
    } catch (error) {
      console.error("Failed to load supervisors:", error);

      setFromSupervisors([]);

      toast.error(
        error?.response?.data?.message || "Failed to load supervisors.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // Fetch Workers Of Selected Supervisor
  // ============================================================

  const fetchWorkersForSupervisor = async (supervisorId) => {
    if (!supervisorId) {
      setFromSupervisorWorkers([]);
      setSelectedWorkers([]);
      return;
    }

    try {
      setLoadingWorkers(true);

      const response = await getUsers({
        page: 1,
        limit: 100,
        designation: "worker",
        supervisor: supervisorId,
        isActive: true,
      });

      const data = getResponseData(response);

      const filtered = data.filter(
        (user) =>
          user?.designation?.toLowerCase() === "worker" &&
          user?.isActive !== false,
      );

      setFromSupervisorWorkers(filtered);
      setSelectedWorkers([]);
    } catch (error) {
      console.error("Failed to load workers for supervisor:", error);

      setFromSupervisorWorkers([]);
      setSelectedWorkers([]);

      toast.error(error?.response?.data?.message || "Failed to load workers.");
    } finally {
      setLoadingWorkers(false);
    }
  };

  // ============================================================
  // Initial / Designation Change
  // ============================================================

  useEffect(() => {
    if (!ucmoId || !selectedDesignation) {
      setStaff([]);
      setFromSupervisors([]);
      setFromSupervisorWorkers([]);
      setSelectedWorkers([]);
      setLoading(false);
      return;
    }

    // Worker has a different selection flow
    if (selectedDesignation === "worker") {
      setStaff([]);
      setSelectedStaff("");
      fetchFromSupervisors();
      return;
    }

    // Normal staff
    resetWorkerSelection();
    fetchStaff();
  }, [ucmoId, selectedDesignation]);

  // ============================================================
  // Selected Normal Staff
  // ============================================================

  const selectedUser = useMemo(() => {
    if (selectedDesignation === "worker") {
      return null;
    }

    return staff.find((user) => getUserId(user) === String(selectedStaff));
  }, [staff, selectedStaff, selectedDesignation]);

  // ============================================================
  // Selected Workers Objects
  // ============================================================

  const selectedWorkerObjects = useMemo(() => {
    return fromSupervisorWorkers.filter((worker) =>
      selectedWorkers.includes(getUserId(worker)),
    );
  }, [fromSupervisorWorkers, selectedWorkers]);

  // ============================================================
  // From Supervisor Change
  // ============================================================

  const handleFromSupervisorChange = async (value) => {
    setFromSupervisor(value);
    setSelectedWorkers([]);
    setFromSupervisorWorkers([]);

    if (!value) {
      return;
    }

    await fetchWorkersForSupervisor(value);
  };

  // ============================================================
  // Toggle Worker
  // ============================================================

  const toggleWorker = (workerId) => {
    const id = String(workerId);

    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // ============================================================
  // Select All Workers
  // ============================================================

  const toggleAllWorkers = () => {
    if (!fromSupervisorWorkers.length) return;

    if (selectedWorkers.length === fromSupervisorWorkers.length) {
      setSelectedWorkers([]);
      return;
    }

    setSelectedWorkers(
      fromSupervisorWorkers.map((worker) => getUserId(worker)),
    );
  };

  // ============================================================
  // District Change
  // ============================================================

  const handleDistrictChange = async (value) => {
    setTargetDistrict(value);

    setTargetTown("");
    setTargetUnionCouncil("");
    setTargetUcmo("");
    setTargetSupervisor("");

    setTowns([]);
    setUnionCouncils([]);
    setUcmos([]);
    setTargetSupervisors([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      const response = await getTownDropdown(value);

      setTowns(response?.data || []);
    } catch (error) {
      setTowns([]);

      toast.error("Failed to load towns.", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
      });
    } finally {
      setLoadingTarget(false);
    }
  };

  // ============================================================
  // Town Change
  // ============================================================

  const handleTownChange = async (value) => {
    setTargetTown(value);

    setTargetUnionCouncil("");
    setTargetUcmo("");
    setTargetSupervisor("");

    setUnionCouncils([]);
    setUcmos([]);
    setTargetSupervisors([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      const response = await getUnionCouncilDropdown(value);

      setUnionCouncils(response?.data || []);
    } catch (error) {
      setUnionCouncils([]);

      toast.error("Failed to load Union Councils.", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
      });
    } finally {
      setLoadingTarget(false);
    }
  };

  // ============================================================
  // Union Council Change
  // ============================================================

  const handleUnionCouncilChange = async (value) => {
    setTargetUnionCouncil(value);

    setTargetUcmo("");
    setTargetSupervisor("");

    setUcmos([]);
    setTargetSupervisors([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      const response = await getUcmoDropdown(value);

      setUcmos(response?.data || []);
    } catch (error) {
      setUcmos([]);

      toast.error("Failed to load UCMOs.", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
      });
    } finally {
      setLoadingTarget(false);
    }
  };

  // ============================================================
  // Target UCMO Change
  // ============================================================

  const handleUcmoChange = async (value) => {
    setTargetUcmo(value);
    setTargetSupervisor("");
    setTargetSupervisors([]);

    if (!value) return;

    // Supervisor is only needed for worker transfer
    if (selectedDesignation !== "worker") {
      return;
    }

    try {
      setLoadingSupervisors(true);

      const response = await getUsers({
        page: 1,
        limit: 100,
        ucmo: value,
        designation: "supervisor",
        isActive: true,
      });

      const data = getResponseData(response);

      const filtered = data.filter(
        (user) =>
          user?.designation?.toLowerCase() === "supervisor" &&
          user?.isActive !== false,
      );

      setTargetSupervisors(filtered);
    } catch (error) {
      console.error("Failed to load target supervisors:", error);

      setTargetSupervisors([]);

      toast.error(
        error?.response?.data?.message || "Failed to load Supervisors.",
      );
    } finally {
      setLoadingSupervisors(false);
    }
  };

  // ============================================================
  // Designation Change
  // ============================================================

  const handleDesignationChange = (value) => {
    setSelectedDesignation(value);

    setSelectedStaff("");
    setStaff([]);

    resetWorkerSelection();
    resetTarget();
  };

  // ============================================================
  // Normal Staff Transfer
  // ============================================================

  const handleNormalStaffTransfer = async () => {
    if (!selectedUser) {
      toast.error("Please select a staff member.");
      return;
    }

    if (!targetDistrict) {
      toast.error("Please select a district.");
      return;
    }

    if (!targetTown) {
      toast.error("Please select a town.");
      return;
    }

    if (!targetUnionCouncil) {
      toast.error("Please select a Union Council.");
      return;
    }

    if (!targetUcmo) {
      toast.error("Please select a UCMO.");
      return;
    }

    const currentUcmo = selectedUser?.ucmo?._id || selectedUser?.ucmo || "";

    if (String(currentUcmo) !== String(ucmoId)) {
      toast.error("You can only transfer staff assigned to your UCMO.");
      return;
    }

    try {
      setTransferring(true);

      const payload = {
        userId: selectedStaff,
        currentUcmoId: ucmoId,
        district: targetDistrict,
        town: targetTown,
        unionCouncil: targetUnionCouncil,
        ucmo: targetUcmo,
      };

      const response = await transferUser(payload);

      if (!response?.success) {
        toast.error(response?.message || "Failed to transfer staff.");
        return;
      }

      toast.success(response.message || "Staff transferred successfully.");

      setSelectedStaff("");
      resetTarget();

      await fetchStaff();
    } catch (error) {
      console.error("Staff transfer error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to transfer staff.",
      );
    } finally {
      setTransferring(false);
    }
  };

  // ============================================================
  // Worker Transfer
  // ============================================================

  const handleWorkerTransfer = async () => {
    if (!fromSupervisor) {
      toast.error("Please select a From Supervisor.");
      return;
    }

    if (!selectedWorkers.length) {
      toast.error("Please select at least one worker to transfer.");
      return;
    }

    if (!targetDistrict) {
      toast.error("Please select a district.");
      return;
    }

    if (!targetTown) {
      toast.error("Please select a town.");
      return;
    }

    if (!targetUnionCouncil) {
      toast.error("Please select a Union Council.");
      return;
    }

    if (!targetUcmo) {
      toast.error("Please select a UCMO.");
      return;
    }

    if (!targetSupervisor) {
      toast.error("Please select a target Supervisor.");
      return;
    }

    if (String(fromSupervisor) === String(targetSupervisor)) {
      toast.error("From and To Supervisor cannot be the same.");
      return;
    }

    const workers = selectedWorkerObjects.map((worker) => ({
      workerId: getUserId(worker),
      teamNumber: worker?.teamNumber,
      workerRole: worker?.workerRole,
    }));

    if (!workers.length) {
      toast.error("Selected workers could not be found.");
      return;
    }

    try {
      setTransferring(true);

      const payload = {
        fromSupervisorId: fromSupervisor,
        toSupervisorId: targetSupervisor,
        workers,
      };

      const response = await transferWorkers(payload);

      if (!response?.success) {
        toast.error(response?.message || "Failed to transfer workers.");
        return;
      }

      toast.success(response.message || "Workers transferred successfully.");

      setSelectedWorkers([]);
      setFromSupervisorWorkers([]);

      resetTarget();

      await fetchWorkersForSupervisor(fromSupervisor);
    } catch (error) {
      console.error("Worker transfer error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to transfer workers.",
      );
    } finally {
      setTransferring(false);
    }
  };

  // ============================================================
  // Transfer Handler
  // ============================================================

  const handleTransfer = async () => {
    if (selectedDesignation === "worker") {
      await handleWorkerTransfer();
      return;
    }

    await handleNormalStaffTransfer();
  };

  // ============================================================
  // Refresh
  // ============================================================

  const handleRefresh = async () => {
    if (!ucmoId || !selectedDesignation) return;

    try {
      setRefreshing(true);

      if (selectedDesignation === "worker") {
        await fetchFromSupervisors(true);

        if (fromSupervisor) {
          await fetchWorkersForSupervisor(fromSupervisor);
        }
      } else {
        await fetchStaff(true);
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // Current Supervisor Name
  // ============================================================

  const currentSupervisorName = useMemo(() => {
    const supervisor = fromSupervisors.find(
      (item) => getUserId(item) === String(fromSupervisor),
    );

    return supervisor?.name || "From Supervisor";
  }, [fromSupervisors, fromSupervisor]);

  // ============================================================
  // Target Supervisor Name
  // ============================================================

  const targetSupervisorName = useMemo(() => {
    const supervisor = targetSupervisors.find(
      (item) => getUserId(item) === String(targetSupervisor),
    );

    return supervisor?.name || "To Supervisor";
  }, [targetSupervisors, targetSupervisor]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="m-auto max-w-7xl space-y-6">
      {/* ========================================================
HEADER
======================================================== */}

      <header
        className={`border-border relative mb-4 flex items-center justify-between overflow-hidden border-b pb-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
      >
        <div className="bg-primary/10 pointer-events-none absolute -top-20 left-10 h-40 w-72 rounded-full blur-3xl" />

        <div className="bg-primary/5 pointer-events-none absolute -right-20 -bottom-20 h-40 w-64 rounded-full blur-3xl" />

        <div className="relative">
          <ClientPageHeader
            title="Staff Management"
            description="Transfer supervisors, vaccinators, other staff and workers to another UCMO or location."
            onBack={() => router.back()}
          />
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || !selectedDesignation}
          className="border-border bg-surface text-primary hover:border-primary hover:bg-primary-light relative inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

          <span className="hidden sm:inline">
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </header>

      {/* ========================================================
      DESIGNATION
  ======================================================== */}

      <section
        className={`border-border bg-background relative z-30 rounded-2xl border p-5 shadow-sm transition-all duration-700 ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="text-text text-base font-semibold">Select Staff</h2>

            <p className="text-text-secondary text-sm">
              Select the staff designation you want to transfer.
            </p>
          </div>
        </div>

        <Select
          label="Designation"
          name="designation"
          value={selectedDesignation}
          onChange={(event) => handleDesignationChange(event.target.value)}
          options={designationOptions}
          placeholder="Select Designation"
          clearable
          searchable
          searchPlaceholder="Search designation..."
        />
      </section>

      {/* ========================================================
      NORMAL STAFF SELECTION
  ======================================================== */}

      {selectedDesignation !== "worker" && selectedDesignation && (
        <section className="border-border bg-background relative z-20 rounded-2xl border p-5 shadow-sm">
          <Select
            label="Staff Member"
            name="staff"
            value={selectedStaff}
            onChange={(event) => {
              setSelectedStaff(event.target.value);
              resetTarget();
            }}
            options={staff.map((user) => ({
              value: user._id || user.id,
              label: user.name,
            }))}
            placeholder={`Select ${
              selectedDesignation === "otherstaff"
                ? "Other Staff"
                : selectedDesignation.charAt(0).toUpperCase() +
                  selectedDesignation.slice(1)
            }`}
            loading={loading}
            searchable
            searchPlaceholder="Search staff..."
            clearable
          />
        </section>
      )}

      {/* ========================================================
      WORKER SELECTION
  ======================================================== */}

      {selectedDesignation === "worker" && (
        <section className="border-border bg-background relative z-20 rounded-2xl border p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Users size={20} />
            </div>

            <div>
              <h2 className="text-text text-base font-semibold">
                Select Workers
              </h2>

              <p className="text-text-secondary text-sm">
                First select a supervisor. All active workers assigned to that
                supervisor will be shown.
              </p>
            </div>
          </div>

          <Select
            label="From Supervisor"
            name="fromSupervisor"
            value={fromSupervisor}
            onChange={(event) => handleFromSupervisorChange(event.target.value)}
            options={fromSupervisors.map((supervisor) => ({
              value: supervisor._id || supervisor.id,
              label: supervisor.name,
            }))}
            placeholder="Select From Supervisor"
            disabled={!fromSupervisors.length}
            loading={loading}
            searchable
            searchPlaceholder="Search supervisor..."
            clearable
          />

          {fromSupervisor && (
            <div className="mt-5">
              <div className="border-border bg-surface mb-3 flex items-center justify-between rounded-xl border px-4 py-3">
                <div>
                  <p className="text-text text-sm font-semibold">
                    {currentSupervisorName}
                  </p>

                  <p className="text-text-secondary text-xs">
                    {selectedWorkers.length} of {fromSupervisorWorkers.length}{" "}
                    workers selected
                  </p>
                </div>

                {fromSupervisorWorkers.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllWorkers}
                    className="text-primary hover:text-primary-dark text-sm font-semibold"
                  >
                    {selectedWorkers.length === fromSupervisorWorkers.length
                      ? "Unselect All"
                      : "Select All"}
                  </button>
                )}
              </div>

              {loadingWorkers ? (
                <div className="text-text-secondary py-6 text-center text-sm">
                  Loading workers...
                </div>
              ) : fromSupervisorWorkers.length === 0 ? (
                <div className="border-border text-text-secondary rounded-xl border border-dashed p-6 text-center text-sm">
                  No active workers found for this supervisor.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[...fromSupervisorWorkers]
                    .sort((a, b) => {
                      const teamA = Number(a.teamNumber) || 0;
                      const teamB = Number(b.teamNumber) || 0;

                      return teamA - teamB;
                    })
                    .map((worker) => {
                      const workerId = getUserId(worker);

                      const isSelected = selectedWorkers.includes(workerId);

                      return (
                        <label
                          key={workerId}
                          className={`border-border flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-primary bg-primary-light"
                              : "bg-background hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleWorker(workerId)}
                            className="h-4 w-4 accent-[var(--primary)]"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-text truncate text-sm font-semibold">
                              {worker.name || "Unnamed Worker"}
                            </p>

                            <div className="text-text-secondary mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                              <span>
                                Team:
                                {worker.teamNumber || "—"}
                              </span>

                              <span>
                                Role:
                                {worker.workerRole || "—"}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
      CURRENT ASSIGNMENT - NORMAL STAFF
  ======================================================== */}

      {selectedUser && (
        <section className="border-border bg-surface rounded-2xl border p-5 shadow-sm">
          <h3 className="text-text mb-4 text-sm font-semibold">
            Current Assignment
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Info label="Name" value={selectedUser.name} />

            <Info label="Designation" value={selectedUser.designation} />

            <Info label="District" value={selectedUser.district?.name || "—"} />

            <Info label="Town" value={selectedUser.town?.name || "—"} />

            <Info
              label="Union Council"
              value={selectedUser.unionCouncil?.name || "—"}
            />

            <Info label="Current UCMO" value={selectedUser.ucmo?.name || "—"} />
          </div>
        </section>
      )}

      {/* ========================================================
      WORKER CURRENT ASSIGNMENT
  ======================================================== */}

      {selectedDesignation === "worker" && selectedWorkerObjects.length > 0 && (
        <section className="border-border bg-surface rounded-2xl border p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-text text-sm font-semibold">
              Selected Workers
            </h3>

            <span className="text-primary text-sm font-semibold">
              {selectedWorkerObjects.length}
              selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
            {selectedWorkerObjects.map((worker) => (
              <div
                key={getUserId(worker)}
                className="border-border bg-background rounded-xl border p-4"
              >
                <p className="text-text text-sm font-semibold">
                  {worker.name || "Unnamed Worker"}
                </p>

                <p className="text-text-secondary mt-1 text-xs">
                  Team:
                  {worker.teamNumber || "—"}
                </p>

                <p className="text-text-secondary mt-1 text-xs">
                  Role:
                  {worker.workerRole || "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================
      TARGET LOCATION
  ======================================================== */}

      {(selectedUser ||
        (selectedDesignation === "worker" && selectedWorkers.length > 0)) && (
        <section className="border-border bg-background rounded-2xl border p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <ArrowRight size={20} />
            </div>

            <div>
              <h2 className="text-text text-base font-semibold">
                New Assignment
              </h2>

              <p className="text-text-secondary text-sm">
                Select where the selected staff will be transferred.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="District"
              name="district"
              value={targetDistrict}
              onChange={handleDistrictChange}
              options={districts}
              loading={loadingTarget && !targetTown}
              searchable
              searchPlaceholder="Search district..."
              clearable
            />

            <SelectField
              label="Town"
              name="town"
              value={targetTown}
              onChange={handleTownChange}
              options={towns}
              disabled={!targetDistrict}
              loading={loadingTarget && !!targetDistrict && !targetTown}
              searchable
              searchPlaceholder="Search town..."
              clearable
            />

            <SelectField
              label="Union Council"
              name="unionCouncil"
              value={targetUnionCouncil}
              onChange={handleUnionCouncilChange}
              options={unionCouncils}
              disabled={!targetTown}
              loading={loadingTarget && !!targetTown && !targetUnionCouncil}
              searchable
              searchPlaceholder="Search Union Council..."
              clearable
              showCode
              codePrefix="UC"
            />

            <SelectField
              label="UCMO"
              name="ucmo"
              value={targetUcmo}
              onChange={handleUcmoChange}
              options={ucmos}
              disabled={!targetUnionCouncil}
              loading={loadingTarget && !!targetUnionCouncil && !targetUcmo}
              searchable
              searchPlaceholder="Search UCMO..."
              clearable
            />

            {/* ==================================================
            TARGET SUPERVISOR - WORKER ONLY
        ================================================== */}

            {selectedDesignation === "worker" && (
              <SelectField
                label="To Supervisor"
                name="supervisor"
                value={targetSupervisor}
                onChange={setTargetSupervisor}
                options={targetSupervisors}
                disabled={!targetUcmo}
                loading={loadingSupervisors}
                searchable
                searchPlaceholder="Search Supervisor..."
                clearable
              />
            )}
          </div>

          {selectedDesignation === "worker" && targetSupervisor && (
            <div className="border-primary/20 bg-primary-light/50 text-text mt-5 rounded-xl border p-4 text-sm">
              Selected workers will be transferred from
              <strong>{currentSupervisorName}</strong>
              to
              <strong>{targetSupervisorName}</strong>.
            </div>
          )}
        </section>
      )}

      {/* ========================================================
      NORMAL STAFF WARNING
  ======================================================== */}

      {selectedUser && targetUcmo && (
        <div className="border-primary/20 bg-primary-light/50 text-text rounded-2xl border p-4 text-sm">
          <strong>Important:</strong> After transfer, this staff member will
          become
          <strong>Pending</strong> and
          <strong>Inactive</strong>. The selected new UCMO must approve the
          account before the staff member can login again.
        </div>
      )}

      {/* ========================================================
      WORKER WARNING
  ======================================================== */}

      {selectedDesignation === "worker" &&
        selectedWorkers.length > 0 &&
        targetSupervisor && (
          <div className="border-primary/20 bg-primary-light/50 text-text rounded-2xl border p-4 text-sm">
            <strong>Important:</strong> The selected
            <strong>
              {selectedWorkers.length} worker
              {selectedWorkers.length > 1 ? "s" : ""}
            </strong>
            will be transferred to the selected Supervisor.
          </div>
        )}

      {/* ========================================================
      TRANSFER BUTTON
  ======================================================== */}

      {(selectedUser ||
        (selectedDesignation === "worker" && selectedWorkers.length > 0)) && (
        <div className="border-border flex justify-end border-t pt-5">
          <button
            type="button"
            onClick={handleTransfer}
            disabled={
              transferring ||
              loadingTarget ||
              loadingSupervisors ||
              (selectedDesignation === "worker"
                ? !selectedWorkers.length || !targetUcmo || !targetSupervisor
                : !targetUcmo)
            }
            className="bg-primary hover:bg-primary-dark rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {transferring
              ? "Transferring..."
              : selectedDesignation === "worker"
                ? `Transfer ${selectedWorkers.length || ""} Worker${
                    selectedWorkers.length === 1 ? "" : "s"
                  }`
                : "Transfer Staff"}
          </button>
        </div>
      )}

      {/* ========================================================
      LOADING
  ======================================================== */}

      {loading && selectedDesignation && selectedDesignation !== "worker" && (
        <div className="text-text-secondary text-center text-sm">
          Loading staff...
        </div>
      )}
    </div>
  );
}

// ============================================================
// Info
// ============================================================

function Info({ label, value }) {
  return (
    <div>
      <p className="text-text-secondary mb-1 text-xs">{label} </p>
      <p className="text-text text-sm font-medium capitalize">{value || "—"}</p>
    </div>
  );
}

// ============================================================
// Select Field
// ============================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  clearable = false,
  showCode = false,
  codePrefix = "",
}) {
  return (
    <Select
      label={label}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={options.map((item) => ({
        value: item._id || item.id || item.value,
        label: item.name || item.label,
        code: item.code,
      }))}
      placeholder={`Select ${label}`}
      disabled={disabled}
      loading={loading}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      clearable={clearable}
      showCode={showCode}
      codePrefix={codePrefix}
    />
  );
}
