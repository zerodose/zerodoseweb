"use client";

import { useState } from "react";
import PageHeaderWithDesignation from "@/components/ui/PageHeaderWithDesignation";

export default function OtherStaffLayout({ children }) {
  const [user] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const authUser = localStorage.getItem("authUser");

      if (!authUser) {
        return null;
      }

      return JSON.parse(authUser);
    } catch (error) {
      console.error("Invalid authUser:", error);
      return null;
    }
  });

  const designation = user?.designation || "otherstaff";

  const ucCode = user?.unionCouncil?.code || user?.unionCouncilId?.code || "";

  const ucName = user?.unionCouncil?.name || user?.unionCouncilId?.name || "";

  return (
    <div className="min-h-full p-4 md:p-6">

      <PageHeaderWithDesignation
        name={user?.name}
        designation={designation}
        ucCode={ucCode}
        ucName={ucName}
      />



      {children}
    </div>
  );
}
