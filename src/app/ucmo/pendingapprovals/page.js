// // "use client";

// // import { useCallback, useEffect, useState } from "react";
// // import {
// //   CheckCircle2,
// //   RefreshCw,
// //   ShieldCheck,
// //   UserCheck,
// //   Syringe,
// //   Users,
// // } from "lucide-react";
// // import { useRouter } from "next/navigation";
// // import { toast } from "sonner";

// // import {
// //   getPendingUserApprovals,
// //   updateUserApproval,
// // } from "@/api/userApprovalsApi";

// // import SupervisorApprovalCard from "@/components/ucmo/SupervisorApprovalCard";
// // import ClientPageHeader from "@/components/ui/ClientPageHeader";

// // export default function Page() {
// //   const router = useRouter();

// //   const [approvals, setApprovals] = useState([]);
// //   const [expandedApprovals, setExpandedApprovals] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [processingId, setProcessingId] = useState(null);
// //   const [error, setError] = useState("");

// //   // ============================================================
// //   // GET ID
// //   // ============================================================

// //   const getId = (value) => {
// //     if (!value) return null;

// //     if (typeof value === "object") {
// //       return (
// //         value._id?.toString() ||
// //         value.id?.toString() ||
// //         value.value?.toString() ||
// //         null
// //       );
// //     }

// //     return value.toString();
// //   };

// //   // ============================================================
// //   // AUTH USER
// //   // ============================================================

// //   const getAuthUser = () => {
// //     try {
// //       return JSON.parse(localStorage.getItem("authUser") || "{}");
// //     } catch {
// //       return {};
// //     }
// //   };

// //   // ============================================================
// //   // GET UCMO UNION COUNCIL
// //   // ============================================================

// //   const getAuthUnionCouncil = (authUser) => {
// //     if (!authUser) return null;

// //     return (
// //       getId(authUser.unionCouncil) || getId(authUser.unionCouncilId) || null
// //     );
// //   };

// //   // ============================================================
// //   // DESIGNATION LABEL
// //   // ============================================================

// //   const getDesignationLabel = (designation) => {
// //     switch (designation) {
// //       case "supervisor":
// //         return "Supervisor";

// //       case "vaccinator":
// //         return "Vaccinator";

// //       case "otherstaff":
// //         return "Other Staff";

// //       default:
// //         return "User";
// //     }
// //   };

// //   // ============================================================
// //   // FETCH APPROVALS
// //   // ============================================================

// //   const fetchApprovals = useCallback(async (isRefresh = false) => {
// //     try {
// //       if (isRefresh) {
// //         setRefreshing(true);
// //       } else {
// //         setLoading(true);
// //       }

// //       setError("");

// //       const authUser = getAuthUser();

// //       if (!authUser?.id) {
// //         throw new Error("UCMO authentication data not found.");
// //       }

// //       const unionCouncilId = getAuthUnionCouncil(authUser);

// //       if (!unionCouncilId) {
// //         throw new Error(
// //           "Union Council information not found in UCMO authentication data.",
// //         );
// //       }

// //       // ==========================================================
// //       // UCMO CAN APPROVE THESE 3 DESIGNATIONS
// //       // ==========================================================

// //       const approvalDesignations = ["supervisor", "vaccinator", "otherstaff"];

// //       // ==========================================================
// //       // FETCH ALL 3 APPROVAL TYPES
// //       // ==========================================================

// //       const responses = await Promise.all(
// //         approvalDesignations.map((designation) =>
// //           getPendingUserApprovals({
// //             designation,
// //             unionCouncil: unionCouncilId,
// //           }),
// //         ),
// //       );

// //       // ==========================================================
// //       // VALIDATE RESPONSES
// //       // ==========================================================

// //       responses.forEach((response, index) => {
// //         if (!response?.success) {
// //           throw new Error(
// //             response?.message ||
// //               `Failed to fetch ${approvalDesignations[index]} approvals.`,
// //           );
// //         }
// //       });

// //       // ==========================================================
// //       // MERGE ALL APPROVALS
// //       // ==========================================================

// //       const allApprovals = responses.flatMap((response, index) => {
// //         const designation = approvalDesignations[index];

// //         return (response?.data || []).map((user) => ({
// //           ...user,

// //           // Explicitly keep designation for UI/card
// //           approvalDesignation: designation,
// //         }));
// //       });

// //       setApprovals(allApprovals);
// //     } catch (error) {
// //       console.error("Approval fetch error:", error);

// //       const message =
// //         error?.response?.data?.message ||
// //         error?.message ||
// //         "Failed to load approvals.";

// //       setError(message);
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchApprovals();
// //   }, [fetchApprovals]);

// //   // ============================================================
// //   // TOGGLE APPROVAL ITEM
// //   // ============================================================

// //   const toggleApproval = (id) => {
// //     setExpandedApprovals((prev) => ({
// //       ...prev,
// //       [id]: !prev[id],
// //     }));
// //   };

// //   // ============================================================
// //   // APPROVE / REJECT
// //   // ============================================================

// //   const handleApproval = async (user, status) => {
// //     const userId = getId(user);

// //     if (!userId) {
// //       toast.error("Invalid user ID.");
// //       return;
// //     }

// //     try {
// //       setProcessingId(userId);

// //       // Get logged-in UCMO
// //       const authUser = getAuthUser();
// //       const approverId = getId(authUser);

// //       if (!approverId) {
// //         toast.error("Invalid approver ID.");
// //         return;
// //       }

// //       const response = await updateUserApproval(userId, status, approverId);

// //       if (!response?.success) {
// //         throw new Error(response?.message || "Failed to update approval.");
// //       }

// //       const designationText = getDesignationLabel(user?.approvalDesignation);

// //       toast.success(
// //         status === "approved"
// //           ? `${designationText} approved successfully.`
// //           : `${designationText} rejected successfully.`,
// //       );

// //       // Remove approved/rejected item
// //       setApprovals((prev) => prev.filter((item) => getId(item) !== userId));

// //       // Remove expanded state
// //       setExpandedApprovals((prev) => {
// //         const updated = { ...prev };

// //         delete updated[userId];

// //         return updated;
// //       });
// //     } catch (error) {
// //       console.error("Approval update error:", error);

// //       toast.error(
// //         error?.response?.data?.message ||
// //           error?.message ||
// //           "Failed to update approval.",
// //       );
// //     } finally {
// //       setProcessingId(null);
// //     }
// //   };

// //   // ============================================================
// //   // GROUP APPROVALS
// //   // ============================================================

// //   const supervisorApprovals = approvals.filter(
// //     (user) => user?.approvalDesignation === "supervisor",
// //   );

// //   const vaccinatorApprovals = approvals.filter(
// //     (user) => user?.approvalDesignation === "vaccinator",
// //   );

// //   const otherstaffApprovals = approvals.filter(
// //     (user) => user?.approvalDesignation === "otherstaff",
// //   );

// //   // ============================================================
// //   // APPROVAL SECTION
// //   // ============================================================

// //   const renderApprovalSection = ({ title, description, icon: Icon, users }) => {
// //     if (users.length === 0) return null;

// //     return (
// //       <section className="mb-8">
// //         {/* Section Header */}
// //         <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
// //           <div>
// //             <div className="flex items-center gap-2">
// //               <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
// //                 <Icon size={18} />
// //               </div>

// //               <div className="flex items-center gap-2">
// //                 <h2 className="text-text text-lg font-bold tracking-tight">
// //                   {title}
// //                 </h2>

// //                 <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
// //                   {users.length}
// //                 </span>
// //               </div>
// //             </div>

// //             <p className="text-text-secondary mt-2 text-xs md:text-sm">
// //               {description}
// //             </p>
// //           </div>

// //           <div className="text-text-secondary flex items-center gap-1.5 text-xs">
// //             <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
// //             {users.length} {users.length === 1 ? "request" : "requests"} waiting
// //           </div>
// //         </div>

// //         {/* Approval Cards */}
// //         <div className="space-y-3 rounded-2xl bg-primary/[0.025] p-2 sm:p-2.5">
// //           {users.map((user) => {
// //             const userId = getId(user);

// //             return (
// //               <SupervisorApprovalCard
// //                 key={userId}
// //                 supervisor={user}
// //                 expanded={!!expandedApprovals[userId]}
// //                 processing={processingId === userId}
// //                 onToggle={() => toggleApproval(userId)}
// //                 onApprove={() => handleApproval(user, "approved")}
// //                 onReject={() => handleApproval(user, "rejected")}
// //               />
// //             );
// //           })}
// //         </div>
// //       </section>
// //     );
// //   };

// //   // ============================================================
// //   // LOADING SKELETON
// //   // ============================================================

// //   if (loading) {
// //     return (
// //       <div className="min-h-full">
// //         <div className="mx-auto w-full max-w-7xl">
// //           {/* Header */}
// //           <div className="border-border mb-6 border-b pb-6">
// //             <div className="bg-surface mb-5 h-8 w-32 animate-pulse rounded-lg" />

// //             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
// //               <div className="flex items-start gap-3.5">
// //                 <div className="bg-surface h-11 w-11 shrink-0 animate-pulse rounded-xl" />

// //                 <div>
// //                   <div className="bg-surface h-8 w-64 animate-pulse rounded-lg" />

// //                   <div className="bg-surface mt-3 h-4 w-80 animate-pulse rounded" />
// //                 </div>
// //               </div>

// //               <div className="bg-surface h-10 w-28 animate-pulse rounded-xl" />
// //             </div>
// //           </div>

// //           {/* Sections */}
// //           {[1, 2, 3].map((section) => (
// //             <div key={section} className="mb-8">
// //               <div className="mb-4 flex items-center justify-between">
// //                 <div>
// //                   <div className="bg-surface h-6 w-52 animate-pulse rounded" />

// //                   <div className="bg-surface mt-2 h-4 w-72 animate-pulse rounded" />
// //                 </div>

// //                 <div className="bg-surface h-7 w-24 animate-pulse rounded-full" />
// //               </div>

// //               <div className="space-y-3 rounded-2xl bg-primary/[0.025] p-2 sm:p-2.5">
// //                 {[1, 2].map((item) => (
// //                   <div
// //                     key={item}
// //                     className="border-border bg-surface h-20 animate-pulse rounded-xl border"
// //                   />
// //                 ))}
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ============================================================
// //   // PAGE
// //   // ============================================================

// //   return (
// //     <div className="min-h-full">
// //       <div className="mx-auto w-full max-w-7xl">
// //         {/* ======================================================
// //             HEADER
// //         ====================================================== */}

// //         <header className="border-border mb-6 flex justify-between border-b pb-6">
// //           <ClientPageHeader
// //             title="User Approvals"
// //             description="Review and manage pending user registration requests."
// //             onBack={() => router.back()}
// //           />

// //           <button
// //             type="button"
// //             onClick={() => fetchApprovals(true)}
// //             disabled={refreshing}
// //             className="border-border text-text hover:border-primary/30 hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
// //           >
// //             <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

// //             <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
// //           </button>
// //         </header>

// //         {/* ======================================================
// //             ERROR
// //         ====================================================== */}

// //         {error && (
// //           <div className="mb-6 overflow-hidden rounded-xl border border-red-200 bg-red-50">
// //             <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
// //               <div className="flex items-start gap-3">
// //                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
// //                   <ShieldCheck size={17} />
// //                 </div>

// //                 <div>
// //                   <p className="text-sm font-semibold text-red-700">
// //                     Unable to load approvals
// //                   </p>

// //                   <p className="mt-0.5 text-xs text-red-600">{error}</p>
// //                 </div>
// //               </div>

// //               <button
// //                 type="button"
// //                 onClick={() => fetchApprovals(true)}
// //                 disabled={refreshing}
// //                 className="w-fit rounded-lg bg-red-100 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60"
// //               >
// //                 Try Again
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {/* ======================================================
// //             EMPTY STATE
// //         ====================================================== */}

// //         {approvals.length === 0 && !error && (
// //           <div className="border-border relative overflow-hidden rounded-xl border bg-white px-5 py-14 text-center shadow-sm">
// //             <div className="bg-primary/5 absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-2xl" />

// //             <div className="relative">
// //               <div className="bg-primary/10 text-primary mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl">
// //                 <CheckCircle2 size={28} strokeWidth={1.8} />
// //               </div>

// //               <h3 className="text-text text-lg font-bold">All Caught Up</h3>

// //               <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
// //                 There are currently no registration requests waiting for your
// //                 approval.
// //               </p>

// //               <button
// //                 type="button"
// //                 onClick={() => fetchApprovals(true)}
// //                 disabled={refreshing}
// //                 className="bg-primary hover:bg-primary-dark mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
// //               >
// //                 <RefreshCw
// //                   size={15}
// //                   className={refreshing ? "animate-spin" : ""}
// //                 />

// //                 <span>{refreshing ? "Checking..." : "Check Again"}</span>
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {/* ======================================================
// //             SUPERVISOR APPROVALS
// //         ====================================================== */}

// //         {renderApprovalSection({
// //           title: "Supervisor Approvals",
// //           description:
// //             "Review and manage pending supervisor registration requests.",
// //           icon: UserCheck,
// //           users: supervisorApprovals,
// //         })}

// //         {/* ======================================================
// //             VACCINATOR APPROVALS
// //         ====================================================== */}

// //         {renderApprovalSection({
// //           title: "Vaccinator Approvals",
// //           description:
// //             "Review and manage pending vaccinator registration requests.",
// //           icon: Syringe,
// //           users: vaccinatorApprovals,
// //         })}

// //         {/* ======================================================
// //             OTHER STAFF APPROVALS
// //         ====================================================== */}

// //         {renderApprovalSection({
// //           title: "Other Staff Approvals",
// //           description:
// //             "Review and manage pending other staff registration requests.",
// //           icon: Users,
// //           users: otherstaffApprovals,
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

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
// import Loader from "@/components/ui/Loader";
// import UserApprovalsSkeleton from "@/components/ucmo/UserApprovalsSkeleton";

// export default function Page() {
//   const router = useRouter();

//   const [approvals, setApprovals] = useState([]);
//   const [expandedApprovals, setExpandedApprovals] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [processingId, setProcessingId] = useState(null);
//   const [error, setError] = useState("");

//   // ============================================================
//   // PAGE LOAD ANIMATION
//   // ============================================================

//   const [pageReady, setPageReady] = useState(false);

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

//       const approvalDesignations = ["supervisor", "vaccinator", "otherstaff"];

//       const responses = await Promise.all(
//         approvalDesignations.map((designation) =>
//           getPendingUserApprovals({
//             designation,
//             unionCouncil: unionCouncilId,
//           }),
//         ),
//       );

//       responses.forEach((response, index) => {
//         if (!response?.success) {
//           throw new Error(
//             response?.message ||
//               `Failed to fetch ${approvalDesignations[index]} approvals.`,
//           );
//         }
//       });

//       const allApprovals = responses.flatMap((response, index) => {
//         const designation = approvalDesignations[index];

//         return (response?.data || []).map((user) => ({
//           ...user,
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

//       setApprovals((prev) => prev.filter((item) => getId(item) !== userId));

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

//   const renderApprovalSection = ({
//     title,
//     description,
//     icon: Icon,
//     users,
//     delay = 0,
//   }) => {
//     if (users.length === 0) return null;
  
//     return (
//       <section
//         className={`mb-8 transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
//           pageReady
//             ? "translate-y-0 scale-100 opacity-100"
//             : "translate-y-10 scale-[0.98] opacity-0"
//         }`}
//         style={{
//           transitionDelay: `${delay}ms`,
//         }}
//       >
//         {/* ============================================================
//             LOADING
//         ============================================================ */}
//         {/* ============================================================
//             SECTION HEADER
//         ============================================================ */}

//         <div className="border-border bg-surface relative mb-4 overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-sm sm:p-5">
//           {/* Decorative glow */}
//           <div className="bg-primary/10 pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-2xl" />

//           <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             {/* Left */}
//             <div className="flex min-w-0 items-start gap-3">
//               {/* Icon */}
//               <div className="bg-primary-light text-primary ring-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1">
//                 <Icon size={19} strokeWidth={2} />
//               </div>

//               {/* Title */}
//               <div className="min-w-0">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <h2 className="text-text text-base font-bold tracking-tight sm:text-lg">
//                     {title}
//                   </h2>

//                   <span className="bg-primary-light text-primary ring-primary/10 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1">
//                     {users.length}
//                   </span>
//                 </div>

//                 <p className="text-text-secondary mt-1 text-xs leading-5 sm:text-sm">
//                   {description}
//                 </p>
//               </div>
//             </div>

//             {/* Waiting Status */}
//             <div className="border-border bg-background text-text-secondary flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-sm">
//               <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />

//               <span>
//                 {users.length} {users.length === 1 ? "request" : "requests"}{" "}
//                 waiting
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* ============================================================
//             APPROVAL CARDS
//         ============================================================ */}

//         <div className="bg-surface border-border space-y-3 rounded-2xl border p-2 sm:p-2.5">
//           {users.map((user, index) => {
//             const userId = getId(user);

//             return (
//               <div
//                 key={userId}
//                 className={`transform transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
//                   pageReady
//                     ? "translate-y-0 scale-100 opacity-100"
//                     : "translate-y-10 scale-[0.98] opacity-0"
//                 }`}
//                 style={{
//                   transitionDelay: `${delay + 100 + index * 70}ms`,
//                 }}
//               >
//                 <SupervisorApprovalCard
//                   supervisor={user}
//                   expanded={!!expandedApprovals[userId]}
//                   processing={processingId === userId}
//                   onToggle={() => toggleApproval(userId)}
//                   onApprove={() => handleApproval(user, "approved")}
//                   onReject={() => handleApproval(user, "rejected")}
//                 />
//               </div>
//             );
//           })}
//         </div>
//       </section>
//     );
//   };

//   // ============================================================
//   // PAGE
//   // ============================================================
  
//   if (loading) {
//   return <UserApprovalsSkeleton />;
// }

//   return (
//     <div className="min-h-full">
//       <div className="mx-auto w-full max-w-7xl">
//         {/* ============================================================
//             HEADER
//         ============================================================ */}

//         <header
//           className={`border-border relative mb-4 flex transform items-center justify-between overflow-hidden border-b pb-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
//             pageReady
//               ? "translate-y-0 scale-100 opacity-100"
//               : "translate-y-10 scale-[0.98] opacity-0"
//           }`}
//         >
//           {/* Header glow */}
//           <div className="bg-primary/10 pointer-events-none absolute -top-20 left-10 h-40 w-72 rounded-full blur-3xl" />

//           <div className="bg-primary/5 pointer-events-none absolute -right-20 -bottom-20 h-40 w-64 rounded-full blur-3xl" />

//           <div className="relative">
//             <ClientPageHeader
//               title="User Approvals"
//               description="Review and manage pending user registration requests."
//               onBack={() => router.back()}
//             />
//           </div>

//           {/* Refresh */}
//           <button
//             type="button"
//             onClick={() => fetchApprovals(true)}
//             disabled={refreshing}
//             className="border-border bg-surface text-primary hover:border-primary hover:bg-primary-light relative inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

//             <span className="hidden sm:inline">
//               {refreshing ? "Refreshing..." : "Refresh"}
//             </span>
//           </button>
//         </header>

//         {/* ============================================================
//             ERROR
//         ============================================================ */}

//         {error && (
//           <div
//             className={`mb-6 transform overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-red-900/50 dark:bg-red-950/30 ${
//               pageReady
//                 ? "translate-y-0 scale-100 opacity-100"
//                 : "translate-y-10 scale-[0.98] opacity-0"
//             }`}
//           >
//             <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-start gap-3">
//                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
//                   <ShieldCheck size={17} />
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold text-red-700 dark:text-red-300">
//                     Unable to load approvals
//                   </p>

//                   <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
//                     {error}
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => fetchApprovals(true)}
//                 disabled={refreshing}
//                 className="w-fit rounded-lg bg-red-100 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ============================================================
//             EMPTY STATE
//         ============================================================ */}

//         {approvals.length === 0 && !error && (
//           <div
//             className={`border-border bg-surface relative transform overflow-hidden rounded-2xl border px-5 py-16 text-center shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
//               pageReady
//                 ? "translate-y-0 scale-100 opacity-100"
//                 : "translate-y-10 scale-[0.98] opacity-0"
//             }`}
//           >
//             {/* Decorative glow */}
//             <div className="bg-primary/5 pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full blur-2xl" />

//             <div className="bg-primary/5 pointer-events-none absolute -right-20 bottom-[-40px] h-40 w-40 rounded-full blur-3xl" />

//             <div className="relative">
//               {/* Icon */}
//               <div className="bg-primary-light text-primary ring-primary/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1">
//                 <CheckCircle2 size={30} strokeWidth={1.8} />
//               </div>

//               {/* Title */}
//               <h3 className="text-text text-lg font-bold">All Caught Up</h3>

//               {/* Description */}
//               <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
//                 There are currently no registration requests waiting for your
//                 approval.
//               </p>

//               {/* Button */}
//               <button
//                 type="button"
//                 onClick={() => fetchApprovals(true)}
//                 disabled={refreshing}
//                 className="bg-primary text-primary-foreground hover:bg-primary-dark mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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

//         {/* ============================================================
//             SUPERVISOR APPROVALS
//         ============================================================ */}

//         {renderApprovalSection({
//           title: "Supervisor Approvals",
//           description:
//             "Review and manage pending supervisor registration requests.",
//           icon: UserCheck,
//           users: supervisorApprovals,
//           delay: 120,
//         })}

//         {/* ============================================================
//             VACCINATOR APPROVALS
//         ============================================================ */}

//         {renderApprovalSection({
//           title: "Vaccinator Approvals",
//           description:
//             "Review and manage pending vaccinator registration requests.",
//           icon: Syringe,
//           users: vaccinatorApprovals,
//           delay: 220,
//         })}

//         {/* ============================================================
//             OTHER STAFF APPROVALS
//         ============================================================ */}

//         {renderApprovalSection({
//           title: "Other Staff Approvals",
//           description:
//             "Review and manage pending other staff registration requests.",
//           icon: Users,
//           users: otherstaffApprovals,
//           delay: 320,
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileEdit,
  RefreshCw,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getPendingZerodoseUpdates,
  updateZerodoseApproval,
} from "@/api/zerodoseApprovalApi";

import ClientPageHeader from "@/components/ui/ClientPageHeader";
import Loader from "@/components/ui/Loader";
import SupervisorApprovalCard from "@/components/ucmo/SupervisorApprovalCard";

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

  const getAuthUser = useCallback(() => {
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
      childName: "Child Name",
      fatherName: "Father Name",
      age: "Age",
      address: "Address",
      contactNo: "Contact Number",
      location: "Location",
      gender: "Gender",
      houseNumber: "House Number",
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

    const {
      User,
      UserRound,
      Phone,
      Hash,
      Clock3,
      FileEdit,
    } = require("lucide-react");

    const icons = {
      childName: User,
      fatherName: UserRound,
      age: Clock3,
      address: UserRound,
      contactNo: Phone,
      location: UserRound,
      gender: User,
      houseNumber: Hash,
    };

    return icons[field] || FileEdit;
  }, []);

  // ============================================================
  // GET CURRENT ZERODOSE DATA
  // ============================================================

  const getZerodoseData = useCallback((request) => {
    if (!request || typeof request !== "object") {
      return {};
    }

    /*
     * Preferred structure:
     * request.zerodose
     */

    if (
      request?.zerodose &&
      typeof request.zerodose === "object" &&
      !Array.isArray(request.zerodose)
    ) {
      return request.zerodose;
    }

    /*
     * Alternative structures
     */

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
  // GET REQUESTED / NEW DATA
  // ============================================================

  const getRequestedData = useCallback((request) => {
    if (!request || typeof request !== "object") {
      return {};
    }

    /*
     * Preferred structure:
     * request.requestedData
     */

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
              <span className="text-text-secondary">
                Latitude:
              </span>{" "}
              {latitude ?? "—"}
            </p>

            <p>
              <span className="text-text-secondary">
                Longitude:
              </span>{" "}
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
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return "—";
      }

      if (field === "age") {
        return `${value} months`;
      }

      if (field === "location") {
        return formatLocation(value);
      }

      if (typeof value === "object") {
        if (value?.name) {
          return value.name;
        }

        if (
          value?.latitude !== undefined ||
          value?.longitude !== undefined
        ) {
          return formatLocation(value);
        }

        return JSON.stringify(value);
      }

      return String(value);
    },
    [formatLocation],
  );

  // ============================================================
  // NORMALIZE VALUE
  // ============================================================

  const normalizeValue = useCallback((value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    if (typeof value === "object") {
      /*
       * Location
       */

      if (
        value?.latitude !== undefined ||
        value?.longitude !== undefined
      ) {
        return {
          latitude: value?.latitude ?? null,
          longitude: value?.longitude ?? null,
        };
      }

      /*
       * Mongo ObjectId / populated object
       */

      if (value?._id) {
        return value._id.toString();
      }

      /*
       * Populated name
       */

      if (value?.name) {
        return value.name;
      }
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
       * These are the only fields worker is allowed
       * to request for update approval.
       */

      const editableFields = [
        "childName",
        "fatherName",
        "age",
        "address",
        "contactNo",
        "location",
      ];

      return editableFields.filter((field) => {
        /*
         * If worker did not send this field,
         * it is not considered changed.
         */

        if (requested?.[field] === undefined) {
          return false;
        }

        const currentValue = normalizeValue(
          current?.[field],
        );

        const requestedValue = normalizeValue(
          requested?.[field],
        );

        return (
          JSON.stringify(currentValue) !==
          JSON.stringify(requestedValue)
        );
      });
    },
    [
      getRequestedData,
      getZerodoseData,
      normalizeValue,
    ],
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
          getId(authUser?.id) ||
          getId(authUser?._id) ||
          null;

        if (!supervisorId) {
          throw new Error(
            "Supervisor authentication data not found.",
          );
        }

        const response =
          await getPendingZerodoseUpdates(
            supervisorId,
          );

        console.log(
          "========== PENDING ZERODOSE ==========",
        );
        console.log(
          "Supervisor ID:",
          supervisorId,
        );
        console.log("Response:", response);
        console.log("Requests:", response?.data);
        console.log(
          "======================================",
        );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to fetch Zerodose requests.",
          );
        }

        const pendingRequests = Array.isArray(
          response?.data,
        )
          ? response.data
          : [];

        setRequests(pendingRequests);

        /*
         * Keep already expanded requests expanded
         * after refresh.
         */

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
        console.error(
          "Zerodose approval fetch error:",
          error,
        );

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
    [getAuthUser, getId],
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

  const handleToggle = useCallback((requestId) => {
    if (!requestId) {
      return;
    }

    setExpandedRequests((previous) => ({
      ...previous,
      [requestId]: !previous[requestId],
    }));
  }, []);

  // ============================================================
  // APPROVE / REJECT
  // ============================================================

  const handleApproval = useCallback(
    async (request, action) => {
      const zerodose = getZerodoseData(request);

      const zerodoseId =
        getId(zerodose) ||
        getId(request?.zerodoseId) ||
        getId(request?.zerodose);

      if (!zerodoseId) {
        toast.error("Invalid Zerodose ID.");
        return;
      }

      if (
        !["approve", "reject"].includes(action)
      ) {
        toast.error("Invalid approval action.");
        return;
      }

      try {
        setProcessingId(zerodoseId);

        const authUser = getAuthUser();

        const supervisorId =
          getId(authUser?.id) ||
          getId(authUser?._id);

        if (!supervisorId) {
          throw new Error(
            "Supervisor authentication data not found.",
          );
        }

        /*
         * approve -> approved
         * reject  -> rejected
         */

        const approvalStatus =
          action === "approve"
            ? "approved"
            : "rejected";

        const response =
          await updateZerodoseApproval(
            zerodoseId,
            approvalStatus,
            supervisorId,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to update Zerodose approval.",
          );
        }

        if (action === "approve") {
          toast.success(
            "Zerodose update approved successfully.",
          );
        } else {
          toast.success(
            "Zerodose update rejected successfully.",
          );
        }

        /*
         * Remove processed request.
         */

        const requestId = getId(request);

        setRequests((previous) =>
          previous.filter(
            (item) => getId(item) !== requestId,
          ),
        );

        setExpandedRequests((previous) => {
          const updated = {
            ...previous,
          };

          delete updated[requestId];

          return updated;
        });
      } catch (error) {
        console.error(
          "Zerodose approval error:",
          error,
        );

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to process Zerodose approval.",
        );
      } finally {
        setProcessingId(null);
      }
    },
    [
      getAuthUser,
      getId,
      getZerodoseData,
    ],
  );

  // ============================================================
  // TOTAL CHANGES
  // ============================================================

  const totalChanges = useMemo(() => {
    return requests.reduce(
      (total, request) =>
        total + getChangedFields(request).length,
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
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
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

                <p className="mt-1 text-xs">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchRequests(true)
                }
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
                <CheckCircle2
                  size={30}
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="text-text text-lg font-bold">
                All Caught Up
              </h3>

              <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                There are currently no Zerodose
                update requests waiting for your
                approval.
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchRequests(true)
                }
                disabled={refreshing}
                className="bg-primary text-primary-foreground hover:bg-primary-dark mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span>
                  {refreshing
                    ? "Checking..."
                    : "Check Again"}
                </span>
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
                      Review only the fields changed by
                      the worker before approving or
                      rejecting.
                    </p>

                  </div>
                </div>

                <div className="flex flex-wrap gap-2">

                  <div className="border-border bg-background text-text-secondary flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />

                    <span>
                      {requests.length}{" "}
                      {requests.length === 1
                        ? "request"
                        : "requests"}{" "}
                      waiting
                    </span>
                  </div>

                  {totalChanges > 0 && (
                    <div className="bg-primary-light text-primary ring-primary/10 flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1">
                      <FileEdit size={12} />

                      {totalChanges} total{" "}
                      {totalChanges === 1
                        ? "change"
                        : "changes"}
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* ==================================================
                CARDS
            ================================================== */}

            <div className="bg-surface border-border space-y-3 rounded-2xl border p-2 sm:p-2.5">

              {requests.map(
                (request, index) => {
                  const requestId =
                    getId(request);

                  const worker =
                    getWorker(request);

                  const zerodose =
                    getZerodoseData(
                      request,
                    );

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

                  const workerRole =
                    getWorkerRoleLabel(
                      worker,
                    );

                  const teamNumber =
                    worker?.teamNumber ??
                    zerodose?.teamNumber ??
                    request?.teamNumber ??
                    "—";

                  const changedFields =
                    getChangedFields(
                      request,
                    );

                  const requestedAt =
                    request?.updateRequestedAt ||
                    request?.requestedAt ||
                    request?.createdAt ||
                    null;

                  const expanded =
                    !!expandedRequests[
                      requestId
                    ];

                  const processing =
                    processingId === requestId;

                  return (
                    <div
                      key={requestId}
                      className={`transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        pageReady
                          ? "translate-y-0 scale-100 opacity-100"
                          : "translate-y-10 scale-[0.98] opacity-0"
                      }`}
                      style={{
                        transitionDelay: `${
                          100 + index * 70
                        }ms`,
                      }}
                    >
                      <SupervisorApprovalCard
                        request={request}
                        expanded={expanded}
                        processing={processing}
                        changedFields={
                          changedFields
                        }
                        workerName={
                          workerName
                        }
                        workerContact={
                          workerContact
                        }
                        workerRole={
                          workerRole
                        }
                        teamNumber={
                          teamNumber
                        }
                        requestedAt={
                          requestedAt
                        }
                        getFieldLabel={
                          getFieldLabel
                        }
                        getFieldIcon={
                          getFieldIcon
                        }
                        formatValue={
                          formatValue
                        }
                        getZerodoseData={
                          getZerodoseData
                        }
                        getRequestedData={
                          getRequestedData
                        }
                        onToggle={() =>
                          handleToggle(
                            requestId,
                          )
                        }
                        onApprove={() =>
                          handleApproval(
                            request,
                            "approve",
                          )
                        }
                        onReject={() =>
                          handleApproval(
                            request,
                            "reject",
                          )
                        }
                      />
                    </div>
                  );
                },
              )}

            </div>
          </section>
        )}

      </div>
    </div>
  );
}