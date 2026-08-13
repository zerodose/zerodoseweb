"use client";

import { useState } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { supervisorSidebar } from "@/content/data";

export default function SupervisorLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-surface flex min-h-screen">
      {/* Mobile Sidebar */}

      <Sidebar
        items={supervisorSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="Supervisor Dashboard"
          dashboardRoute="/supervisor"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
