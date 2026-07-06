"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { isOwnerEmail } from "@/lib/constants";
import { OwnerPage } from "@/src/features/owner/owner-page";
import { ListingsAdmin } from "@/src/features/admin/listings-admin";
import { useState } from "react";

type AdminTab = "publicaciones" | "usuarios";

export function AdminPanel() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("publicaciones");

  useEffect(() => {
    if (!loading && (!user || !isOwnerEmail(user.email))) {
      router.replace("/comunidad");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </main>
    );
  }

  if (!user || !isOwnerEmail(user.email)) return null;

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-zinc-900 to-black p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">Control total · IÓN MAX</p>
          <h1 className="mt-2 text-3xl font-black">Administrador de la App</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Panel exclusivo para {user.email}. Gestiona publicaciones, usuarios y la plataforma desde un solo lugar.
          </p>
        </div>

        <div className="flex gap-2">
          {(
            [
              { id: "publicaciones" as const, label: "Publicaciones" },
              { id: "usuarios" as const, label: "Usuarios y control" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                tab === item.id
                  ? "bg-yellow-400 text-black"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "publicaciones" ? <ListingsAdmin /> : <OwnerPage />}
      </div>
    </main>
  );
}
