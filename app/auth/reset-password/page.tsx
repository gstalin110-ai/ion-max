"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase/client";
import toast from "react-hot-toast";

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay un token en la URL
    const accessToken = searchParams.get("access_token");
    if (!accessToken) {
      setError("Enlace inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const accessToken = searchParams.get("access_token");
      if (!accessToken) {
        throw new Error("Token no encontrado");
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Contraseña actualizada exitosamente");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_42%),linear-gradient(135deg,_#050505,_#111)] px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-8">
        <h1 className="mb-2 text-3xl font-black">Nueva Contraseña</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Ingresa tu nueva contraseña para continuar.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-400">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 text-sm font-black uppercase tracking-wider text-black rounded-xl hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-500">
          Por seguridad, te recomendamos usar una contraseña con al menos 8 caracteres, incluyendo números y símbolos.
        </p>
      </div>
    </main>
  );
}
