"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";

export default function AdminHeader({ onMenuClick }) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // ============================================================
  // User
  // ============================================================

  const user = {
    name: "Admin User",
    email: "admin@zerodose.com",
    image: "",
  };

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

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-5 md:px-6">
      {/* ======================================================
          Mobile Menu
      ====================================================== */}

      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-lg
          text-text
          transition
          hover:bg-surface
          active:scale-95
          md:hidden
        "
      >
        <Menu size={22} />
      </button>

      {/* ======================================================
          Page Title
      ====================================================== */}

      <h1
        onClick={() => router.push("/dashboard")}
        className="
          absolute
          left-1/2
          -translate-x-1/2
          cursor-pointer
          text-base
          font-semibold
          text-text
          sm:text-lg
          md:static
          md:translate-x-0
        "
      >
        Zerodose Dashboard
      </h1>

      {/* ======================================================
          Profile
      ====================================================== */}

      <div ref={profileRef} className="relative ml-auto">
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            p-1
            transition
            hover:bg-surface
          "
        >
          {/* Avatar */}

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-primary
              text-sm
              font-semibold
              text-primary-foreground
            "
          >
            {getAvatar()}
          </div>

          {/* Desktop User Info */}

          <div className="hidden text-left lg:block">
            <p className="max-w-32 truncate text-sm font-semibold text-text">
              {user.name}
            </p>

            <p className="max-w-32 truncate text-xs text-text-secondary">
              {user.email}
            </p>
          </div>

          <ChevronDown
            size={16}
            className={`
              hidden
              text-text-secondary
              transition-transform
              lg:block
              ${profileOpen ? "rotate-180" : ""}
            `}
          />
        </button>

        {/* ====================================================
            Profile Dropdown
        ==================================================== */}

        {profileOpen && (
          <div
            className="
              absolute
              right-0
              top-12
              z-50
              w-64
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-background
              p-2
              shadow-xl
            "
          >
            {/* User */}

            <div className="mb-2 flex items-center gap-3 border-b border-border px-2 pb-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  bg-primary
                  text-sm
                  font-semibold
                  text-primary-foreground
                "
              >
                {getAvatar()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">
                  {user.name}
                </p>

                <p className="truncate text-xs text-text-secondary">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Menu */}

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/dashboard/profile");
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  text-text
                  transition
                  hover:bg-surface
                "
              >
                <User size={17} />

                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/dashboard/settings");
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  text-text
                  transition
                  hover:bg-surface
                "
              >
                <Settings size={17} />

                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/auth/login");
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  text-red-500
                  transition
                  hover:bg-red-50
                "
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
