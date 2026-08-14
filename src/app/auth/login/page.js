"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, House } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

function Page() {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Go to Home */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-text-secondary hover:text-primary hover:bg-primary-light absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
      >
        <ArrowLeft size={18} />
        <House size={17} />
        <span>Home</span>
      </button>

      <LoginForm />
    </div>
  );
}

export default Page;
