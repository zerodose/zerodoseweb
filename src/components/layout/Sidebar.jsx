"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Sidebar({ items = [], mobileOpen, setMobileOpen }) {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState({});

  // ============================================================
  // Automatically open active parent
  // ============================================================

  useEffect(() => {
    items.forEach((item) => {
      if (!item.children?.length) return;

      const activeChild = item.children.some(
        (child) => pathname === child.href,
      );

      if (activeChild) {
        setOpenMenus((prev) => ({
          ...prev,
          [item.title]: true,
        }));
      }
    });
  }, [pathname, items]);

  // ============================================================
  // Close on Desktop
  // ============================================================

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

  // ============================================================
  // Toggle Menu
  // ============================================================

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // ============================================================
  // Active Route
  // ============================================================

  const isActive = (href) => {
    if (!href) return false;

    // Sirf exact current pathname active hoga
    return pathname === href;
  };

  return (
    <>
      {/* ======================================================
          Mobile Overlay
      ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* ======================================================
          Sidebar
      ====================================================== */}

      <aside
        className={`border-border bg-background fixed inset-y-0 left-0 z-50 flex h-screen w-[256px] flex-col overflow-hidden border-r shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ====================================================
            Header
        ==================================================== */}

        <div className="border-border relative flex h-16 shrink-0 items-center border-b px-4">
          {/* Logo */}

          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Zerodose Logo"
              width={35}
              height={35}
              className="h-auto w-[35px]"
              priority
            />

            <div>
              <p className="text-text text-base font-bold">Zerodose</p>

              <p className="text-text-secondary text-[11px]">
                Management System
              </p>
            </div>
          </div>

          {/* Close */}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="text-text-secondary hover:bg-surface hover:text-text absolute right-3 flex h-9 w-9 items-center justify-center rounded-lg transition"
          >
            <X size={21} />
          </button>
        </div>

        {/* ====================================================
            Navigation
        ==================================================== */}

        <nav className="scrollbar-hide flex-1 overflow-y-auto p-3">
          <div className="space-y-1.5">
            {items.map((item) => {
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
                    <>
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.title)}
                        className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 transition ${
                          parentActive
                            ? "bg-primary text-primary-foreground"
                            : "text-text hover:bg-surface"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {Icon && <Icon size={20} className="shrink-0" />}

                          <span className="truncate text-sm font-medium">
                            {item.title}
                          </span>
                        </div>

                        <ChevronDown
                          size={17}
                          className={`shrink-0 transition-transform duration-300 ${
                            openMenus[item.title] ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Children */}

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openMenus[item.title]
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
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-text hover:bg-surface"
                      }`}
                    >
                      {Icon && <Icon size={20} className="shrink-0" />}

                      <span className="truncate text-sm font-medium">
                        {item.title}
                      </span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* ====================================================
            Footer
        ==================================================== */}

        <div className="border-border shrink-0 border-t p-3">
          <div className="bg-surface rounded-lg px-3 py-2.5">
            <p className="text-text-secondary truncate text-xs font-medium">
              Zerodose
            </p>

            <p className="text-text-secondary truncate text-[11px]">
              Management System
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
