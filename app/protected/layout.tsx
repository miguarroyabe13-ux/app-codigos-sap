import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-[#F1F4F9]">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Simple Top Bar (Removed Template Header) */}
        <nav className="w-full flex justify-center border-b border-[#083344]/5 h-14 bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div className="w-full max-w-6xl flex justify-end items-center px-8">
            <div className="flex items-center gap-6">
              <Suspense>
                <AuthButton />
              </Suspense>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <div className="flex-1 w-full">
          {children}
        </div>

        {/* Minimal Footer */}
        <footer className="w-full flex items-center justify-center border-t border-[#083344]/5 text-center text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#083344]/20 py-8">
          <span>© FIRPLAK HOME - 2024</span>
        </footer>
      </div>
    </main>
  );
}
