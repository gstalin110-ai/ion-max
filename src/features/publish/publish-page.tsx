"use client";

import { useState } from "react";
import { createListing } from "@/lib/supabase-helpers";
import { ListingFormData } from "@/lib/types";
import { useAuth } from "@/src/contexts/auth-context";
import { supabase } from "@/src/lib/supabase/client";
import { generateOptimizedDescription } from "@/src/services/ai-marketing-service";
import toast from "react-hot-toast";
import { Sparkles, Upload, X, Image as ImageIcon, Eye, Wand2, DollarSign, Tag, MapPin, Clock, GraduationCap, Briefcase, Package } from "lucide-react";
import { sanitizeText, sanitizeName, sanitizeDecimal, sanitizeLongText } from "@/src/lib/sanitizer";
import { logger } from "@/src/lib/logger";
import { motion, AnimatePresence } from "framer-motion";

const types = ["Producto Físico", "Servicio", "Curso", "Enlace Afiliado"] as const;

export function PublishPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<(typeof types)[number]>("Producto Físico");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    category_id: "",
    location: "",
    tags: "",
    images: [],
  });

  // Plantillas de descripción por categoría
  const templates = {
    "Producto Físico": `📦 **[NOMBRE DEL PRODUCTO]**

✨ **Características Principales:**
- [Característica 1]
- [Característica 2]
- [Característica 3]

💎 **Beneficios:**
- [Beneficio 1]
- [Beneficio 2]

📍 **Ubicación:** [Tu ciudad/país]
🚚 **Envío disponible a todo el país

💰 **Precio:** $[Tu precio]

📞 **Contacto:** Responde en menos de 1 hora`,
    
    "Servicio": `🎯 **[NOMBRE DEL SERVICIO]**

⭐ **Lo que ofrezco:**
- [Servicio 1]
- [Servicio 2]
- [Servicio 3]

🎓 **Experiencia:** [Años de experiencia/certificaciones]

💼 **Modalidad:** [Presencial/Virtual/Híbrido]
⏰ **Horario:** [Tus horarios disponibles]

💰 **Precio:** $[Tu precio]
📞 **Respuesta garantizada en menos de 24h`,

    "Curso": `🎓 **[NOMBRE DEL CURSO]**

📚 **Temario:**
- Módulo 1: [Tema]
- Módulo 2: [Tema]
- Módulo 3: [Tema]

🎯 **Aprenderás:**
- [Habilidad 1]
- [Habilidad 2]
- [Habilidad 3]

⏰ **Duración:** [Tiempo total]
📊 **Nivel:** [Principiante/Intermedio/Avanzado]

💰 **Precio:** $[Tu precio]
🎁 **Incluye:** [Materiales/Certificado/Soporte]`,

    "Enlace Afiliado": `🔗 **[NOMBRE DEL PRODUCTO]**

💎 **¿Por qué este producto?**
- [Beneficio 1]
- [Beneficio 2]
- [Beneficio 3]

🏆 **Características destacadas:**
- [Característica 1]
- [Característica 2]

💰 **Precio:** $[Precio original]
🎁 **Descuento:** [Tu descuento/oferta]

📱 **Plataforma:** [Amazon/ClickBank/etc]
⚡ **Enlace de afiliado verificado y seguro`
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sanitizar datos antes de enviar
      const sanitizedData: ListingFormData = {
        title: sanitizeName(formData.title),
        description: sanitizeLongText(formData.description),
        price: sanitizeDecimal(formData.price).toString(),
        category_id: formData.category_id,
        location: sanitizeText(formData.location || ""),
        tags: sanitizeText(formData.tags || ""),
        images: formData.images,
      };

      // Mapear tipo a category_id
      const categoryMap: Record<string, string> = {
        "Producto Físico": "product",
        "Servicio": "service", 
        "Curso": "course",
        "Enlace Afiliado": "affiliate",
      };

      const submissionData: ListingFormData = {
        ...sanitizedData,
        category_id: categoryMap[selectedType],
      };

      logger.info('Listing submission attempt', { 
        userId: user?.id, 
        title: sanitizedData.title,
        category: categoryMap[selectedType]
      }, user?.id);

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

  const handleApplyTemplate = () => {
    if (selectedTemplate && templates[selectedTemplate as keyof typeof templates]) {
      setFormData((prev) => ({
        ...prev,
        description: templates[selectedType as keyof typeof templates],
      }));
      toast.success("Plantilla aplicada exitosamente");
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
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded-2xl">
            <Package className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Publicar</p>
            <h1 className="text-4xl font-black text-white">Crea una publicación en 30 segundos</h1>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-zinc-400">
          Elige el tipo de publicación, usa plantillas o IA, y sube tus imágenes. Tu listing será visible inmediatamente en el marketplace.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario Principal */}
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 space-y-6"
        >
          {/* Tipo de Publicación con Iconos */}
          <div>
            <label className="text-sm text-zinc-400 mb-3 block font-black uppercase tracking-wider">Tipo de Publicación</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {types.map((type) => {
                const icons = {
                  "Producto Físico": Package,
                  "Servicio": Briefcase,
                  "Curso": GraduationCap,
                  "Enlace Afiliado": Wand2,
                };
                const Icon = icons[type as keyof typeof icons];
                
                return (
                  <motion.button
                    key={type}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedType(type);
                      setSelectedTemplate("");
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      selectedType === type 
                        ? "bg-yellow-400 text-black border-yellow-400" 
                        : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-black">{type}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Campos específicos por tipo */}
          <AnimatePresence mode="wait">
            {selectedType === "Enlace Afiliado" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="h-4 w-4" />
                    URL del Enlace Afiliado
                  </div>
                  <input 
                    type="url"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                    placeholder="https://ejemplo.com/afiliado" 
                    required
                  />
                </label>
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4" />
                    Plataforma
                  </div>
                  <input 
                    type="text"
                    value={formData.tags || ""}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                    placeholder="Ej. Amazon, ClickBank, etc." 
                  />
                </label>
              </motion.div>
            )}

            {selectedType === "Producto Físico" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación
                  </div>
                  <input 
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                    placeholder="Ciudad, País" 
                  />
                </label>
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" />
                    Stock (opcional)
                  </div>
                  <input 
                    type="number"
                    className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                    placeholder="Cantidad disponible" 
                  />
                </label>
              </motion.div>
            )}

            {selectedType === "Servicio" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4" />
                    Modalidad
                  </div>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white">
                  <option value="">Seleccionar...</option>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="híbrido">Híbrido</option>
                  </select>
                </label>
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Duración estimada
                  </div>
                  <input 
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                    placeholder="Ej. 2 horas, 1 semana, etc." 
                  />
                </label>
              </motion.div>
            )}

            {selectedType === "Curso" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-4 w-4" />
                    Nivel
                  </div>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white">
                  <option value="">Seleccionar...</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                  </select>
                </label>
                <label className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Duración total
                  </div>
                  <input 
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                    placeholder="Ej. 10 horas, 4 semanas, etc." 
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Campos generales */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-400">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                Título *
              </div>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="Ej. Diseño premium para marcas" 
                required
              />
            </label>
            <label className="text-sm text-zinc-400">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Precio (USD) *
              </div>
              <input 
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="100" 
                required
              />
            </label>
            <label className="text-sm text-zinc-400 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Descripción *</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleApplyTemplate}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black hover:bg-blue-500/20 transition"
                  >
                    <Wand2 className="h-3 w-3" />
                    Plantilla
                  </button>
                  <button
                    type="button"
                    onClick={handleOptimizeWithAI}
                    disabled={isOptimizing || !formData.title || !formData.description}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black hover:bg-yellow-400/20 transition disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    {isOptimizing ? "Optimizando..." : "IA"}
                  </button>
                </div>
              </div>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
                placeholder="Describe tu publicación con claridad. Incluye características, beneficios y cualquier información relevante." 
                required
              />
            </label>
          </div>

          {/* Subida de Imágenes */}
          <div>
            <label className="text-sm text-zinc-400 mb-3 block flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
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
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4" />
              Etiquetas (separadas por comas)
            </label>
            <input 
              type="text"
              value={formData.tags || ""}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white" 
              placeholder="premium, tecnología, negocio" 
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Package className="h-5 w-5" />
            {isSubmitting ? "Publicando..." : "Publicar Ahora"}
          </button>
        </motion.form>

        {/* Sidebar de Ayuda */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 space-y-6"
        >
          <div>
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Consejos Rápidos
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">✓</span>
                <span>Usa títulos claros y descriptivos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">✓</span>
                <span>Incluye al menos 3 imágenes de alta calidad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">✓</span>
                <span>Sé específico en la descripción</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">✓</span>
                <span>Usa etiquetas relevantes</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-400" />
              Preview en Vivo
            </h3>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 hover:bg-white/10 transition"
            >
              {showPreview ? "Ocultar Preview" : "Ver Preview"}
            </button>
          </div>

          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-white/10 pt-6"
            >
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4 space-y-3">
                <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden">
                  {previewImages[0] ? (
                    <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-white">{formData.title || "Tu título"}</h4>
                  <p className="text-yellow-400 font-black text-lg">${formData.price || "0.00"}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
