"use client";

import { UsersRound } from "lucide-react";
import ActionLinkButton from "../admin/ui/ActionLinkButton";

export default function UCMOActions() {
  const actions = [
    {
      href: "/ucmo/team-management",
      label: "Teams Management",
      description: "Manage supervisor teams and workers",
      icon: UsersRound,
    },
    {
      href: "/ucmo/supervisorDetail",
      label: "Supervisor Details",
      description: "View your supervisor details",
      icon: UsersRound,
    },
    {
      href: "/ucmo/staff-management",
      label: "Staff Transfer",
      description: "Transfer supervisors",
      icon: UsersRound,
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
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
