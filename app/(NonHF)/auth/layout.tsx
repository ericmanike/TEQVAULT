import React from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login/Signup - TEQVAULT",
  description: "Sign in or create a free account with TEQVAULT. Start your mobile data agent business or buy bundles directly.",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] w-full flex-col items-center justify-start sm:justify-center bg-[#f4f6f8] px-4 py-8 sm:py-12 overflow-y-auto font-sans antialiased text-slate-800">
      <div className="my-auto w-full max-w-[430px] flex flex-col items-center py-2">
        {/* Website Name Header */}
        <div className="mb-6 flex flex-col items-center justify-center">
          <Link
            href="/"
            className="group cursor-pointer select-none"
          >
            <span className="text-2xl font-extrabold text-gray-800 tracking-tight logo">
              TEQVAULT
            </span>
          </Link>
        </div>

        <div className="w-full px-2 sm:px-4">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-3.5 text-center text-sm">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-slate-400" strokeWidth={2} />
            Need help? Watch how to log in
          </Link>
          <span className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} TEQVAULT
          </span>
        </div>
      </div>
    </div>
  );
}

