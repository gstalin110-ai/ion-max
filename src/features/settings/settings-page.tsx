"use client";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Configuración</p>
        <h1 className="mt-3 text-4xl font-black">Ajusta tu experiencia</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Idioma, tema, privacidad, notificaciones y seguridad desde un centro centralizado.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-zinc-400">Este módulo está listo para conectar con la configuración del usuario en Supabase.</p>
      </div>
    </div>
  );
}
