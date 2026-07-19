"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/src/contexts/auth-context";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().optional(),
});

const resetRequestSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

type FormValues = {
  email: string;
  password?: string;
  fullName?: string;
};

interface AuthFormProps {
  mode: "login" | "register" | "reset";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const schema = useMemo(() => {
    if (mode === "login") return loginSchema;
    if (mode === "register") return registerSchema;
    return resetRequestSchema;
  }, [mode]) as typeof loginSchema | typeof registerSchema | typeof resetRequestSchema;

  const defaultValues = useMemo(() => {
    if (mode === "login") return { email: "", password: "" };
    if (mode === "register") return { email: "", password: "", fullName: "" };
    return { email: "" };
  }, [mode]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const title = useMemo(() => {
    if (mode === "register") return "Crear cuenta";
    if (mode === "reset") return "Recuperar contraseña";
    return "Iniciar sesión";
  }, [mode]);

  const busy = isSubmitting || redirecting;

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setStatus(null);

    try {
      if (mode === "reset") {
        await resetPassword(values.email);
        setStatus("Revisa tu correo para continuar.");
        return;
      }

      setRedirecting(true);

      if (mode === "register") {
        const registerValues = values as RegisterValues;
        await signUp(
          registerValues.email,
          registerValues.password,
          registerValues.fullName
        );

        setStatus("Cuenta creada exitosamente. Revisa tu correo para confirmar.");
        setRedirecting(false);
        return;
      }

      const loginValues = values as LoginValues;
      await signIn(loginValues.email, loginValues.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
      setRedirecting(false);
    }
  };

  return (
    <div className="relative">
      {redirecting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-black/80 backdrop-blur-sm">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-sm font-semibold text-white">Entrando a IÓN MAX...</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Ión Max</p>
          <h1 className="mt-2 text-3xl font-black">{title}</h1>
          <p className="mt-2 text-sm text-zinc-400">Accede o crea tu cuenta para entrar al ecosistema.</p>
        </div>

        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Nombre completo</label>
            <input
              {...register("fullName")}
              className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm"
              placeholder="Tu nombre"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-zinc-400">Correo</label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm"
            placeholder="correo@empresa.com"
          />
          {errors.email?.message && (
            <p className="mt-1 text-sm text-rose-400">{String(errors.email.message)}</p>
          )}
        </div>

        {mode !== "reset" && (
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Contraseña</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm"
              placeholder="••••••••"
            />
            {errors.password?.message && (
              <p className="mt-1 text-sm text-rose-400">{String(errors.password.message)}</p>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </p>
        )}
        {status && (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {status}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:opacity-60"
        >
          {busy ? "Procesando..." : title}
        </button>

        <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
          {mode !== "register" && (
            <a href="/register" className="hover:text-white">
              Crear cuenta
            </a>
          )}
          {mode !== "reset" && (
            <a href="/reset-password" className="hover:text-white">
              Recuperar contraseña
            </a>
          )}
          {mode !== "login" && (
            <a href="/login" className="hover:text-white">
              Volver a iniciar sesión
            </a>
          )}
          <a href="/invite" className="hover:text-white">
            ← Volver al acceso
          </a>
        </div>
      </form>
    </div>
  );
}
