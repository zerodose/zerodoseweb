"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, UserRound } from "lucide-react";
import { toast } from "sonner";

import { getUsers, transferUser } from "@/api/userApi";
import ClientPageHeader from "@/components/ui/ClientPageHeader";

export default function StaffManagementPage() {
  const router = useRouter();

  const [ucmoId, setUcmoId] = useState("");

  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [unionCouncils, setUnionCouncils] = useState([]);
  const [ucmos, setUcmos] = useState([]);

  const [targetDistrict, setTargetDistrict] = useState("");
  const [targetTown, setTargetTown] = useState("");
  const [targetUnionCouncil, setTargetUnionCouncil] = useState("");
  const [targetUcmo, setTargetUcmo] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageReady, setPageReady] = useState(false);

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
  // Page Animation
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
  // Fetch Staff Belonging To Current UCMO
  // ============================================================

  const fetchStaff = async (isRefresh = false) => {
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
        ucmo: ucmoId,
        isActive: true,
      });

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.users || [];

      const filtered = data.filter((user) =>
        ["supervisor", "vaccinator", "otherstaff"].includes(user.designation),
      );

      setStaff(filtered);
    } catch (error) {
      console.error("Failed to fetch staff:", error);

      toast.error(error?.response?.data?.message || "Failed to load staff.");

      setStaff([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (ucmoId) {
      fetchStaff();
    }
  }, [ucmoId]);

  // ============================================================
  // Selected Staff
  // ============================================================

  const selectedUser = useMemo(() => {
    return staff.find(
      (user) => String(user._id || user.id) === String(selectedStaff),
    );
  }, [staff, selectedStaff]);

  // ============================================================
  // Reset Target Selection
  // ============================================================

  const resetTarget = () => {
    setTargetDistrict("");
    setTargetTown("");
    setTargetUnionCouncil("");
    setTargetUcmo("");

    setTowns([]);
    setUnionCouncils([]);
    setUcmos([]);
  };

  // ============================================================
  // District Change
  // ============================================================

  const handleDistrictChange = async (value) => {
    setTargetDistrict(value);
    setTargetTown("");
    setTargetUnionCouncil("");
    setTargetUcmo("");

    setTowns([]);
    setUnionCouncils([]);
    setUcmos([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      /*
        Apni existing district API yahan use karein.
        Example:

        const response = await getTowns({
          district: value,
        });

        setTowns(response.data || []);
      */
    } catch (error) {
      console.error("Failed to load towns:", error);
      toast.error("Failed to load towns.");
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

    setUnionCouncils([]);
    setUcmos([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      /*
        Existing Union Council API use karein.
      */
    } catch (error) {
      console.error("Failed to load Union Councils:", error);

      toast.error("Failed to load Union Councils.");
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

    setUcmos([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      const response = await getUsers({
        page: 1,
        limit: 100,
        designation: "ucmo",
        district: targetDistrict,
        town: targetTown,
        unionCouncil: value,
        isActive: true,
      });

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.users || [];

      setUcmos(
        data.filter(
          (user) =>
            user.approvalStatus === "approved" && user.isActive === true,
        ),
      );
    } catch (error) {
      console.error("Failed to load UCMOs:", error);

      toast.error("Failed to load UCMOs.");
    } finally {
      setLoadingTarget(false);
    }
  };

  // ============================================================
  // Transfer
  // ============================================================

  const handleTransfer = async () => {
    if (!selectedStaff) {
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

    if (!selectedUser) {
      toast.error("Selected staff member not found.");
      return;
    }

    const currentUcmo = selectedUser?.ucmo?._id || selectedUser?.ucmo || "";

    if (String(currentUcmo) !== String(ucmoId)) {
      toast.error("You can only transfer staff assigned to your UCMO.");
      return;
    }

    try {
      setTransferring(true);

      const response = await transferUser({
        userId: selectedStaff,
        currentUcmoId: ucmoId,
        district: targetDistrict,
        town: targetTown,
        unionCouncil: targetUnionCouncil,
        ucmo: targetUcmo,
      });

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
  // Refresh
  // ============================================================

  const handleRefresh = async () => {
    await fetchStaff(true);
  };

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
            description="Transfer supervisors, vaccinators and other staff to another UCMO or location."
            onBack={() => router.back()}
          />
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-border bg-surface text-primary hover:border-primary hover:bg-primary-light relative inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

          <span className="hidden sm:inline">
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </header>

      {/* ========================================================
          STAFF SELECTION
      ======================================================== */}

      <section
        className={`border-border bg-background relative z-20 rounded-2xl border p-5 shadow-sm transition-all duration-700 ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="text-text text-base font-semibold">Select Staff</h2>

            <p className="text-text-secondary text-sm">
              Select an active staff member assigned to you.
            </p>
          </div>
        </div>

        <select
          value={selectedStaff}
          onChange={(event) => {
            setSelectedStaff(event.target.value);
            resetTarget();
          }}
          className="border-border bg-input-background text-text focus:border-primary w-full rounded-xl border px-4 py-3 text-sm outline-none"
        >
          <option value="">Select Supervisor / Vaccinator / Other Staff</option>

          {staff.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} — {user.designation}
            </option>
          ))}
        </select>
      </section>

      {/* ========================================================
          CURRENT USER
      ======================================================== */}

      {selectedUser && (
        <section className="border-border bg-surface rounded-2xl border p-5 shadow-sm">
          <h3 className="text-text mb-4 text-sm font-semibold">
            Current Assignment
          </h3>

          <div className="grid gap-4 md:grid-cols-4">
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
          TARGET LOCATION
      ======================================================== */}

      {selectedUser && (
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
                Select where this staff member will be transferred.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="District"
              value={targetDistrict}
              onChange={handleDistrictChange}
              options={districts}
            />

            <SelectField
              label="Town"
              value={targetTown}
              onChange={handleTownChange}
              options={towns}
              disabled={!targetDistrict}
            />

            <SelectField
              label="Union Council"
              value={targetUnionCouncil}
              onChange={handleUnionCouncilChange}
              options={unionCouncils}
              disabled={!targetTown}
            />

            <SelectField
              label="UCMO"
              value={targetUcmo}
              onChange={setTargetUcmo}
              options={ucmos}
              disabled={!targetUnionCouncil}
            />
          </div>
        </section>
      )}

      {/* ========================================================
          WARNING
      ======================================================== */}

      {selectedUser && targetUcmo && (
        <div className="border-primary/20 bg-primary-light/50 text-text rounded-2xl border p-4 text-sm">
          <strong>Important:</strong> After transfer, this staff member will
          become
          <strong> Pending</strong> and
          <strong> Inactive</strong>. The selected new UCMO must approve the
          account before the staff member can login again.
        </div>
      )}

      {/* ========================================================
          TRANSFER BUTTON
      ======================================================== */}

      {selectedUser && (
        <div className="border-border flex justify-end border-t pt-5">
          <button
            type="button"
            onClick={handleTransfer}
            disabled={!targetUcmo || loadingTarget || transferring}
            className="bg-primary hover:bg-primary-dark rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {transferring ? "Transferring..." : "Transfer Staff"}
          </button>
        </div>
      )}

      {loading && (
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
      <p className="text-text-secondary mb-1 text-xs">{label}</p>

      <p className="text-text text-sm font-medium capitalize">{value || "—"}</p>
    </div>
  );
}

// ============================================================
// Select Field
// ============================================================

function SelectField({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
}) {
  return (
    <div>
      <label className="text-text mb-2 block text-sm font-medium">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="border-border bg-input-background text-text focus:border-primary w-full rounded-xl border px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select {label}</option>

        {options.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name}
            {item.code ? ` (${item.code})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
