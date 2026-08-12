"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginUser } from "@/api/authApi";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // Dashboard Routes
  // =====================================================

  const dashboardRoutes = {
    admin: "/dashboard",
    worker: "/worker",
    supervisor: "/supervisor",
    ucmo: "/ucmo",
    otherStaff: "/otherStaff",
    vaccinator: "/vaccinator",
  };

  // =====================================================
  // React Hook Form
  // =====================================================

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobile: "",
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // =====================================================
  // Submit
  // =====================================================

  const onSubmit = async (data) => {
    if (loading) return;

    const mobile = data.mobile.trim();
    const password = data.password;

    try {
      // =================================================
      // Start Loading
      // =================================================

      setLoading(true);

      // Give browser time to render loader
      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      );

      // =================================================
      // Login API
      // =================================================

      const response = await loginUser({
        mobile,
        password,
      });

      console.log("Login response:", response);

      // =================================================
      // Get User
      // =================================================

      const user = response?.data?.user;

      if (!user) {
        throw new Error(
          "User information was not returned.",
        );
      }

      console.log("Logged in user:", user);

      // =================================================
      // Get Route According To Designation
      // =================================================

      const designation = user?.designation;

      const route =
        dashboardRoutes[designation];

      console.log(
        "User designation:",
        designation,
      );

      console.log(
        "Dashboard route:",
        route,
      );

      if (!route) {
        throw new Error(
          `No dashboard route found for designation: ${designation || "unknown"
          }`,
        );
      }

      // =================================================
      // Successful Login
      // =================================================

      toast.success("Login successful!", {
        description: "Welcome back.",
      });

      // Loader intentionally remains active.
      // Router will replace the page.
      router.replace(route);
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message ||
        "Invalid mobile number or password.";

      // Show toast
      toast.error("Login failed", {
        description: message,
      });

      // Show error under password
      setError("password", {
        type: "server",
        message,
      });

      setLoading(false);
    }
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <>
      {/* =================================================
          Loading Overlay
      ================================================= */}

      {loading && (
        <Loader text="Signing in..." />
      )}

      <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
        <div className="w-full max-w-md">
          {/* =================================================
              Card
          ================================================= */}

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
            {/* =================================================
                Logo
            ================================================= */}

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

            {/* =================================================
                Form
            ================================================= */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* =================================================
                  Mobile Number
              ================================================= */}

              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Mobile Number
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="mobile"
                  type="tel"
                  placeholder="03123456789"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={11}
                  disabled={loading}
                  {...register("mobile", {
                    required:
                      "Mobile number is required.",

                    validate: {
                      validPakistaniMobile: (
                        value,
                      ) =>
                        /^03\d{9}$/.test(
                          value.trim(),
                        ) ||
                        "Please enter a valid Pakistani mobile number.",
                    },
                  })}
                  className={`w-full rounded-lg border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.mobile
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-border focus:border-primary focus:ring-primary-light"
                    }`}
                />

                {/* =================================================
                    Mobile Error
                ================================================= */}

                {errors.mobile && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* =================================================
                  Password
              ================================================= */}

              <div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      {...register("password", {
                        required: "Password is required.",
                        minLength: {
                          value: 8,
                          message:
                            "Password must be at least 8 characters.",
                        },
                      })}
                      className={`w-full rounded-lg border bg-input-background px-4 py-3 pr-20 text-sm text-text outline-none transition placeholder:text-muted focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-border focus:border-primary focus:ring-primary-light"
                        }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted transition hover:text-text disabled:opacity-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* SERVER + VALIDATION ERROR */}

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

              </div>

              {/* =================================================
                  Submit
              ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            {/* =================================================
                Signup
            ================================================= */}

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