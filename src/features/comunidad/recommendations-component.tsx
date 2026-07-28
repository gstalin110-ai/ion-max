"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, TrendingUp, Heart, Star, ArrowRight } from "lucide-react";
import { getListings } from "@/lib/supabase-helpers";
import { Listing } from "@/lib/types";

export function RecommendationsComponent() {
  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });

  // Algoritmo de recomendación basado en:
  // - Productos con mejor rating
  // - Productos más recientes
  // - Productos en categorías populares
  const getRecommendations = (): Listing[] => {
    if (listings.length === 0) return [];

    // Productos mejor valorados
    const topRated = [...listings]
      .filter(l => l.rating && l.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    // Productos más recientes
    const recent = [...listings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    // Productos con mejor precio
    const bestValue = [...listings]
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    // Combinar y eliminar duplicados
    const combined = [...topRated, ...recent, ...bestValue];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    return unique.slice(0, 6);
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-yellow-400/10 p-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-black">Recomendados para ti</h3>
            <p className="text-xs text-zinc-500">Basado en tu actividad</p>
          </div>
        </div>
        <Link
          href="/marketplace"
          className="text-xs font-black text-yellow-400 hover:text-yellow-300 transition"
        >
          Ver más →
        </Link>
      </div>

      <div className="space-y-3">
        {recommendations.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/listing/${listing.id}`}
              className="block rounded-2xl border border-white/10 bg-black/60 p-3 hover:border-white/20 transition"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={listing.images?.[0] || "/placeholder.png"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm line-clamp-1">{listing.title}</p>
                      <p className="text-xs text-zinc-500">{listing.category_name || "General"}</p>
                    </div>
                    {listing.rating && (
                      <div className="flex items-center gap-1 text-xs flex-shrink-0">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400">{listing.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-black text-yellow-400">${listing.price}</p>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <TrendingUp className="h-3 w-3" />
                      <span>Popular</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Banner de recomendación */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 to-yellow-400/5 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-yellow-400 p-2">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-white">Descubre más productos</p>
            <p className="text-xs text-zinc-400">Personalizados según tus intereses</p>
          </div>
          <Link
            href="/marketplace"
            className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-black hover:bg-yellow-300 transition"
          >
            Explorar
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
