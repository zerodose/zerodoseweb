"use client";

import { useState } from "react";

import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";

export default function WorkerLayout({ children }) {
  // ============================================================
  // Logged-in Worker
  // ============================================================

  const [user] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const authUser = localStorage.getItem("authUser");

      if (!authUser) {
        return null;
      }

      return JSON.parse(authUser);
    } catch (error) {
      console.error("Invalid authUser:", error);
      return null;
    }
  });

  // ============================================================
  // Extract Worker Data
  // ============================================================

  const designation = user?.designation || "worker";

  const teamNumber = user?.teamNumber;

  const supervisorName =
    user?.supervisor?.name || user?.supervisorId?.name || "";

  return (
    <div className="min-h-full p-4 md:p-6 max-w-[480] mx-auto border rounded-3xl border-gray-300 dark:border-gray-700">
      {/* ========================================================
          Permanent Worker Header
      ======================================================== */}

      <PageHeaderWithDesignation
        name={user?.name}
        designation={designation}
        teamNumber={teamNumber}
        supervisorName={supervisorName}
      />

      {/* ========================================================
          Page Content
      ======================================================== */}

      {children}
    </div>
  );
}
