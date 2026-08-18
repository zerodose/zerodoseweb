"use client";

import { useEffect, useMemo, useState } from "react";

import { getUsers, transferWorkers } from "@/api/userApi";
import { toast } from "sonner";
import WorkerTransfer from "@/components/ucmo/supervisor-management/WorkerTransfer";
import { useRouter } from "next/navigation";
import ClientPageHeader from "@/components/ui/ClientPageHeader";
import SupervisorSelection from "@/components/ucmo/supervisor-management/SupervisorSelection";

export default function SupervisorManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const router = useRouter();
  const [fromSupervisor, setFromSupervisor] = useState("");
  const [toSupervisor, setToSupervisor] = useState("");

  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [transferredWorkers, setTransferredWorkers] = useState([]);
  const [transferDetails, setTransferDetails] = useState({});

  const handleTransferDetailChange = (workerId, field, value) => {
    setTransferDetails((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await getUsers();

        const data = Array.isArray(response)
          ? response
          : response?.users || response?.data || [];

        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const supervisors = useMemo(() => {
    return users.filter(
      (user) => user.designation === "supervisor" && user.isActive !== false,
    );
  }, [users]);

  const workers = useMemo(() => {
    return users.filter(
      (user) => user.designation === "worker" && user.isActive !== false,
    );
  }, [users]);

  const fromSupervisorWorkers = useMemo(() => {
    if (!fromSupervisor) return [];

    return workers.filter(
      (worker) =>
        String(worker.supervisorId || worker.supervisor?._id) ===
        String(fromSupervisor),
    );
  }, [workers, fromSupervisor]);

  const getWorkerId = (worker) => {
    return String(worker._id || worker.id);
  };

  const getSupervisorName = (id) => {
    const supervisor = supervisors.find(
      (item) => String(item._id || item.id) === String(id),
    );

    return supervisor?.name || "Supervisor";
  };

  const handleFromSupervisorChange = (value) => {
    setFromSupervisor(value);

    setSelectedWorkers([]);
    setTransferredWorkers([]);

    if (value === toSupervisor) {
      setToSupervisor("");
    }
  };

  const handleToSupervisorChange = (value) => {
    setToSupervisor(value);
    setTransferredWorkers([]);
  };

  const toggleWorker = (workerId) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId],
    );
  };

  const toggleTransferredWorker = (workerId) => {
    setTransferredWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId],
    );
  };

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

  const moveToLeft = () => {
    if (!transferredWorkers.length) return;

    setTransferredWorkers([]);
  };

  const transferredWorkerObjects = useMemo(() => {
    return fromSupervisorWorkers.filter((worker) =>
      transferredWorkers.includes(getWorkerId(worker)),
    );
  }, [fromSupervisorWorkers, transferredWorkers]);

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
    // console.log("Worker transfer payload:", payload);

    /*
    await transferWorkers(payload);
  */

    try {
      setTransferring(true);
      const response = await transferWorkers(payload);

      if (response?.success) {
        toast.success(response.message || "Workers transferred successfully.");

        setSelectedWorkers([]);
        setTransferredWorkers([]);
        setTransferDetails({});

        // Latest workers/supervisors dobara load karne ke liye
        const usersResponse = await getUsers();

        const data = Array.isArray(usersResponse)
          ? usersResponse
          : usersResponse?.users || usersResponse?.data || [];

        setUsers(data);

        return;
      }
      toast.error(response?.message || "Failed to transfer workers.");
    } catch (error) {
      console.error("Worker transfer error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to transfer workers.",
      );
    } finally {
      setTransferring(false);
    }
  };
  // setSelectedWorkers([]);
  // setTransferredWorkers([]);

  return (
    <div className="m-auto max-w-7xl space-y-6">
      <ClientPageHeader
        title="Supervisor Management"
        description="Transfer individual workers between supervisors."
        onBack={() => router.back()}
      />

      <SupervisorSelection
        supervisors={supervisors}
        fromSupervisor={fromSupervisor}
        toSupervisor={toSupervisor}
        onFromChange={handleFromSupervisorChange}
        onToChange={handleToSupervisorChange}
      />

      <WorkerTransfer
        fromSupervisorName={
          fromSupervisor ? getSupervisorName(fromSupervisor) : "From Supervisor"
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

      <div className="border-border flex justify-end border-t pt-5">
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
