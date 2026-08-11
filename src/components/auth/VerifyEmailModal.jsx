"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function VerifyEmailModal({
  open,
  email,
  loading = false,
  resendLoading = false,
  error = "",
  onVerify,
  onResend,
  onClose,
}) {
  const [code, setCode] = useState("");

  const inputRef = useRef(null);

  // ============================================================
  // Focus input when modal opens
  // ============================================================

  useEffect(() => {
    if (open) {
      setCode("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // ============================================================
  // Close with Escape
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  // ============================================================
  // Handle code change
  // ============================================================

  const handleChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setCode(value);
    }
  };

  // ============================================================
  // Submit verification
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (code.length !== 6) {
      return;
    }

    onVerify?.(code);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/40
        px-4
        py-6
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <div
        className="
          relative
          w-full
          max-w-md
          rounded-2xl
          border
          border-border
          bg-background
          p-6
          shadow-xl
          sm:p-8
        "
      >
        {/* ======================================================
            Close
        ====================================================== */}

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="
            absolute
            right-4
            top-4
            rounded-lg
            p-2
            text-muted
            transition
            hover:bg-surface
            hover:text-text
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* ======================================================
            Header
        ====================================================== */}

        <div className="text-center">
          <div
            className="
              mx-auto
              mb-4
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-primary-light
              text-primary
            "
          >
            <span className="text-xl font-bold">@</span>
          </div>

          <h2 className="text-xl font-semibold text-text">Verify your email</h2>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            We sent a 6-digit verification code to
          </p>

          <p className="mt-1 break-all text-sm font-medium text-text">
            {email}
          </p>
        </div>

        {/* ======================================================
            Form
        ====================================================== */}

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="verificationCode"
            className="mb-2 block text-sm font-medium text-text"
          >
            Verification Code
          </label>

          <input
            ref={inputRef}
            id="verificationCode"
            name="verificationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={handleChange}
            placeholder="000000"
            maxLength={6}
            disabled={loading}
            className="
              w-full
              rounded-lg
              border
              border-border
              bg-input-background
              px-4
              py-3
              text-center
              text-2xl
              font-semibold
              tracking-[0.5em]
              text-text
              outline-none
              transition
              placeholder:text-muted
              placeholder:tracking-[0.5em]
              focus:border-primary
              focus:ring-2
              focus:ring-primary-light
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          {/* ====================================================
              Error
          ==================================================== */}

          {error && (
            <p className="mt-2 text-center text-xs text-red-500">{error}</p>
          )}

          {/* ====================================================
              Verify Button
          ==================================================== */}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="
              mt-5
              w-full
              rounded-lg
              bg-primary
              px-4
              py-3
              text-sm
              font-semibold
              text-primary-foreground
              transition
              hover:bg-primary-dark
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* ======================================================
            Resend
        ====================================================== */}

        <div className="mt-5 text-center">
          <p className="text-sm text-text-secondary">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={onResend}
            disabled={loading || resendLoading}
            className="
              mt-1
              text-sm
              font-semibold
              text-primary
              transition
              hover:text-primary-dark
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {resendLoading ? "Sending..." : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
