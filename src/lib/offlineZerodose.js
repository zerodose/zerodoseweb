import { createZerodose } from "@/api/zerodoseApi";

const STORAGE_KEY = "offlineZerodose";

export const saveOfflineZerodose = (data) => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  existing.push({
    ...data,
    offlineId: crypto.randomUUID(),
    savedAt: Date.now(),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const syncOfflineZerodose = async () => {
  if (!navigator.onLine) {
    return;
  }

  const pending = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  if (!pending.length) {
    return;
  }

  const remaining = [];

  for (const item of pending) {
    try {
      const { offlineId, savedAt, ...payload } = item;

      await createZerodose(payload);
    } catch (error) {
      console.error("Offline Zerodose sync failed:", error);

      remaining.push(item);
    }
  }

  if (remaining.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};
