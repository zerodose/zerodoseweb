"use client";

import { ArrowLeft, Eye, EyeOff, Lock, Save, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
const router = useRouter();

const [showPassword, setShowPassword] = useState({
current: false,
newPassword: false,
confirm: false,
});

const [form, setForm] = useState({
currentPassword: "",
newPassword: "",
confirmPassword: "",
});

const handleChange = (event) => {
const { name, value } = event.target;

setForm((previous) => ({
  ...previous,
  [name]: value,
}));

};

const handleSubmit = (event) => {
event.preventDefault();

if (form.newPassword !== form.confirmPassword) {
  toast.error("New passwords do not match.");
  return;
}

if (form.newPassword.length < 6) {
  toast.error("New password must be at least 6 characters.");
  return;
}

toast.info("Change password API will be connected here.");

};

return ( <div className="mx-auto w-full max-w-5xl"> <div className="mb-6 flex items-center gap-3">
<button
type="button"
onClick={() => router.back()}
className="border-border bg-background text-text hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg border"
> <ArrowLeft size={19} /> </button>

    <div>
      <h1 className="text-text text-2xl font-bold">
        Security
      </h1>

      <p className="text-text-secondary mt-1 text-sm">
        Manage your password and account security.
      </p>
    </div>
  </div>

  <div className="space-y-5">
    <section className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center gap-3 border-b p-6">
        <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <Lock size={20} />
        </div>

        <div>
          <h2 className="text-text text-base font-semibold">
            Change Password
          </h2>

          <p className="text-text-secondary mt-0.5 text-xs">
            Update the password used to access the admin panel.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-5">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            show={showPassword.current}
            onToggle={() =>
              setShowPassword((previous) => ({
                ...previous,
                current: !previous.current,
              }))
            }
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            show={showPassword.newPassword}
            onToggle={() =>
              setShowPassword((previous) => ({
                ...previous,
                newPassword: !previous.newPassword,
              }))
            }
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            show={showPassword.confirm}
            onToggle={() =>
              setShowPassword((previous) => ({
                ...previous,
                confirm: !previous.confirm,
              }))
            }
          />
        </div>

        <div className="border-border mt-6 flex justify-end border-t pt-6">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary-dark flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
          >
            <Save size={17} />
            Update Password
          </button>
        </div>
      </form>
    </section>

    <section className="bg-surface border-border flex items-start gap-3 rounded-2xl border p-5">
      <Shield className="text-primary mt-0.5 shrink-0" size={19} />

      <div>
        <p className="text-text text-sm font-semibold">
          Session Security
        </p>

        <p className="text-text-secondary mt-1 text-xs leading-5">
          Administrator sessions are automatically expired according
          to the application's configured session duration.
        </p>
      </div>
    </section>
  </div>
</div>

);
}

function PasswordField({
label,
name,
value,
onChange,
show,
onToggle,
}) {
return ( <div> <label className="text-text mb-2 block text-sm font-medium">
{label} </label>

  <div className="relative">
    <input
      type={show ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      className="bg-input-background border-border text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none focus:ring-2"
    />

    <button
      type="button"
      onClick={onToggle}
      className="text-text-secondary hover:text-text absolute right-3 top-1/2 -translate-y-1/2"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

);
}
