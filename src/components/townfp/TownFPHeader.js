"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Menu, User, Settings, ChevronDown } from "lucide-react";
import LogoutButton from "../ui/LogoutButton";
import { logoutUser } from "@/api/authApi";

export default function TownFPHeader({ onMenuClick }) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState({
    name: "User",
    designation: "",
    email: "",
    image: "",
    district: null,
    town: null,
  });

  const profileRef = useRef(null);

  // ============================================================
  // Get Logged-in User
  // ============================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser({
        name: parsedUser?.name || "User",
        designation: parsedUser?.designation || "",
        email: parsedUser?.email || "",
        image: parsedUser?.image || "",
        district: parsedUser?.district || null,
        town: parsedUser?.town || null,
      });
    } catch (error) {
      console.error("Failed to parse authUser:", error);
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
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }

    return "U";
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

  // ============================================================
  // Location Label
  // ============================================================

  const getTownName = () => {
    if (!user.town) return "-";

    if (typeof user.town === "object") {
      return user.town?.name || user.town?.label || "-";
    }

    return user.town;
  };

  return (
    <header className="border-border bg-background relative z-10 flex h-16 shrink-0 items-center justify-between border-b px-3 sm:px-5 md:px-6">
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
          onClick={() => router.push("/townfp")}
          className="text-text cursor-pointer truncate text-base font-semibold sm:text-lg"
        >
          Zerodose Town Dashboard
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
            <p className="text-text max-w-32 truncate text-sm font-semibold uppercase">
              {user.name}
            </p>

            <p className="text-text-secondary max-w-32 truncate text-xs capitalize uppercase">
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
              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold">
                {getAvatar()}
              </div>

              <div className="min-w-0">
                <p className="text-text truncate text-sm font-semibold uppercase">
                  {user.name}
                </p>

                <p className="text-text-secondary truncate text-xs capitalize uppercase">
                  {user.designation}
                </p>
              </div>
            </div>

            {/* District */}

            {user.district && (
              <div className="border-border mb-2 border-b px-2 pb-3">
                <p className="text-text-secondary text-[10px] font-medium uppercase">
                  District
                </p>

                <p className="text-text mt-0.5 truncate text-sm font-semibold">
                  {typeof user.district === "object"
                    ? user.district?.name || user.district?.label || "-"
                    : user.district}
                </p>
              </div>
            )}

            {/* Town */}

            {user.town && (
              <div className="border-border mb-2 border-b px-2 pb-3">
                <p className="text-text-secondary text-[10px] font-medium uppercase">
                  Town
                </p>

                <p className="text-text mt-0.5 truncate text-sm font-semibold">
                  {getTownName()}
                </p>
              </div>
            )}

            {/* Menu */}

            <div className="space-y-1">
              {/* Profile */}

              <button
                type="button"
                onClick={() => goTo("/townfp/profile")}
                className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
              >
                <User size={17} />

                <span>Profile</span>
              </button>

              {/* Settings */}

              <button
                type="button"
                onClick={() => goTo("/townfp/settings")}
                className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
              >
                <Settings size={17} />

                <span>Settings</span>
              </button>

              <LogoutButton
                logout={logoutUser}
                setProfileOpen={setProfileOpen}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
