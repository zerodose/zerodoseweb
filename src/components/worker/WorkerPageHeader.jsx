"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { changePassword } from "@/api/userApi";

export default function Header({
  onMenuClick,
  title = "Zerodose",
  dashboardRoute = "/dashboard",
  profileRoute = "/dashboard/profile",
  settingsRoute = "/dashboard/settings",
}) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [user, setUser] = useState({
    id: "",
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
          id: parsedUser?.id || parsedUser?._id || "",
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
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }

    return "U";
  };

  // ============================================================
  // Navigation
  // ============================================================

  const goTo = (route) => {
    if (!route) return;

    setProfileOpen(false);
    router.push(route);
  };

  // ============================================================
  // Open Change Password
  // ============================================================

  const openChangePassword = () => {
    setProfileOpen(false);

    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    setChangePasswordOpen(true);
  };

  // ============================================================
  // Close Change Password
  // ============================================================

  const closeChangePassword = () => {
    if (changingPassword) return;

    setChangePasswordOpen(false);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ============================================================
  // Change Password
  // ============================================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      toast.error("User authentication data not found.");
      return;
    }

    if (!password) {
      toast.error("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changePassword(user.id, {
        password,
        confirmPassword,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to change password.");
      }

      toast.success("Password changed successfully.");

      closeChangePassword();
    } catch (error) {
      console.error("Change password error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ============================================================
  // Logout
  // ============================================================

  const handleLogout = () => {
    setProfileOpen(false);
    localStorage.removeItem("authUser");
    router.push("/");
  };

  return (
    <>
      <header className="border-border bg-background relative z-30 flex h-16 shrink-0 items-center justify-between border-b px-3 sm:px-5 md:px-6">
        {/* ======================================================
            Left
        ====================================================== */}

        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="text-text hover:bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition active:scale-95 md:hidden"
          >
            <Menu size={22} />
          </button>

          <h1
            onClick={() => router.push(dashboardRoute)}
            className="text-text cursor-pointer truncate text-base font-semibold sm:text-lg"
          >
            {title}
          </h1>
        </div>

        {/* ======================================================
            Right - Profile
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

            {/* Desktop User */}

            <div className="hidden text-left lg:block">
              <p className="text-text max-w-32 truncate text-sm font-semibold uppercase">
                {user.name}
              </p>

              <p className="text-text-secondary max-w-32 truncate text-xs uppercase">
                {user.designation}
              </p>
            </div>

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

                  <p className="text-text-secondary truncate text-xs uppercase">
                    {user.designation}
                  </p>
                </div>
              </div>

              {/* Menu */}

              <div className="space-y-1">
                {/* Profile */}

                <button
                  type="button"
                  onClick={() => goTo(profileRoute)}
                  className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                >
                  <User size={17} />

                  <span>Profile</span>
                </button>

                {/* Change Password */}

                <button
                  type="button"
                  onClick={openChangePassword}
                  className="text-text hover:bg-surface flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                >
                  <LockKeyhole size={17} />

                  <span>Change Password</span>
                </button>

                {/* Settings */}

                <button
                  type="button"
                  onClick={() => goTo(settingsRoute)}
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

      {/* ========================================================
          CHANGE PASSWORD MODAL
      ======================================================== */}

      {changePasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="border-border bg-background w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
            {/* Modal Header */}

            <div className="border-border flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <LockKeyhole size={19} />
                </div>

                <div>
                  <h2 className="text-text text-base font-semibold">
                    Change Password
                  </h2>

                  <p className="text-text-secondary mt-0.5 text-xs">
                    Enter your new password below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeChangePassword}
                disabled={changingPassword}
                className="text-text-secondary hover:bg-surface hover:text-text flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleChangePassword} className="space-y-5 p-5">
              {/* New Password */}

              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={changingPassword}
                    className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light w-full rounded-xl border px-3 py-3 pr-11 text-sm transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}

              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={changingPassword}
                    className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light w-full rounded-xl border px-3 py-3 pr-11 text-sm transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeChangePassword}
                  disabled={changingPassword}
                  className="border-border bg-surface text-text hover:bg-background rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-primary hover:bg-primary/90 flex min-w-[130px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
