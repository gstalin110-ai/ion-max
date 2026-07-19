"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag, ArrowRight } from "lucide-react";
import { Listing } from "@/lib/types";

export function WishlistPage() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });

  useEffect(() => {
    const saved = localStorage.getItem("ion-wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {
        setWishlist([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("ion-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const wishlistItems = listings.filter((item) => wishlist.includes(item.id));

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      localStorage.setItem("ion-wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const clearWishlist = () => {
    if (confirm("¿Eliminar todos los favoritos?")) {
      setWishlist([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-zinc-400">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black">Mis Favoritos</h1>
          <p className="mt-2 text-zinc-400">{wishlistItems.length} {wishlistItems.length === 1 ? 'producto guardado' : 'productos guardados'}</p>
        </div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <Heart className="mx-auto h-20 w-20 text-zinc-600 mb-6" />
            <h2 className="text-3xl font-black mb-4">No tienes favoritos aún</h2>
            <p className="text-zinc-400 mb-8">Explora nuestro marketplace y guarda tus productos preferidos</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition"
            >
              Ir al marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <button
                onClick={clearWishlist}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 hover:border-white/20 hover:bg-white/10 transition"
              >
                Limpiar favoritos
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 hover:border-white/20 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-110"
                      unoptimized
                    />
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute left-4 top-4 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 transition"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                    {item.rating && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-white font-black">{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                        {item.category_name || "General"}
                      </span>
                      <span className="text-lg font-black text-white">${item.price}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black line-clamp-2">{item.title}</h3>
                      <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/listing/${item.id}`}
                        className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200 transition text-center"
                      >
                        Ver más
                      </Link>
                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
