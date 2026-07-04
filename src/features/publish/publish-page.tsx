"use client";

import { useState } from "react";

const types = ["Producto", "Servicio", "Curso", "Empleo", "Negocio"] as const;

export function PublishPage() {
  const [selectedType, setSelectedType] = useState<(typeof types)[number]>("Producto");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Publicar</p>
        <h1 className="mt-3 text-4xl font-black">Crea una nueva publicación en minutos</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Elige el tipo de publicación y completa un formulario dinámico listo para conectar con Supabase.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <div className="flex flex-wrap gap-3">
          {types.map((type) => (
            <button key={type} onClick={() => setSelectedType(type)} className={`rounded-full px-4 py-2 text-sm ${selectedType === type ? "bg-white text-black" : "border border-white/10 bg-white/5 text-zinc-400"}`}>
              {type}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-400">
            Título
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" placeholder="Ej. Diseño premium para marcas" />
          </label>
          <label className="text-sm text-zinc-400">
            Precio
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" placeholder="100" />
          </label>
          <label className="text-sm text-zinc-400 md:col-span-2">
            Descripción
            <textarea className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" placeholder="Describe tu publicación con claridad" />
          </label>
        </div>
      </div>
    </div>
  );
}
