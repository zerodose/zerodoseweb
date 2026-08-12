// "use client";

// import { useEffect, useState } from "react";

// import AdminSidebar from "./AdminSidebar";
// import AdminHeader from "./AdminHeader";

// const SIDEBAR_STORAGE_KEY = "admin-sidebar-settings";

// const SIDEBAR_WIDTH = {
//   expanded: "256px",
//   collapsed: "80px",
// };

// export default function AdminLayout({ children }) {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   // ============================================================
//   // Load Sidebar Preference
//   // ============================================================

//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);

//       if (!saved) return;

//       const parsed = JSON.parse(saved);

//       if (typeof parsed?.collapsed === "boolean") {
//         setSidebarCollapsed(parsed.collapsed);
//       }
//     } catch (error) {
//       console.error("Failed to load sidebar settings:", error);

//       localStorage.removeItem(SIDEBAR_STORAGE_KEY);
//     }
//   }, []);

//   // ============================================================
//   // Save Sidebar Preference
//   // ============================================================

//   useEffect(() => {
//     try {
//       localStorage.setItem(
//         SIDEBAR_STORAGE_KEY,
//         JSON.stringify({
//           collapsed: sidebarCollapsed,
//         }),
//       );
//     } catch (error) {
//       console.error("Failed to save sidebar settings:", error);
//     }
//   }, [sidebarCollapsed]);

//   // ============================================================
//   // Desktop Sidebar Toggle
//   // ============================================================

//   const handleSidebarToggle = () => {
//     setSidebarCollapsed((prev) => !prev);
//   };

//   // ============================================================
//   // Mobile Sidebar
//   // ============================================================

//   const openMobileSidebar = () => {
//     setMobileOpen(true);
//   };

//   const closeMobileSidebar = () => {
//     setMobileOpen(false);
//   };

//   // ============================================================
//   // ESC Key
//   // ============================================================

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === "Escape") {
//         setMobileOpen(false);
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   // ============================================================
//   // Lock Body Scroll on Mobile
//   // ============================================================

//   useEffect(() => {
//     if (mobileOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [mobileOpen]);

//   return (
//     <div className="flex h-screen overflow-hidden bg-surface">
//       {/* ========================================================
//           DESKTOP SIDEBAR
//       ======================================================== */}

//       <aside
//         className="hidden shrink-0 overflow-hidden border-r border-border bg-background transition-[width] duration-300 ease-in-out md:block"
//         style={{
//           width: sidebarCollapsed
//             ? SIDEBAR_WIDTH.collapsed
//             : SIDEBAR_WIDTH.expanded,
//         }}
//       >
//         <AdminSidebar
//           collapsed={sidebarCollapsed}
//           onToggle={handleSidebarToggle}
//           mobileOpen={false}
//           setMobileOpen={closeMobileSidebar}
//         />
//       </aside>

//       {/* ========================================================
//           MOBILE SIDEBAR
//       ======================================================== */}

//       <AdminSidebar
//         collapsed={false}
//         onToggle={() => {}}
//         mobileOpen={mobileOpen}
//         setMobileOpen={setMobileOpen}
//       />

//       {/* ========================================================
//           MAIN AREA
//       ======================================================== */}

//       <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
//         {/* Header */}

//         <AdminHeader onMenuClick={openMobileSidebar} />

//         {/* Content */}

//         <main className="flex-1 overflow-y-auto bg-surface p-4 sm:p-5 md:p-6 lg:p-8">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

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

  const handleMobileClose = () => {
    setMobileOpen(false);
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
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
