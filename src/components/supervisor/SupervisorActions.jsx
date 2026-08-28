"use client";

import { Users, UserPlus, Syringe } from "lucide-react";
import ActionLinkButton from "../admin/ui/ActionLinkButton";

export default function SupervisorActions() {
  const actions = [
    {
      href: "/supervisor/addworker",
      label: "Add Workers",
      description: "Add new workers to your team",
      icon: UserPlus,
    },
    {
      href: "/supervisor/workers",
      label: "Workers",
      description: "Manage your assigned workers",
      icon: Users,
    },
    {
      href: "/supervisor/zerodoses",
      label: "Zerodose List",
      description: "View and manage zerodose records",
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
          description={action.description}
          icon={action.icon}
        />
      ))}
    </div>
  );
}
