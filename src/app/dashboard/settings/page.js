"use client";

import {
Bell,
ChevronRight,
Database,
Lock,
Settings,
Shield,
SlidersHorizontal,
User,
Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
const router = useRouter();

const settings = [
{
title: "Account Settings",
description: "Manage your administrator account information.",
icon: User,
href: "/dashboard/settings/account",
},
{
title: "User Management",
description: "Configure user-related settings and defaults.",
icon: Users,
href: "/dashboard/settings/users",
},
{
title: "System Settings",
description: "Manage general Zerodose system configuration.",
icon: SlidersHorizontal,
href: "/dashboard/settings/system",
},
{
title: "Security",
description: "Manage password, sessions, and security preferences.",
icon: Shield,
href: "/dashboard/settings/security",
},
{
title: "Notifications",
description: "Configure system and account notification preferences.",
icon: Bell,
href: "/dashboard/settings/notifications",
},
{
title: "Data Management",
description: "Manage system data, exports, and future backup options.",
icon: Database,
href: "/dashboard/settings/data",
},
];

return ( <div className="mx-auto w-full max-w-7xl">
{/* ============================================================
Header
============================================================ */}

  <div className="mb-6">
    <div className="flex items-start gap-3">
      <div className="bg-primary-light text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Settings size={22} />
      </div>

      <div>
        <h1 className="text-text text-2xl font-bold">
          Settings
        </h1>

        <p className="text-text-secondary mt-1 text-sm">
          Manage Zerodose administration and system preferences.
        </p>
      </div>
    </div>
  </div>

  {/* ============================================================
      Settings Cards
  ============================================================ */}

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {settings.map((item) => {
      const Icon = item.icon;

      return (
        <button
          key={item.title}
          type="button"
          onClick={() => router.push(item.href)}
          className="bg-background border-border group flex w-full items-center gap-4 rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Icon */}

          <div className="bg-primary-light text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon size={21} />
          </div>

          {/* Content */}

          <div className="min-w-0 flex-1">
            <h2 className="text-text text-sm font-semibold">
              {item.title}
            </h2>

            <p className="text-text-secondary mt-1 text-xs leading-5">
              {item.description}
            </p>
          </div>

          {/* Arrow */}

          <ChevronRight
            size={19}
            className="text-text-secondary shrink-0 transition group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </button>
      );
    })}
  </div>

  {/* ============================================================
      Security Notice
  ============================================================ */}

  <div className="bg-surface border-border mt-6 flex items-start gap-3 rounded-2xl border p-5">
    <div className="bg-background text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
      <Lock size={18} />
    </div>

    <div>
      <h3 className="text-text text-sm font-semibold">
        Administration Settings
      </h3>

      <p className="text-text-secondary mt-1 text-xs leading-5">
        Some settings may affect the entire Zerodose system.
        Only make changes when you are sure about their impact.
      </p>
    </div>
  </div>
</div>

);
}
