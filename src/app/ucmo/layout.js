// "use client";

// import { useState } from "react";

// import Sidebar from "@/components/layout/Sidebar";
// import { ucmoSidebar } from "@/content/data";
// import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";

// export default function UCMOLayout({ children }) {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   return (
//     <div className="bg-surface flex min-h-screen">
//       {/* Mobile Sidebar */}

//       <Sidebar
//         items={ucmoSidebar}
//         mobileOpen={mobileOpen}
//         setMobileOpen={setMobileOpen}
//       />

//       {/* Main */}

//       <div className="flex min-w-0 flex-1 flex-col">
//         <PageHeaderWithDesignation
//           name={user?.name}
//           designation="ucmo"
//           onMenuClick={() => setMobileOpen(true)}
//           dashboardRoute="/ucmo"
//           ucCode={ucCode}
//           ucName={ucName}
//           townName={townName}
//         />

//         <main className="flex-1 bg-white p-4 sm:p-5 md:p-6">{children}</main>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import { ucmoSidebar } from "@/content/data";
import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";

export default function UCMOLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ============================================================
  // Logged-in UCMO
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
  // UCMO Data
  // ============================================================

  const ucCode = user?.unionCouncil?.code || user?.unionCouncilId?.code || "";

  const ucName = user?.unionCouncil?.name || user?.unionCouncilId?.name || "";

  const townName = user?.town?.name || user?.townId?.name || "";

  return (
    <div className="bg-surface flex min-h-screen">
      {/* ========================================================
          Sidebar
      ======================================================== */}

      <Sidebar
        items={ucmoSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ========================================================
          Main
      ======================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 bg-white p-4 sm:px-4 sm:py-5 md:px-10 md:py-6">
          {/* ======================================================
            UCMO Header
        ====================================================== */}

          <PageHeaderWithDesignation
            name={user?.name}
            designation={user?.designation || "ucmo"}
            onMenuClick={() => setMobileOpen(true)}
            dashboardRoute="/ucmo"
            ucCode={ucCode}
            ucName={ucName}
            townName={townName}
          />

          {/* ======================================================
            Page Content
            ====================================================== */}

          {children}
        </main>
      </div>
    </div>
  );
}
