"use client";

import { useCallback, useEffect, useState } from "react";
import { Listing, ListingFormData } from "../../lib/types";
import { getListings, createListing, updateListing, deleteListing } from "../../lib/supabase-helpers";
import { getDashboardStats, type DashboardStats } from "@/src/services/account";
import { ListingFormSchema } from "../../lib/validation";
import { motion } from "framer-motion";
import { z } from "zod";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    category_id: "",
    location: "",
    tags: "",
    images: [""]
  });

  const loadListings = useCallback(async () => {
    try {
      const data = await getListings();
      setListings(data);
    } catch (error) {
      console.error(error);
      showMessage("error", "Error al cargar publicaciones");
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const stats = await getDashboardStats();
      setDashboard(stats);
    } catch (err) {
      console.warn("No se pudieron obtener métricas completas:", err);
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      await Promise.all([loadListings(), loadDashboard()]);
      setIsLoading(false);
    }
    initialize();
  }, [loadListings, loadDashboard]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function validateForm() {
    try {
      ListingFormSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          errors[field] = issue.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessing(true);
    try {
      if (editingId) {
        await updateListing(editingId, formData);
        showMessage("success", "✅ Publicación actualizada exitosamente");
        setEditingId(null);
      } else {
        await createListing(formData);
        showMessage("success", "✅ Publicación creada exitosamente");
      }

      setFormData({
        title: "",
        description: "",
        price: "",
        category_id: "",
        location: "",
        tags: "",
        images: [""]
      });
      await loadListings();
    } catch (error) {
      showMessage("error", `❌ Error: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setProcessing(false);
    }
  }

  async function handleEdit(listing: Listing) {
    setEditingId(listing.id);
    setFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      category_id: listing.category_id,
      location: listing.location || "",
      tags: listing.tags?.[0] || "",
      images: listing.images
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("⚠️ ¿Eliminar esta publicación permanentemente?")) return;
    
    setProcessing(true);
    try {
      await deleteListing(id);
      showMessage("success", "✅ Publicación eliminada");
      await loadListings();
    } catch (error) {
      showMessage("error", `❌ Error: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-zinc-400">Cargando administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-40 bg-black border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-wider">⚡ IÓN MAX ADMIN</h1>
              <p className="text-zinc-500 text-sm mt-1">Panel de gestión profesional</p>
            </div>
            <div className="text-right text-zinc-400 text-sm">
              <p>📅 {new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">🛍️ Productos</p>
              <p className="text-2xl font-black text-blue-300">{dashboard ? dashboard.products : 0}</p>
            </div>
            <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3">
              <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">📚 Cursos</p>
              <p className="text-2xl font-black text-purple-300">{dashboard ? dashboard.courses : 0}</p>
            </div>
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-bold uppercase tracking-wider">⚙️ Servicios</p>
              <p className="text-2xl font-black text-green-300">{dashboard ? dashboard.services : 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg font-bold text-sm tracking-wider ${
                  message.type === "success" 
                    ? "bg-green-600/20 border border-green-600/50 text-green-400" 
                    : "bg-red-600/20 border border-red-600/50 text-red-400"
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <section className="sticky top-40 bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                {editingId ? "✏️ Editar" : "➕ Nuevo"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Título</label>
                  <input
                    type="text"
                    placeholder="Ej. Reloj Alpha"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.title ? "border-red-600" : "border-white/20"
                    }`}
                    required
                  />
                  {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Precio (USD)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.price ? "border-red-600" : "border-white/20"
                    }`}
                    step="0.01"
                    required
                  />
                  {formErrors.price && <p className="text-red-400 text-xs mt-1">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Descripción</label>
                  <textarea
                    placeholder="Características..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.description ? "border-red-600" : "border-white/20"
                    }`}
                    rows={3}
                    required
                  />
                  {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">URL Imagen</label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/img.jpg"
                    value={formData.images[0]}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.images ? "border-red-600" : "border-white/20"
                    }`}
                    required
                  />
                  {formErrors.images && <p className="text-red-400 text-xs mt-1">{formErrors.images}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ubicación</label>
                  <input
                    type="text"
                    placeholder="Ciudad, País"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-white text-black font-black py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 uppercase tracking-widest text-xs"
                  >
                    {processing ? "⏳" : (editingId ? "💾" : "✅")}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: "",
                          description: "",
                          price: "",
                          category_id: "",
                          location: "",
                          tags: "",
                          images: [""]
                        });
                        setFormErrors({});
                      }}
                      className="bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-zinc-700 transition uppercase text-xs"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </form>
            </section>
          </div>

          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">📦 Publicaciones ({listings.length})</h2>
            </div>
            
            {listings.length === 0 ? (
              <div className="text-center py-16 border border-white/10 rounded-2xl bg-zinc-950/50">
                <p className="text-zinc-500 text-sm">📭 No hay publicaciones aún</p>
                <p className="text-zinc-600 text-xs mt-1">Crea la primera con el formulario ↖️</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {listings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-900/50 to-black border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all group"
                  >
                    <div className="relative mb-3 overflow-hidden rounded-lg">
                      <img 
                        src={listing.images?.[0] || "/placeholder.png"} 
                        alt={listing.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />
                    </div>

                    <div>
                      <h3 className="font-black text-sm line-clamp-2 mb-1">{listing.title}</h3>
                      <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{listing.description.substring(0, 60)}...</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-black text-white">${listing.price}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleEdit(listing)}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/50 text-blue-300 px-3 py-2 rounded font-bold text-xs transition uppercase"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-300 px-3 py-2 rounded font-bold text-xs transition uppercase"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
