"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AccountSettingsPage() {
const router = useRouter();

const [form, setForm] = useState({
name: "",
email: "",
contactNumber: "",
});

useEffect(() => {
try {
const authUser = localStorage.getItem("authUser");

  if (!authUser) return;

  const user = JSON.parse(authUser);

  setForm({
    name: user?.name || "",
    email: user?.email || "",
    contactNumber: user?.contactNumber || "",
  });
} catch (error) {
  console.error("Load account settings error:", error);
}

}, []);

const handleChange = (event) => {
const { name, value } = event.target;

setForm((previous) => ({
  ...previous,
  [name]: value,
}));

};

const handleSubmit = (event) => {
event.preventDefault();

```
toast.info("Account update API will be connected here.");
```

};

return ( <div className="mx-auto w-full max-w-5xl"> <div className="mb-6 flex items-center gap-3">
<button
type="button"
onClick={() => router.back()}
className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition"
> <ArrowLeft size={19} /> </button>

```
    <div>
      <h1 className="text-text text-2xl font-bold">
        Account Settings
      </h1>

      <p className="text-text-secondary mt-1 text-sm">
        Manage your administrator account information.
      </p>
    </div>
  </div>

  <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
    <div className="border-border flex items-center gap-3 border-b p-6">
      <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
        <User size={20} />
      </div>

      <div>
        <h2 className="text-text text-base font-semibold">
          Profile Information
        </h2>

        <p className="text-text-secondary mt-0.5 text-xs">
          Update your administrator profile information.
        </p>
      </div>
    </div>

    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <FormField
          label="Contact Number"
          name="contactNumber"
          value={form.contactNumber}
          onChange={handleChange}
        />

        <div className="sm:col-span-2">
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>

      <div className="border-border mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="border-border text-text hover:bg-surface rounded-lg border px-5 py-3 text-sm font-semibold transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-dark flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>
    </form>
  </div>

  <button
    type="button"
    onClick={() => router.push("/dashboard/settings/security")}
    className="bg-background border-border group mt-5 flex w-full items-center gap-4 rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md"
  >
    <div className="bg-primary-light text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
      <Lock size={20} />
    </div>

    <div className="flex-1">
      <h3 className="text-text text-sm font-semibold">
        Change Password
      </h3>

      <p className="text-text-secondary mt-1 text-xs">
        Update your administrator account password.
      </p>
    </div>
  </button>
</div>

);
}

function FormField({
label,
name,
value,
onChange,
type = "text",
disabled = false,
}) {
return ( <div> <label className="text-text mb-2 block text-sm font-medium">
{label} </label>

  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className="bg-input-background border-border text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary-light w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
  />
</div>

);
}
