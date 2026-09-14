"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  User,
  ChevronDown,
  X,
  Mail,
  Shield,
  CalendarDays,
  LockKeyhole,
} from "lucide-react";

import { changePassword } from "@/api/userApi";
import LogoutButton from "./LogoutButton";
import { getCurrentUser, logoutUser } from "@/api/authApi";
import { formatDate } from "@/lib/formatDate";

export default function PageHeaderWithDesignation({
  name = "",
  designation = "",

  onMenuClick,
  dashboardRoute = "",

  teamNumber,
  supervisorName,

  ucCode,
  ucName,

  ucmoName,

  townName,

  districtName,

  // ============================================================
  // District FP
  // ============================================================

  provinceName = "Sindh",
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // ============================================================
  // Normalized Values
  // ============================================================

  const normalizedDesignation = String(designation || "")
    .trim()
    .toLowerCase();

  const displayName = name || "User";

  // ============================================================
  // Menu
  // Only Supervisor + UCMO
  // ============================================================

  const showMenu =
    normalizedDesignation === "supervisor" ||
    normalizedDesignation === "ucmo" ||
    normalizedDesignation === "townfp" ||
    normalizedDesignation === "districtfp";

  // const loadUserProfile = async () => {
  //   try {
  //     setLoadingProfile(true);

  //     const response = await fetch("/api/auth/me", {
  //       method: "GET",
  //       credentials: "include",
  //       cache: "no-store",
  //     });

  //     const result = await response.json();

  //     if (!response.ok || !result.success) {
  //       throw new Error(result.message || "Failed to load profile.");
  //     }

  //     setUser(result.data.user);

  //     return result.data.user;
  //   } catch (error) {
  //     console.error("Profile fetch error:", error);
  //     throw error;
  //   } finally {
  //     setLoadingProfile(false);
  //   }
  // };

  // ============================================================
  // Profile
  // ============================================================

  const handleProfile = async () => {
    setOpen(false);
    setProfileOpen(true);

    if (user) return;

    try {
      setLoadingProfile(true);

      // const response = await fetch("/api/auth/me", {
      //   method: "GET",
      //   credentials: "include",
      //   cache: "no-store",
      // });
      const response = await getCurrentUser();

      if (!response.success) {
        throw new Error(response.message || "Failed to load profile.");
      }
      console.log("Response for me", response);
      setUser(response.data.user);
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ============================================================
  // Avatar
  // ============================================================

  const getAvatar = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }

    return "U";
  };

  // ============================================================
  // Dashboard Navigation
  // ============================================================

  const handleDashboardClick = () => {
    if (!dashboardRoute) return;

    router.push(dashboardRoute);
  };

  // ============================================================
  // Get Header Information
  // ============================================================

  const getHeaderInfo = () => {
    switch (normalizedDesignation) {
      // --------------------------------------------------------
      // Worker
      // --------------------------------------------------------

      case "worker":
        return {
          title: displayName,
          details: (
            <>
              {teamNumber !== undefined &&
                teamNumber !== null &&
                teamNumber !== "" && <span>Team No. {teamNumber}</span>}

              {teamNumber !== undefined &&
                teamNumber !== null &&
                teamNumber !== "" &&
                supervisorName && <span>•</span>}

              {supervisorName && (
                <span className="truncate">Supervisor: {supervisorName}</span>
              )}
            </>
          ),
        };

      // --------------------------------------------------------
      // Vaccinator
      // --------------------------------------------------------

      case "vaccinator":
        return {
          title: displayName,
          details: (
            <>
              {ucCode && <span>UC: {ucCode}</span>}

              {ucCode && ucName && <span>•</span>}

              {ucName && <span className="truncate">{ucName}</span>}
            </>
          ),
        };

      // --------------------------------------------------------
      // Supervisor
      // --------------------------------------------------------

      case "supervisor":
        return {
          title: displayName,
          details: (
            <>
              {ucCode && <span>UC: {ucCode}</span>}

              {ucCode && ucName && <span>•</span>}

              {ucName && <span className="truncate">{ucName}</span>}

              {ucName && ucmoName && <span>•</span>}

              {ucmoName && <span className="truncate">UCMO: {ucmoName}</span>}
            </>
          ),
        };

      // --------------------------------------------------------
      // UCMO
      // --------------------------------------------------------

      case "ucmo":
        return {
          title: displayName,
          details: (
            <>
              {ucCode && <span>UC: {ucCode}</span>}

              {ucCode && ucName && <span>•</span>}

              {ucName && <span className="truncate">{ucName}</span>}

              {ucName && townName && <span>•</span>}

              {townName && <span className="truncate">Town: {townName}</span>}
            </>
          ),
        };

      // --------------------------------------------------------
      // Town FP
      // --------------------------------------------------------

      case "townfp":
        return {
          title: displayName,
          details: (
            <>
              {districtName && (
                <span className="truncate">District: {districtName}</span>
              )}
            </>
          ),
        };

      // --------------------------------------------------------
      // District FP
      // --------------------------------------------------------

      case "districtfp":
        return {
          title: displayName,
          details: (
            <>
              <span>Province: {provinceName || "Sindh"}</span>
            </>
          ),
        };

      // --------------------------------------------------------
      // Default
      // --------------------------------------------------------

      default:
        return {
          title: displayName,
          details: null,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // ============================================================
  // Don't Render Header for Admin
  // ============================================================

  if (normalizedDesignation === "admin") {
    return null;
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!user?._id) {
      setPasswordError("Unable to identify your account.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Password is required.");
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Confirm password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changePassword(user._id, {
        password: newPassword,
        confirmPassword,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to change password.");
      }

      setPasswordSuccess(response?.message || "Password changed successfully.");

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordSuccess("");
      }, 1200);
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      {/* ========================================================
          Page Header
      ======================================================== */}

      <div className="border-border mb-6 flex items-center justify-between border-b pb-4 md:mb-7 md:pb-5">
        {/* ======================================================
            Left
        ====================================================== */}

        <div className="flex min-w-0 items-center gap-2">
          {/* ====================================================
              Mobile Menu
              ONLY Supervisor + UCMO
          ==================================================== */}

          {showMenu && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open sidebar"
              className="text-text hover:bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition active:scale-95 md:hidden"
            >
              <Menu size={22} />
            </button>
          )}

          {/* ====================================================
              Name + Information
          ==================================================== */}

          <div
            onClick={handleDashboardClick}
            className={`min-w-0 ${dashboardRoute ? "cursor-pointer" : ""}`}
          >
            {/* Main Name */}

            <h1 className="text-text truncate text-xl font-bold uppercase md:text-2xl">
              {headerInfo.title}
            </h1>

            {/* Designation-specific Information */}

            {headerInfo.details && (
              <div className="text-text-secondary mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs md:text-sm">
                {headerInfo.details}
              </div>
            )}
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
            {/* Avatar */}

            <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold md:h-8 md:w-8">
              {getAvatar()}
            </div>

            <ChevronDown
              size={16}
              className={`text-text-secondary hidden transition-transform sm:block ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* ====================================================
              Profile Dropdown
          ==================================================== */}

          {open && (
            <>
              {/* Close Dropdown Overlay */}

              <button
                type="button"
                aria-label="Close profile menu"
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="bg-background border-border absolute top-12 right-0 z-50 w-56 overflow-hidden rounded-xl border p-2 shadow-xl md:top-14">
                {/* User Information */}

                <div className="border-border mb-2 flex items-center gap-3 border-b px-2 pb-3">
                  {/* Avatar */}

                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                    {getAvatar()}
                  </div>

                  {/* Name + Designation */}

                  <div className="min-w-0">
                    <p className="text-text truncate text-sm font-semibold uppercase">
                      {displayName}
                    </p>

                    <p className="text-text-secondary truncate text-xs capitalize">
                      {designation}
                    </p>
                  </div>
                </div>

                {/* Menu */}

                <div className="space-y-1">
                  {/* Profile */}

                  <button
                    type="button"
                    onClick={handleProfile}
                    className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                  >
                    <User size={18} className="text-text-secondary" />

                    <span>Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                      setNewPassword("");
                      setConfirmPassword("");

                      try {
                        setLoadingProfile(true);

                        const response = await fetch("/api/auth/me", {
                          method: "GET",
                          credentials: "include",
                          cache: "no-store",
                        });

                        const result = await response.json();

                        if (!response.ok || !result.success) {
                          throw new Error(
                            result.message ||
                              "Failed to load account information.",
                          );
                        }

                        setUser(result.data.user);
                        setChangePasswordOpen(true);
                      } catch (error) {
                        console.error(
                          "Change password profile fetch error:",
                          error,
                        );

                        setPasswordError(
                          error?.message ||
                            "Unable to load your account information.",
                        );

                        setChangePasswordOpen(true);
                      } finally {
                        setLoadingProfile(false);
                      }
                    }}
                    className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                  >
                    <LockKeyhole size={18} className="text-text-secondary" />

                    <span>Change Password</span>
                  </button>

                  <LogoutButton
                    logout={logoutUser}
                    setProfileOpen={setProfileOpen}
                  />
                </div>
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
                    <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    {/* 
                    <h3 className="text-text mt-3 text-lg font-semibold">
                      {user.name || user.fullName || "User"}
                    </h3>

                    {user.designation && (
                      <span className="bg-primary/10 text-primary mt-1 rounded-full px-3 py-1 text-xs font-medium capitalize">
                        {user.designation}
                      </span>
                    )} */}
                  </div>

                  {/* Details */}

                  <div className="grid grid-cols-2 gap-3 space-y-3">
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

                    {/* Supervisor */}

                    {user.supervisor && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <User size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            Supervisor
                          </p>

                          <p className="text-text truncate text-sm font-medium">
                            {user.supervisor.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* UCMO */}

                    {user.ucmo && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            UCMO
                          </p>

                          <p className="text-text text-sm font-medium capitalize">
                            {user.ucmo.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* UnionCouncil */}

                    {user.unionCouncil && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            Union Council
                          </p>

                          <p className="text-text text-sm font-medium capitalize">
                            {user.unionCouncil.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Town */}

                    {user.town && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            Town
                          </p>

                          <p className="text-text text-sm font-medium capitalize">
                            {user.town.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* District */}

                    {user.district && (
                      <div className="bg-surface flex items-center gap-3 rounded-xl p-3">
                        <div className="bg-background text-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-text-secondary text-[11px]">
                            District
                          </p>

                          <p className="text-text text-sm font-medium capitalize">
                            {user.district.name}
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
                            {formatDate(user.createdAt)}
                            {/* {new Date(user.createdAt).toLocaleDateString()} */}
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

      {changePasswordOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close change password"
            onClick={() => {
              if (changingPassword) return;

              setChangePasswordOpen(false);
              setPasswordError("");
              setPasswordSuccess("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}

          <div className="bg-background border-border relative z-10 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
            {/* Header */}

            <div className="border-border flex items-center justify-between border-b px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <LockKeyhole size={19} />
                </div>

                <div>
                  <h2 className="text-text text-lg font-semibold">
                    Change Password
                  </h2>

                  <p className="text-text-secondary mt-0.5 text-xs">
                    Update your account password
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (changingPassword) return;

                  setChangePasswordOpen(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={changingPassword}
                aria-label="Close change password"
                className="text-text-secondary hover:bg-surface hover:text-text flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* Content */}

            <form onSubmit={handleChangePassword} className="p-5 md:p-6">
              {/* Error */}

              {passwordError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
                  {passwordError}
                </div>
              )}

              {/* Success */}

              {passwordSuccess && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-600 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
                  {passwordSuccess}
                </div>
              )}

              {/* New Password */}

              <div className="mb-4">
                <label
                  htmlFor="new-password"
                  className="text-text mb-1.5 block text-sm font-medium"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={changingPassword}
                  className="border-border bg-surface text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Confirm Password */}

              <div className="mb-6">
                <label
                  htmlFor="confirm-password"
                  className="text-text mb-1.5 block text-sm font-medium"
                >
                  Confirm Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={changingPassword}
                  className="border-border bg-surface text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Actions */}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (changingPassword) return;

                    setChangePasswordOpen(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={changingPassword}
                  className="border-border bg-background text-text hover:bg-surface rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-primary hover:bg-primary-dark flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
