"use client";

import { useEffect, useMemo, useState } from "react";

import { getUsers } from "@/api/userApi";
import { toast } from "sonner";
import SupervisorSelection from "@/components/ucmo/supervisor-management/SupervisorSelection";
import WorkerTransfer from "@/components/ucmo/supervisor-management/WorkerTransfer";
import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SupervisorManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

    const payload = {
      fromSupervisorId: fromSupervisor,
      toSupervisorId: toSupervisor,
      workerIds: transferredWorkers,
    };

    console.log("Worker transfer payload:", payload);

    /*
    await transferWorkers(payload);
  */

    toast.success("Worker transfer API will be connected here.");

    setSelectedWorkers([]);
    setTransferredWorkers([]);
  };

  return (
    <div className="m-auto max-w-7xl space-y-6">
      <div className="flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="border-border bg-background text-text hover:bg-surface mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
          title="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <h1 className="text-text text-2xl font-semibold">
            Supervisor Management
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            Transfer individual workers between supervisors.
          </p>
        </div>
      </div>

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
        {/* <button
          type="button"
          onClick={handleTransfer}
          disabled={
            !fromSupervisor || !toSupervisor || !transferredWorkers.length
          }
          className="bg-primary hover:bg-primary-dark rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Transfer Selected Workers
        </button> */}
        <button
          type="button"
          onClick={handleTransfer}
          disabled={!transferredWorkers.length}
          className="bg-primary hover:bg-primary-dark rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Transfer Selected Workers
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
