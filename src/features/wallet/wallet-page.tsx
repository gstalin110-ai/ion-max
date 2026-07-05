"use client";

import { useQuery } from "@tanstack/react-query";
import { getWalletSummary } from "@/src/services/account";

export function WalletPage() {
  const { data: wallet = null, isLoading } = useQuery({
    queryKey: ["walletSummary"],
    queryFn: getWalletSummary,
  });

  const cards = [
    {
      label: "Saldo disponible",
      value: wallet?.availableBalance,
      accent: "text-emerald-400",
    },
    {
      label: "Saldo retenido",
      value: wallet?.heldBalance,
      accent: "text-amber-400",
    },
    {
      label: "Saldo pendiente",
      value: wallet?.pendingBalance,
      accent: "text-sky-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Billetera</p>
        <h1 className="mt-3 text-4xl font-black">Tu dinero, organizado y protegido</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Administra saldos, comisiones, retiros y movimientos desde un centro financiero profesional.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className={`mt-4 text-4xl font-black ${item.accent}`}>
              {isLoading
                ? "Cargando..."
                : item.value !== undefined
                ? `$${item.value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Finanzas</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Ingresos</p>
              <p className="mt-3 text-2xl font-black text-white">
                {isLoading ? "—" : wallet ? `$${wallet.income.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Comisiones</p>
              <p className="mt-3 text-2xl font-black text-white">
                {isLoading ? "—" : wallet ? `$${wallet.commissions.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-400">Datos extraídos directamente desde la tabla de wallet en Supabase. Si el registro no existe, el sistema mostrará valores vacíos.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-zinc-950 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Sugerencias</p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-400">
            <li>• Verifica comisiones y pagos pendientes.</li>
            <li>• Asegura tus métodos de retiro en Supabase.</li>
            <li>• Revisa transacciones recientes periódicamente.</li>
            <li>• Usa extracción de datos para conciliaciones financieras.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
