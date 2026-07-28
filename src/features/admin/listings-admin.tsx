"use client";

import { useCallback, useEffect, useState } from "react";
import { Listing, ListingFormData } from "@/lib/types";
import { getListings, createListing, updateListing, deleteListing } from "@/lib/supabase-helpers";
import { getDashboardStats, type DashboardStats } from "@/src/services/account";
import { ListingFormSchema } from "@/lib/validation";
import { motion } from "framer-motion";
import { z } from "zod";

export function ListingsAdmin() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    category_id: "",
    location: "",
    tags: "",
    images: [""],
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
      console.warn("No se pudieron obtener métricas:", err);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadListings(), loadDashboard()]);
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
        showMessage("success", "Publicación actualizada");
        setEditingId(null);
      } else {
        await createListing(formData);
        showMessage("success", "Publicación creada");
      }

      setFormData({
        title: "",
        description: "",
        price: "",
        category_id: "",
        location: "",
        tags: "",
        images: [""],
      });
      await loadListings();
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Desconocido"}`);
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
      images: listing.images,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta publicación?")) return;
    setProcessing(true);
    try {
      await deleteListing(id);
      showMessage("success", "Publicación eliminada");
      await loadListings();
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-blue-600/30 bg-blue-600/10 p-3">
          <p className="text-xs font-bold uppercase text-blue-400">Productos</p>
          <p className="text-2xl font-black text-blue-300">{dashboard?.products ?? 0}</p>
        </div>
        <div className="rounded-xl border border-purple-600/30 bg-purple-600/10 p-3">
          <p className="text-xs font-bold uppercase text-purple-400">Cursos</p>
          <p className="text-2xl font-black text-purple-300">{dashboard?.courses ?? 0}</p>
        </div>
        <div className="rounded-xl border border-green-600/30 bg-green-600/10 p-3">
          <p className="text-xs font-bold uppercase text-green-400">Servicios</p>
          <p className="text-2xl font-black text-green-300">{dashboard?.services ?? 0}</p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-bold ${
            message.type === "success"
              ? "border border-green-600/50 bg-green-600/20 text-green-400"
              : "border border-red-600/50 bg-red-600/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 lg:col-span-1">
          <h2 className="mb-4 text-xl font-black">{editingId ? "Editar" : "Nueva publicación"}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {(["title", "price", "description"] as const).map((field) => (
              <div key={field}>
                <input
                  type={field === "price" ? "number" : "text"}
                  placeholder={field === "title" ? "Título" : field === "price" ? "Precio USD" : "Descripción"}
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-black p-3 text-sm text-white"
                  required={field !== "description"}
                />
                {formErrors[field] && <p className="mt-1 text-xs text-red-400">{formErrors[field]}</p>}
              </div>
            ))}
            <input
              type="url"
              placeholder="URL imagen"
              value={formData.images[0]}
              onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
              className="w-full rounded-lg border border-white/20 bg-black p-3 text-sm text-white"
              required
            />
            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-lg bg-white py-3 text-sm font-black text-black disabled:opacity-50"
            >
              {processing ? "Guardando..." : editingId ? "Actualizar" : "Publicar"}
            </button>
          </form>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-black">Publicaciones ({listings.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <motion.div
                key={listing.id}
                className="rounded-xl border border-white/10 bg-zinc-900/50 p-4"
              >
                <img
                  src={listing.images?.[0] || "/placeholder.png"}
                  alt={listing.title}
                  className="mb-3 h-28 w-full rounded-lg object-cover"
                />
                <h3 className="font-black">{listing.title}</h3>
                <p className="text-lg font-black text-white">${listing.price}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(listing)}
                    className="flex-1 rounded-lg border border-blue-600/50 bg-blue-600/20 py-2 text-xs font-bold text-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(listing.id)}
                    className="flex-1 rounded-lg border border-red-600/50 bg-red-600/20 py-2 text-xs font-bold text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
