// ============================================================
// Pending Password Resets
// ============================================================

const pendingPasswordResets = new Map();

// ============================================================
// Set
// ============================================================

export function setPendingPasswordReset(identifier, data) {
  pendingPasswordResets.set(identifier, data);
}

// ============================================================
// Get
// ============================================================

export function getPendingPasswordReset(identifier) {
  return pendingPasswordResets.get(identifier);
}

// ============================================================
// Find By Reset Token
// ============================================================

export function findPendingPasswordResetByToken(resetToken) {
  for (const [identifier, data] of pendingPasswordResets.entries()) {
    if (data?.resetToken === resetToken) {
      return {
        identifier,
        data,
      };
    }
  }

  return null;
}

// ============================================================
// Delete
// ============================================================

export function deletePendingPasswordReset(identifier) {
  pendingPasswordResets.delete(identifier);
}
