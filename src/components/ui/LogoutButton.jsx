"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ logout = null, setProfileOpen }) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setProfileOpen?.(false);

      await logout();

      localStorage.removeItem("authUser");

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);

      // API fail ho tab bhi local session clear
      localStorage.removeItem("authUser");

      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut size={17} />

      <span>{loggingOut ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
