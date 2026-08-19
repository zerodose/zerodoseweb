"use client";

import { useState } from "react";
import {
  User,
  LogOut,
  ChevronDown,
  X,
  Mail,
  Shield,
  CalendarDays,
} from "lucide-react";

export default function WorkerPageHeader({
  name = "Worker",
  teamNumber,
  supervisorCode,
  supervisorName,
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ============================================================
  // Profile
  // ============================================================

  const handleProfile = async () => {
    setOpen(false);
    setProfileOpen(true);

    if (user) return;

    try {
      setLoadingProfile(true);

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load profile.");
      }

      setUser(result.data.user);
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ============================================================
  // Logout
  // ============================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  // ============================================================
  // Supervisor Display
  // ============================================================

  const supervisorDisplay = supervisorCode
    ? `Supervisor Code: ${supervisorCode}`
    : supervisorName
      ? `Supervisor: ${supervisorName}`
      : null;

  return (
    <>
      {/* ========================================================
          Page Header
      ======================================================== */}

      <div className="border-border mb-6 flex items-center justify-between border-b pb-4 md:mb-7 md:pb-5">
        {/* ======================================================
            Left
        ====================================================== */}

        <div className="min-w-0">
          <h1 className="text-text truncate text-xl font-bold md:text-2xl">
            {name}
          </h1>

          {/* Worker Information */}
          <div className="text-text-secondary mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs md:text-sm">
            {teamNumber !== undefined && teamNumber !== null && (
              <span>Team No. {teamNumber}</span>
            )}

            {teamNumber !== undefined &&
              teamNumber !== null &&
              supervisorDisplay && <span>•</span>}

            {supervisorDisplay && <span>{supervisorDisplay}</span>}
          </div>
        </div>

        {/* ======================================================
            Right Menu
        ====================================================== */}

        <div className="relative ml-4 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Open profile menu"
            aria-expanded={open}
            className="border-border bg-surface hover:bg-background flex h-10 items-center gap-2 rounded-xl border px-2.5 transition md:h-11 md:px-3"
          >
            <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg md:h-8 md:w-8">
              <User size={17} />
            </div>

            <ChevronDown
              size={16}
              className={`text-text-secondary hidden transition-transform sm:block ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}

          {open && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="bg-background border-border absolute top-12 right-0 z-50 w-48 overflow-hidden rounded-xl border p-1.5 shadow-lg md:top-14">
                {/* Profile */}

                <button
                  type="button"
                  onClick={handleProfile}
                  className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                >
                  <User size={18} className="text-text-secondary" />
                  <span>Profile</span>
                </button>

                {/* Logout */}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={18} className="text-text-secondary" />

                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================
          Profile Modal
      ======================================================== */}

      {profileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close profile"
            onClick={() => setProfileOpen(false)}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}

          <div className="bg-background border-border relative z-10 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
            {/* Header */}

            <div className="border-border flex items-center justify-between border-b px-5 py-4 md:px-6">
              <div>
                <h2 className="text-text text-lg font-semibold">My Profile</h2>

                <p className="text-text-secondary mt-0.5 text-xs">
                  Current account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile"
                className="text-text-secondary hover:bg-surface hover:text-text flex h-9 w-9 items-center justify-center rounded-lg transition"
              >
                <X size={19} />
              </button>
            </div>

            {/* Content */}

            <div className="p-5 md:p-6">
              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="border-border border-t-primary h-10 w-10 animate-spin rounded-full border-4" />

                  <p className="text-text-secondary mt-4 text-sm">
                    Loading profile...
                  </p>
                </div>
              ) : user ? (
                <>
                  {/* Avatar */}

                  <div className="mb-6 flex flex-col items-center">
                    <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-2xl">
                      <User size={38} />
                    </div>

                    <h3 className="text-text mt-3 text-lg font-semibold">
                      {user.name || user.fullName || "Worker"}
                    </h3>

                    {user.designation && (
                      <span className="bg-primary/10 text-primary mt-1 rounded-full px-3 py-1 text-xs font-medium capitalize">
                        {user.designation}
                      </span>
                    )}
                  </div>

                  {/* Details */}

                  <div className="space-y-3">
                    {/* Name */}

                    {(user.name || user.fullName) && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <User size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            Name
                          </p>

                          <p className="text-text truncate text-sm font-medium">
                            {user.name || user.fullName}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Email */}

                    {user.email && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Mail size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            Email
                          </p>

                          <p className="text-text truncate text-sm font-medium">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Designation */}

                    {user.designation && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            Designation
                          </p>

                          <p className="text-text text-sm font-medium capitalize">
                            {user.designation}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Joined */}

                    {user.createdAt && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <CalendarDays size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            Joined
                          </p>

                          <p className="text-text text-sm font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-text font-medium">
                    Unable to load profile
                  </p>

                  <p className="text-text-secondary mt-1 text-sm">
                    Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
