"use client";

import {
AlertTriangle,
ArrowLeft,
Database,
Download,
FileSpreadsheet,
FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DataManagementPage() {
const router = useRouter();

const handleAction = (message) => {
toast.info(message);
};

return ( <div className="mx-auto w-full max-w-5xl"> <div className="mb-6 flex items-center gap-3">
<button
type="button"
onClick={() => router.back()}
className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg border"
> <ArrowLeft size={19} /> </button>

    <div>
      <h1 className="text-text text-2xl font-bold">
        Data Management
      </h1>

      <p className="text-text-secondary mt-1 text-sm">
        Manage system data exports and database operations.
      </p>
    </div>
  </div>

  <div className="space-y-5">
    <section className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center gap-3 border-b p-6">
        <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <Download size={20} />
        </div>

        <div>
          <h2 className="text-text text-base font-semibold">
            Export Data
          </h2>

          <p className="text-text-secondary mt-0.5 text-xs">
            Export important system records for reporting or backup.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <ExportCard
          icon={Database}
          title="Users"
          description="Export registered user records."
          onClick={() =>
            handleAction("Users export will be connected here.")
          }
        />

        <ExportCard
          icon={FileSpreadsheet}
          title="Zerodose"
          description="Export Zerodose campaign records."
          onClick={() =>
            handleAction("Zerodose export will be connected here.")
          }
        />

        <ExportCard
          icon={FileText}
          title="Campaigns"
          description="Export campaign information."
          onClick={() =>
            handleAction("Campaign export will be connected here.")
          }
        />

        <ExportCard
          icon={FileSpreadsheet}
          title="Locations"
          description="Export districts, towns and Union Councils."
          onClick={() =>
            handleAction("Location export will be connected here.")
          }
        />
      </div>
    </section>

    <section className="border-red-200 bg-red-50 rounded-2xl border p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-red-500">
          <AlertTriangle size={20} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-red-700">
            Advanced Data Operations
          </h2>

          <p className="mt-1 text-xs leading-5 text-red-600">
            Destructive data operations should only be enabled after
            proper backup and administrator confirmation.
          </p>
        </div>
      </div>
    </section>
  </div>
</div>

);
}

function ExportCard({
icon: Icon,
title,
description,
onClick,
}) {
return ( <button
   type="button"
   onClick={onClick}
   className="bg-surface border-border group flex items-center gap-4 rounded-xl border p-4 text-left transition hover:shadow-sm"
 > <div className="bg-background text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border"> <Icon size={19} /> </div>

  <div className="min-w-0 flex-1">
    <h3 className="text-text text-sm font-semibold">
      {title}
    </h3>

    <p className="text-text-secondary mt-1 text-xs">
      {description}
    </p>
  </div>

  <Download
    size={17}
    className="text-text-secondary shrink-0 transition group-hover:text-primary"
  />
</button>

);
}
