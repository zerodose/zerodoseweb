import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-surface flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="bg-background border-border overflow-hidden rounded-3xl border shadow-sm">
          <div className="grid md:grid-cols-2">
            {/* Left Content */}
            {/* Left Content */}
            <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
              <div className="mb-7 flex justify-center md:justify-start">
                <Image
                  src="/images/logo.png"
                  alt="Zerodose Logo"
                  width={80}
                  height={80}
                  className="h-auto w-[100px] object-contain"
                />
              </div>

              <div className="mb-4 flex items-center gap-2">
                {/* <span className="bg-primary h-1.5 w-8 rounded-full"></span> */}
                <span className="text-primary text-sm font-semibold tracking-wide">
                  ZERODOSE
                </span>
              </div>

              <h1 className="text-text max-w-md text-3xl leading-[1.15] font-bold tracking-tight md:text-4xl">
                Centralized
                <span className="text-primary block">Management System</span>
              </h1>

              <p className="text-text-secondary mt-5 max-w-md text-base leading-7 md:text-lg">
                A simple and centralized platform to manage, monitor, and
                organize Zerodose data efficiently.
              </p>

              <div className="mt-8">
                <Link
                  href="auth/login"
                  className="bg-primary hover:bg-primary-dark inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  Login
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="bg-surface-blue hidden items-center justify-center p-12 md:flex">
              <div className="w-full max-w-sm">
                <div className="bg-background border-border rounded-2xl border p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Dashboard</p>

                      <h2 className="text-text mt-1 text-xl font-bold">
                        Management Overview
                      </h2>
                    </div>

                    <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-xl">
                      <ShieldCheck className="text-primary h-5 w-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-text-secondary text-xs">Campaigns</p>
                      <p className="text-text mt-1 text-2xl font-bold">--</p>
                    </div>

                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-text-secondary text-xs">Teams</p>
                      <p className="text-text mt-1 text-2xl font-bold">--</p>
                    </div>

                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-text-secondary text-xs">Supervisors</p>
                      <p className="text-text mt-1 text-2xl font-bold">--</p>
                    </div>

                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-text-secondary text-xs">Zerodose</p>
                      <p className="text-text mt-1 text-2xl font-bold">--</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-text-secondary mt-6 text-center text-sm">
          © {new Date().getFullYear()} ZeroDose Management System
        </p>
      </div>
    </main>
  );
}
