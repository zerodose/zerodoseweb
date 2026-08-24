"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeClosed } from "lucide-react";
import { loginUser } from "@/api/authApi";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { requestLocationPermission } from "@/utils/locationPermission";
import { designationRoutes } from "@/content/data";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");

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

  const normalizeReference = (value, extraFields = []) => {
    if (!value) {
      return null;
    }

    if (typeof value === "string") {
      return {
        _id: value,
      };
    }

    if (typeof value === "object") {
      const normalized = {
        _id: value._id || value.id || null,
      };

      // Save name when available
      if (
        value.name !== undefined &&
        value.name !== null &&
        value.name !== ""
      ) {
        normalized.name = value.name;
      }

      // Save requested additional fields
      extraFields.forEach((field) => {
        if (
          value[field] !== undefined &&
          value[field] !== null &&
          value[field] !== ""
        ) {
          normalized[field] = value[field];
        }
      });

      return normalized;
    }

    return null;
  };

  const prepareAuthUser = (user) => {
    const {
      password: _password,
      passwordHash: _passwordHash,

      verificationCode: _verificationCode,
      verificationCodeHash: _verificationCodeHash,

      resetToken: _resetToken,
      resetTokenHash: _resetTokenHash,

      resetPasswordToken: _resetPasswordToken,
      resetPasswordTokenHash: _resetPasswordTokenHash,

      approvalStatus: _approvalStatus,
      emailVerified: _emailVerified,

      ...safeUser
    } = user;

    const authUser = {
      ...safeUser,

      // ---------------------------------------------------
      // User ID
      // ---------------------------------------------------

      id: user._id || user.id || null,

      // ---------------------------------------------------
      // Common User Fields
      // ---------------------------------------------------

      name: user.name || "",
      email: user.email || "",
      contactNumber: user.contactNumber || "",
      designation: user.designation || "",

      // ---------------------------------------------------
      // Active Status
      // ---------------------------------------------------

      isActive: user.isActive !== undefined ? user.isActive : true,
    };

    // =====================================================
    // DISTRICT
    // =====================================================

    authUser.district = user.district
      ? normalizeReference(user.district, ["code"])
      : null;

    // =====================================================
    // TOWN
    // =====================================================

    authUser.town = user.town ? normalizeReference(user.town) : null;

    // =====================================================
    // UNION COUNCIL
    // =====================================================

    authUser.unionCouncil = user.unionCouncil
      ? normalizeReference(user.unionCouncil, ["code"])
      : null;

    // =====================================================
    // UCMO
    // =====================================================

    authUser.ucmo = user.ucmo ? normalizeReference(user.ucmo) : null;

    // =====================================================
    // SUPERVISOR
    // =====================================================

    authUser.supervisor = user.supervisor
      ? normalizeReference(user.supervisor)
      : null;

    // =====================================================
    // WORKER
    // =====================================================

    if (user.designation === "worker") {
      // ---------------------------------------------------
      // Team Number
      // ---------------------------------------------------

      authUser.teamNumber =
        user.teamNumber !== undefined && user.teamNumber !== null
          ? user.teamNumber
          : null;

      // ---------------------------------------------------
      // Worker Role
      // ---------------------------------------------------

      authUser.workerRole = user.workerRole || null;
    }

    // =====================================================
    // SUPERVISOR
    // =====================================================

    if (user.designation === "supervisor") {
      // ---------------------------------------------------
      // Supervisor Code
      // ---------------------------------------------------

      authUser.supervisorCode = user.supervisorCode || null;

      // approvalStatus intentionally NOT saved
    }

    // =====================================================
    // SESSION
    // =====================================================

    authUser.expiresAt = Date.now() + 6 * 60 * 60 * 1000;

    // =====================================================
    // LOCATION PERMISSION
    // =====================================================

    authUser.locationPermission =
      user.designation === "worker"
        ? localStorage.getItem("locationPermission") || "denied"
        : null;

    return authUser;
  };

  // =====================================================
  // Submit
  // =====================================================

  const onSubmit = async (data) => {
    if (loading) {
      return;
    }

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

      // =================================================
      // Get User
      // =================================================

      const user = response?.data?.user;

      if (!user) {
        throw new Error("User information was not returned.");
      }

      console.log("LOGIN USER FROM API:", user);

      // =================================================
      // Designation
      // =================================================

      const designation = user?.designation;

      // =================================================
      // Worker Location Permission
      // =================================================

      if (designation === "worker") {
        console.log("LOCATION: user is worker");

        await requestLocationPermission();

        console.log("LOCATION: permission check completed");
      }

      // =================================================
      // Dashboard Route
      // =================================================

      const route = designationRoutes[designation];

      if (!route) {
        throw new Error(
          `No dashboard route found for designation: ${
            designation || "unknown"
          }`,
        );
      }

      // =================================================
      // Prepare Auth User
      // =================================================

      const authUser = prepareAuthUser(user);

      // =================================================
      // Save Auth User
      // =================================================

      localStorage.setItem("authUser", JSON.stringify(authUser));

      // =================================================
      // Debug
      // =================================================

      console.log("AUTH USER SAVED:", authUser);

      // =================================================
      // Success
      // =================================================

      toast.success("Login successful!", {
        description: "Welcome back.",
      });

      // Keep loader active while navigating
      router.replace(route);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";

      const isApprovalMessage = /approval|approved|pending|rejected/i.test(
        message,
      );

      if (isApprovalMessage) {
        setApprovalMessage(message);
      } else {
        toast.error("Login failed", {
          description: message,
        });

        setError("password", {
          type: "server",
          message,
        });
      }

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
                className="h-[100px] w-[100px]"
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

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}

                {/* =================================================
                    Forgot Password
                ================================================= */}

                <div className="mt-4 text-right">
                  <Link
                    href="/auth/forgot-password"
                    aria-disabled={loading}
                    onClick={(e) => {
                      if (loading) {
                        e.preventDefault();
                      }
                    }}
                    className="text-primary hover:text-primary-dark text-sm transition aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  >
                    Forgot Password?
                  </Link>
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
      {approvalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-modal-title"
            className="bg-background border-border w-full max-w-md rounded-2xl border p-6 shadow-xl"
          >
            <div className="mb-5 text-center">
              <div className="bg-primary-light mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <span className="text-primary text-2xl">!</span>
              </div>

              <h2
                id="approval-modal-title"
                className="text-text text-lg font-semibold"
              >
                Account Approval
              </h2>
            </div>

            <p className="text-text-secondary text-center text-sm leading-6">
              {approvalMessage}
            </p>

            <button
              type="button"
              onClick={() => setApprovalMessage("")}
              className="bg-primary text-primary-foreground hover:bg-primary-dark mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
