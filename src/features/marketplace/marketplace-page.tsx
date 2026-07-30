"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/supabase-helpers";
import { useAppStore } from "@/src/store/app-store";
import { useAuth } from "@/src/contexts/auth-context";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Search, Sparkles, SlidersHorizontal, Star, TrendingUp, Clock, Flame, Zap, Award, Eye, ShoppingCart, GitCompare, X } from "lucide-react";

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

  // Sistema de Comparación
  const [compareItems, setCompareItems] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("ion-compare");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showCompare, setShowCompare] = useState(false);

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
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push("/invite");
      return;
    }
    const next = wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id];
    setWishlist(next);
    localStorage.setItem("ion-wishlist", JSON.stringify(next));
  };

  const toggleCompare = (id: string) => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push("/invite");
      return;
    }
    if (compareItems.includes(id)) {
      const next = compareItems.filter((x) => x !== id);
      setCompareItems(next);
      localStorage.setItem("ion-compare", JSON.stringify(next));
    } else if (compareItems.length < 3) {
      const next = [...compareItems, id];
      setCompareItems(next);
      localStorage.setItem("ion-compare", JSON.stringify(next));
    }
  };

  const handleViewListing = (id: string) => {
    if (!user) {
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

      {/* LISTINGS DESTACADOS - Tendencias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-3xl border border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 to-transparent p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-black text-yellow-400">🔥 Tendencias del Momento</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredListings.slice(0, 4).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 group cursor-pointer"
              onClick={() => handleViewListing(item.id)}
            >
              <div className="relative h-32 overflow-hidden">
                <Image 
                  src={item.images?.[0] || "/placeholder.png"} 
                  alt={item.title} 
                  fill 
                  sizes="100vw"
                  className="object-cover transition duration-500 group-hover:scale-110" 
                  unoptimized 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-sm font-black text-white line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-yellow-400 font-black">${item.price}</p>
                </div>
                <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-[10px] font-black">
                  #{index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-3">
        {(["ALL", "SHOP", "ACADEMY", "SERVICES", "JOBS", "BUSINESS"] as const).map((category) => (
          <button key={category} onClick={() => useAppStore.getState().setSelectedCategory(category)} className={`rounded-full border px-4 py-2 text-sm transition ${selectedCategory === category ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"}`}>
            {category === "ALL" ? "Todo" : category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-10 text-center text-zinc-500">Cargando marketplace...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {filteredListings.map((item) => (
            <motion.article key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <div className="relative h-48 overflow-hidden">
                <Image src={item.images?.[0] || "/placeholder.png"} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-110" unoptimized />
                
                {/* Badges Premium */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.rating && item.rating >= 4.5 && (
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-[10px] font-black text-black shadow-lg">
                      <Award className="h-3 w-3" />
                      <span>TOP RATED</span>
                    </div>
                  )}
                  {item.price < 50 && (
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-400 to-green-600 px-3 py-1 text-[10px] font-black text-black shadow-lg">
                      <Zap className="h-3 w-3" />
                      <span>OFERTA</span>
                    </div>
                  )}
                </div>

                <button onClick={() => toggleWishlist(item.id)} className="absolute right-4 top-4 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 transition hover:scale-110">
                  <Heart className={`h-4 w-4 ${wishlist.includes(item.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                </button>
                
                <button 
                  onClick={() => toggleCompare(item.id)}
                  className={`absolute right-14 top-4 rounded-full p-2 text-white transition hover:scale-110 ${
                    compareItems.includes(item.id) 
                      ? "bg-blue-500 hover:bg-blue-600" 
                      : "bg-black/70 hover:bg-black/90"
                  }`}
                  title={compareItems.includes(item.id) ? "Quitar de comparación" : "Comparar"}
                >
                  <GitCompare className="h-4 w-4" />
                </button>
                
                {item.rating && (
                  <div className="absolute right-4 top-14 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs backdrop-blur">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-black">{item.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Vistas Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-zinc-300 backdrop-blur">
                  <Eye className="h-3 w-3" />
                  <span>{Math.floor(Math.random() * 500) + 100}</span>
                </div>
              </div>
              
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">{item.category_name || "General"}</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-white">${item.price}</span>
                    {item.price < 50 && (
                      <p className="text-[10px] text-green-400 font-black">¡Precio especial!</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-black line-clamp-2 group-hover:text-yellow-400 transition">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.description}</p>
                </div>
                
                {item.seller_name && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-black text-xs">
                      {item.seller_name.charAt(0)}
                    </div>
                    <span>{item.seller_name}</span>
                    {item.seller_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{item.seller_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Estadísticas de vendedor Premium */}
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
                      <Zap className="h-3 w-3 text-yellow-400" />
                      <span>Respuesta rápida</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-black">Premium</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewListing(item.id)}
                      className="rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200 transition hover:scale-105 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver más
                    </button>
                    <button 
                      onClick={() => handleViewListing(item.id)}
                      className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 text-sm font-black text-black hover:from-yellow-300 hover:to-yellow-500 transition hover:scale-105 flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* MODAL DE COMPARACIÓN */}
      {showCompare && compareItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur p-4"
          onClick={() => setShowCompare(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Comparar Productos ({compareItems.length}/3)</h2>
              <button
                onClick={() => setShowCompare(false)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {filteredListings.filter(item => compareItems.includes(item.id)).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 space-y-4">
                  <div className="relative h-40 overflow-hidden rounded-xl">
                    <Image 
                      src={item.images?.[0] || "/placeholder.png"} 
                      alt={item.title} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black text-white line-clamp-2">{item.title}</h3>
                    <p className="text-2xl font-black text-yellow-400 mt-2">${item.price}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Categoría</span>
                      <span className="text-white font-semibold">{item.category_name || "General"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Rating</span>
                      <span className="text-white font-semibold flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {item.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Vendedor</span>
                      <span className="text-white font-semibold">{item.seller_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Rating Vendedor</span>
                      <span className="text-white font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {item.seller_rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        toggleCompare(item.id);
                        if (compareItems.length === 1) setShowCompare(false);
                      }}
                      className="w-full rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-400 hover:bg-red-500/20 transition"
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {compareItems.length < 3 && (
              <p className="text-center text-zinc-500 mt-6 text-sm">
                Puedes comparar hasta 3 productos. Selecciona más para agregar a la comparación.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* BOTÓN FLOTANTE DE COMPARACIÓN */}
      {compareItems.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowCompare(true)}
          className="fixed bottom-24 right-8 z-40 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition hover:scale-105 flex items-center gap-2"
        >
          <GitCompare className="h-5 w-5" />
          Comparar ({compareItems.length})
        </motion.button>
      )}
    </div>
  );
}
