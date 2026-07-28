"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

async function getOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  if (host) return `${protocol}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function createActionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot always write cookies; proxy handles refresh.
          }
        },
      },
    }
  );
}

export type AuthActionResult = {
  error?: string;
  needsEmailConfirmation?: boolean;
  message?: string;
};

export async function loginAction(
  email: string,
  password: string,
  next?: string | null
): Promise<AuthActionResult> {
  const supabase = await createActionClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (!data.session) {
    return { error: "No se pudo iniciar sesión. Verifica tu correo o contraseña." };
  }

  const destination =
    next && next.startsWith("/") && !next.startsWith("/login") ? next : "/comunidad";

  redirect(destination);
}

export async function signupAction(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthActionResult> {
  const supabase = await createActionClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: fullName ? { nombre_completo: fullName } : undefined,
      emailRedirectTo: `${origin}/auth/callback?next=/comunidad`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (!data.session) {
    return {
      needsEmailConfirmation: true,
      message:
        "Cuenta creada. Si Supabase pide confirmación, revisa tu correo y luego inicia sesión.",
    };
  }

  redirect("/comunidad");
}

function translateAuthError(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (message.includes("Email not confirmed")) {
    return "Debes confirmar tu correo antes de ingresar. Revisa tu bandeja.";
  }
  if (message.includes("User already registered")) {
    return "Este correo ya está registrado. Inicia sesión.";
  }
  return message;
}
