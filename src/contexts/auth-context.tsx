"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function initialize() {
      // FIX: Usar getSession() en el cliente también, consistente con el middleware.
      // getUser() fuerza una llamada de red; getSession() lee desde la cookie local
      // y es suficiente para la inicialización del contexto en el browser.
      const { data } = await supabase.auth.getSession();
      if (active) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    }

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) {
          throw new Error("No se pudo establecer la sesión. Intenta de nuevo.");
        }
        // FIX: Redirigir explícitamente después del login exitoso.
        // Antes, signIn() resolvía sin navegar → el formulario se quedaba con
        // redirecting=true esperando una navegación que nunca ocurría → loop infinito.
        // Usamos router.push() para que Next.js ejecute el middleware (proxy.ts),
        // el cual detecta user autenticado en /login y redirige a /comunidad.
        router.push("/comunidad");
      },
      signUp: async (email, password, fullName) => {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: fullName ? { data: { full_name: fullName } } : undefined,
        });
        if (error) throw error;

        // Asignar rol owner automáticamente si es el dueño
        if (email === "gstalin110@gmail.com" && data.user) {
          try {
            // Primero crear el perfil con rol owner
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: data.user.id,
                email: email,
                full_name: fullName || "Stalin",
                role: "owner",
                account_verified: true,
              });

            if (profileError) console.error("Error creando perfil owner:", profileError);

            // También asignar en user_roles si existe esa tabla
            const { error: roleError } = await supabase
              .from("user_roles")
              .upsert({
                user_id: data.user.id,
                role_id: (await supabase.from("roles").select("id").eq("name", "owner").single()).data?.id,
              });

            if (roleError) console.error("Error asignando rol owner:", roleError);
          } catch (err) {
            console.error("Error asignando rol owner:", err);
          }
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = "/login";
      },
      resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      },
    }),
    [loading, router, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
