import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import {
  Package,
  Sparkles,
  Database,
  Search,
  ArrowRight,
  Code,
  Layers,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";
import { FirplakWordmark } from "@/components/firplak-wordmark";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-float delay-700" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-3xl animate-float delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full border-b border-foreground/10 backdrop-blur-md bg-background/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SAP Codes
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link
              href="/auth/login"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8 mb-16 text-[#23313F]">
          {/* Floating Icons */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="relative">
              <Package className="w-16 h-16 text-[#23313F] dark:text-[#FDD79A]" />
              <div className="absolute inset-0 bg-[#FDD79A]/20 blur-2xl rounded-full animate-pulse" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#23313F] via-[#3a4d5e] to-[#23313F] bg-clip-text text-transparent leading-tight animate-in slide-in-from-bottom-8 duration-700">
            Bienvenido a la App
            <br />
            de Códigos SAP
          </h1>

          {/* Subtitle */}
          <div className="text-lg md:text-xl text-[#083344] max-w-2xl mx-auto animate-in slide-in-from-bottom-10 duration-1000 leading-relaxed font-medium flex flex-wrap items-center justify-center gap-x-2">
            <span>Tu solución inteligente para gestionar códigos SAP con</span>
            <span className="text-[#324f5f] font-black underline decoration-[#324f5f]/30 decoration-2 underline-offset-4">tecnología moderna</span>
            <span>y el</span>
            <span className="text-[#324f5f] font-black underline decoration-[#324f5f]/30 decoration-2 underline-offset-4 flex items-center gap-1">
              diseño premium de <FirplakWordmark className="inline-flex text-[1.1em] translate-y-[0.05em]" aWidth="w-[0.8em]" aHeight="h-[0.8em]" /> Home
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom-12 duration-1200">
            <Link
              href="/auth/sign-up"
              className="group px-8 py-4 bg-[#324f5f] hover:bg-[#2a4351] text-white rounded-xl font-black text-lg hover:shadow-xl hover:scale-105 transition-all duration-400 flex items-center gap-3"
            >
              Comenzar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-[#324f5f]/10 text-[#324f5f] rounded-xl font-black text-lg hover:bg-[#324f5f]/5 transition-all duration-400"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 animate-in slide-in-from-bottom-14 duration-1500 text-[#23313F]">
          {/* Feature Card 1 */}
          <div className="group relative p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-[#23313F]/5 hover:border-[#FDD79A]/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(35,49,63,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDD79A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Database className="w-12 h-12 text-[#23313F] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-3 tracking-tight">Base de Datos Completa</h3>
            <p className="text-[#23313F]/70 dark:text-white/60 leading-relaxed font-medium text-sm">
              Acceso instantáneo a todos los códigos SAP organizados por familias y versiones.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="group relative p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-[#23313F]/5 hover:border-[#FDD79A]/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(35,49,63,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDD79A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Search className="w-12 h-12 text-[#23313F] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-3 tracking-tight">Búsqueda Inteligente</h3>
            <p className="text-[#23313F]/70 dark:text-white/60 leading-relaxed font-medium text-sm">
              Filtra y encuentra códigos por familia, versión, o número de artículo en segundos.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="group relative p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-[#23313F]/5 hover:border-[#FDD79A]/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(35,49,63,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDD79A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Layers className="w-12 h-12 text-[#23313F] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-3 tracking-tight">Gestión Organizada</h3>
            <p className="text-[#23313F]/70 dark:text-white/60 leading-relaxed font-medium text-sm">
              Interfaz intuitiva para administrar versiones y familias de productos.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="group relative p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-[#23313F]/5 hover:border-[#FDD79A]/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(35,49,63,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDD79A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="w-12 h-12 text-[#23313F] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-3 tracking-tight">Rendimiento Ultra Rápido</h3>
            <p className="text-[#23313F]/70 dark:text-white/60 leading-relaxed font-medium text-sm">
              Tecnología Next.js y Supabase para velocidad y confiabilidad máxima.
            </p>
          </div>

          {/* Feature Card 5 */}
          <div className="group relative p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-[#23313F]/5 hover:border-[#FDD79A]/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(35,49,63,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDD79A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield className="w-12 h-12 text-[#23313F] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-3 tracking-tight">Seguridad Robusta</h3>
            <p className="text-[#23313F]/70 dark:text-white/60 leading-relaxed font-medium text-sm">
              Autenticación segura y protección de datos con las mejores prácticas.
            </p>
          </div>

          {/* Feature Card 6 */}
          <div className="group relative p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-[#23313F]/5 hover:border-[#FDD79A]/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(35,49,63,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDD79A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <TrendingUp className="w-12 h-12 text-[#23313F] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-3 tracking-tight">Escalabilidad</h3>
            <p className="text-[#23313F]/70 dark:text-white/60 leading-relaxed font-medium text-sm">
              Diseñado para crecer con tus necesidades y manejar grandes volúmenes.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-16 animate-in slide-in-from-bottom-16 duration-1700">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-lg border border-foreground/10">
            <Code className="w-16 h-16 mx-auto mb-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a la plataforma que moderniza la gestión de códigos SAP
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Crear tu Cuenta Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-foreground/10 backdrop-blur-md bg-background/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 SAP Codes App. Powered by Next.js & Supabase</p>
        </div>
      </footer>
    </main>
  );
}
