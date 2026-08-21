// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   X,
//   ChevronDown,
//   ChevronLeft,

// } from "lucide-react";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { districtfpSidebar } from "@/content/data";

// export default function districtfpSidebar({
//   collapsed,
//   onToggle,
//   mobileOpen,
//   setMobileOpen,
// }) {
//   const pathname = usePathname();

//   const [openMenus, setOpenMenus] = useState({});

//   // ============================================================
//   // Automatically open active parent
//   // ============================================================

//   useEffect(() => {
//     districtfpSidebar.forEach((item) => {
//       if (!item.children?.length) return;

//       const activeChild = item.children.some((child) =>
//         pathname.startsWith(child.href),
//       );

//       if (activeChild) {
//         setOpenMenus((prev) => ({
//           ...prev,
//           [item.title]: true,
//         }));
//       }
//     });
//   }, [pathname]);

//   // ============================================================
//   // Close mobile sidebar when screen becomes desktop
//   // ============================================================

//   useEffect(() => {
//     if (!mobileOpen) return;

//     const handleResize = () => {
//       if (window.innerWidth >= 768) {
//         setMobileOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, [mobileOpen, setMobileOpen]);

//   // ============================================================
//   // Toggle Parent Menu
//   // ============================================================

//   const toggleMenu = (title) => {
//     setOpenMenus((prev) => ({
//       ...prev,
//       [title]: !prev[title],
//     }));
//   };

//   // ============================================================
//   // Active Route
//   // ============================================================

//   const isActive = (href) => {
//     if (!href) return false;

//     if (href === "/districtfp") {
//       return pathname === "/districtfp";
//     }

//     return pathname.startsWith(href);
//   };

//   return (
//     <>
//       {/* ========================================================
//           Mobile Overlay
//       ======================================================== */}

//       {mobileOpen && (
//         <button
//           type="button"
//           aria-label="Close menu"
//           onClick={() => setMobileOpen(false)}
//           className="fixed inset-0 z-[999] cursor-default bg-black/40 backdrop-blur-[2px] md:hidden"
//         />
//       )}

//       {/* ========================================================
//           Sidebar
//       ======================================================== */}

//       <aside
//         className={`border-border bg-background fixed inset-y-0 left-0 z-50 flex h-screen w-[256px] flex-col border-r shadow-xl transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:w-full md:translate-x-0 md:border-r-0 md:shadow-none ${
//           mobileOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         {/* ======================================================
//             Sidebar Header
//         ====================================================== */}

//         <div className="border-border relative flex h-16 shrink-0 items-center border-b px-4">
//           {/* Logo / Brand */}

//           <div
//             className={`flex min-w-0 items-center gap-3 transition-all duration-300 ${
//               collapsed ? "md:w-10" : "md:w-auto"
//             }`}
//           >
//             {/* Logo */}

//             <div className="text-primary-foreground flex shrink-0 items-center justify-center rounded-lg text-sm font-bold">
//               <Image
//                 src="/images/logo.png"
//                 alt="Zerodose Logo"
//                 width={35}
//                 height={35}
//                 className="h-auto w-[35px]"
//                 priority
//               />
//             </div>

//             {/* Brand */}

//             <div
//               className={`overflow-visible whitespace-nowrap transition-all duration-300 ${
//                 collapsed ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"
//               }`}
//             >
//               <p className="text-text text-base font-bold">Zerodose</p>

//               <p className="text-text-secondary text-[11px]">
//                 District FP Panel
//               </p>
//             </div>
//           </div>

//           {/* ====================================================
//               Desktop Toggle
//           ==================================================== */}

//           <button
//             type="button"
//             onClick={onToggle}
//             aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//             className="text-text-secondary hover:bg-surface hover:text-text border-border bg-background absolute top-15 -right-4.5 z-50 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-all duration-300 ease-in-out md:flex"
//           >
//             <ChevronLeft
//               size={20}
//               className={`transition-transform duration-300 ease-in-out ${
//                 collapsed ? "rotate-180" : "rotate-0"
//               }`}
//             />
//           </button>

//           {/* ====================================================
//               Mobile Close
//           ==================================================== */}

//           <button
//             type="button"
//             onClick={() => setMobileOpen(false)}
//             aria-label="Close menu"
//             className="text-text-secondary hover:bg-surface hover:text-text absolute right-3 flex h-9 w-9 items-center justify-center rounded-lg transition md:hidden"
//           >
//             <X size={21} />
//           </button>
//         </div>

//         {/* ======================================================
//             Navigation
//         ====================================================== */}

//         <nav className="scrollbar-hide flex-1 overflow-y-auto p-3">
//           <div className="space-y-1.5">
//             {districtfpSidebar.map((item) => {
//               const Icon = item.icon;

//               const hasChildren = item.children?.length > 0;

//               const active = isActive(item.href);

//               const childActive = item.children?.some((child) =>
//                 pathname.startsWith(child.href),
//               );

//               const parentActive = active || childActive;

//               return (
//                 <div key={item.title}>
//                   {/* ==================================================
//                       Parent With Children
//                   ================================================== */}

//                   {hasChildren ? (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         if (collapsed) {
//                           onToggle();
//                           return;
//                         }

//                         toggleMenu(item.title);
//                       }}
//                       title={collapsed ? item.title : undefined}
//                       className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 transition ${
//                         parentActive
//                           ? "bg-primary text-primary-foreground"
//                           : "text-text hover:bg-surface"
//                       }`}
//                     >
//                       <div className="flex min-w-0 items-center gap-3">
//                         {Icon && <Icon size={20} className="shrink-0" />}

//                         <span
//                           className={`truncate text-sm font-medium whitespace-nowrap transition-all duration-300 ${
//                             collapsed ? "md:hidden" : ""
//                           }`}
//                         >
//                           {item.title}
//                         </span>
//                       </div>

//                       {!collapsed && (
//                         <ChevronDown
//                           size={17}
//                           className={`shrink-0 transition-transform duration-300 ${
//                             openMenus[item.title] ? "rotate-180" : ""
//                           }`}
//                         />
//                       )}
//                     </button>
//                   ) : (
//                     /* ==================================================
//                        Normal Link
//                     ================================================== */

//                     <Link
//                       href={item.href}
//                       title={collapsed ? item.title : undefined}
//                       onClick={() => setMobileOpen(false)}
//                       className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 transition ${
//                         active
//                           ? "bg-primary text-primary-foreground"
//                           : "text-text hover:bg-surface"
//                       }`}
//                     >
//                       {Icon && <Icon size={20} className="shrink-0" />}

//                       <span
//                         className={`truncate text-sm font-medium whitespace-nowrap transition-all duration-300 ${
//                           collapsed ? "md:hidden" : ""
//                         }`}
//                       >
//                         {item.title}
//                       </span>
//                     </Link>
//                   )}

//                   {/* ==================================================
//                       Children
//                   ================================================== */}

//                   {hasChildren && (
//                     <div
//                       className={`overflow-visible transition-all duration-300 ease-in-out ${
//                         openMenus[item.title] && !collapsed
//                           ? "max-h-96 opacity-100"
//                           : "max-h-0 opacity-0"
//                       }`}
//                     >
//                       <div className="border-border mt-1 ml-5 space-y-1 border-l pl-3">
//                         {item.children.map((child) => {
//                           const ChildIcon = child.icon;

//                           const childIsActive = isActive(child.href);

//                           return (
//                             <Link
//                               key={child.href}
//                               href={child.href}
//                               onClick={() => setMobileOpen(false)}
//                               className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
//                                 childIsActive
//                                   ? "bg-primary-light text-primary font-medium"
//                                   : "text-text-secondary hover:bg-surface hover:text-text"
//                               }`}
//                             >
//                               {ChildIcon && (
//                                 <ChildIcon size={16} className="shrink-0" />
//                               )}

//                               <span className="truncate">{child.title}</span>
//                             </Link>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </nav>

//         {/* ======================================================
//             Sidebar Footer
//         ====================================================== */}

//         <div className="border-border shrink-0 border-t p-3">
//           <div
//             className={`bg-surface rounded-lg px-3 py-2.5 transition-all ${
//               collapsed ? "md:px-2" : ""
//             }`}
//           >
//             <p
//               className={`text-text-secondary truncate text-xs font-medium ${
//                 collapsed ? "md:hidden" : ""
//               }`}
//             >
//               Zerodose
//             </p>

//             <p
//               className={`text-text-secondary truncate text-[11px] ${
//                 collapsed ? "md:hidden" : ""
//               }`}
//             >
//               District Focal Person
//             </p>

//             {collapsed && (
//               <div className="text-text hidden text-center text-xs font-semibold md:block">
//                 D
//               </div>
//             )}
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { districtSidebarData } from "@/content/data";
import Image from "next/image";
import { getPendingApprovalCount } from "@/api/userApprovalsApi";

export default function DistrictFPSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  setMobileOpen,
}) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  // Automatically open active parent
  useEffect(() => {
    districtSidebarData.forEach((item) => {
      if (!item.children?.length) return;

      const activeChild = item.children.some((child) =>
        pathname.startsWith(child.href),
      );

      if (activeChild) {
        setOpenMenus((prev) => ({
          ...prev,
          [item.title]: true,
        }));
      }
    });
  }, [pathname]);

  useEffect(() => {
    const loadPendingApprovalCount = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");

        const userId = authUser?.id || authUser?._id;

        if (!userId) {
          setPendingApprovalCount(0);
          return;
        }

        const response = await getPendingApprovalCount({
          userId,
          designation: "districtfp",
        });

        setPendingApprovalCount(response?.count || 0);
      } catch (error) {
        console.error("Get pending approval count error:", error);

        setPendingApprovalCount(0);
      }
    };

    loadPendingApprovalCount();
  }, [pathname]);

  // Close mobile sidebar when screen becomes desktop
  useEffect(() => {
    if (!mobileOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileOpen, setMobileOpen]);

  // Toggle parent menu
  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Check active route
  const isActive = (href) => {
    if (!href) return false;

    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`border-border bg-background fixed inset-y-0 left-0 z-50 flex h-screen w-[256px] flex-col border-r shadow-xl transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:w-full md:translate-x-0 md:border-r-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-border relative flex h-16 shrink-0 items-center border-b px-4">
          {/* Logo / Brand */}
          <div
            className={`flex min-w-0 items-center gap-3 transition-all duration-300 ${
              collapsed ? "md:w-10" : "md:w-auto"
            }`}
          >
            {/* Logo */}
            <div className="text-primary-foreground flex shrink-0 items-center justify-center rounded-lg text-sm font-bold">
              <Image
                src="/images/logo.png"
                alt="Zerodose Logo"
                width={35}
                height={35}
                className="h-auto w-[35px]"
                priority
              />
            </div>

            {/* Brand */}
            <div
              className={`overflow-visible whitespace-nowrap transition-all duration-300 ${
                collapsed ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"
              }`}
            >
              <p className="text-text text-base font-bold">Zerodose</p>
              <p className="text-text-secondary text-[11px]">Admin Panel</p>
            </div>
          </div>

          {/* Desktop Toggle */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-text-secondary hover:bg-surface hover:text-text border-border bg-background absolute top-15 -right-4.5 z-50 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-all duration-300 ease-in-out md:flex"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform duration-300 ease-in-out ${
                collapsed ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="text-text-secondary hover:bg-surface hover:text-text absolute right-3 flex h-9 w-9 items-center justify-center rounded-lg transition md:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-hide flex-1 overflow-y-auto p-3">
          <div className="space-y-1.5">
            {districtSidebarData.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children?.length > 0;
              const active = isActive(item.href);

              const childActive = item.children?.some((child) =>
                pathname.startsWith(child.href),
              );

              const parentActive = active || childActive;

              return (
                <div key={item.title}>
                  {/* Parent with children */}
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (collapsed) {
                          onToggle();
                          return;
                        }

                        toggleMenu(item.title);
                      }}
                      title={collapsed ? item.title : undefined}
                      className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 transition ${
                        parentActive
                          ? "bg-primary text-primary-foreground"
                          : "text-text hover:bg-surface"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {Icon && <Icon size={20} className="shrink-0" />}

                        <span
                          className={`truncate text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                            collapsed ? "md:hidden" : ""
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      {!collapsed && (
                        <ChevronDown
                          size={17}
                          className={`shrink-0 transition-transform duration-300 ${
                            openMenus[item.title] ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>
                  ) : (
                    /* Normal link */
                    <Link
                      href={item.href}
                      title={collapsed ? item.title : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-text hover:bg-surface"
                      }`}
                    >
                      {Icon && <Icon size={20} className="shrink-0" />}

                      <span
                        className={`truncate text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                          collapsed ? "md:hidden" : ""
                        }`}
                      >
                        {item.title}
                      </span>

                      {item.title === "Pending Approvals" &&
                        !collapsed &&
                        pendingApprovalCount > 0 && (
                          <span
                            className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-lg px-1.5 text-[10px] font-bold ${
                              active
                                ? "bg-surface text-primary"
                                : "bg-primary text-white"
                            }`}
                          >
                            {pendingApprovalCount}
                          </span>
                        )}
                    </Link>
                  )}

                  {/* Children */}
                  {hasChildren && (
                    <div
                      className={`overflow-visible transition-all duration-300 ease-in-out ${
                        openMenus[item.title] && !collapsed
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="border-border mt-1 ml-5 space-y-1 border-l pl-3">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childIsActive = isActive(child.href);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                                childIsActive
                                  ? "bg-primary-light text-primary font-medium"
                                  : "text-text-secondary hover:bg-surface hover:text-text"
                              }`}
                            >
                              {ChildIcon && (
                                <ChildIcon size={16} className="shrink-0" />
                              )}

                              <span className="truncate">{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-border shrink-0 border-t p-3 pb-20 md:pb-3">
          <div
            className={`bg-surface rounded-lg px-3 py-2.5 transition-all ${
              collapsed ? "md:px-2" : ""
            }`}
          >
            <p
              className={`text-text-secondary truncate text-xs font-medium ${
                collapsed ? "md:hidden" : ""
              }`}
            >
              Zerodose
            </p>

            <p
              className={`text-text-secondary truncate text-[11px] ${
                collapsed ? "md:hidden" : ""
              }`}
            >
              Administration Panel
            </p>

            {collapsed && (
              <div className="text-text hidden text-center text-xs font-semibold md:block">
                Z
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
