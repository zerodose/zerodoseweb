"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authUser = localStorage.getItem("authUser");

    const publicRoutes = [
      "/auth/login",
      "/auth/signup",
      "/auth/verify-email",
      "/auth/forgot-password",
      "/",
    ];

    if (!authUser) {
      if (!publicRoutes.includes(pathname)) {
        router.replace("/auth/login");
      }

      return;
    }

    try {
      const parsedUser = JSON.parse(authUser);

      if (!parsedUser.expiresAt) {
        localStorage.removeItem("authUser");
        router.replace("/auth/login");
        return;
      }

      const remainingTime = parsedUser.expiresAt - Date.now();

      // Already expired
      if (remainingTime <= 0) {
        localStorage.removeItem("authUser");
        router.replace("/auth/login");
        return;
      }

      console.log(
        "Auth expires at:",
        new Date(parsedUser.expiresAt).toLocaleString(),
      );

      console.log("Remaining minutes:", Math.ceil(remainingTime / 1000 / 60));

      // Automatically logout exactly when expiry time arrives
      const timer = setTimeout(() => {
        localStorage.removeItem("authUser");
        router.replace("/auth/login");
      }, remainingTime);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Invalid authUser:", error);

      localStorage.removeItem("authUser");
      router.replace("/auth/login");
    }
  }, [pathname, router]);

  return children;
}
