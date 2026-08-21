"use client";

import { useEffect, useState } from "react";
import DistrictfpHeader from "@/components/districtfp/DistrictFPHeader";
import DistrictFPSidebar from "@/components/districtfp/DistrictFPSidebar";

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
        <DistrictfpHeader onMenuClick={handleMobileOpen} />

        <main className="bg-surface min-h-0 flex-1 overflow-y-auto">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";

// import Sidebar from "@/components/layout/Sidebar";
// import { districtfpSidebar } from "@/content/data";
// import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";

// export default function districtfpLayout({ children }) {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [user, setUser] = useState(null);

//   // ============================================================
//   // Logged-in District FP
//   // ============================================================

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     try {
//       const authUser = localStorage.getItem("authUser");

//       if (!authUser) return;

//       const parsedUser = JSON.parse(authUser);

//       setUser(parsedUser);
//     } catch (error) {
//       console.error("Invalid authUser:", error);
//     }
//   }, []);

//   // ============================================================
//   // District FP Data
//   // ============================================================

//   const districtCode =
//     user?.district?.code ||
//     user?.districtId?.code ||
//     "";

//   const districtName =
//     user?.district?.name ||
//     user?.districtId?.name ||
//     "";

//   return (
//     <div className="bg-surface flex min-h-screen">
//       {/* ========================================================
//           Sidebar
//       ======================================================== */}

//       <Sidebar
//         items={districtfpSidebar}
//         mobileOpen={mobileOpen}
//         setMobileOpen={setMobileOpen}
//       />

//       {/* ========================================================
//           Main
//       ======================================================== */}

//       <div className="flex min-w-0 flex-1 flex-col">
//         <main className="flex-1 bg-white p-4 sm:px-4 sm:py-5 md:px-10 md:py-6">
//           {/* ======================================================
//               District FP Header
//           ====================================================== */}

//           <PageHeaderWithDesignation
//             name={user?.name}
//             designation={user?.designation || "districtfp"}
//             onMenuClick={() => setMobileOpen(true)}
//             dashboardRoute="/districtfp"
//             districtCode={districtCode}
//             districtName={districtName}
//           />

//           {/* ======================================================
//               Page Content
//           ====================================================== */}

//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
