"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeClosed, House } from "lucide-react";
import { useRouter } from "next/navigation";

import Loader from "@/components/ui/Loader";
import VerifyEmailModal from "@/components/auth/VerifyEmailModal";

import {
  forgotPassword,
  verifyForgotPassword,
  resendForgotPasswordCode,
  resetPassword,
} from "@/api/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // =====================================================
  // States
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  // =====================================================
  // React Hook Form
  // =====================================================

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobile: "",
      password: "",
      confirmPassword: "",
    },

    mode: "onBlur",

    reValidateMode: "onChange",
  });

  const password = watch("password");

  // =====================================================
  // Send Verification Code
  // =====================================================

  const onSubmitMobile = async (data) => {
    if (loading) {
      return;
    }

    const mobile = data.mobile.trim();

    try {
      setLoading(true);

      setError("mobile", {
        type: "server",
        message: "",
      });

      // =================================================
      // Forgot Password API
      // =================================================

      const response = await forgotPassword({
        mobile,
      });

      console.log("Forgot password response:", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to send verification code.",
        );
      }

      // =================================================
      // Save Mobile
      // =================================================

      setMobileNumber(mobile);

      // =================================================
      // Get Registered Email
      // =================================================

      const email = response?.data?.email || response?.data?.user?.email;

      if (!email) {
        throw new Error("Registered email address was not returned.");
      }

      setVerificationEmail(email);

      // =================================================
      // Reset Modal State
      // =================================================

      setVerificationError("");

      setShowVerifyModal(true);

      // =================================================
      // Success
      // =================================================

      toast.success("Verification code sent!", {
        description: `A verification code was sent to ${email}.`,
      });
    } catch (error) {
      console.error("Forgot password error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send verification code.";

      toast.error("Failed to send code", {
        description: message,
      });

      setError("mobile", {
        type: "server",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Verify Forgot Password Code
  // =====================================================

  const handleVerifyCode = async (code) => {
    if (verificationLoading) {
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationError("");

      const response = await verifyForgotPassword({
        mobile: mobileNumber,
        code,
      });

      console.log("Forgot password verification response:", response);

      if (!response?.success) {
        const message = response?.message || "Verification failed.";

        setVerificationError(message);

        toast.error("Verification failed", {
          description: message,
        });

        return;
      }

      // =================================================
      // Save Reset Token
      // =================================================

      const token = response?.data?.resetToken;

      if (!token) {
        throw new Error("Password reset token was not returned.");
      }

      setResetToken(token);

      // =================================================
      // Close Verification Modal
      // =================================================

      setShowVerifyModal(false);
      setVerificationError("");

      // =================================================
      // Show Reset Password Form
      // =================================================

      setShowResetForm(true);

      toast.success("Verification successful!", {
        description: "You can now create your new password.",
      });
    } catch (error) {
      console.error("Forgot password verification error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid verification code.";

      setVerificationError(message);

      toast.error("Verification failed", {
        description: message,
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  // =====================================================
  // Resend Verification Code
  // =====================================================

  const handleResendCode = async () => {
    if (resendLoading) {
      return;
    }

    try {
      setResendLoading(true);

      setVerificationError("");

      // =================================================
      // Forgot Password Resend API
      // =================================================

      const response = await resendForgotPasswordCode({
        mobile: mobileNumber,
        email: verificationEmail,
      });

      console.log("Forgot password resend response:", response);

      if (!response?.success) {
        const message =
          response?.message || "Failed to resend verification code.";

        setVerificationError(message);

        toast.error("Failed to resend code", {
          description: message,
        });

        return;
      }

      toast.success("Verification code sent!", {
        description: `A new verification code was sent to ${verificationEmail}.`,
      });
    } catch (error) {
      console.error("Forgot password resend error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend verification code.";

      setVerificationError(message);

      toast.error("Failed to resend code", {
        description: message,
      });
    } finally {
      setResendLoading(false);
    }
  };

  // =====================================================
  // Reset Password
  // =====================================================

  const handleResetPassword = async (data) => {
    if (resetLoading) {
      return;
    }

    try {
      setResetLoading(true);

      clearErrors(["password", "confirmPassword"]);

      // =================================================
      // Reset Password API
      // =================================================

      // const response = await resetPassword({
      //   mobile: mobileNumber,
      //   token: resetToken,
      //   password: data.password,
      // });

      const response = await resetPassword({
        resetToken,
        password: data.password,
      });

      console.log("Reset password response:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to reset password.");
      }

      // =================================================
      // Success
      // =================================================

      toast.success("Password changed successfully!", {
        description: "You can now login with your new password.",
      });

      // =================================================
      // Reset Everything
      // =================================================

      setShowResetForm(false);

      setShowVerifyModal(false);

      setResetToken("");

      setMobileNumber("");

      setVerificationEmail("");

      reset();

      // =================================================
      // Go Login
      // =================================================

      router.replace("/auth/login");
    } catch (error) {
      console.error("Reset password error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password.";

      toast.error("Password reset failed", {
        description: message,
      });
    } finally {
      setResetLoading(false);
    }
  };

  // =====================================================
  // Close Verification Modal
  // =====================================================

  const handleCloseVerificationModal = () => {
    if (verificationLoading || resendLoading) {
      return;
    }

    setShowVerifyModal(false);

    setVerificationError("");
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <>
      {/* =================================================
          Loading Overlay
      ================================================= */}

      {(loading || resetLoading) && (
        <Loader
          text={
            resetLoading
              ? "Changing password..."
              : "Sending verification code..."
          }
        />
      )}

      {/* =================================================
          Main
      ================================================= */}

      <main className="bg-surface flex min-h-screen items-center justify-center px-4 py-10">
        {/* =================================================
            Home Button
        ================================================= */}

        <button
          type="button"
          onClick={() => router.push("/")}
          disabled={loading || resetLoading}
          className="text-text-secondary hover:text-primary hover:bg-primary-light absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowLeft size={18} />

          <House size={17} />

          <span>Home</span>
        </button>

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

              <h1 className="text-text mt-2 text-xl font-semibold">
                {showResetForm ? "Create New Password" : "Forgot Password?"}
              </h1>

              <p className="text-text-secondary text-sm">
                {showResetForm
                  ? "Enter your new password below."
                  : "Enter your registered mobile number to reset your password."}
              </p>
            </div>

            {/* =================================================
                Mobile Form
            ================================================= */}

            {!showResetForm && (
              <form
                onSubmit={handleSubmit(onSubmitMobile)}
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
                    } `}
                  />

                  {errors.mobile && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    Submit
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary-dark w-full rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            )}

            {/* =================================================
                Reset Password Form
            ================================================= */}

            {showResetForm && (
              <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="space-y-5"
                noValidate
              >
                {/* =================================================
                    New Password
                ================================================= */}

                <div>
                  <label
                    htmlFor="password"
                    className="text-text mb-2 block text-sm font-medium"
                  >
                    New Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showResetPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      disabled={resetLoading}
                      {...register("password", {
                        required: "New password is required.",

                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters.",
                        },
                      })}
                      className={`bg-input-background text-text placeholder:text-muted w-full rounded-lg border px-4 py-3 pr-14 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-border focus:border-primary focus:ring-primary-light"
                      } `}
                    />

                    <button
                      type="button"
                      onClick={() => setShowResetPassword((prev) => !prev)}
                      disabled={resetLoading}
                      aria-label={
                        showResetPassword ? "Hide password" : "Show password"
                      }
                      className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition disabled:opacity-50"
                    >
                      {showResetPassword ? (
                        <EyeClosed size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    Confirm Password
                ================================================= */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-text mb-2 block text-sm font-medium"
                  >
                    Confirm Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={resetLoading}
                      {...register("confirmPassword", {
                        required: "Please confirm your password.",

                        validate: (value) =>
                          value === password || "Passwords do not match.",
                      })}
                      className={`bg-input-background text-text placeholder:text-muted w-full rounded-lg border px-4 py-3 pr-14 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-border focus:border-primary focus:ring-primary-light"
                      } `}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      disabled={resetLoading}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeClosed size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    Reset Password
                ================================================= */}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary-dark w-full rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetLoading ? "Changing Password..." : "Change Password"}
                </button>
              </form>
            )}

            {/* =================================================
                Login Link
            ================================================= */}

            {!showResetForm && (
              <div className="text-text-secondary mt-6 text-center text-sm">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary-dark font-semibold transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
          Existing Verify Email Modal
      ===================================================== */}

      <VerifyEmailModal
        open={showVerifyModal}
        email={verificationEmail}
        loading={verificationLoading}
        resendLoading={resendLoading}
        error={verificationError}
        onClose={handleCloseVerificationModal}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
      />
    </>
  );
}
