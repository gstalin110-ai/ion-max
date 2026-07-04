"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/src/contexts/auth-context";

const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AuthFormProps {
  mode: "login" | "register" | "reset";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  const title = useMemo(() => {
    if (mode === "register") return "Crear cuenta";
    if (mode === "reset") return "Recuperar contraseña";
    return "Iniciar sesión";
  }, [mode]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setStatus(null);

    try {
      if (mode === "reset") {
        await resetPassword(values.email);
        setStatus("Revisa tu correo para continuar.");
        return;
      }

      if (mode === "register") {
        await signUp(values.email, values.password, values.fullName);
        setStatus("Cuenta creada. Bienvenido a IÓN MAX.");
        return;
      }

      await signIn(values.email, values.password);
      setStatus("Sesión iniciada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Ión Max</p>
        <h1 className="mt-2 text-3xl font-black">{title}</h1>
        <p className="mt-2 text-sm text-zinc-400">Accede o crea tu cuenta para entrar al ecosistema.</p>
      </div>

      {mode === "register" && (
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Nombre completo</label>
          <input {...register("fullName")} className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm" placeholder="Tu nombre" />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-zinc-400">Correo</label>
        <input type="email" {...register("email")} className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm" placeholder="correo@empresa.com" />
        {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
      </div>

      {mode !== "reset" && (
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Contraseña</label>
          <input type="password" {...register("password")} className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm" placeholder="••••••••" />
          {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
        </div>
      )}

      {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>}
      {status && <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{status}</p>}

      <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:opacity-60">
        {isSubmitting ? "Procesando..." : title}
      </button>

      <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
        {mode !== "register" && <a href="/register" className="hover:text-white">Crear cuenta</a>}
        {mode !== "reset" && <a href="/reset-password" className="hover:text-white">Recuperar contraseña</a>}
        {mode !== "login" && <a href="/login" className="hover:text-white">Volver a iniciar sesión</a>}
      </div>
    </form>
  );
}
