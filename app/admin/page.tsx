"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
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

  const loadItems = useCallback(async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error(error);
      showMessage("error", "Error al cargar items");
    }
  }, []);

  // Verificar autenticación
  useEffect(() => {
    async function initialize() {
      await loadItems();
      setIsLoading(false);
    }
    initialize();
  }, [loadItems]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function validateForm() {
    try {
      AdminFormSchema.parse(formData);
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

  const shopItems = items.filter(i => i.categoria === "SHOP").length;
  const academyItems = items.filter(i => i.categoria === "ACADEMY").length;
  const serviceItems = items.filter(i => i.categoria === "SERVICES").length;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER ADMIN MEJORADO */}
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
          
          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">🛍️ Productos</p>
              <p className="text-2xl font-black text-blue-300">{shopItems}</p>
            </div>
            <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3">
              <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">📚 Cursos</p>
              <p className="text-2xl font-black text-purple-300">{academyItems}</p>
            </div>
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-bold uppercase tracking-wider">⚙️ Servicios</p>
              <p className="text-2xl font-black text-green-300">{serviceItems}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* LAYOUT 2 COLUMNAS */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA - FORMULARIO */}
          <div className="lg:col-span-1">
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

            {/* FORMULARIO COMPACTO */}
            <section className="sticky top-40 bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                {editingId ? "✏️ Editar" : "➕ Nuevo"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* NOMBRE */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej. Reloj Alpha"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.nombre ? "border-red-600" : "border-white/20"
                    }`}
                    required
                  />
                  {formErrors.nombre && <p className="text-red-400 text-xs mt-1">{formErrors.nombre}</p>}
                </div>

                {/* PRECIO */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Precio (USD)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.precio ? "border-red-600" : "border-white/20"
                    }`}
                    step="0.01"
                    required
                  />
                  {formErrors.precio && <p className="text-red-400 text-xs mt-1">{formErrors.precio}</p>}
                </div>

                {/* DESCRIPCIÓN */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Descripción</label>
                  <textarea
                    placeholder="Características..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.descripcion ? "border-red-600" : "border-white/20"
                    }`}
                    rows={3}
                    required
                  />
                  {formErrors.descripcion && <p className="text-red-400 text-xs mt-1">{formErrors.descripcion}</p>}
                </div>

                {/* IMAGEN URL */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">URL Imagen</label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/img.jpg"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.imagen_url ? "border-red-600" : "border-white/20"
                    }`}
                    required
                  />
                  {formErrors.imagen_url && <p className="text-red-400 text-xs mt-1">{formErrors.imagen_url}</p>}
                  
                  {formData.imagen_url && (
                    <div className="mt-3 border border-white/20 rounded-lg p-2 bg-black/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={formData.imagen_url} 
                        alt="preview"
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />
                    </div>
                  )}
                </div>

                {/* ENLACE */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Enlace Destino</label>
                  <input
                    type="url"
                    placeholder="https://wa.me/..."
                    value={formData.enlace_externo}
                    onChange={(e) => setFormData({ ...formData, enlace_externo: e.target.value })}
                    className={`w-full bg-black border rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm ${
                      formErrors.enlace_externo ? "border-red-600" : "border-white/20"
                    }`}
                    required
                  />
                  {formErrors.enlace_externo && <p className="text-red-400 text-xs mt-1">{formErrors.enlace_externo}</p>}
                </div>

                {/* CATEGORÍA */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, categoria: e.target.value as AdminFormData["categoria"] })}
                    className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-white focus:outline-none transition text-sm"
                  >
                    <option value="SHOP">🛍️ SHOP</option>
                    <option value="ACADEMY">📚 ACADEMY</option>
                    <option value="SERVICES">⚙️ SERVICES</option>
                  </select>
                </div>

                {/* ETIQUETA */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Etiqueta</label>
                  <input
                    type="text"
                    placeholder="🔥 Trending"
                    value={formData.etiqueta}
                    onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm"
                  />
                </div>

                {/* STOCK */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stock</label>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition text-sm"
                  />
                </div>

                {/* BOTONES */}
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
                      className="bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-zinc-700 transition uppercase text-xs"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </form>
            </section>
          </div>

          {/* COLUMNA DERECHA - LISTA DE RECURSOS */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">📦 Recursos ({items.length})</h2>
              {items.length > 0 && (
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-zinc-400">
                  Total: ${items.reduce((sum, i) => sum + i.precio, 0).toFixed(2)}
                </span>
              )}
            </div>
            
            {items.length === 0 ? (
              <div className="text-center py-16 border border-white/10 rounded-2xl bg-zinc-950/50">
                <p className="text-zinc-500 text-sm">📭 No hay recursos aún</p>
                <p className="text-zinc-600 text-xs mt-1">Crea el primero con el formulario ↖️</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-900/50 to-black border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all group"
                  >
                    {/* IMAGEN */}
                    <div className="relative mb-3 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.imagen_url} 
                        alt={item.nombre}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.categoria === "SHOP" ? "bg-blue-600 text-white" :
                          item.categoria === "ACADEMY" ? "bg-purple-600 text-white" :
                          "bg-green-600 text-white"
                        }`}>
                          {item.categoria === "SHOP" ? "🛍️" : item.categoria === "ACADEMY" ? "📚" : "⚙️"}
                        </span>
                      </div>
                    </div>

                    {/* CONTENIDO */}
                    <div>
                      <h3 className="font-black text-sm line-clamp-2 mb-1">{item.nombre}</h3>
                      <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{item.descripcion.substring(0, 60)}...</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-black text-white">${item.precio}</span>
                        {item.etiqueta && <span className="text-xs bg-white/10 px-2 py-1 rounded">{item.etiqueta}</span>}
                      </div>

                      {item.stock && (
                        <p className="text-xs text-zinc-500 mb-3">📦 Stock: {item.stock}</p>
                      )}
                    </div>

                    {/* ACCIONES */}
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/50 text-blue-300 px-3 py-2 rounded font-bold text-xs transition uppercase"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-300 px-3 py-2 rounded font-bold text-xs transition uppercase"
                      >
                        🗑️
                      </button>
                      <a
                        href={item.enlace_externo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded font-bold text-xs transition uppercase"
                      >
                        🔗
                      </a>
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
