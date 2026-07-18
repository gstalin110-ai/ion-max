"use client";

import { useState } from "react";
import { createListing } from "@/lib/supabase-helpers";
import { ListingFormData } from "@/lib/types";
import toast from "react-hot-toast";

const types = ["Producto Físico", "Servicio", "Curso", "Enlace Afiliado"] as const;

export function PublishPage() {
  const [selectedType, setSelectedType] = useState<(typeof types)[number]>("Producto Físico");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    category_id: "",
    location: "",
    tags: "",
    images: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mapear tipo a category_id
      const categoryMap: Record<string, string> = {
        "Producto Físico": "product",
        "Servicio": "service", 
        "Curso": "course",
        "Enlace Afiliado": "affiliate",
      };

      const submissionData: ListingFormData = {
        ...formData,
        category_id: categoryMap[selectedType],
      };

      await createListing(submissionData);
      
      toast.success("Publicación creada exitosamente");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category_id: "",
        location: "",
        tags: "",
        images: [],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear publicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Publicar</p>
        <h1 className="mt-3 text-4xl font-black">Crea una nueva publicación en minutos</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Elige el tipo de publicación y completa el formulario. Tu listing será revisado antes de publicarse.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        {/* Tipo de Publicación */}
        <div className="mb-6">
          <label className="text-sm text-zinc-400 mb-3 block">Tipo de Publicación</label>
          <div className="flex flex-wrap gap-3">
            {types.map((type) => (
              <button 
                key={type} 
                type="button"
                onClick={() => setSelectedType(type)} 
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  selectedType === type 
                    ? "bg-white text-black" 
                    : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Campos específicos por tipo */}
        {selectedType === "Enlace Afiliado" && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-400">
              URL del Enlace Afiliado
              <input 
                type="url"
                value={formData.location || ""}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="https://ejemplo.com/afiliado" 
                required
              />
            </label>
            <label className="text-sm text-zinc-400">
              Plataforma
              <input 
                type="text"
                value={formData.tags || ""}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="Ej. Amazon, ClickBank, etc." 
              />
            </label>
          </div>
        )}

        {selectedType === "Producto Físico" && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-400">
              Ubicación
              <input 
                type="text"
                value={formData.location || ""}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="Ciudad, País" 
              />
            </label>
            <label className="text-sm text-zinc-400">
              Stock (opcional)
              <input 
                type="number"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="Cantidad disponible" 
              />
            </label>
          </div>
        )}

        {selectedType === "Servicio" && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-400">
              Modalidad
              <select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white">
              <option value="">Seleccionar...</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="híbrido">Híbrido</option>
              </select>
            </label>
            <label className="text-sm text-zinc-400">
              Duración estimada
              <input 
                type="text"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="Ej. 2 horas, 1 semana, etc." 
              />
            </label>
          </div>
        )}

        {selectedType === "Curso" && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-400">
              Nivel
              <select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white">
              <option value="">Seleccionar...</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              </select>
            </label>
            <label className="text-sm text-zinc-400">
              Duración total
              <input 
                type="text"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="Ej. 10 horas, 4 semanas, etc." 
              />
            </label>
          </div>
        )}

        {/* Campos generales */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-400">
            Título *
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
              placeholder="Ej. Diseño premium para marcas" 
              required
            />
          </label>
          <label className="text-sm text-zinc-400">
            Precio (USD) *
            <input 
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
              placeholder="100" 
              required
            />
          </label>
          <label className="text-sm text-zinc-400 md:col-span-2">
            Descripción *
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
              placeholder="Describe tu publicación con claridad. Incluye características, beneficios y cualquier información relevante." 
              required
            />
          </label>
        </div>

        {/* Etiquetas */}
        <div className="mb-6">
          <label className="text-sm text-zinc-400">
            Etiquetas (separadas por comas)
            <input 
              type="text"
              value={formData.tags || ""}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
              placeholder="premium, tecnología, negocio" 
            />
          </label>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Publicando..." : "Publicar Ahora"}
        </button>
      </form>
    </div>
  );
}
