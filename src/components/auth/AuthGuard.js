"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { designationRoutes } from "@/content/data";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/auth/login",
      "/auth/signup",
      "/auth/verify-email",
      "/auth/forgot-password",
      "/",
    ];

    const authUser = localStorage.getItem("authUser");

    // ============================================================
    // Public route
    // ============================================================

    if (publicRoutes.includes(pathname)) {
      setIsCheckingAuth(false);
      return;
    }

    // ============================================================
    // Protected route but no auth
    // ============================================================

    if (!authUser) {
      setIsCheckingAuth(false);
      router.replace("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(authUser);

      // ============================================================
      // Invalid auth data
      // ============================================================

      if (!parsedUser?.expiresAt) {
        localStorage.removeItem("authUser");
        setIsCheckingAuth(false);
        router.replace("/auth/login");
        return;
      }

      // ============================================================
      // Session expiration
      // ============================================================

      const remainingTime = parsedUser.expiresAt - Date.now();

      if (remainingTime <= 0) {
        localStorage.removeItem("authUser");
        setIsCheckingAuth(false);
        router.replace("/auth/login");
        return;
      }

      // ============================================================
      // Designation-based route protection
      // ============================================================

      const designation = String(parsedUser?.designation || "")
        .trim()
        .toLowerCase();

      // const designationRoutes = {
      //   admin: "/dashboard",
      //   districtfp: "/districtfp",
      //   townfp: "/townfp",
      //   ucmo: "/ucmo",
      //   supervisor: "/supervisor",
      //   vaccinator: "/vaccinator",
      //   worker: "/worker",
      // };

      const allowedBaseRoute = designationRoutes[designation];

      // ============================================================
      // Invalid / unknown designation
      // ============================================================

      if (!allowedBaseRoute) {
        console.error("Invalid user designation:", parsedUser?.designation);

        localStorage.removeItem("authUser");
        setIsCheckingAuth(false);
        router.replace("/auth/login");
        return;
      }

      // ============================================================
      // Check whether current route belongs to user's designation
      // ============================================================

      const isAllowedRoute =
        pathname === allowedBaseRoute ||
        pathname.startsWith(`${allowedBaseRoute}/`);

      if (!isAllowedRoute) {
        setIsCheckingAuth(false);

        // Send user to their own dashboard
        router.replace(allowedBaseRoute);

        return;
      }

      // ============================================================
      // Session is valid + route is allowed
      // ============================================================

      setIsCheckingAuth(false);

      // Automatically logout when session expires
      const timer = setTimeout(() => {
        localStorage.removeItem("authUser");
        router.replace("/auth/login");
      }, remainingTime);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Invalid authUser:", error);

      localStorage.removeItem("authUser");
      setIsCheckingAuth(false);
      router.replace("/auth/login");
    }
  }, [pathname, router]);

  // ============================================================
  // Don't render protected content while checking
  // ============================================================

  if (isCheckingAuth) {
    return null;
  }

  return children;
}
