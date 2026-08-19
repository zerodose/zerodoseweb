"use client";

import { User } from "lucide-react";
import PageHeader from "@/components/user/PageHeader";

export default function WorkerHeader({
  name = "Worker",
  teamNumber,
  supervisorCode,
}) {
  const subtitleParts = [];

  if (teamNumber !== undefined && teamNumber !== null) {
    subtitleParts.push(`Team No. ${teamNumber}`);
  }

  if (supervisorCode) {
    subtitleParts.push(`Supervisor Code: ${supervisorCode}`);
  }

  return (
    <PageHeader
      title={name}
      subtitle={
        subtitleParts.length > 0
          ? subtitleParts.join(" • ")
          : "Manage your team's Zerodose"
      }
    />
  );
}
