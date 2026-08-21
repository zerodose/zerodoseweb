"use client";

import DistrictFPHeader from "@/components/districtfp/DistrictFPHeader";
import DistrictFPSidebar from "@/components/districtfp/DistrictFPSidebar";
import { useEffect, useState } from "react";

const SIDEBAR_STORAGE_KEY = "district-fp-sidebar-settings";

export default function DistrictFPLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [sidebar, setSidebar] = useState({
    collapsed: false,
    width: "256px",
  });

  // =====================================================
  // Load Sidebar Settings
  // =====================================================

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (typeof parsed === "object" && parsed !== null) {
        const collapsed = Boolean(parsed.collapsed);

        setSidebar({
          collapsed,
          width: collapsed ? "80px" : "256px",
        });
      }
    } catch (error) {
      console.error("Invalid sidebar storage:", error);

      localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    }
  }, []);

  // =====================================================
  // Save Sidebar Settings
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      JSON.stringify({
        collapsed: sidebar.collapsed,
      }),
    );
  }, [sidebar.collapsed]);

  // =====================================================
  // Desktop Sidebar Toggle
  // =====================================================

  const handleSidebarToggle = () => {
    setSidebar((prev) => {
      const collapsed = !prev.collapsed;

      return {
        collapsed,
        width: collapsed ? "80px" : "256px",
      };
    });
  };

  // =====================================================
  // Mobile Sidebar
  // =====================================================

  const handleMobileOpen = () => {
    setMobileOpen(true);
  };

  return (
    <div className="bg-surface flex h-screen w-full overflow-visible">
      {/* Desktop Sidebar */}

      <div
        className="relative z-50 hidden shrink-0 overflow-visible md:block"
        style={{
          width: sidebar.width,
          transition: "width 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <DistrictFPSidebar
          collapsed={sidebar.collapsed}
          onToggle={handleSidebarToggle}
          mobileOpen={false}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* Mobile Sidebar */}

      <div className="md:hidden">
        <DistrictFPSidebar
          collapsed={false}
          onToggle={() => {}}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* Main Area */}

      <div className="flex min-w-0 flex-1 flex-col">
        <DistrictFPHeader onMenuClick={handleMobileOpen} />

        <main className="bg-surface min-h-0 flex-1 overflow-y-auto">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}