"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CreditCard, Heart, MessageSquare, Package, Sparkles } from "lucide-react";
import { getDashboardStats } from "@/src/services/account";

export function DashboardPage() {
  const { data: dashboard = null, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const stats = [
    { label: "Productos", value: dashboard ? dashboard.products.toString() : "—", hint: "Publicaciones activas" },
    { label: "Servicios", value: dashboard ? dashboard.services.toString() : "—", hint: "Ofertas disponibles" },
    { label: "Cursos", value: dashboard ? dashboard.courses.toString() : "—", hint: "Capacitaciones" },
    { label: "Mensajería", value: dashboard ? dashboard.messages.toString() : "—", hint: "Conversaciones abiertas" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Dashboard premium</p>
            <h1 className="mt-3 text-4xl font-black">Tu ecosistema de ventas y servicios</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">Control total de tus publicaciones, billetera, ventas, mensajes y ganancias desde un solo lugar.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-zinc-300">
            <p className="text-zinc-500">Estado</p>
            <p className="mt-1 font-black text-white">Cuenta activa · 100% operativa</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-black">{stat.value}</p>
            <p className="mt-2 text-sm text-emerald-400">{stat.hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black">Actividad reciente</h2>
            <button className="text-sm text-zinc-500">Ver todo</button>
          </div>
          <div className="space-y-4">
            {(isLoading ? [
              { title: "Actualizando métricas...", meta: "Espere un momento" },
            ] : [
              { title: `Pedidos totales: ${dashboard?.orders ?? 0}`, meta: `Ventas: ${dashboard?.sales ?? 0}` },
              { title: `Favoritos guardados: ${dashboard?.favorites ?? 0}`, meta: `Mensajes: ${dashboard?.messages ?? 0}` },
              { title: `Productos activos: ${dashboard?.products ?? 0}`, meta: `Servicios activos: ${dashboard?.services ?? 0}` },
            ]).map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-zinc-500">{item.meta}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-zinc-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-zinc-950 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="font-black">Herramientas premium</p>
                <p className="text-sm text-zinc-400">Todo listo para escalar</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { label: "Productos publicados", value: dashboard ? dashboard.products.toString() : "—", icon: Package },
              { label: "Favoritos", value: dashboard ? dashboard.favorites.toString() : "—", icon: Heart },
              { label: "Mensajes", value: dashboard ? dashboard.messages.toString() : "—", icon: MessageSquare },
              { label: "Ventas", value: dashboard ? dashboard.sales.toString() : "—", icon: CreditCard },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500">{card.label}</p>
                    <Icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <p className="mt-2 text-2xl font-black">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
