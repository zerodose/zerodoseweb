// "use client";

// import { useEffect, useMemo, useState } from "react";

// import { getUsers, transferWorkers } from "@/api/userApi";
// import { toast } from "sonner";
// import WorkerTransfer from "@/components/ucmo/team-management/WorkerTransfer";
// import { useRouter } from "next/navigation";
// import ClientPageHeader from "@/components/ui/ClientPageHeader";
// import SupervisorSelection from "@/components/ucmo/team-management/SupervisorSelection";

// export default function SupervisorManagementPage() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [transferring, setTransferring] = useState(false);
//   const router = useRouter();
//   const [fromSupervisor, setFromSupervisor] = useState("");
//   const [toSupervisor, setToSupervisor] = useState("");

//   const [selectedWorkers, setSelectedWorkers] = useState([]);
//   const [transferredWorkers, setTransferredWorkers] = useState([]);
//   const [transferDetails, setTransferDetails] = useState({});

//   const handleTransferDetailChange = (workerId, field, value) => {
//     setTransferDetails((prev) => ({
//       ...prev,
//       [workerId]: {
//         ...prev[workerId],
//         [field]: value,
//       },
//     }));
//   };

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setLoading(true);

//         const response = await getUsers();

//         const data = Array.isArray(response)
//           ? response
//           : response?.users || response?.data || [];

//         setUsers(data);
//       } catch (error) {
//         console.error("Failed to fetch users:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const supervisors = useMemo(() => {
//     return users.filter(
//       (user) => user.designation === "supervisor" && user.isActive !== false,
//     );
//   }, [users]);

//   const workers = useMemo(() => {
//     return users.filter(
//       (user) => user.designation === "worker" && user.isActive !== false,
//     );
//   }, [users]);

//   const fromSupervisorWorkers = useMemo(() => {
//     if (!fromSupervisor) return [];

//     return workers.filter(
//       (worker) =>
//         String(worker.supervisorId || worker.supervisor?._id) ===
//         String(fromSupervisor),
//     );
//   }, [workers, fromSupervisor]);

//   const getWorkerId = (worker) => {
//     return String(worker._id || worker.id);
//   };

//   const getSupervisorName = (id) => {
//     const supervisor = supervisors.find(
//       (item) => String(item._id || item.id) === String(id),
//     );

//     return supervisor?.name || "Supervisor";
//   };

//   const handleFromSupervisorChange = (value) => {
//     setFromSupervisor(value);

//     setSelectedWorkers([]);
//     setTransferredWorkers([]);

//     if (value === toSupervisor) {
//       setToSupervisor("");
//     }
//   };

//   const handleToSupervisorChange = (value) => {
//     setToSupervisor(value);
//     setTransferredWorkers([]);
//   };

//   const toggleWorker = (workerId) => {
//     setSelectedWorkers((prev) =>
//       prev.includes(workerId)
//         ? prev.filter((id) => id !== workerId)
//         : [...prev, workerId],
//     );
//   };

//   const toggleTransferredWorker = (workerId) => {
//     setTransferredWorkers((prev) =>
//       prev.includes(workerId)
//         ? prev.filter((id) => id !== workerId)
//         : [...prev, workerId],
//     );
//   };

//   const moveToRight = () => {
//     if (!toSupervisor) {
//       toast.error("Please select a To Supervisor first.");
//       return;
//     }

//     if (!selectedWorkers.length) {
//       toast.error("Please select at least one worker to transfer.");
//       return;
//     }

//     setTransferredWorkers((prev) => [
//       ...new Set([...prev, ...selectedWorkers]),
//     ]);

//     setSelectedWorkers([]);
//   };

//   const moveToLeft = () => {
//     if (!transferredWorkers.length) return;

//     setTransferredWorkers([]);
//   };

//   const transferredWorkerObjects = useMemo(() => {
//     return fromSupervisorWorkers.filter((worker) =>
//       transferredWorkers.includes(getWorkerId(worker)),
//     );
//   }, [fromSupervisorWorkers, transferredWorkers]);

//   const handleTransfer = async () => {
//     if (!fromSupervisor) {
//       toast.error("Please select a From Supervisor.");
//       return;
//     }

//     if (!toSupervisor) {
//       toast.error("Please select a To Supervisor.");
//       return;
//     }

//     if (fromSupervisor === toSupervisor) {
//       toast.error("From and To supervisor cannot be the same.");
//       return;
//     }

//     if (!transferredWorkers.length) {
//       toast.error("Please select at least one worker to transfer.");
//       return;
//     }

//     const workers = transferredWorkerObjects.map((worker) => {
//       const workerId = getWorkerId(worker);
//       const details = transferDetails[workerId] || {};

//       return {
//         workerId,
//         teamNumber: details.teamNumber ?? worker.teamNumber,
//         workerRole: details.workerRole ?? worker.workerRole,
//       };
//     });

//     const payload = {
//       fromSupervisorId: fromSupervisor,
//       toSupervisorId: toSupervisor,
//       workers,
//     };
//     // console.log("Worker transfer payload:", payload);

//     /*
//     await transferWorkers(payload);
//   */

//     try {
//       setTransferring(true);
//       const response = await transferWorkers(payload);

//       if (response?.success) {
//         toast.success(response.message || "Workers transferred successfully.");

//         setSelectedWorkers([]);
//         setTransferredWorkers([]);
//         setTransferDetails({});

//         // Latest workers/supervisors dobara load karne ke liye
//         const usersResponse = await getUsers();

//         const data = Array.isArray(usersResponse)
//           ? usersResponse
//           : usersResponse?.users || usersResponse?.data || [];

//         setUsers(data);

//         return;
//       }
//       toast.error(response?.message || "Failed to transfer workers.");
//     } catch (error) {
//       console.error("Worker transfer error:", error);

//       toast.error(
//         error?.response?.data?.message || "Failed to transfer workers.",
//       );
//     } finally {
//       setTransferring(false);
//     }
//   };
//   // setSelectedWorkers([]);
//   // setTransferredWorkers([]);

//   return (
//     <div className="m-auto max-w-7xl space-y-6">
//       <ClientPageHeader
//         title="Supervisor Management"
//         description="Transfer individual workers between supervisors."
//         onBack={() => router.back()}
//       />

//       <SupervisorSelection
//         supervisors={supervisors}
//         fromSupervisor={fromSupervisor}
//         toSupervisor={toSupervisor}
//         onFromChange={handleFromSupervisorChange}
//         onToChange={handleToSupervisorChange}
//       />

//       <WorkerTransfer
//         fromSupervisorName={
//           fromSupervisor ? getSupervisorName(fromSupervisor) : "From Supervisor"
//         }
//         toSupervisorName={
//           toSupervisor ? getSupervisorName(toSupervisor) : "To Supervisor"
//         }
//         fromWorkers={fromSupervisorWorkers}
//         toWorkers={transferredWorkerObjects}
//         selectedWorkers={selectedWorkers}
//         transferredWorkers={transferredWorkers}
//         onToggleLeft={toggleWorker}
//         onToggleRight={toggleTransferredWorker}
//         onMoveRight={moveToRight}
//         onMoveLeft={moveToLeft}
//         transferDetails={transferDetails}
//         onTransferDetailChange={handleTransferDetailChange}
//       />

//       <div className="border-border flex justify-end border-t pt-5">
//         <button
//           type="button"
//           onClick={handleTransfer}
//           disabled={!transferredWorkers.length || loading || transferring}
//           className="bg-primary hover:bg-primary-dark rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           {transferring ? "Transferring..." : "Transfer Selected Workers"}
//         </button>
//       </div>

//       {loading && (
//         <div className="text-text-secondary text-center text-sm">
//           Loading supervisors and workers...
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, transferWorkers } from "@/api/userApi";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import WorkerTransfer from "@/components/ucmo/team-management/WorkerTransfer";
import ClientPageHeader from "@/components/ui/ClientPageHeader";
import SupervisorSelection from "@/components/ucmo/team-management/SupervisorSelection";

export default function SupervisorManagementPage() {
  const [supervisors, setSupervisors] = useState([]);
  const [fromSupervisorWorkers, setFromSupervisorWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const router = useRouter();

  const [ucmoId, setUcmoId] = useState("");

  const [fromSupervisor, setFromSupervisor] = useState("");
  const [toSupervisor, setToSupervisor] = useState("");

  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [transferredWorkers, setTransferredWorkers] = useState([]);
  const [transferDetails, setTransferDetails] = useState({});

  // ============================================================
  // Get Current UCMO ID From Local Storage
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
  // Page Ready Animation
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
  // Transfer Detail Change
  // ============================================================

  const handleTransferDetailChange = (workerId, field, value) => {
    setTransferDetails((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        [field]: value,
      },
    }));
  };

  // ============================================================
  // Fetch Current UCMO Active Supervisors
  // ============================================================

  const fetchSupervisors = async (isRefresh = false) => {
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

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.users || [];

      setSupervisors(data);
    } catch (error) {
      console.error("Failed to fetch supervisors:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load supervisors.",
      );

      setSupervisors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // Fetch Active Workers Of Selected Supervisor
  // ============================================================

  const fetchWorkersForSupervisor = async (supervisorId) => {
    if (!supervisorId) {
      setFromSupervisorWorkers([]);
      return;
    }

    try {
      const response = await getUsers({
        page: 1,
        limit: 100,
        designation: "worker",
        supervisor: supervisorId,
        isActive: true,
      });

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.users || [];

      setFromSupervisorWorkers(data);
    } catch (error) {
      console.error("Failed to fetch workers for supervisor:", error);

      setFromSupervisorWorkers([]);

      toast.error(error?.response?.data?.message || "Failed to load workers.");
    }
  };

  // ============================================================
  // Initial Supervisors Fetch
  // ============================================================

  useEffect(() => {
    if (ucmoId) {
      fetchSupervisors();
    }
  }, [ucmoId]);

  // ============================================================
  // Worker ID
  // ============================================================

  const getWorkerId = (worker) => {
    return String(worker._id || worker.id);
  };

  // ============================================================
  // Supervisor Name
  // ============================================================

  const getSupervisorName = (id) => {
    const supervisor = supervisors.find(
      (item) => String(item._id || item.id) === String(id),
    );

    return supervisor?.name || "Supervisor";
  };

  // ============================================================
  // From Supervisor Change
  // ============================================================

  const handleFromSupervisorChange = async (value) => {
    setFromSupervisor(value);

    setSelectedWorkers([]);
    setTransferredWorkers([]);
    setTransferDetails({});
    setFromSupervisorWorkers([]);

    if (value === toSupervisor) {
      setToSupervisor("");
    }

    if (!value) {
      return;
    }

    try {
      setLoading(true);

      await fetchWorkersForSupervisor(value);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // To Supervisor Change
  // ============================================================

  const handleToSupervisorChange = (value) => {
    setToSupervisor(value);

    setTransferredWorkers([]);
    setTransferDetails({});
  };

  // ============================================================
  // Toggle Worker On Left Side
  // ============================================================

  const toggleWorker = (workerId) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId],
    );
  };

  // ============================================================
  // Toggle Worker On Right Side
  // ============================================================

  const toggleTransferredWorker = (workerId) => {
    setTransferredWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId],
    );
  };

  // ============================================================
  // Move Selected Workers From Left To Right
  // ============================================================

  const moveToRight = () => {
    if (!toSupervisor) {
      toast.error("Please select a To Supervisor first.");
      return;
    }

    if (!selectedWorkers.length) {
      toast.error("Please select at least one worker to transfer.");
      return;
    }

    setTransferredWorkers((prev) => [
      ...new Set([...prev, ...selectedWorkers]),
    ]);

    setSelectedWorkers([]);
  };

  // ============================================================
  // Move Workers Back To Left
  // ============================================================

  const moveToLeft = () => {
    if (!transferredWorkers.length) return;

    setTransferredWorkers([]);
  };

  // ============================================================
  // Selected Worker Objects
  // ============================================================

  const transferredWorkerObjects = useMemo(() => {
    return fromSupervisorWorkers.filter((worker) =>
      transferredWorkers.includes(getWorkerId(worker)),
    );
  }, [fromSupervisorWorkers, transferredWorkers]);

  // ============================================================
  // Transfer Workers
  // ============================================================

  const handleTransfer = async () => {
    if (!fromSupervisor) {
      toast.error("Please select a From Supervisor.");
      return;
    }

    if (!toSupervisor) {
      toast.error("Please select a To Supervisor.");
      return;
    }

    if (fromSupervisor === toSupervisor) {
      toast.error("From and To supervisor cannot be the same.");
      return;
    }

    if (!transferredWorkers.length) {
      toast.error("Please select at least one worker to transfer.");
      return;
    }

    const workers = transferredWorkerObjects.map((worker) => {
      const workerId = getWorkerId(worker);
      const details = transferDetails[workerId] || {};

      return {
        workerId,
        teamNumber: details.teamNumber ?? worker.teamNumber,
        workerRole: details.workerRole ?? worker.workerRole,
      };
    });

    const payload = {
      fromSupervisorId: fromSupervisor,
      toSupervisorId: toSupervisor,
      workers,
    };

    try {
      setTransferring(true);

      const response = await transferWorkers(payload);

      if (response?.success) {
        toast.success(response.message || "Workers transferred successfully.");

        setSelectedWorkers([]);
        setTransferredWorkers([]);
        setTransferDetails({});

        // Current From Supervisor ke workers
        // dobara DB se load karo.
        await fetchWorkersForSupervisor(fromSupervisor);

        return;
      }

      toast.error(response?.message || "Failed to transfer workers.");
    } catch (error) {
      // console.error("Worker transfer error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to transfer workers.",
      );
    } finally {
      setTransferring(false);
    }
  };

  // ============================================================
  // Refresh
  // ============================================================

  const handleRefresh = async () => {
    if (!ucmoId) return;

    try {
      setRefreshing(true);

      await fetchSupervisors(true);

      if (fromSupervisor) {
        await fetchWorkersForSupervisor(fromSupervisor);
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="m-auto max-w-7xl space-y-6">
      {/* ============================================================
        HEADER
    ============================================================ */}

      <header
        className={`border-border relative mb-4 flex items-center justify-between overflow-hidden border-b pb-5 transition-[opacity,translate,scale] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
            title="Supervisor Management"
            description="Transfer individual workers between supervisors."
            onBack={() => router.back()}
          />
        </div>

        {/* Refresh */}
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

      {/* ============================================================
        SUPERVISOR SELECTION
    ============================================================ */}

      <div
        className={`relative z-30 transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
        style={{
          transitionDelay: "120ms",
        }}
      >
        <SupervisorSelection
          supervisors={supervisors}
          fromSupervisor={fromSupervisor}
          toSupervisor={toSupervisor}
          onFromChange={handleFromSupervisorChange}
          onToChange={handleToSupervisorChange}
        />
      </div>

      {/* ============================================================
        WORKER TRANSFER
    ============================================================ */}

      <div
        className={`relative z-10 transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
        style={{
          transitionDelay: "220ms",
        }}
      >
        <WorkerTransfer
       
          fromSupervisorName={
            fromSupervisor
              ? getSupervisorName(fromSupervisor)
              : "From Supervisor"
          }
          toSupervisorName={
            toSupervisor ? getSupervisorName(toSupervisor) : "To Supervisor"
          }
          fromWorkers={fromSupervisorWorkers}
          toWorkers={transferredWorkerObjects}
          selectedWorkers={selectedWorkers}
          transferredWorkers={transferredWorkers}
          onToggleLeft={toggleWorker}
          onToggleRight={toggleTransferredWorker}
          onMoveRight={moveToRight}
          onMoveLeft={moveToLeft}
          transferDetails={transferDetails}
          onTransferDetailChange={handleTransferDetailChange}
        />
      </div>

      {/* ============================================================
        TRANSFER BUTTON
    ============================================================ */}

      <div
        className={`border-border flex transform justify-end border-t pt-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pageReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.98] opacity-0"
        }`}
        style={{
          transitionDelay: "320ms",
        }}
      >
        <button
          type="button"
          onClick={handleTransfer}
          disabled={!transferredWorkers.length || loading || transferring}
          className="bg-primary hover:bg-primary-dark rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {transferring ? "Transferring..." : "Transfer Selected Workers"}
        </button>
      </div>

      {loading && (
        <div className="text-text-secondary text-center text-sm">
          Loading supervisors and workers...
        </div>
      )}
    </div>
  );
}
