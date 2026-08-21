// "use client";

// import { useCallback, useEffect, useState } from "react";
// import {
//   CheckCircle2,
//   RefreshCw,
//   ShieldCheck,
//   UserCheck,
//   Syringe,
//   Users,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// import {
//   getPendingUserApprovals,
//   updateUserApproval,
// } from "@/api/userApprovalsApi";

// import SupervisorApprovalCard from "@/components/ucmo/SupervisorApprovalCard";
// import ClientPageHeader from "@/components/ui/ClientPageHeader";

// export default function Page() {
//   const router = useRouter();

//   const [approvals, setApprovals] = useState([]);
//   const [expandedApprovals, setExpandedApprovals] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [processingId, setProcessingId] = useState(null);
//   const [error, setError] = useState("");

//   // ============================================================
//   // GET ID
//   // ============================================================

//   const getId = (value) => {
//     if (!value) return null;

//     if (typeof value === "object") {
//       return (
//         value._id?.toString() ||
//         value.id?.toString() ||
//         value.value?.toString() ||
//         null
//       );
//     }

//     return value.toString();
//   };

//   // ============================================================
//   // AUTH USER
//   // ============================================================

//   const getAuthUser = () => {
//     try {
//       return JSON.parse(localStorage.getItem("authUser") || "{}");
//     } catch {
//       return {};
//     }
//   };

//   // ============================================================
//   // GET UCMO UNION COUNCIL
//   // ============================================================

//   const getAuthUnionCouncil = (authUser) => {
//     if (!authUser) return null;

//     return (
//       getId(authUser.unionCouncil) || getId(authUser.unionCouncilId) || null
//     );
//   };

//   // ============================================================
//   // DESIGNATION LABEL
//   // ============================================================

//   const getDesignationLabel = (designation) => {
//     switch (designation) {
//       case "supervisor":
//         return "Supervisor";

//       case "vaccinator":
//         return "Vaccinator";

//       case "otherstaff":
//         return "Other Staff";

//       default:
//         return "User";
//     }
//   };

//   // ============================================================
//   // FETCH APPROVALS
//   // ============================================================

//   const fetchApprovals = useCallback(async (isRefresh = false) => {
//     try {
//       if (isRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       setError("");

//       const authUser = getAuthUser();

//       if (!authUser?.id) {
//         throw new Error("UCMO authentication data not found.");
//       }

//       const unionCouncilId = getAuthUnionCouncil(authUser);

//       if (!unionCouncilId) {
//         throw new Error(
//           "Union Council information not found in UCMO authentication data.",
//         );
//       }

//       // ==========================================================
//       // UCMO CAN APPROVE THESE 3 DESIGNATIONS
//       // ==========================================================

//       const approvalDesignations = ["supervisor", "vaccinator", "otherstaff"];

//       // ==========================================================
//       // FETCH ALL 3 APPROVAL TYPES
//       // ==========================================================

//       const responses = await Promise.all(
//         approvalDesignations.map((designation) =>
//           getPendingUserApprovals({
//             designation,
//             unionCouncil: unionCouncilId,
//           }),
//         ),
//       );

//       // ==========================================================
//       // VALIDATE RESPONSES
//       // ==========================================================

//       responses.forEach((response, index) => {
//         if (!response?.success) {
//           throw new Error(
//             response?.message ||
//               `Failed to fetch ${approvalDesignations[index]} approvals.`,
//           );
//         }
//       });

//       // ==========================================================
//       // MERGE ALL APPROVALS
//       // ==========================================================

//       const allApprovals = responses.flatMap((response, index) => {
//         const designation = approvalDesignations[index];

//         return (response?.data || []).map((user) => ({
//           ...user,

//           // Explicitly keep designation for UI/card
//           approvalDesignation: designation,
//         }));
//       });

//       setApprovals(allApprovals);
//     } catch (error) {
//       console.error("Approval fetch error:", error);

//       const message =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Failed to load approvals.";

//       setError(message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchApprovals();
//   }, [fetchApprovals]);

//   // ============================================================
//   // TOGGLE APPROVAL ITEM
//   // ============================================================

//   const toggleApproval = (id) => {
//     setExpandedApprovals((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   // ============================================================
//   // APPROVE / REJECT
//   // ============================================================

//   const handleApproval = async (user, status) => {
//     const userId = getId(user);

//     if (!userId) {
//       toast.error("Invalid user ID.");
//       return;
//     }

//     try {
//       setProcessingId(userId);

//       // Get logged-in UCMO
//       const authUser = getAuthUser();
//       const approverId = getId(authUser);

//       if (!approverId) {
//         toast.error("Invalid approver ID.");
//         return;
//       }

//       const response = await updateUserApproval(userId, status, approverId);

//       if (!response?.success) {
//         throw new Error(response?.message || "Failed to update approval.");
//       }

//       const designationText = getDesignationLabel(user?.approvalDesignation);

//       toast.success(
//         status === "approved"
//           ? `${designationText} approved successfully.`
//           : `${designationText} rejected successfully.`,
//       );

//       // Remove approved/rejected item
//       setApprovals((prev) => prev.filter((item) => getId(item) !== userId));

//       // Remove expanded state
//       setExpandedApprovals((prev) => {
//         const updated = { ...prev };

//         delete updated[userId];

//         return updated;
//       });
//     } catch (error) {
//       console.error("Approval update error:", error);

//       toast.error(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Failed to update approval.",
//       );
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   // ============================================================
//   // GROUP APPROVALS
//   // ============================================================

//   const supervisorApprovals = approvals.filter(
//     (user) => user?.approvalDesignation === "supervisor",
//   );

//   const vaccinatorApprovals = approvals.filter(
//     (user) => user?.approvalDesignation === "vaccinator",
//   );

//   const otherstaffApprovals = approvals.filter(
//     (user) => user?.approvalDesignation === "otherstaff",
//   );

//   // ============================================================
//   // APPROVAL SECTION
//   // ============================================================

//   const renderApprovalSection = ({ title, description, icon: Icon, users }) => {
//     if (users.length === 0) return null;

//     return (
//       <section className="mb-8">
//         {/* Section Header */}
//         <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <div className="flex items-center gap-2">
//               <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
//                 <Icon size={18} />
//               </div>

//               <div className="flex items-center gap-2">
//                 <h2 className="text-text text-lg font-bold tracking-tight">
//                   {title}
//                 </h2>

//                 <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
//                   {users.length}
//                 </span>
//               </div>
//             </div>

//             <p className="text-text-secondary mt-2 text-xs md:text-sm">
//               {description}
//             </p>
//           </div>

//           <div className="text-text-secondary flex items-center gap-1.5 text-xs">
//             <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
//             {users.length} {users.length === 1 ? "request" : "requests"} waiting
//           </div>
//         </div>

//         {/* Approval Cards */}
//         <div className="space-y-3 rounded-2xl bg-primary/[0.025] p-2 sm:p-2.5">
//           {users.map((user) => {
//             const userId = getId(user);

//             return (
//               <SupervisorApprovalCard
//                 key={userId}
//                 supervisor={user}
//                 expanded={!!expandedApprovals[userId]}
//                 processing={processingId === userId}
//                 onToggle={() => toggleApproval(userId)}
//                 onApprove={() => handleApproval(user, "approved")}
//                 onReject={() => handleApproval(user, "rejected")}
//               />
//             );
//           })}
//         </div>
//       </section>
//     );
//   };

//   // ============================================================
//   // LOADING SKELETON
//   // ============================================================

//   if (loading) {
//     return (
//       <div className="min-h-full">
//         <div className="mx-auto w-full max-w-7xl">
//           {/* Header */}
//           <div className="border-border mb-6 border-b pb-6">
//             <div className="bg-surface mb-5 h-8 w-32 animate-pulse rounded-lg" />

//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-start gap-3.5">
//                 <div className="bg-surface h-11 w-11 shrink-0 animate-pulse rounded-xl" />

//                 <div>
//                   <div className="bg-surface h-8 w-64 animate-pulse rounded-lg" />

//                   <div className="bg-surface mt-3 h-4 w-80 animate-pulse rounded" />
//                 </div>
//               </div>

//               <div className="bg-surface h-10 w-28 animate-pulse rounded-xl" />
//             </div>
//           </div>

//           {/* Sections */}
//           {[1, 2, 3].map((section) => (
//             <div key={section} className="mb-8">
//               <div className="mb-4 flex items-center justify-between">
//                 <div>
//                   <div className="bg-surface h-6 w-52 animate-pulse rounded" />

//                   <div className="bg-surface mt-2 h-4 w-72 animate-pulse rounded" />
//                 </div>

//                 <div className="bg-surface h-7 w-24 animate-pulse rounded-full" />
//               </div>

//               <div className="space-y-3 rounded-2xl bg-primary/[0.025] p-2 sm:p-2.5">
//                 {[1, 2].map((item) => (
//                   <div
//                     key={item}
//                     className="border-border bg-surface h-20 animate-pulse rounded-xl border"
//                   />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // PAGE
//   // ============================================================

//   return (
//     <div className="min-h-full">
//       <div className="mx-auto w-full max-w-7xl">
//         {/* ======================================================
//             HEADER
//         ====================================================== */}

//         <header className="border-border mb-6 flex justify-between border-b pb-6">
//           <ClientPageHeader
//             title="User Approvals"
//             description="Review and manage pending user registration requests."
//             onBack={() => router.back()}
//           />

//           <button
//             type="button"
//             onClick={() => fetchApprovals(true)}
//             disabled={refreshing}
//             className="border-border text-text hover:border-primary/30 hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

//             <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
//           </button>
//         </header>

//         {/* ======================================================
//             ERROR
//         ====================================================== */}

//         {error && (
//           <div className="mb-6 overflow-hidden rounded-xl border border-red-200 bg-red-50">
//             <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-start gap-3">
//                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
//                   <ShieldCheck size={17} />
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold text-red-700">
//                     Unable to load approvals
//                   </p>

//                   <p className="mt-0.5 text-xs text-red-600">{error}</p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => fetchApprovals(true)}
//                 disabled={refreshing}
//                 className="w-fit rounded-lg bg-red-100 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ======================================================
//             EMPTY STATE
//         ====================================================== */}

//         {approvals.length === 0 && !error && (
//           <div className="border-border relative overflow-hidden rounded-xl border bg-white px-5 py-14 text-center shadow-sm">
//             <div className="bg-primary/5 absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-2xl" />

//             <div className="relative">
//               <div className="bg-primary/10 text-primary mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl">
//                 <CheckCircle2 size={28} strokeWidth={1.8} />
//               </div>

//               <h3 className="text-text text-lg font-bold">All Caught Up</h3>

//               <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
//                 There are currently no registration requests waiting for your
//                 approval.
//               </p>

//               <button
//                 type="button"
//                 onClick={() => fetchApprovals(true)}
//                 disabled={refreshing}
//                 className="bg-primary hover:bg-primary-dark mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 <RefreshCw
//                   size={15}
//                   className={refreshing ? "animate-spin" : ""}
//                 />

//                 <span>{refreshing ? "Checking..." : "Check Again"}</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ======================================================
//             SUPERVISOR APPROVALS
//         ====================================================== */}

//         {renderApprovalSection({
//           title: "Supervisor Approvals",
//           description:
//             "Review and manage pending supervisor registration requests.",
//           icon: UserCheck,
//           users: supervisorApprovals,
//         })}

//         {/* ======================================================
//             VACCINATOR APPROVALS
//         ====================================================== */}

//         {renderApprovalSection({
//           title: "Vaccinator Approvals",
//           description:
//             "Review and manage pending vaccinator registration requests.",
//           icon: Syringe,
//           users: vaccinatorApprovals,
//         })}

//         {/* ======================================================
//             OTHER STAFF APPROVALS
//         ====================================================== */}

//         {renderApprovalSection({
//           title: "Other Staff Approvals",
//           description:
//             "Review and manage pending other staff registration requests.",
//           icon: Users,
//           users: otherstaffApprovals,
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Syringe,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getPendingUserApprovals,
  updateUserApproval,
} from "@/api/userApprovalsApi";

import SupervisorApprovalCard from "@/components/ucmo/SupervisorApprovalCard";
import ClientPageHeader from "@/components/ui/ClientPageHeader";
import Loader from "@/components/ui/Loader";
import UserApprovalsSkeleton from "@/components/ucmo/UserApprovalsSkeleton";

export default function Page() {
  const router = useRouter();

  const [approvals, setApprovals] = useState([]);
  const [expandedApprovals, setExpandedApprovals] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // PAGE LOAD ANIMATION
  // ============================================================

  const [pageReady, setPageReady] = useState(false);

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
  // DESIGNATION LABEL
  // ============================================================

  const getDesignationLabel = (designation) => {
    switch (designation) {
      case "supervisor":
        return "Supervisor";

      case "vaccinator":
        return "Vaccinator";

      case "otherstaff":
        return "Other Staff";

      default:
        return "User";
    }
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

      const approvalDesignations = ["supervisor", "vaccinator", "otherstaff"];

      const responses = await Promise.all(
        approvalDesignations.map((designation) =>
          getPendingUserApprovals({
            designation,
            unionCouncil: unionCouncilId,
          }),
        ),
      );

      responses.forEach((response, index) => {
        if (!response?.success) {
          throw new Error(
            response?.message ||
              `Failed to fetch ${approvalDesignations[index]} approvals.`,
          );
        }
      });

      const allApprovals = responses.flatMap((response, index) => {
        const designation = approvalDesignations[index];

        return (response?.data || []).map((user) => ({
          ...user,
          approvalDesignation: designation,
        }));
      });

      setApprovals(allApprovals);
    } catch (error) {
      console.error("Approval fetch error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load approvals.";

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
  // TOGGLE APPROVAL ITEM
  // ============================================================

  const toggleApproval = (id) => {
    setExpandedApprovals((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ============================================================
  // APPROVE / REJECT
  // ============================================================

  const handleApproval = async (user, status) => {
    const userId = getId(user);

    if (!userId) {
      toast.error("Invalid user ID.");
      return;
    }

    try {
      setProcessingId(userId);

      const authUser = getAuthUser();
      const approverId = getId(authUser);

      if (!approverId) {
        toast.error("Invalid approver ID.");
        return;
      }

      const response = await updateUserApproval(userId, status, approverId);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update approval.");
      }

      const designationText = getDesignationLabel(user?.approvalDesignation);

      toast.success(
        status === "approved"
          ? `${designationText} approved successfully.`
          : `${designationText} rejected successfully.`,
      );

      setApprovals((prev) => prev.filter((item) => getId(item) !== userId));

      setExpandedApprovals((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (error) {
      console.error("Approval update error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update approval.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // GROUP APPROVALS
  // ============================================================

  const supervisorApprovals = approvals.filter(
    (user) => user?.approvalDesignation === "supervisor",
  );

  const vaccinatorApprovals = approvals.filter(
    (user) => user?.approvalDesignation === "vaccinator",
  );

  const otherstaffApprovals = approvals.filter(
    (user) => user?.approvalDesignation === "otherstaff",
  );

  // ============================================================
  // APPROVAL SECTION
  // ============================================================

  const renderApprovalSection = ({
    title,
    description,
    icon: Icon,
    users,
    delay = 0,
  }) => {
    if (users.length === 0) return null;
  
    return (
      <section
        className={`mb-8 transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
        style={{
          transitionDelay: `${delay}ms`,
        }}
      >
        {/* ============================================================
            LOADING
        ============================================================ */}
        {/* ============================================================
            SECTION HEADER
        ============================================================ */}

        <div className="border-border bg-surface relative mb-4 overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-sm sm:p-5">
          {/* Decorative glow */}
          <div className="bg-primary/10 pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-2xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left */}
            <div className="flex min-w-0 items-start gap-3">
              {/* Icon */}
              <div className="bg-primary-light text-primary ring-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1">
                <Icon size={19} strokeWidth={2} />
              </div>

              {/* Title */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-text text-base font-bold tracking-tight sm:text-lg">
                    {title}
                  </h2>

                  <span className="bg-primary-light text-primary ring-primary/10 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1">
                    {users.length}
                  </span>
                </div>

                <p className="text-text-secondary mt-1 text-xs leading-5 sm:text-sm">
                  {description}
                </p>
              </div>
            </div>

            {/* Waiting Status */}
            <div className="border-border bg-background text-text-secondary flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />

              <span>
                {users.length} {users.length === 1 ? "request" : "requests"}{" "}
                waiting
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            APPROVAL CARDS
        ============================================================ */}

        <div className="bg-surface border-border space-y-3 rounded-2xl border p-2 sm:p-2.5">
          {users.map((user, index) => {
            const userId = getId(user);

            return (
              <div
                key={userId}
                className={`transform transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  pageReady
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-10 scale-[0.98] opacity-0"
                }`}
                style={{
                  transitionDelay: `${delay + 100 + index * 70}ms`,
                }}
              >
                <SupervisorApprovalCard
                  supervisor={user}
                  expanded={!!expandedApprovals[userId]}
                  processing={processingId === userId}
                  onToggle={() => toggleApproval(userId)}
                  onApprove={() => handleApproval(user, "approved")}
                  onReject={() => handleApproval(user, "rejected")}
                />
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  // ============================================================
  // PAGE
  // ============================================================
  
  if (loading) {
  return <UserApprovalsSkeleton />;
}

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-7xl">
        {/* ============================================================
            HEADER
        ============================================================ */}

        <header
          className={`border-border relative mb-4 flex transform items-center justify-between overflow-hidden border-b pb-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pageReady
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-10 scale-[0.98] opacity-0"
          }`}
        >
          {/* Header glow */}
          <div className="bg-primary/10 pointer-events-none absolute -top-20 left-10 h-40 w-72 rounded-full blur-3xl" />

          <div className="bg-primary/5 pointer-events-none absolute -right-20 -bottom-20 h-40 w-64 rounded-full blur-3xl" />

          <div className="relative">
            <ClientPageHeader
              title="User Approvals"
              description="Review and manage pending user registration requests."
              onBack={() => router.back()}
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => fetchApprovals(true)}
            disabled={refreshing}
            className="border-border bg-surface text-primary hover:border-primary hover:bg-primary-light relative inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </header>

        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div
            className={`mb-6 transform overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-red-900/50 dark:bg-red-950/30 ${
              pageReady
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-10 scale-[0.98] opacity-0"
            }`}
          >
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Unable to load approvals
                  </p>

                  <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchApprovals(true)}
                disabled={refreshing}
                className="w-fit rounded-lg bg-red-100 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            EMPTY STATE
        ============================================================ */}

        {approvals.length === 0 && !error && (
          <div
            className={`border-border bg-surface relative transform overflow-hidden rounded-2xl border px-5 py-16 text-center shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              pageReady
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-10 scale-[0.98] opacity-0"
            }`}
          >
            {/* Decorative glow */}
            <div className="bg-primary/5 pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full blur-2xl" />

            <div className="bg-primary/5 pointer-events-none absolute -right-20 bottom-[-40px] h-40 w-40 rounded-full blur-3xl" />

            <div className="relative">
              {/* Icon */}
              <div className="bg-primary-light text-primary ring-primary/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1">
                <CheckCircle2 size={30} strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 className="text-text text-lg font-bold">All Caught Up</h3>

              {/* Description */}
              <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                There are currently no registration requests waiting for your
                approval.
              </p>

              {/* Button */}
              <button
                type="button"
                onClick={() => fetchApprovals(true)}
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

        {/* ============================================================
            SUPERVISOR APPROVALS
        ============================================================ */}

        {renderApprovalSection({
          title: "Supervisor Approvals",
          description:
            "Review and manage pending supervisor registration requests.",
          icon: UserCheck,
          users: supervisorApprovals,
          delay: 120,
        })}

        {/* ============================================================
            VACCINATOR APPROVALS
        ============================================================ */}

        {renderApprovalSection({
          title: "Vaccinator Approvals",
          description:
            "Review and manage pending vaccinator registration requests.",
          icon: Syringe,
          users: vaccinatorApprovals,
          delay: 220,
        })}

        {/* ============================================================
            OTHER STAFF APPROVALS
        ============================================================ */}

        {renderApprovalSection({
          title: "Other Staff Approvals",
          description:
            "Review and manage pending other staff registration requests.",
          icon: Users,
          users: otherstaffApprovals,
          delay: 320,
        })}
      </div>
    </div>
  );
}
