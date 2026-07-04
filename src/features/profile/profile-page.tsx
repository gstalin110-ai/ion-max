"use client";

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Perfil</p>
        <h1 className="mt-3 text-4xl font-black">Controla tu identidad profesional</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Edita tu foto, portada, datos de contacto, biografía, empresa y redes sociales.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-zinc-400">El perfil está preparado para conectar con la tabla de usuarios y storage de Supabase.</p>
      </div>
    </div>
  );
}
