"use client";

import { useState } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ucmoSidebar } from "@/content/data";

export default function UCMOLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-surface flex min-h-screen">
      {/* Mobile Sidebar */}

      <Sidebar
        items={ucmoSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="UCMO Dashboard"
          dashboardRoute="/ucmo"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
