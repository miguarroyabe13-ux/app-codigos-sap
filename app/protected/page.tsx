import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ColorGroupsTable } from "@/components/colors-table";
import {
  Layers,
  Pencil,
  Activity,
  LogOut,
  User,
  Settings,
  ChevronRight,
} from "lucide-react";
import { FirplakWordmark } from "@/components/firplak-wordmark";
import { Suspense } from "react";
import { AnimatedLogo } from "@/components/animated-logo";
import Link from "next/link";

async function UserBadge() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Simulating the user ID and name from the image
  const userId = "5435454";
  const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Miguel Angel Arroyave Gomez';
  const department = "Ingenieria";

  return (
    <div className="flex flex-col items-center gap-2 animate-in fade-in duration-1000 slide-in-from-bottom-4">
      <h2 className="text-4xl font-black text-[#23313F] dark:text-white mb-1 tracking-tight">
        {fullName}
      </h2>
      <div className="flex items-center gap-3">
        <div className="h-0.5 w-6 bg-[#FDD79A]" />
        <span className="text-[#23313F]/60 font-black text-xl uppercase tracking-[0.2em]">
          {department}
        </span>
        <div className="h-0.5 w-6 bg-[#FDD79A]" />
      </div>
      <Link href="/auth/login" className="text-[#23313F]/40 hover:text-[#23313F] text-xs uppercase tracking-widest font-black hover:underline mt-6 transition-all">
        Cambiar usuario
      </Link>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start min-h-screen bg-[#F1F4F9] p-6 md:p-8 relative overflow-hidden">
      {/* Top Logo & Branding */}
      <div className="flex flex-col items-center mb-10 relative">
        <AnimatedLogo size="lg" showSparkles={false} />
        <FirplakWordmark
          className="mt-6 text-4xl md:text-6xl text-[#083344]"
        />
        {/* Proportional SAP Status Badge - Vibrant Pastel Green */}
        <div className="mt-4 bg-[#81C784] text-[0.6rem] md:text-[0.7rem] text-white px-6 py-2 rounded-full font-black tracking-[0.2em] shadow-sm flex items-center gap-2 animate-in fade-in zoom-in duration-500">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
          CONECTADO SAP
        </div>
      </div>

      {/* User Info Section (Image Match - Removed ID Badge) */}
      <div className="flex flex-col items-center mb-10 text-center">
        {/* User Name */}
        <div className="mb-1">
          <Suspense fallback={null}>
            <span className="text-2xl md:text-3xl font-medium text-[#64748b]">
              Miguel Angel Arroyave Gomez
            </span>
          </Suspense>
        </div>

        {/* Department */}
        <div className="mb-4">
          <span className="text-xl md:text-2xl font-bold text-[#324f5f]">
            Ingenieria
          </span>
        </div>

        {/* Change User Link */}
        <button className="text-[#3499CD] hover:underline text-sm font-medium">
          Cambiar usuario
        </button>
      </div>

      {/* Main Action Cards (Image Match) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl animate-in fade-in duration-1000 slide-in-from-bottom-8 mb-10">
        {/* CREACIÓN */}
        <Link
          href="/protected/creacion"
          className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[1.5rem] bg-[#324f5f] hover:bg-[#2a4351] transition-all duration-500 shadow-lg text-center"
        >
          <Layers className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-500" />
          <span className="text-white font-black text-lg tracking-widest uppercase">
            CREACIÓN
          </span>
        </Link>

        {/* MODIFICACIÓN */}
        <Link
          href="/protected/modificacion"
          className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[1.5rem] bg-[#324f5f] hover:bg-[#2a4351] transition-all duration-500 shadow-lg text-center"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Pencil className="w-8 h-8 text-white fill-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-white font-black text-lg tracking-widest uppercase">
            MODIFICACIÓN
          </span>
        </Link>

        {/* ESTADO */}
        <Link
          href="/protected/estado"
          className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[1.5rem] bg-[#324f5f] hover:bg-[#2a4351] transition-all duration-500 shadow-lg text-center"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Activity className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-white font-black text-lg tracking-widest uppercase">
            ESTADO
          </span>
        </Link>
      </div>
    </div>
  );
}
