"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-settings";

export default function AdminLayout({ children }) {
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
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      {/* =================================================
          Desktop Sidebar
      ================================================= */}

      <div
        className="hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out md:block"
        style={{
          width: sidebar.width,
        }}
      >
        <AdminSidebar
          collapsed={sidebar.collapsed}
          onToggle={handleSidebarToggle}
          mobileOpen={false}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* =================================================
          Mobile Sidebar
      ================================================= */}

      <div className="md:hidden">
        <AdminSidebar
          collapsed={false}
          onToggle={() => {}}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* =================================================
          Main Area
      ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}

        <AdminHeader onMenuClick={handleMobileOpen} />

        {/* Page Content */}

        <main className="min-h-0 flex-1 overflow-y-auto bg-surface">
          <div className="p-4 ">{children}</div>
        </main>
      </div>
    </div>
  );
}
