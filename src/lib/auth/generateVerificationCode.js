import crypto from "crypto";

// =====================================================
// Generate verification code
// =====================================================

export function generateVerificationCode() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

// =====================================================
// Hash verification code
// =====================================================

export function hashVerificationCode(code) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}
