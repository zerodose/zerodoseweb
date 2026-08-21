// "use client";

// import { useState } from "react";

// import Header from "@/components/layout/Header";
// import Sidebar from "@/components/layout/Sidebar";
// import { supervisorSidebar } from "@/content/data";

// export default function SupervisorLayout({ children }) {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   return (
//     <div className="flex min-h-screen bg-white">
//       {/* Mobile Sidebar */}

//       <Sidebar
//         items={supervisorSidebar}
//         mobileOpen={mobileOpen}
//         setMobileOpen={setMobileOpen}
//       />

//       {/* Main */}

//       <div className="flex min-w-0 flex-1 flex-col">
//         <Header
//           onMenuClick={() => setMobileOpen(true)}
//           title="Supervisor"
//           dashboardRoute="/supervisor"
//           profileRoute="/supervisor/profile"
//           settingsRoute="/supervisor/settings"
//         />

//         <main className="flex-1 bg-white p-4 sm:px-4 sm:py-5 md:px-10 md:py-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";

import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";
import Sidebar from "@/components/layout/Sidebar";
import { supervisorSidebar } from "@/content/data";

export default function SupervisorLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ============================================================
  // Logged-in Supervisor
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
  // Supervisor Data
  // ============================================================

  const designation = user?.designation || "supervisor";

  const supervisorName = user?.name || "";

  const ucCode = user?.unionCouncil?.code || user?.unionCouncilId?.code || "";

  const ucName = user?.unionCouncil?.name || user?.unionCouncilId?.name || "";

  const ucmoName = user?.ucmo?.name || user?.ucmoId?.name || "";

  return (
    <div className="flex min-h-screen bg-white">
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
        <main className="flex-1 bg-white p-4 sm:px-4 sm:py-5 md:px-10 md:py-6">
          {/* ==================================================
              Supervisor Header
          ================================================== */}

          <PageHeaderWithDesignation
            name={supervisorName}
            designation="supervisor"
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
