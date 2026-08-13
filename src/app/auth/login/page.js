"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeClosed, EyeOff } from "lucide-react";
import { loginUser } from "@/api/authApi";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

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
      await new Promise((resolve) => setTimeout(resolve, 100));

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
        throw new Error("User information was not returned.");
      }

      console.log("Logged in user:", user);

      // =================================================
      // Get Route According To Designation
      // =================================================

      const designation = user?.designation;

      const route = dashboardRoutes[designation];

      console.log("User designation:", designation);

      console.log("Dashboard route:", route);

      if (!route) {
        throw new Error(
          `No dashboard route found for designation: ${
            designation || "unknown"
          }`,
        );
      }

      // =================================================
      // Save Logged-in User
      // =================================================

      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: user._id || user.id,
          name: user.name,
          designation: user.designation,
        }),
      );

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
      // console.error("Login error:", error);

      const message =
        // error?.response?.data?.message || "Invalid mobile number or password.";
        error?.response?.data?.message || "Login failed. Please try again.";
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
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <>
      {/* =================================================
          Loading Overlay
      ================================================= */}

      {loading && <Loader text="Signing in..." />}

      <main className="bg-surface flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* =================================================
              Card
          ================================================= */}

          <div className="border-border bg-background rounded-2xl border p-6 shadow-sm sm:p-8">
            {/* =================================================
                Logo
            ================================================= */}

            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <Image
                src="/images/logo.png"
                alt="Zerodose Logo"
                width={100}
                height={100}
                className="h-auto w-[100px]"
                priority
              />

              <p className="text-text-secondary mt-2 text-sm">
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
                  className="text-text mb-2 block text-sm font-medium"
                >
                  Mobile Number
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="mobile"
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={11}
                  disabled={loading}
                  {...register("mobile", {
                    required: "Mobile number is required.",

                    validate: {
                      validPakistaniMobile: (value) =>
                        /^03\d{9}$/.test(value.trim()) ||
                        "Please enter a valid Pakistani mobile number.",
                    },
                  })}
                  className={`bg-input-background text-text placeholder:text-muted w-full rounded-lg border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.mobile
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
                    className="text-text mb-2 block text-sm font-medium"
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
                          message: "Password must be at least 8 characters.",
                        },
                      })}
                      className={`bg-input-background text-text placeholder:text-muted w-full rounded-lg border px-4 py-3 pr-20 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-border focus:border-primary focus:ring-primary-light"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition disabled:opacity-50"
                    >
                      {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
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
                className="bg-primary text-primary-foreground hover:bg-primary-dark w-full rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* =================================================
                Signup
            ================================================= */}

            <div className="text-text-secondary mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                aria-disabled={loading}
                onClick={(e) => {
                  if (loading) {
                    e.preventDefault();
                  }
                }}
                className="text-primary hover:text-primary-dark font-semibold transition aria-disabled:pointer-events-none aria-disabled:opacity-50"
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
