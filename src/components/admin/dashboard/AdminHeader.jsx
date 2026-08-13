"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";

export default function AdminHeader({ onMenuClick }) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);

  // ============================================================
  // User
  // ============================================================

  const [user, setUser] = useState({
    name: "User",
    designation: "",
    email: "",
    image: "",
  });

  const profileRef = useRef(null);

  // ============================================================
  // Get Logged-in User
  // ============================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser({
          name: parsedUser?.name || "User",
          designation: parsedUser?.designation || "",
          email: parsedUser?.email || "",
          image: parsedUser?.image || "",
        });
      } catch (error) {
        console.error("Failed to parse authUser:", error);
      }
    }
  }, []);

  // ============================================================
  // Outside Click
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================================
  // Avatar
  // ============================================================

  const getAvatar = () => {
    if (user?.image) {
      return (
        <img
          src={user.image}
          alt={user.name}
          className="h-full w-full object-cover"
        />
      );
    }

    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }

    return "A";
  };

  // ============================================================
  // Navigation
  // ============================================================

  const goTo = (route) => {
    setProfileOpen(false);
    router.push(route);
  };

  // ============================================================
  // Logout
  // ============================================================

  const handleLogout = () => {
    setProfileOpen(false);
    localStorage.removeItem("authUser");
    // router.push("/auth/login");
    router.push("/");
  };

  return (
    <header className="border-border bg-background relative z-30 flex h-16 shrink-0 items-center justify-between border-b px-3 sm:px-5 md:px-6">
      {/* ======================================================
          Left Side
      ====================================================== */}

      <div className="flex min-w-0 items-center gap-2">
        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="text-text hover:bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition active:scale-95 md:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}

        <h1
          onClick={() => router.push("/dashboard")}
          className="text-text cursor-pointer truncate text-base font-semibold sm:text-lg"
        >
          Zerodose Dashboard
        </h1>
      </div>

      {/* ======================================================
          Right Side - Profile
      ====================================================== */}

      <div ref={profileRef} className="relative ml-auto">
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          aria-label="Open profile menu"
          className="hover:bg-surface flex items-center gap-2 rounded-xl p-1 transition"
        >
          {/* Avatar */}

          <div className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold">
            {getAvatar()}
          </div>

          {/* Desktop User Info */}

          <div className="hidden text-left lg:block">
            <p className="text-text max-w-32 truncate text-sm font-semibold">
              {user.name}
            </p>

            <p className="text-text-secondary uppercase max-w-32 truncate text-xs capitalize">
              {user.designation}
            </p>
          </div>

          {/* Desktop Arrow */}

          <ChevronDown
            size={16}
            className={`text-text-secondary hidden transition-transform lg:block ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ====================================================
            Profile Dropdown
        ==================================================== */}

        {profileOpen && (
          <div className="border-border bg-background absolute top-12 right-0 z-50 w-64 overflow-hidden rounded-xl border p-2 shadow-xl">
            {/* User Information */}

            <div className="border-border mb-2 flex items-center gap-3 border-b px-2 pb-3">
              {/* Avatar */}

              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold">
                {getAvatar()}
              </div>

              {/* Name + Designation */}

              <div className="min-w-0">
                <p className="text-text truncate text-sm font-semibold">
                  {user.name}
                </p>

                <p className="text-text-secondary truncate text-xs capitalize">
                  {user.designation}
                </p>
              </div>
            </div>

            {/* Menu */}

            <div className="space-y-1">
              {/* Profile */}

              <button
                type="button"
                onClick={() => goTo("/dashboard/profile")}
                className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
              >
                <User size={17} />

                <span>Profile</span>
              </button>

              {/* Settings */}

              <button
                type="button"
                onClick={() => goTo("/dashboard/settings")}
                className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
              >
                <Settings size={17} />

                <span>Settings</span>
              </button>

              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={17} />

                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
