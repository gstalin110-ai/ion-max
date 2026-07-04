"use client";

export function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Mensajes</p>
        <h1 className="mt-3 text-4xl font-black">Chat y conversaciones en tiempo real</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Centraliza mensajes, archivos, respuestas y conversaciones con clientes y proveedores.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-zinc-400">El módulo de mensajería está preparado para integrarse con Supabase Realtime.</p>
      </div>
    </div>
  );
}
