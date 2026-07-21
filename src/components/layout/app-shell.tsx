"use client";

import Link from "next/link";
import { BriefcaseBusiness, Building2, CreditCard, Heart, LayoutDashboard, MessageSquare, Search, Settings, Sparkles, UserCircle2, Users } from "lucide-react";
import { useAppStore } from "@/src/store/app-store";
import { useAuth } from "@/src/contexts/auth-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useAppStore();
  useAuth();

  const baseNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Comunidad", href: "/comunidad", icon: Users },
    { label: "Mensajes", href: "/mensajes", icon: MessageSquare },
    { label: "Publicar", href: "/publish", icon: Sparkles },
    { label: "Empleos", href: "/jobs", icon: BriefcaseBusiness },
    { label: "Empresas", href: "/companies", icon: Building2 },
    { label: "Favoritos", href: "/favorites", icon: Heart },
    { label: "Billetera", href: "/wallet", icon: CreditCard },
    { label: "Perfil", href: "/profile", icon: UserCircle2 },
    { label: "Configuración", href: "/settings", icon: Settings },
  ];

  const navItems = baseNav;

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-zinc-950/95 p-6 backdrop-blur xl:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Ión Max</p>
          <h2 className="mt-2 text-2xl font-black">Centro de operaciones</h2>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="rounded-xl border border-white/10 bg-white/5 p-2 xl:hidden">
              ☰
            </button>
            <div className="flex flex-1 items-center justify-end gap-3">
              <label className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 md:flex">
                <Search className="h-4 w-4" />
                <input placeholder="Buscar" className="w-40 bg-transparent outline-none" />
              </label>
            </div>
          </div>
        </header>

        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
