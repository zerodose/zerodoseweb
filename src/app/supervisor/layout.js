
"use client";

import { useState } from "react";

import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";
import Sidebar from "@/components/layout/Sidebar";
import { supervisorSidebar } from "@/content/data";

export default function SupervisorLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // ============================================================
  // Logged-in Supervisor
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
  // Supervisor Data
  // ============================================================

  const designation = user?.designation || "supervisor";

  const supervisorName = user?.name || "";

  const ucCode = user?.unionCouncil?.code || user?.unionCouncilId?.code || "";

  const ucName = user?.unionCouncil?.name || user?.unionCouncilId?.name || "";

  const ucmoName = user?.ucmo?.name || user?.ucmoId?.name || "";

  return (
    <div className="bg-background flex min-h-screen">
      {/* ======================================================
          Mobile Sidebar
      ====================================================== */}

      <Sidebar
        items={supervisorSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ======================================================
          Main
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="bg-background flex-1 p-4 sm:px-4 sm:py-5 md:px-10 md:py-6">
          {/* ==================================================
              Supervisor Header
          ================================================== */}

          <PageHeaderWithDesignation
            name={supervisorName}
            designation={designation}
            onMenuClick={() => setMobileOpen(true)}
            dashboardRoute="/supervisor"
            ucCode={ucCode}
            ucName={ucName}
            ucmoName={ucmoName}
          />

          {/* ==================================================
              Page Content
          ================================================== */}

          {children}
        </main>
      </div>
    </div>
  );
}
