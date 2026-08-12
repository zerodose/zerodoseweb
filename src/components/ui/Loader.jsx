"use client";

export default function Loader({ text = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-xs">
      <div className="flex min-w-[240px] flex-col items-center rounded-2xl bg-background px-8 py-7 shadow-xl">
        
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-border" />

          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary" />
        </div>

        <p className="mt-4 text-sm font-medium text-text">
          {text}
        </p>

      </div>
    </div>
  );
}
