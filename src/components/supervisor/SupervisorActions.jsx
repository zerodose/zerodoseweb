"use client";

import { Users, UserPlus, Syringe, ShieldAlert } from "lucide-react";
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
      href: "/supervisor/teams",
      label: "Teams",
      description: "Manage your assigned teams",
      icon: Users,
    },
    {
      href: "/supervisor/zerodose",
      label: "Zerodose List",
      description: "View and manage zerodose records",
      icon: Syringe,
    },
    {
      href: "/supervisor/pendingapprovals",
      label: "Pending Approvals",
      description: "View and manage pending approvals",
      icon: ShieldAlert,
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
