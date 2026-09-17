"use client";

import { Syringe, UsersRound } from "lucide-react";
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
      href: "/ucmo/staff-management",
      label: "Staff Transfer",
      description: "Transfer supervisors",
      icon: UsersRound,
    },
    {
      href: "/ucmo/staff-details",
      label: "Staff Details",
      description: "View your staff details",
      icon: UsersRound,
    },
        {
      href: "/ucmo/zerodose",
      label: "Zerodose List",
      description: "View and manage zerodose records",
      icon: Syringe,
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
