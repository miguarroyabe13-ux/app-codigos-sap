import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
