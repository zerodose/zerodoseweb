"use client";

import { Users, UserPlus, Syringe } from "lucide-react";
import ActionLinkButton from "../admin/ui/ActionLinkButton";

export default function SupervisorActions() {
  const actions = [
    {
      href: "/supervisor/addworker",
      label: "Add Workers",
      icon: UserPlus,
    },
    {
      href: "/supervisor/workers",
      label: "Workers",
      icon: Users,
    },
    {
      href: "/supervisor/zerodoses",
      label: "Zerodose List",
      icon: Syringe,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => (
        <ActionLinkButton
          key={action.href}
          href={action.href}
          label={action.label}
          icon={action.icon}
        />
      ))}
    </div>
  );
}
