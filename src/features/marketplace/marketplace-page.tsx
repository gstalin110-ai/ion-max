"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/supabase-helpers";
import { useAppStore } from "@/src/store/app-store";
import { motion } from "framer-motion";
import { Heart, Search, Sparkles } from "lucide-react";

export function MarketplacePage() {
  const { searchQuery, selectedCategory, setSearchQuery } = useAppStore();
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("ion-wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { data: listings = [], isLoading } = useQuery({ queryKey: ["listings"], queryFn: getListings });

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesCategory = selectedCategory === "ALL" || item.category_name === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [listings, searchQuery, selectedCategory]);

  const toggleWishlist = (id: string) => {
    const next = wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id];
    setWishlist(next);
    localStorage.setItem("ion-wishlist", JSON.stringify(next));
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Marketplace universal</p>
            <h1 className="mt-3 text-4xl font-black">Descubre, compra, vende y conecta.</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">Productos, servicios, cursos, empleos y empresas en un solo lugar.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            <Search className="h-4 w-4" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar publicaciones" className="w-48 bg-transparent outline-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {(["ALL", "SHOP", "ACADEMY", "SERVICES", "JOBS", "BUSINESS"] as const).map((category) => (
          <button key={category} onClick={() => useAppStore.getState().setSelectedCategory(category)} className={`rounded-full border px-4 py-2 text-sm ${selectedCategory === category ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-zinc-400"}`}>
            {category === "ALL" ? "Todo" : category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-10 text-center text-zinc-500">Cargando marketplace...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {filteredListings.map((item) => (
            <motion.article key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80">
              <div className="relative h-48 overflow-hidden">
                <Image src={item.images?.[0] || "/placeholder.png"} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-110" unoptimized />
                <button onClick={() => toggleWishlist(item.id)} className="absolute left-4 top-4 rounded-full bg-black/70 p-2 text-white">
                  <Heart className={`h-4 w-4 ${wishlist.includes(item.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">{item.category_name || "General"}</span>
                  <span className="text-sm font-black text-white">${item.price}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Sparkles className="h-4 w-4" />
                    Premium
                  </div>
                  <a href={`/listing/${item.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">Ver más</a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
