"use client";

export function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Billetera</p>
        <h1 className="mt-3 text-4xl font-black">Tu dinero, organizado y protegido</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Administra saldos, comisiones, retiros y movimientos desde un centro financiero profesional.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Saldo disponible", value: "$12.480" },
          { label: "Saldo retenido", value: "$3.240" },
          { label: "Saldo pendiente", value: "$890" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className="mt-3 text-3xl font-black">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
