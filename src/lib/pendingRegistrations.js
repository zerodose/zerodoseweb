// src/lib/pendingRegistrations.js

const pendingRegistrations = new Map();

export function setPendingRegistration(email, data) {
    pendingRegistrations.set(email, {
        ...data,
        createdAt: Date.now(),
    });
}

export function getPendingRegistration(email) {
    return pendingRegistrations.get(email);
}

export function deletePendingRegistration(email) {
    pendingRegistrations.delete(email);
}

export function hasPendingRegistration(email) {
    return pendingRegistrations.has(email);
}

// 15 minutes ke baad automatically remove
setInterval(() => {
    const now = Date.now();
    const expiry = 15 * 60 * 1000;

    for (const [email, registration] of pendingRegistrations.entries()) {
        if (now - registration.createdAt > expiry) {
            pendingRegistrations.delete(email);
        }
    }
}, 60 * 1000);