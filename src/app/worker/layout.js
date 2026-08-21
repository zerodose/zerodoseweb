"use client";

import { useEffect, useState } from "react";
import WorkerPageHeader from "@/components/worker/WorkerPageHeader";

export default function WorkerLayout({ children }) {
  const [worker, setWorker] = useState(null);

  // ============================================================
  // Logged-in Worker
  // ============================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const authUser = localStorage.getItem("authUser");

      if (!authUser) return;

      const user = JSON.parse(authUser);

      setWorker(user);
    } catch (error) {
      console.error("Invalid authUser:", error);
    }
  }, []);

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* ========================================================
          Permanent Worker Header
      ======================================================== */}

      <WorkerPageHeader
        name={worker?.name}
        teamNumber={worker?.teamNumber}
        supervisorName={worker?.supervisorId?.name}
        supervisorCode={worker?.supervisorId?.supervisorCode}
      />

      {/* ========================================================
          Page Content
      ======================================================== */}

      {children}
    </div>
  );
}