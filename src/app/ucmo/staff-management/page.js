// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowRight, RefreshCw, UserRound } from "lucide-react";
// import { toast } from "sonner";

// import { getDistrictDropdown } from "@/api/districtApi";
// import { getTownDropdown } from "@/api/townApi";
// import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";
// import { getUsers, transferUser, getUcmoDropdown } from "@/api/userApi";
// import ClientPageHeader from "@/components/ui/ClientPageHeader";
// import Select from "@/components/ui/Select";

// export default function StaffManagementPage() {
//   const router = useRouter();

//   const [ucmoId, setUcmoId] = useState("");

//   const [staff, setStaff] = useState([]);
//   const [selectedStaff, setSelectedStaff] = useState("");
//   const [selectedDesignation, setSelectedDesignation] = useState("");
//   const [districts, setDistricts] = useState([]);
//   const [towns, setTowns] = useState([]);
//   const [unionCouncils, setUnionCouncils] = useState([]);
//   const [ucmos, setUcmos] = useState([]);

//   const [targetDistrict, setTargetDistrict] = useState("");
//   const [targetTown, setTargetTown] = useState("");
//   const [targetUnionCouncil, setTargetUnionCouncil] = useState("");
//   const [targetUcmo, setTargetUcmo] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [loadingTarget, setLoadingTarget] = useState(false);
//   const [transferring, setTransferring] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [pageReady, setPageReady] = useState(false);

//   // ============================================================
//   // Current UCMO
//   // ============================================================

//   const designationOptions = [
//     { value: "supervisor", label: "Supervisor" },
//     { value: "vaccinator", label: "Vaccinator" },
//     { value: "otherstaff", label: "Other Staff" },
//     { value: "worker", label: "Worker" },
//   ];

//   useEffect(() => {
//     try {
//       const authUser = localStorage.getItem("authUser");

//       if (!authUser) {
//         toast.error("UCMO session not found.");
//         setLoading(false);
//         return;
//       }

//       const parsedUser = JSON.parse(authUser);
//       const id = parsedUser?.id || parsedUser?._id;

//       if (!id) {
//         toast.error("UCMO ID not found.");
//         setLoading(false);
//         return;
//       }

//       setUcmoId(String(id));
//     } catch (error) {
//       console.error("Failed to read UCMO session:", error);
//       toast.error("Invalid login session.");
//       setLoading(false);
//     }
//   }, []);

//   // ============================================================
//   // Load Districts
//   // ============================================================

//   useEffect(() => {
//     const loadDistricts = async () => {
//       try {
//         const response = await getDistrictDropdown();

//         setDistricts(response?.data || []);
//       } catch (error) {
//         console.error("Failed to load districts:", error);

//         setDistricts([]);

//         toast.error("Failed to load districts.", {
//           description:
//             error?.response?.data?.message ||
//             error?.message ||
//             "Please try again.",
//         });
//       }
//     };

//     loadDistricts();
//   }, []);

//   // ============================================================
//   // Page Animation
//   // ============================================================

//   useEffect(() => {
//     if (!loading) {
//       const timer = setTimeout(() => {
//         setPageReady(true);
//       }, 80);

//       return () => clearTimeout(timer);
//     }

//     setPageReady(false);
//   }, [loading]);

//   // ============================================================
//   // Fetch Staff Belonging To Current UCMO
//   // ============================================================

//   const fetchStaff = async (isRefresh = false) => {
//     try {
//       if (!ucmoId) return;

//       if (isRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       const response = await getUsers({
//         page: 1,
//         limit: 100,
//         ucmo: ucmoId,
//         isActive: true,
//       });

//       const data = Array.isArray(response)
//         ? response
//         : response?.data || response?.users || [];

//       const filtered = data.filter(
//         (user) =>
//           user.designation?.toLowerCase() ===
//           selectedDesignation?.toLowerCase(),
//       );

//       setStaff(filtered);

//     } catch (error) {
//       console.error("Failed to fetch staff:", error);

//       toast.error(error?.response?.data?.message || "Failed to load staff.");

//       setStaff([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (ucmoId && selectedDesignation) {
//       fetchStaff();
//     } else {
//       setStaff([]);
//     }
//   }, [ucmoId, selectedDesignation]);

//   // ============================================================
//   // Selected Staff
//   // ============================================================

//   const selectedUser = useMemo(() => {
//     return staff.find(
//       (user) => String(user._id || user.id) === String(selectedStaff),
//     );
//   }, [staff, selectedStaff]);

//   // ============================================================
//   // Reset Target Selection
//   // ============================================================

//   const resetTarget = () => {
//     setTargetDistrict("");
//     setTargetTown("");
//     setTargetUnionCouncil("");
//     setTargetUcmo("");

//     setTowns([]);
//     setUnionCouncils([]);
//     setUcmos([]);
//   };

//   // ============================================================
//   // District Change
//   // ============================================================

//   const handleDistrictChange = async (value) => {
//     setTargetDistrict(value);

//     setTargetTown("");
//     setTargetUnionCouncil("");
//     setTargetUcmo("");

//     setTowns([]);
//     setUnionCouncils([]);
//     setUcmos([]);

//     if (!value) return;

//     try {
//       setLoadingTarget(true);

//       const response = await getTownDropdown(value);

//       setTowns(response?.data || []);
//     } catch (error) {
//       console.error("Failed to load towns:", error);

//       setTowns([]);

//       toast.error("Failed to load towns.", {
//         description:
//           error?.response?.data?.message ||
//           error?.message ||
//           "Please try again.",
//       });
//     } finally {
//       setLoadingTarget(false);
//     }
//   };

//   // ============================================================
//   // Town Change
//   // ============================================================

//   const handleTownChange = async (value) => {
//     setTargetTown(value);

//     setTargetUnionCouncil("");
//     setTargetUcmo("");

//     setUnionCouncils([]);
//     setUcmos([]);

//     if (!value) return;

//     try {
//       setLoadingTarget(true);

//       const response = await getUnionCouncilDropdown(value);

//       setUnionCouncils(response?.data || []);
//     } catch (error) {
//       console.error("Failed to load Union Councils:", error);

//       setUnionCouncils([]);

//       toast.error("Failed to load Union Councils.", {
//         description:
//           error?.response?.data?.message ||
//           error?.message ||
//           "Please try again.",
//       });
//     } finally {
//       setLoadingTarget(false);
//     }
//   };

//   // ============================================================
//   // Union Council Change
//   // ============================================================

//   const handleUnionCouncilChange = async (value) => {
//     setTargetUnionCouncil(value);
//     setTargetUcmo("");

//     setUcmos([]);

//     if (!value) return;

//     try {
//       setLoadingTarget(true);

//       const response = await getUcmoDropdown(value);

//       setUcmos(response?.data || []);
//     } catch (error) {
//       console.error("Failed to load UCMOs:", error);

//       setUcmos([]);

//       toast.error("Failed to load UCMOs.", {
//         description:
//           error?.response?.data?.message ||
//           error?.message ||
//           "Please try again.",
//       });
//     } finally {
//       setLoadingTarget(false);
//     }
//   };

//   // ============================================================
//   // Transfer
//   // ============================================================

//   const handleTransfer = async () => {
//     if (!selectedStaff) {
//       toast.error("Please select a staff member.");
//       return;
//     }

//     if (!targetDistrict) {
//       toast.error("Please select a district.");
//       return;
//     }

//     if (!targetTown) {
//       toast.error("Please select a town.");
//       return;
//     }

//     if (!targetUnionCouncil) {
//       toast.error("Please select a Union Council.");
//       return;
//     }

//     if (!targetUcmo) {
//       toast.error("Please select a UCMO.");
//       return;
//     }

//     if (!selectedUser) {
//       toast.error("Selected staff member not found.");
//       return;
//     }

//     const currentUcmo = selectedUser?.ucmo?._id || selectedUser?.ucmo || "";

//     if (String(currentUcmo) !== String(ucmoId)) {
//       toast.error("You can only transfer staff assigned to your UCMO.");
//       return;
//     }

//     try {
//       setTransferring(true);

//       const response = await transferUser({
//         userId: selectedStaff,
//         currentUcmoId: ucmoId,
//         district: targetDistrict,
//         town: targetTown,
//         unionCouncil: targetUnionCouncil,
//         ucmo: targetUcmo,
//       });

//       if (!response?.success) {
//         toast.error(response?.message || "Failed to transfer staff.");
//         return;
//       }

//       toast.success(response.message || "Staff transferred successfully.");

//       setSelectedStaff("");
//       resetTarget();

//       await fetchStaff();
//     } catch (error) {
//       console.error("Staff transfer error:", error);

//       toast.error(
//         error?.response?.data?.message || "Failed to transfer staff.",
//       );
//     } finally {
//       setTransferring(false);
//     }
//   };

//   // ============================================================
//   // Refresh
//   // ============================================================

//   const handleRefresh = async () => {
//     await fetchStaff(true);
//   };

//   return (
//     <div className="m-auto max-w-7xl space-y-6">
//       {/* ========================================================
//           HEADER
//       ======================================================== */}

//       <header
//         className={`border-border relative mb-4 flex items-center justify-between overflow-hidden border-b pb-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
//           pageReady
//             ? "translate-y-0 scale-100 opacity-100"
//             : "translate-y-10 scale-[0.98] opacity-0"
//         }`}
//       >
//         <div className="bg-primary/10 pointer-events-none absolute -top-20 left-10 h-40 w-72 rounded-full blur-3xl" />

//         <div className="bg-primary/5 pointer-events-none absolute -right-20 -bottom-20 h-40 w-64 rounded-full blur-3xl" />

//         <div className="relative">
//           <ClientPageHeader
//             title="Staff Management"
//             description="Transfer supervisors, vaccinators and other staff to another UCMO or location."
//             onBack={() => router.back()}
//           />
//         </div>

//         <button
//           type="button"
//           onClick={handleRefresh}
//           disabled={refreshing}
//           className="border-border bg-surface text-primary hover:border-primary hover:bg-primary-light relative inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

//           <span className="hidden sm:inline">
//             {refreshing ? "Refreshing..." : "Refresh"}
//           </span>
//         </button>
//       </header>

//       {/* ========================================================
//           STAFF SELECTION
//       ======================================================== */}

//       <Select
//         label="Designation"
//         name="designation"
//         value={selectedDesignation}
//         onChange={(event) => {
//           setSelectedDesignation(event.target.value);
//           setSelectedStaff("");
//           resetTarget();
//         }}
//         options={designationOptions}
//         placeholder="Select Designation"
//         clearable
//       />

//       <section
//         className={`border-border bg-background relative z-20 rounded-2xl border p-5 shadow-sm transition-all duration-700 ${
//           pageReady
//             ? "translate-y-0 scale-100 opacity-100"
//             : "translate-y-10 scale-[0.98] opacity-0"
//         }`}
//       >
//         <div className="mb-5 flex items-center gap-3">
//           <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
//             <UserRound size={20} />
//           </div>

//           <div>
//             <h2 className="text-text text-base font-semibold">Select Staff</h2>

//             <p className="text-text-secondary text-sm">
//               Select an active staff member assigned to you.
//             </p>
//           </div>
//         </div>

//         <Select
//           label="Staff Member"
//           name="staff"
//           value={selectedStaff}
//           onChange={(event) => {
//             setSelectedStaff(event.target.value);
//             resetTarget();
//           }}
//           options={staff.map((user) => ({
//             value: user._id,
//             label: user.name,
//           }))}
//           placeholder={
//             selectedDesignation
//               ? `Select ${
//                   selectedDesignation === "otherstaff"
//                     ? "Other Staff"
//                     : selectedDesignation.charAt(0).toUpperCase() +
//                       selectedDesignation.slice(1)
//                 }`
//               : "First select designation"
//           }
//           disabled={!selectedDesignation}
//           loading={loading}
//           searchable
//           searchPlaceholder="Search staff..."
//           clearable
//         />
//       </section>

//       {/* ========================================================
//           CURRENT USER
//       ======================================================== */}

//       {selectedUser && (
//         <section className="border-border bg-surface rounded-2xl border p-5 shadow-sm">
//           <h3 className="text-text mb-4 text-sm font-semibold">
//             Current Assignment
//           </h3>

//           <div className="grid gap-4 md:grid-cols-4">
//             <Info label="Name" value={selectedUser.name} />

//             <Info label="Designation" value={selectedUser.designation} />

//             <Info label="District" value={selectedUser.district?.name || "—"} />

//             <Info label="Town" value={selectedUser.town?.name || "—"} />

//             <Info
//               label="Union Council"
//               value={selectedUser.unionCouncil?.name || "—"}
//             />

//             <Info label="Current UCMO" value={selectedUser.ucmo?.name || "—"} />
//           </div>
//         </section>
//       )}

//       {/* ========================================================
//           TARGET LOCATION
//       ======================================================== */}

//       {selectedUser && (
//         <section className="border-border bg-background rounded-2xl border p-5 shadow-sm">
//           <div className="mb-5 flex items-center gap-3">
//             <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
//               <ArrowRight size={20} />
//             </div>

//             <div>
//               <h2 className="text-text text-base font-semibold">
//                 New Assignment
//               </h2>

//               <p className="text-text-secondary text-sm">
//                 Select where this staff member will be transferred.
//               </p>
//             </div>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             <SelectField
//               label="District"
//               value={targetDistrict}
//               onChange={handleDistrictChange}
//               options={districts}
//             />

//             <SelectField
//               label="Town"
//               value={targetTown}
//               onChange={handleTownChange}
//               options={towns}
//               disabled={!targetDistrict}
//             />

//             <SelectField
//               label="Union Council"
//               value={targetUnionCouncil}
//               onChange={handleUnionCouncilChange}
//               options={unionCouncils}
//               disabled={!targetTown}
//             />

//             <SelectField
//               label="UCMO"
//               value={targetUcmo}
//               onChange={setTargetUcmo}
//               options={ucmos}
//               disabled={!targetUnionCouncil}
//             />
//           </div>
//         </section>
//       )}

//       {/* ========================================================
//           WARNING
//       ======================================================== */}

//       {selectedUser && targetUcmo && (
//         <div className="border-primary/20 bg-primary-light/50 text-text rounded-2xl border p-4 text-sm">
//           <strong>Important:</strong> After transfer, this staff member will
//           become
//           <strong> Pending</strong> and
//           <strong> Inactive</strong>. The selected new UCMO must approve the
//           account before the staff member can login again.
//         </div>
//       )}

//       {/* ========================================================
//           TRANSFER BUTTON
//       ======================================================== */}

//       {selectedUser && (
//         <div className="border-border flex justify-end border-t pt-5">
//           <button
//             type="button"
//             onClick={handleTransfer}
//             disabled={!targetUcmo || loadingTarget || transferring}
//             className="bg-primary hover:bg-primary-dark rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {transferring ? "Transferring..." : "Transfer Staff"}
//           </button>
//         </div>
//       )}

//       {loading && (
//         <div className="text-text-secondary text-center text-sm">
//           Loading staff...
//         </div>
//       )}
//     </div>
//   );
// }

// // ============================================================
// // Info
// // ============================================================

// function Info({ label, value }) {
//   return (
//     <div>
//       <p className="text-text-secondary mb-1 text-xs">{label}</p>

//       <p className="text-text text-sm font-medium capitalize">{value || "—"}</p>
//     </div>
//   );
// }

// // ============================================================
// // Select Field
// // ============================================================

// function SelectField({
//   label,
//   value,
//   onChange,
//   options = [],
//   disabled = false,
// }) {
//   return (
//     <div>
//       <label className="text-text mb-2 block text-sm font-medium">
//         {label}
//       </label>

//       <select
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         disabled={disabled}
//         className="border-border bg-input-background text-text focus:border-primary w-full rounded-xl border px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
//       >
//         <option value="">Select {label}</option>

//         {options.map((item) => (
//           <option key={item._id} value={item._id}>
//             {item.name}
//             {item.code ? ` (${item.code})` : ""}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, UserRound } from "lucide-react";
import { toast } from "sonner";

import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";
import { getUsers, transferUser, getUcmoDropdown } from "@/api/userApi";
import ClientPageHeader from "@/components/ui/ClientPageHeader";
import Select from "@/components/ui/Select";

export default function StaffManagementPage() {
  const router = useRouter();

  const [ucmoId, setUcmoId] = useState("");

  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
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
      // console.error("Failed to read UCMO session:", error);
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
        // console.error("Failed to load districts:", error);

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
    // Page animation should NOT depend on staff loading.
    // Header and initial page UI should always become visible.
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // Fetch Staff Belonging To Current UCMO
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
        isActive: true,
      });

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.users || [];

      const filtered = data.filter(
        (user) =>
          user.designation?.toLowerCase() ===
          selectedDesignation?.toLowerCase(),
      );

      setStaff(filtered);
    } catch (error) {
      // console.error("Failed to fetch staff:", error);

      toast.error(error?.response?.data?.message || "Failed to load staff.");

      setStaff([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (ucmoId && selectedDesignation) {
      fetchStaff();
    } else {
      setStaff([]);
      setLoading(false);
    }
  }, [ucmoId, selectedDesignation]);

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

      const response = await getTownDropdown(value);

      setTowns(response?.data || []);
    } catch (error) {
      // console.error("Failed to load towns:", error);

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

    setUnionCouncils([]);
    setUcmos([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      const response = await getUnionCouncilDropdown(value);

      setUnionCouncils(response?.data || []);
    } catch (error) {
      // console.error("Failed to load Union Councils:", error);

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

    setUcmos([]);

    if (!value) return;

    try {
      setLoadingTarget(true);

      const response = await getUcmoDropdown(value);

      setUcmos(response?.data || []);
    } catch (error) {
      // console.error("Failed to load UCMOs:", error);

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
      // console.error("Staff transfer error:", error);

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
          SELECT STAFF
      ======================================================== */}

      <section
        className={`border-border bg-background relative z-20 flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-all duration-700 ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
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

        <Select
          label="Designation"
          name="designation"
          value={selectedDesignation}
          onChange={(event) => {
            setSelectedDesignation(event.target.value);
            setSelectedStaff("");
            resetTarget();
          }}
          options={designationOptions}
          placeholder="Select Designation"
          clearable
          searchable
          searchPlaceholder="Search designation..."
        />

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
          placeholder={
            selectedDesignation
              ? `Select ${
                  selectedDesignation === "otherstaff"
                    ? "Other Staff"
                    : selectedDesignation.charAt(0).toUpperCase() +
                      selectedDesignation.slice(1)
                }`
              : "First select designation"
          }
          disabled={!selectedDesignation}
          loading={loading}
          searchable
          searchPlaceholder="Search staff..."
          clearable
        />
      </section>

      {/* ========================================================
          CURRENT USER
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
              onChange={setTargetUcmo}
              options={ucmos}
              disabled={!targetUnionCouncil}
              loading={loadingTarget && !!targetUnionCouncil && !targetUcmo}
              searchable
              searchPlaceholder="Search UCMO..."
              clearable
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

      {loading && selectedDesignation && (
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
