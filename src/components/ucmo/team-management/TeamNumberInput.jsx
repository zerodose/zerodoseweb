"use client";

export default function TeamNumberInput({
  value,
  onChange,
  placeholder = "Enter team number",
}) {
  return (
    <input
      type="number"
      min="1"
      value={value === "-" ? "" : value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="border-border bg-background text-text focus:border-primary focus:ring-primary-light w-full [appearance:textfield] rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}
