"use client";

import { useState } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { supervisorSidebar } from "@/content/data";

export default function SupervisorLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Sidebar */}

      <Sidebar
        items={supervisorSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setMobileOpen(true)}
          title="Supervisor"
          dashboardRoute="/supervisor"
          profileRoute="/supervisor/profile"
          settingsRoute="/supervisor/settings"
        />

        <main className="flex-1 bg-white p-4 sm:px-4 sm:py-5 md:px-10 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
