"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { supabase } from "@/src/lib/supabase/client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (loading) return;

      if (user) {
        if (active) {
          setAllowed(true);
          setChecking(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data.session?.user) {
        setAllowed(true);
        setChecking(false);
        return;
      }

      setAllowed(false);
      setChecking(false);
      router.replace("/login");
    }

    void verify();

    return () => {
      active = false;
    };
  }, [loading, router, user]);

  if (loading || checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-400">Verificando sesión...</p>
        </div>
      </main>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
