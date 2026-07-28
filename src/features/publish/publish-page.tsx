"use client";

import { useState } from "react";
import { createListing } from "@/lib/supabase-helpers";
import { ListingFormData } from "@/lib/types";
import { useAuth } from "@/src/contexts/auth-context";
import { supabase } from "@/src/lib/supabase/client";
import { generateOptimizedDescription } from "@/src/services/ai-marketing-service";
import toast from "react-hot-toast";
import { Sparkles, Upload, X, Image as ImageIcon } from "lucide-react";

const types = ["Producto Físico", "Servicio", "Curso", "Enlace Afiliado"] as const;

export function PublishPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<(typeof types)[number]>("Producto Físico");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
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

  const handleOptimizeWithAI = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Por favor completa el título y la descripción primero");
      return;
    }

    setIsOptimizing(true);

    try {
      const categoryMap: Record<string, string> = {
        "Producto Físico": "product",
        "Servicio": "service", 
        "Curso": "course",
        "Enlace Afiliado": "affiliate",
      };

      const optimized = await generateOptimizedDescription({
        title: formData.title,
        description: formData.description,
        category: categoryMap[selectedType],
        price: parseFloat(formData.price) || 0,
        location: formData.location,
      });

      setFormData((prev) => ({
        ...prev,
        title: optimized.title || prev.title,
        description: optimized.description || prev.description,
        tags: optimized.tags || prev.tags,
      }));
      
      toast.success("Contenido optimizado con IA para IÓN MAX");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al optimizar con IA");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      
      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
      
      toast.success(`${uploadedUrls.length} imagen(es) subida(s) exitosamente`);
    } catch (error) {
      toast.error("Error al subir imágenes. Por favor intenta nuevamente.");
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
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
            <div className="flex items-center justify-between mb-2">
              <span>Descripción *</span>
              <button
                type="button"
                onClick={handleOptimizeWithAI}
                disabled={isOptimizing || !formData.title || !formData.description}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black hover:bg-yellow-400/20 transition disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                {isOptimizing ? "Optimizando..." : "Optimizar con IA"}
              </button>
            </div>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
              placeholder="Describe tu publicación con claridad. Incluye características, beneficios y cualquier información relevante." 
              required
            />
          </label>
        </div>

        {/* Subida de Imágenes */}
        <div className="mb-6">
          <label className="text-sm text-zinc-400 mb-3 block">
            Imágenes *
          </label>
          
          <div className="rounded-2xl border-2 border-dashed border-white/20 bg-black/50 p-8 text-center hover:border-yellow-400/50 transition cursor-pointer">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3">
                {isUploading ? (
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
                ) : (
                  <Upload className="h-12 w-12 text-zinc-400" />
                )}
                <p className="text-zinc-400 font-black">
                  {isUploading ? "Subiendo imágenes..." : "Arrastra imágenes aquí o haz clic para seleccionar"}
                </p>
                <p className="text-xs text-zinc-500">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </label>
          </div>

          {/* Previsualización de Imágenes */}
          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {previewImages.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 rounded-full bg-black/80 p-1 hover:bg-red-500 transition"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
