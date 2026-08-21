"use client";

import { ArrowLeft, Save, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const approvalDesignations = [
  {
    value: "ucmo",
    label: "UCMO",
  },
  {
    value: "supervisor",
    label: "Supervisor",
  },
  {
    value: "vaccinator",
    label: "Vaccinator",
  },
  {
    value: "otherstaff",
    label: "Other Staff",
  },
  {
    value: "townFP",
    label: "Town Focal Person",
  },
  {
    value: "districtfp",
    label: "District Focal Person",
  },
];

export default function UserSettingsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState({
    emailVerification: true,
    defaultActive: true,
    approvals: {
      ucmo: true,
      supervisor: true,
      vaccinator: true,
      otherstaff: true,
      townFP: true,
      districtfp: true,
    },
  });

  const toggle = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const toggleApproval = (key) => {
    setSettings((previous) => ({
      ...previous,
      approvals: {
        ...previous.approvals,
        [key]: !previous.approvals[key],
      },
    }));
  };

  const handleSave = () => {
    toast.info("User settings API will be connected here.");
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {" "}
      <Header
        router={router}
        title="User Management"
        description="Configure user registration and approval preferences."
      />
      <div className="space-y-5">
        <section className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
          <SectionHeader
            icon={Users}
            title="Registration Settings"
            description="Configure how newly registered users are handled."
          />

          <div className="divide-border divide-y">
            <ToggleRow
              title="Email Verification"
              description="Require users to verify their email before account creation."
              checked={settings.emailVerification}
              onChange={() => toggle("emailVerification")}
            />

            <ToggleRow
              title="Activate New Users"
              description="Newly created accounts are active by default."
              checked={settings.defaultActive}
              onChange={() => toggle("defaultActive")}
            />
          </div>
        </section>

        <section className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
          <SectionHeader
            icon={Users}
            title="Approval Requirements"
            description="Select which designations require administrator approval."
          />

          <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
            {approvalDesignations.map((item) => (
              <ToggleRow
                key={item.value}
                title={item.label}
                description="Require approval before account activation."
                checked={settings.approvals[item.value]}
                onChange={() => toggleApproval(item.value)}
                compact
              />
            ))}
          </div>
        </section>

        <ActionButtons router={router} onSave={handleSave} />
      </div>
    </div>
  );
}

function Header({ router, title, description }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg border transition"
      >
        {" "}
        <ArrowLeft size={19} />{" "}
      </button>

      <div>
        <h1 className="text-text text-2xl font-bold">{title}</h1>
        <p className="text-text-secondary mt-1 text-sm">{description}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="border-border flex items-center gap-3 border-b p-6">
      {" "}
      <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
        {" "}
        <Icon size={20} />{" "}
      </div>
      <div>
        <h2 className="text-text text-base font-semibold">{title}</h2>
        <p className="text-text-secondary mt-0.5 text-xs">{description}</p>
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, compact = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${compact ? "border-border rounded-xl border p-4" : "p-6"}`}
    >
      {" "}
      <div>
        {" "}
        <p className="text-text text-sm font-semibold">{title}</p>{" "}
        <p className="text-text-secondary mt-1 text-xs leading-5">
          {description}{" "}
        </p>{" "}
      </div>
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ActionButtons({ router, onSave }) {
  return (
    <div className="border-border flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => router.back()}
        className="border-border text-text hover:bg-surface rounded-lg border px-5 py-3 text-sm font-semibold"
      >
        Cancel{" "}
      </button>

      <button
        type="button"
        onClick={onSave}
        className="bg-primary text-primary-foreground hover:bg-primary-dark flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
      >
        <Save size={17} />
        Save Settings
      </button>
    </div>
  );
}
