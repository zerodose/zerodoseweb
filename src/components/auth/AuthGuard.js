"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const publicRoutes = [
      "/auth/login",
      "/auth/signup",
      "/auth/verify-email",
      "/auth/forgot-password",
      "/",
    ];

    const authUser = localStorage.getItem("authUser");

    // Public route — no authentication required
    if (publicRoutes.includes(pathname)) {
      setIsCheckingAuth(false);
      return;
    }

    // Protected route but no auth
    if (!authUser) {
      setIsCheckingAuth(false);
      router.replace("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(authUser);

      // Invalid auth data
      if (!parsedUser?.expiresAt) {
        localStorage.removeItem("authUser");
        setIsCheckingAuth(false);
        router.replace("/auth/login");
        return;
      }

      const remainingTime = parsedUser.expiresAt - Date.now();

      // Session expired
      if (remainingTime <= 0) {
        localStorage.removeItem("authUser");
        setIsCheckingAuth(false);
        router.replace("/auth/login");
        return;
      }

      // Session is valid
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

  // Don't render protected content while checking authentication
  if (isCheckingAuth) {
    return null;
  }

  return children;
}
