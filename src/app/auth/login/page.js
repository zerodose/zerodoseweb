"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginUser } from "@/api/authApi";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // Dashboard Routes
  // =====================================================

  const dashboardRoutes = {
    admin: "/dashboard",
    worker: "/worker",
    supervisor: "/supervisor",
    ucmo: "/ucmo",
    otherStaff: "/otherstaff",
    vaccinator: "/vaccinator",
  };

  // =====================================================
  // Handle Change
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // Handle Submit
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const mobile = formData.mobile.trim();
    const password = formData.password;

    // =====================================================
    // Validation
    // =====================================================

    if (!mobile) {
      setError("Mobile number is required.");
      return;
    }

    if (!/^03\d{9}$/.test(mobile)) {
      setError("Please enter a valid Pakistani mobile number.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      // =====================================================
      // Start Loading
      // =====================================================

      setLoading(true);

      // Give browser time to render loader
      await new Promise((resolve) => setTimeout(resolve, 100));

      // =====================================================
      // Login API
      // =====================================================

      const response = await loginUser({
        mobile,
        password,
      });

      console.log("Login response:", response);

      // =====================================================
      // Get User
      // =====================================================

      const user = response?.data?.user;

      if (!user) {
        throw new Error("User information was not returned.");
      }

      console.log("Logged in user:", user);

      // =====================================================
      // Get Route According To Designation
      // =====================================================

      const designation = user?.designation;
      const route = dashboardRoutes[designation];

      console.log("User designation:", designation);
      console.log("Dashboard route:", route);

      if (!route) {
        throw new Error(
          `No dashboard route found for designation: ${designation || "unknown"}`,
        );
      }

      // =====================================================
      // Successful Login
      // =====================================================

      // Loader ko intentionally false nahi kar rahe.
      // Router page ko replace karega aur loader automatically
      // unmount ho jayega.
      router.replace(route);

    } catch (error) {
      console.error("Login error:", error);

      // =====================================================
      // Stop Loading On Error
      // =====================================================

      setLoading(false);

      // =====================================================
      // Get Backend Error
      // =====================================================

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      setError(
        backendMessage || "Unable to sign in. Please try again.",
      );
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <>
      {/* =====================================================
          Loading Overlay
      ====================================================== */}

      {loading && <Loader text="Creating your account..." />}

      <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
        <div className="w-full max-w-md">

          {/* =====================================================
              Logo
          ====================================================== */}

          <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
            <Image
              src="/images/logo.png"
              alt="Zerodose Logo"
              width={100}
              height={100}
              loading="eager"
            />

            <p className="mt-2 text-sm text-text-secondary">
              Sign in to your account
            </p>
          </div>

          {/* =====================================================
              Card
          ====================================================== */}

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">

            {/* =====================================================
                Error
            ====================================================== */}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                {error}
              </div>
            )}

            {/* =====================================================
                Form
            ====================================================== */}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* =====================================================
                  Mobile Number
              ====================================================== */}

              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Mobile Number
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="03123456789"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={11}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* =====================================================
                  Password
              ====================================================== */}

              <div>
                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-text"
                  >
                    Password
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    aria-disabled={loading}
                    onClick={(e) => {
                      if (loading) {
                        e.preventDefault();
                      }
                    }}
                    className="text-sm text-primary transition hover:text-primary-dark aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 pr-20 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted transition hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              {/* =====================================================
                  Submit
              ====================================================== */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* =====================================================
                Signup
            ====================================================== */}

            <div className="mt-6 text-center text-sm text-text-secondary">
              Don't have an account?{" "}

              <Link
                href="/auth/signup"
                aria-disabled={loading}
                onClick={(e) => {
                  if (loading) {
                    e.preventDefault();
                  }
                }}
                className="font-semibold text-primary transition hover:text-primary-dark aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Create account
              </Link>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
