"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/supabase-helpers";
import { useAppStore } from "@/src/store/app-store";
import { useAuth } from "@/src/contexts/auth-context";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Search, Sparkles, SlidersHorizontal, Star, TrendingUp, Clock } from "lucide-react";

export function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
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

  // Filtros avanzados
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "rating">("recent");
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings = [], isLoading } = useQuery({ queryKey: ["listings"], queryFn: getListings });

  const filteredListings = useMemo(() => {
    let filtered = listings.filter((item) => {
      const matchesCategory = selectedCategory === "ALL" || item.category_name === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      const matchesRating = (item.rating || 0) >= minRating;
      return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    });

    // Ordenamiento
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
        break;
    }

    return filtered;
  }, [listings, searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  const toggleWishlist = (id: string) => {
    if (!user) {
      // Guardar la URL actual para redirección después del login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push("/invite");
      return;
    }
    const next = wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id];
    setWishlist(next);
    localStorage.setItem("ion-wishlist", JSON.stringify(next));
  };

  const handleViewListing = (id: string) => {
    if (!user) {
      // Guardar la URL actual para redirección después del login
      localStorage.setItem("redirectAfterLogin", `/listing/${id}`);
      router.push("/invite");
      return;
    }
    router.push(`/listing/${id}`);
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
              <Search className="h-4 w-4" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar publicaciones" className="w-48 bg-transparent outline-none" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400 hover:bg-white/10 transition"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PANEL DE FILTROS AVANZADOS */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-3">
            {/* Rango de Precio */}
            <div>
              <label className="mb-3 block text-sm font-black text-zinc-400">Rango de Precio</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">Min:</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">Max:</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rating Mínimo */}
            <div>
              <label className="mb-3 block text-sm font-black text-zinc-400">Rating Mínimo</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      minRating === rating
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                        : "border-white/10 bg-black text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {rating === 0 ? "Todos" : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="mb-3 block text-sm font-black text-zinc-400">Ordenar Por</label>
              <div className="space-y-2">
                {[
                  { value: "recent", label: "Más recientes", icon: <Clock className="h-4 w-4" /> },
                  { value: "price-asc", label: "Precio: Menor a Mayor", icon: <TrendingUp className="h-4 w-4" /> },
                  { value: "price-desc", label: "Precio: Mayor a Menor", icon: <TrendingUp className="h-4 w-4 rotate-180" /> },
                  { value: "rating", label: "Mejor valorados", icon: <Star className="h-4 w-4" /> },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                      sortBy === option.value
                        ? "border-white bg-white/10 text-white"
                        : "border-white/10 bg-black text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <p className="text-sm text-zinc-400">
              {filteredListings.length} resultados encontrados
            </p>
            <button
              onClick={() => {
                setPriceRange([0, 10000]);
                setMinRating(0);
                setSortBy("recent");
              }}
              className="text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          </div>
        </motion.div>
      )}

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
            <motion.article key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 hover:border-white/20 transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <Image src={item.images?.[0] || "/placeholder.png"} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-110" unoptimized />
                <button onClick={() => toggleWishlist(item.id)} className="absolute left-4 top-4 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 transition">
                  <Heart className={`h-4 w-4 ${wishlist.includes(item.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
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
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">{item.category_name || "General"}</span>
                  <span className="text-lg font-black text-white">${item.price}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black line-clamp-2">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.description}</p>
                </div>
                {item.seller_name && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                    <span>{item.seller_name}</span>
                    {item.seller_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{item.seller_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Estadísticas de vendedor */}
                {item.seller_rating && (
                  <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-white/10 pt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{item.seller_rating.toFixed(1)} rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">✓</span>
                      <span>Verificado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⚡</span>
                      <span>Respuesta rápida</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Sparkles className="h-4 w-4" />
                    Premium
                  </div>
                  <button onClick={() => handleViewListing(item.id)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200 transition">Ver más</button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
