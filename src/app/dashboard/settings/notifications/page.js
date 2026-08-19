"use client";

import { ArrowLeft, Bell, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const notificationItems = [
{
key: "pendingApproval",
title: "Pending Approvals",
description: "Notify administrators when a new approval is waiting.",
},
{
key: "newRegistration",
title: "New User Registration",
description: "Notify administrators when a new user registers.",
},
{
key: "campaign",
title: "Campaign Notifications",
description: "Receive notifications related to campaign activity.",
},
{
key: "system",
title: "System Alerts",
description: "Receive important system and application alerts.",
},
];

export default function NotificationSettingsPage() {
const router = useRouter();

const [notifications, setNotifications] = useState({
pendingApproval: true,
newRegistration: true,
campaign: true,
system: true,
});

const toggle = (key) => {
setNotifications((previous) => ({
...previous,
[key]: !previous[key],
}));
};

const handleSave = () => {
toast.info("Notification settings API will be connected here.");
};

return ( <div className="mx-auto w-full max-w-5xl"> <div className="mb-6 flex items-center gap-3">
<button
type="button"
onClick={() => router.back()}
className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg border"
> <ArrowLeft size={19} /> </button>

    <div>
      <h1 className="text-text text-2xl font-bold">
        Notifications
      </h1>

      <p className="text-text-secondary mt-1 text-sm">
        Configure administrator notification preferences.
      </p>
    </div>
  </div>

  <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
    <div className="border-border flex items-center gap-3 border-b p-6">
      <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
        <Bell size={20} />
      </div>

      <div>
        <h2 className="text-text text-base font-semibold">
          Notification Preferences
        </h2>

        <p className="text-text-secondary mt-0.5 text-xs">
          Choose which events should generate notifications.
        </p>
      </div>
    </div>

    <div className="divide-border divide-y">
      {notificationItems.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between gap-4 p-6"
        >
          <div>
            <p className="text-text text-sm font-semibold">
              {item.title}
            </p>

            <p className="text-text-secondary mt-1 text-xs leading-5">
              {item.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggle(item.key)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              notifications[item.key]
                ? "bg-primary"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                notifications[item.key]
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>

    <div className="border-border flex justify-end border-t p-6">
      <button
        type="button"
        onClick={handleSave}
        className="bg-primary text-primary-foreground hover:bg-primary-dark flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
      >
        <Save size={17} />
        Save Preferences
      </button>
    </div>
  </div>
</div>

);
}
