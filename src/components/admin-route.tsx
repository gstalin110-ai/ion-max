"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { isOwnerEmail } from "@/lib/constants";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (loading) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      // Verificar si es owner por email
      const isOwner = isOwnerEmail(user.email);
      
      // Verificar is_admin en Supabase
      let isAdminFromDb = false;
      try {
        const { supabase } = await import("@/src/lib/supabase/client");
        const { data } = await supabase
          .from("profiles")
          .select("is_admin, role")
          .eq("id", user.id)
          .single();
        
        isAdminFromDb = data?.is_admin || data?.role === 'owner' || false;
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
      
      setIsAdmin(isOwner || isAdminFromDb);
      
      if (!isOwner && !isAdminFromDb) {
        router.replace("/");
        return;
      }

      setReady(true);
    }
    
    checkAdminStatus();
  }, [loading, router, user]);

  if (loading || !ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-400">Verificando permisos...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
