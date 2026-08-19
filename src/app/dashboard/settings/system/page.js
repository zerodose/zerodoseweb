"use client";

import { ArrowLeft, Globe, Save, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SystemSettingsPage() {
const router = useRouter();

const [form, setForm] = useState({
applicationName: "Zerodose",
timezone: "Asia/Karachi",
dateFormat: "DD/MM/YYYY",
defaultPageSize: "10",
});

const handleChange = (event) => {
const { name, value } = event.target;

setForm((previous) => ({
  ...previous,
  [name]: value,
}));

};

const handleSave = () => {
toast.info("System settings API will be connected here.");
};

return ( <div className="mx-auto w-full max-w-5xl"> <Header
     router={router}
     title="System Settings"
     description="Manage general Zerodose system configuration."
   />

  <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
    <div className="border-border flex items-center gap-3 border-b p-6">
      <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
        <Settings size={20} />
      </div>

      <div>
        <h2 className="text-text text-base font-semibold">
          General Configuration
        </h2>

        <p className="text-text-secondary mt-0.5 text-xs">
          Configure the basic behavior and display of the application.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
      <Field
        label="Application Name"
        name="applicationName"
        value={form.applicationName}
        onChange={handleChange}
      />

      <Field
        label="Timezone"
        name="timezone"
        value={form.timezone}
        onChange={handleChange}
      />

      <SelectField
        label="Date Format"
        name="dateFormat"
        value={form.dateFormat}
        onChange={handleChange}
        options={[
          ["DD/MM/YYYY", "DD/MM/YYYY"],
          ["MM/DD/YYYY", "MM/DD/YYYY"],
          ["YYYY-MM-DD", "YYYY-MM-DD"],
        ]}
      />

      <SelectField
        label="Default Page Size"
        name="defaultPageSize"
        value={form.defaultPageSize}
        onChange={handleChange}
        options={[
          ["10", "10 records"],
          ["25", "25 records"],
          ["50", "50 records"],
          ["100", "100 records"],
        ]}
      />
    </div>

    <div className="border-border flex justify-end border-t p-6">
      <button
        type="button"
        onClick={handleSave}
        className="bg-primary text-primary-foreground hover:bg-primary-dark flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
      >
        <Save size={17} />
        Save Settings
      </button>
    </div>
  </div>

  <div className="bg-surface border-border mt-5 flex items-start gap-3 rounded-2xl border p-5">
    <Globe className="text-primary mt-0.5 shrink-0" size={19} />

    <div>
      <p className="text-text text-sm font-semibold">
        Current Timezone
      </p>

      <p className="text-text-secondary mt-1 text-xs">
        Asia/Karachi is currently configured for the Zerodose system.
      </p>
    </div>
  </div>
</div>

);
}

function Header({ router, title, description }) {
return ( <div className="mb-6 flex items-center gap-3">
<button
type="button"
onClick={() => router.back()}
className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg border"
> <ArrowLeft size={19} /> </button>

  <div>
    <h1 className="text-text text-2xl font-bold">{title}</h1>
    <p className="text-text-secondary mt-1 text-sm">{description}</p>
  </div>
</div>

);
}

function Field({ label, name, value, onChange }) {
return ( <div> <label className="text-text mb-2 block text-sm font-medium">
{label} </label>

  <input
    name={name}
    value={value}
    onChange={onChange}
    className="bg-input-background border-border text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
  />
</div>

);
}

function SelectField({ label, name, value, onChange, options }) {
return ( <div> <label className="text-text mb-2 block text-sm font-medium">
{label} </label>

  <select
    name={name}
    value={value}
    onChange={onChange}
    className="bg-input-background border-border text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
  >
    {options.map(([optionValue, optionLabel]) => (
      <option key={optionValue} value={optionValue}>
        {optionLabel}
      </option>
    ))}
  </select>
</div>

);
}
