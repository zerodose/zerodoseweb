"use client";

import { useEffect, useState } from "react";
import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";

export default function VaccinatorLayout({ children }) {
  const [user, setUser] = useState(null);

  // ============================================================
  // Logged-in Vaccinator
  // ============================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const authUser = localStorage.getItem("authUser");

      if (!authUser) return;

      const parsedUser = JSON.parse(authUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("Invalid authUser:", error);
    }
  }, []);

  // ============================================================
  // Extract Vaccinator Data
  // ============================================================

  const designation = user?.designation || "vaccinator";

  const ucCode = user?.unionCouncil?.code || user?.unionCouncilId?.code || "";

  const ucName = user?.unionCouncil?.name || user?.unionCouncilId?.name || "";

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* ========================================================
          Permanent Vaccinator Header
      ======================================================== */}

      <PageHeaderWithDesignation
        name={user?.name}
        designation={designation}
        ucCode={ucCode}
        ucName={ucName}
      />

      {/* ========================================================
          Page Content
      ======================================================== */}

      {children}
    </div>
  );
}
