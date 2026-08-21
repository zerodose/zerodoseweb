// "use client";

// import { useEffect, useRef, useState } from "react";
// import { X } from "lucide-react";

// export default function VerifyEmailModal({
//   open,
//   email,
//   loading = false,
//   resendLoading = false,
//   error = "",
//   onVerify,
//   onResend,
//   onClose,
// }) {
//   const [code, setCode] = useState("");

//   const inputRef = useRef(null);

//   // ============================================================
//   // Focus input when modal opens
//   // ============================================================

//   useEffect(() => {
//     if (open) {
//       setCode("");

//       setTimeout(() => {
//         inputRef.current?.focus();
//       }, 100);
//     }
//   }, [open]);

//   // ============================================================
//   // Close with Escape
//   // ============================================================

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === "Escape" && !loading) {
//         onClose?.();
//       }
//     };

//     if (open) {
//       document.addEventListener("keydown", handleKeyDown);
//     }

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [open, loading, onClose]);

//   // ============================================================
//   // Handle code change
//   // ============================================================

//   const handleChange = (event) => {
//     const value = event.target.value.replace(/\D/g, "");

//     if (value.length <= 6) {
//       setCode(value);
//     }
//   };

//   // ============================================================
//   // Submit verification
//   // ============================================================

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (code.length !== 6) {
//       return;
//     }

//     onVerify?.(code);
//   };

//   if (!open) {
//     return null;
//   }

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
//       <div className="border-border bg-background relative w-full max-w-md rounded-2xl border p-6 shadow-xl sm:p-8">
//         {/* ======================================================
//             Close
//         ====================================================== */}

//         <button
//           type="button"
//           onClick={onClose}
//           disabled={loading}
//           className="text-muted hover:bg-surface hover:text-text absolute top-4 right-4 rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50"
//           aria-label="Close"
//         >
//           <X size={20} />
//         </button>

//         {/* ======================================================
//             Header
//         ====================================================== */}

//         <div className="text-center">
//           <div className="bg-primary-light text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
//             <span className="text-xl font-bold">@</span>
//           </div>

//           <h2 className="text-text text-xl font-semibold">Verify your email</h2>

//           <p className="text-text-secondary mt-2 text-sm leading-6">
//             We sent a 6-digit verification code to
//           </p>

//           <p className="text-text mt-1 text-sm font-medium break-all">
//             {email}
//           </p>
//         </div>

//         {/* ======================================================
//             Form
//         ====================================================== */}

//         <form onSubmit={handleSubmit} className="mt-6">
//           <label
//             htmlFor="verificationCode"
//             className="text-text mb-2 block text-sm font-medium"
//           >
//             Verification Code
//           </label>

//           <input
//             ref={inputRef}
//             id="verificationCode"
//             name="verificationCode"
//             type="text"
//             inputMode="numeric"
//             autoComplete="one-time-code"
//             value={code}
//             onChange={handleChange}
//             placeholder="000000"
//             maxLength={6}
//             disabled={loading}
//             className="border-border bg-input-background text-text placeholder:text-muted focus:border-primary focus:ring-primary-light w-full rounded-lg border px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] transition outline-none placeholder:tracking-[0.5em] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
//           />

//           {/* ====================================================
//               Error
//           ==================================================== */}

//           {error && (
//             <p className="mt-2 text-center text-xs text-red-500">{error}</p>
//           )}

//           {/* ====================================================
//               Verify Button
//           ==================================================== */}

//           <button
//             type="submit"
//             disabled={loading || code.length !== 6}
//             className="bg-primary text-primary-foreground hover:bg-primary-dark mt-5 w-full rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? "Verifying..." : "Verify Email"}
//           </button>
//         </form>

//         {/* ======================================================
//             Resend
//         ====================================================== */}

//         <div className="mt-5 text-center">
//           <p className="text-text-secondary text-sm">
//             Didn't receive the code?
//           </p>

//           <button
//             type="button"
//             onClick={onResend}
//             disabled={loading || resendLoading}
//             className="text-primary hover:text-primary-dark mt-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {resendLoading ? "Sending..." : "Resend Code"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  const [resendSeconds, setResendSeconds] = useState(59);

  const inputRef = useRef(null);

  // ============================================================
  // Focus input + Reset timer when modal opens
  // ============================================================

  useEffect(() => {
    if (!open) return;

    setCode("");
    setResendSeconds(59);

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || resendSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [open, resendSeconds]);

  const handleResend = async () => {
    if (loading || resendLoading || resendSeconds > 0) {
      return;
    }

    await onResend?.();

    setResendSeconds(59);
  };

  const formattedSeconds = String(resendSeconds).padStart(2, "0");

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
  // Handle Code Change
  // ============================================================

  const handleChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setCode(value);
    }
  };

  // ============================================================
  // Submit Verification
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="border-border bg-background relative w-full max-w-md rounded-2xl border p-6 shadow-xl sm:p-8">
        {/* ======================================================
            Close
        ====================================================== */}

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="text-muted hover:bg-surface hover:text-text absolute top-4 right-4 rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* ======================================================
            Header
        ====================================================== */}

        <div className="text-center">
          <div className="bg-primary-light text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <span className="text-xl font-bold">@</span>
          </div>

          <h2 className="text-text text-xl font-semibold">Verify your email</h2>

          <p className="text-text-secondary mt-2 text-sm leading-6">
            We sent a 6-digit verification code to
          </p>

          <p className="text-text mt-1 text-sm font-medium break-all">
            {email
              ? `${email.slice(0, 3)}***${email.slice(email.indexOf("@"))}`
              : ""}
          </p>
        </div>

        {/* ======================================================
            Form
        ====================================================== */}

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="verificationCode"
            className="text-text mb-2 block text-sm font-medium"
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
            className="border-border bg-input-background text-text placeholder:text-muted focus:border-primary focus:ring-primary-light w-full rounded-lg border px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] transition outline-none placeholder:tracking-[0.5em] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="bg-primary text-primary-foreground hover:bg-primary-dark mt-5 w-full rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* ======================================================
            Resend
        ====================================================== */}

        <div className="mt-5 text-center">
          <p className="text-text-secondary text-sm">
            Didn't receive the code?
          </p>

          {resendSeconds > 0 ? (
            <p className="text-text-secondary mt-1 text-sm">
              Resend code in{" "}
              <span className="text-primary font-semibold">
                00:{formattedSeconds}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resendLoading}
              className="text-primary hover:text-primary-dark mt-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
