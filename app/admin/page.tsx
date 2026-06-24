"use client";

import { useEffect, useState } from "react";
import { Item, AdminFormData } from "../../lib/types";
import { getItems, createItem, updateItem, deleteItem } from "../../lib/supabase-helpers";
import { AdminFormSchema } from "../../lib/validation";
import { motion } from "framer-motion";
import { z } from "zod";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [formData, setFormData] = useState<AdminFormData>({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen_url: "",
    enlace_externo: "",
    categoria: "SHOP",
    etiqueta: "",
    stock: ""
  });

  // Verificar autenticación
  useEffect(() => {
    async function initialize() {
      await loadItems();
      setIsLoading(false);
    }
    initialize();
  }, []);

  async function loadItems() {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      showMessage("error", "Error al cargar items");
    }
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function validateForm() {
    try {
      AdminFormSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        if (error.issues) {
          error.issues.forEach((issue: any) => {
            const field = issue.path[0] as string;
            errors[field] = issue.message;
          });
        }
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
        await updateItem(editingId, formData);
        showMessage("success", "✅ Recurso actualizado exitosamente");
        setEditingId(null);
      } else {
        await createItem(formData);
        showMessage("success", "✅ Recurso publicado exitosamente");
      }

      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        imagen_url: "",
        enlace_externo: "",
        categoria: "SHOP",
        etiqueta: "",
        stock: ""
      });
      await loadItems();
    } catch (error) {
      showMessage("error", `❌ Error: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setProcessing(false);
    }
  }

  async function handleEdit(item: Item) {
    setEditingId(item.id);
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio.toString(),
      imagen_url: item.imagen_url,
      enlace_externo: item.enlace_externo,
      categoria: item.categoria,
      etiqueta: item.etiqueta || "",
      stock: item.stock?.toString() || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("⚠️ ¿Eliminar este recurso permanentemente?")) return;
    
    setProcessing(true);
    try {
      await deleteItem(id);
      showMessage("success", "✅ Recurso eliminado");
      await loadItems();
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
      {/* HEADER ADMIN */}
      <div className="sticky top-0 z-40 bg-black border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-wider">⚡ IÓN MAX - ADMIN</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* MENSAJES */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg font-bold text-sm tracking-wider ${
              message.type === "success" 
                ? "bg-green-600/20 border border-green-600/50 text-green-400" 
                : "bg-red-600/20 border border-red-600/50 text-red-400"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* FORMULARIO */}
        <section className="bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 border border-white/10 rounded-3xl p-8 mb-12 backdrop-blur">
          <h2 className="text-3xl font-black mb-8">
            {editingId ? "✏️ Editar Recurso" : "➕ Publicar Nuevo Recurso"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* NOMBRE */}
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Nombre del Producto/Curso/Servicio</label>
                <input
                  type="text"
                  placeholder="Ej. Reloj Alpha Premium"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full bg-black border rounded-xl p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition ${
                    formErrors.nombre ? "border-red-600" : "border-white/20"
                  }`}
                  required
                />
                {formErrors.nombre && <p className="text-red-400 text-xs mt-2">{formErrors.nombre}</p>}
              </div>

              {/* PRECIO */}
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Precio (USD)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className={`w-full bg-black border rounded-xl p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition ${
                    formErrors.precio ? "border-red-600" : "border-white/20"
                  }`}
                  step="0.01"
                  required
                />
                {formErrors.precio && <p className="text-red-400 text-xs mt-2">{formErrors.precio}</p>}
              </div>

              {/* DESCRIPCIÓN */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-zinc-300">Descripción</label>
                <textarea
                  placeholder="Detalla las características y beneficios..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className={`w-full bg-black border rounded-xl p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition ${
                    formErrors.descripcion ? "border-red-600" : "border-white/20"
                  }`}
                  rows={4}
                  required
                />
                {formErrors.descripcion && <p className="text-red-400 text-xs mt-2">{formErrors.descripcion}</p>}
              </div>

              {/* IMAGEN URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-zinc-300">URL de Imagen</label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className={`w-full bg-black border rounded-xl p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition ${
                    formErrors.imagen_url ? "border-red-600" : "border-white/20"
                  }`}
                  required
                />
                {formErrors.imagen_url && <p className="text-red-400 text-xs mt-2">{formErrors.imagen_url}</p>}
                {formData.imagen_url && (
                  <div className="mt-4 border border-white/20 rounded-xl p-4 bg-black/50">
                    <p className="text-xs text-zinc-400 mb-3">Preview:</p>
                    <img 
                      src={formData.imagen_url} 
                      alt="preview"
                      className="max-h-48 rounded-lg object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                  </div>
                )}
              </div>

              {/* ENLACE EXTERNO */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-zinc-300">Enlace de Destino (WhatsApp, Pago, etc)</label>
                <input
                  type="url"
                  placeholder="https://wa.me/593980887170 o https://pago.com"
                  value={formData.enlace_externo}
                  onChange={(e) => setFormData({ ...formData, enlace_externo: e.target.value })}
                  className={`w-full bg-black border rounded-xl p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition ${
                    formErrors.enlace_externo ? "border-red-600" : "border-white/20"
                  }`}
                  required
                />
                {formErrors.enlace_externo && <p className="text-red-400 text-xs mt-2">{formErrors.enlace_externo}</p>}
              </div>

              {/* CATEGORÍA */}
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                  className="w-full bg-black border border-white/20 rounded-xl p-4 text-white focus:border-white focus:outline-none transition"
                >
                  <option value="SHOP">🛍️ SHOP - Productos</option>
                  <option value="ACADEMY">📚 ACADEMY - Cursos</option>
                  <option value="SERVICES">⚙️ SERVICES - Servicios</option>
                </select>
              </div>

              {/* ETIQUETA */}
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Etiqueta (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. 🔥 Trending, ⭐ Premium"
                  value={formData.etiqueta}
                  onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-xl p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition"
                />
              </div>

              {/* STOCK */}
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Stock (opcional)</label>
                <input
                  type="number"
                  placeholder="Cantidad disponible"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-xl p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex gap-4 pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 uppercase tracking-widest text-sm"
              >
                {processing ? "⏳ Procesando..." : (editingId ? "💾 Actualizar" : "✅ Publicar Recurso")}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      nombre: "",
                      descripcion: "",
                      precio: "",
                      imagen_url: "",
                      enlace_externo: "",
                      categoria: "SHOP",
                      etiqueta: "",
                      stock: ""
                    });
                    setFormErrors({});
                  }}
                  className="bg-zinc-800 text-white font-bold py-4 px-6 rounded-xl hover:bg-zinc-700 transition uppercase tracking-widest text-sm"
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* LISTA DE RECURSOS */}
        <section>
          <h2 className="text-3xl font-black mb-8">📦 Recursos Publicados ({items.length})</h2>
          
          {items.length === 0 ? (
            <div className="text-center py-16 border border-white/10 rounded-2xl">
              <p className="text-zinc-400">Aún no hay recursos publicados. Crea el primero arriba 👆</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-zinc-900/50 to-zinc-950/50 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* IMAGEN */}
                    <div className="md:w-32 h-32 flex-shrink-0">
                      <img 
                        src={item.imagen_url} 
                        alt={item.nombre}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />
                    </div>

                    {/* CONTENIDO */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{item.nombre}</h3>
                          <p className="text-zinc-400 text-sm">{item.descripcion.substring(0, 100)}...</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                          item.categoria === "SHOP" ? "bg-blue-600/20 text-blue-400" :
                          item.categoria === "ACADEMY" ? "bg-purple-600/20 text-purple-400" :
                          "bg-green-600/20 text-green-400"
                        }`}>
                          {item.categoria}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 mt-4 text-sm">
                        <span className="text-xl font-black">${item.precio}</span>
                        {item.stock && <span className="text-zinc-400">Stock: {item.stock}</span>}
                        {item.etiqueta && <span className="bg-white/10 px-2 py-1 rounded">{item.etiqueta}</span>}
                      </div>

                      {/* ACCIONES */}
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/50 text-blue-400 px-6 py-2 rounded-lg font-bold text-xs transition uppercase tracking-wider"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-400 px-6 py-2 rounded-lg font-bold text-xs transition uppercase tracking-wider"
                        >
                          🗑️ Eliminar
                        </button>
                        <a
                          href={item.enlace_externo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-lg font-bold text-xs transition uppercase tracking-wider"
                        >
                          🔗 Ver Enlace
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
