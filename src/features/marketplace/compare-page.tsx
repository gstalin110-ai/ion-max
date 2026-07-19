"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Check, ArrowLeft, Star } from "lucide-react";
import { Listing } from "@/lib/types";

export function ComparePage() {
  const [compareList, setCompareList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });

  useEffect(() => {
    const saved = localStorage.getItem("ion-compare");
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch {
        setCompareList([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("ion-compare", JSON.stringify(compareList));
  }, [compareList]);

  const compareItems = listings.filter((item) => compareList.includes(item.id));

  const removeFromCompare = (id: string) => {
    setCompareList(prev => prev.filter(item => item !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-zinc-400">Cargando comparación...</p>
        </div>
      </div>
    );
  }

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="text-3xl font-black mb-4">No hay productos para comparar</h1>
          <p className="text-zinc-400 mb-8">Selecciona productos del marketplace para comparar sus características</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al marketplace
            </Link>
            <h1 className="text-4xl font-black">Comparar Productos</h1>
            <p className="mt-2 text-zinc-400">{compareItems.length} productos seleccionados</p>
          </div>
          <button
            onClick={clearCompare}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 hover:border-white/20 hover:bg-white/10 transition"
          >
            Limpiar comparación
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, minmax(300px, 1fr))` }}>
            {/* ENCABEZADOS */}
            <div className="space-y-4">
              <div className="h-20" />
              <div className="space-y-4">
                <div className="h-6" />
                <div className="h-6" />
                <div className="h-6" />
                <div className="h-6" />
                <div className="h-6" />
                <div className="h-6" />
                <div className="h-6" />
              </div>
            </div>

            {/* PRODUCTOS */}
            {compareItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <button
                    onClick={() => removeFromCompare(item.id)}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="h-20 w-full overflow-hidden rounded-xl">
                    <Image
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-black line-clamp-2">{item.title}</h3>
                  <p className="text-2xl font-black text-yellow-400">${item.price}</p>
                </div>
              </motion.div>
            ))}

            {/* CARACTERÍSTICAS */}
            {[
              { label: "Categoría", getValue: (item: Listing) => item.category_name || "General" },
              { label: "Rating", getValue: (item: Listing) => item.rating ? `${item.rating.toFixed(1)} ⭐` : "N/A" },
              { label: "Ubicación", getValue: (item: Listing) => item.location || "No especificada" },
              { label: "Garantía", getValue: () => "100% Garantizado" },
              { label: "Entrega", getValue: () => "Inmediata" },
              { label: "Soporte", getValue: () => "24/7 Premium" },
            ].map((feature, index) => (
              <>
                <div key={index} className="p-4 rounded-xl border border-white/10 bg-zinc-950/50">
                  <p className="font-black text-sm">{feature.label}</p>
                </div>
                {compareItems.map((item) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="p-4 rounded-xl border border-white/10 bg-zinc-950/50 text-center"
                  >
                    <p className="text-sm">{feature.getValue(item)}</p>
                  </div>
                ))}
              </>
            ))}

            {/* ACCIONES */}
            <div className="space-y-4">
              <div className="h-20" />
            </div>
            {compareItems.map((item) => (
              <div key={item.id} className="space-y-3">
                <Link
                  href={`/listing/${item.id}`}
                  className="block w-full rounded-full bg-white px-4 py-3 text-sm font-black text-black hover:bg-zinc-200 transition text-center"
                >
                  Ver detalles
                </Link>
                <button className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white hover:bg-white/10 transition">
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* INFO ADICIONAL */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-zinc-950/50 p-6">
          <h3 className="text-xl font-black mb-4">Consejos de comparación</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Compara precios y características para encontrar la mejor opción</li>
            <li>• Revisa las valoraciones de otros compradores</li>
            <li>• Verifica la ubicación y tiempos de entrega</li>
            <li>• Considera el soporte y garantía ofrecida</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
