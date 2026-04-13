"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatedLogo } from "@/components/animated-logo";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Animated Logo */}
      <AnimatedLogo size="md" showSparkles={false} />

      {/* Brand Name */}
      <div className="text-center animate-in slide-in-from-bottom-4 duration-700 -mt-2">
        <h1 className="text-2xl font-bold text-[#1a4a52] dark:text-[#2d7a87] tracking-tight">
          FIRPLAK
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sistema de Códigos SAP
        </p>
      </div>

      {/* Login Card */}
      <Card className="backdrop-blur-lg bg-white/50 dark:bg-slate-900/50 border-foreground/10 shadow-2xl animate-in slide-in-from-bottom-6 duration-1000">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-foreground/20 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Contraseña
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-foreground/20 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <Button
                className="w-full h-14 bg-[#324f5f] hover:bg-[#2a4351] text-white font-black text-xl rounded-2xl shadow-xl transition-all duration-400"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>
              <div className="text-center text-sm font-medium">
                ¿No tienes una cuenta?{" "}
                <Link href="/auth/sign-up" className="font-black text-[#23313F] hover:text-[#FDD79A] transition-colors border-b-2 border-[#FDD79A]">
                  Regístrate ahora
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary animate-in fade-in duration-1000 delay-500 font-medium">
        Al hacer clic en continuar, aceptas nuestros{" "}
        <a href="#">Términos de Servicio</a> y{" "}
        <a href="#">Política de Privacidad</a>.
      </div>
      <Link
        href="/"
        className="text-center text-[#23313F]/50 hover:text-[#23313F] text-sm font-bold uppercase tracking-widest hover:underline transition-all animate-in fade-in duration-1000 delay-700"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
