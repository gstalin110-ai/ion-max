"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListing } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Share2, MessageCircle, ShoppingCart, Shield, Clock, MapPin, ChevronLeft, ThumbsUp } from "lucide-react";

interface ListingDetailPageProps {
  listingId: string;
}

export function ListingDetailPage({ listingId }: ListingDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("ion-wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reseñas de ejemplo (en producción vendrían de Supabase)
  const reviews = [
    { id: 1, user: "María García", rating: 5, text: "Excelente producto, superó mis expectativas", date: "Hace 2 días" },
    { id: 2, user: "Carlos Rodríguez", rating: 4, text: "Muy buena calidad, entrega rápida", date: "Hace 1 semana" },
    { id: 3, user: "Ana Martínez", rating: 5, text: "Increíble servicio al cliente", date: "Hace 2 semanas" },
  ];

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => getListing(listingId),
  });

  const toggleWishlist = () => {
    if (!listing) return;
    const next = wishlist.includes(listing.id) ? wishlist.filter((x) => x !== listing.id) : [...wishlist, listing.id];
    setWishlist(next);
    localStorage.setItem("ion-wishlist", JSON.stringify(next));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-zinc-400">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">No se encontró el producto</p>
          <Link href="/marketplace" className="mt-4 inline-block text-yellow-400 hover:text-yellow-300">
            ← Volver al marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al marketplace
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* IMÁGENES */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
              <Image
                src={listing.images?.[selectedImage] || "/placeholder.png"}
                alt={listing.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {listing.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      selectedImage === index ? "border-yellow-400" : "border-white/10"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* DETALLES */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* TÍTULO Y PRECIO */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    {listing.category_name || "General"}
                  </span>
                  <h1 className="mt-4 text-4xl font-black">{listing.title}</h1>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">${listing.price}</p>
                  {listing.rating && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-black">{listing.rating.toFixed(1)}</span>
                      {listing.review_count && (
                        <span className="text-zinc-500">({listing.review_count} reseñas)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex gap-3">
              <button className="flex-1 rounded-full bg-white px-6 py-4 text-sm font-black text-black hover:bg-zinc-200 transition">
                <ShoppingCart className="mr-2 h-4 w-4 inline" />
                Agregar al carrito
              </button>
              <button
                onClick={toggleWishlist}
                className={`rounded-full border px-4 py-4 transition ${
                  wishlist.includes(listing.id)
                    ? "border-red-500 bg-red-500/10 text-red-500"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                }`}
              >
                <Heart className={`h-5 w-5 ${wishlist.includes(listing.id) ? "fill-red-500" : ""}`} />
              </button>
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-4 text-zinc-400 hover:border-white/20 transition">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* VENDEDOR */}
            {listing.seller_name && (
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                    <div>
                      <p className="font-black">{listing.seller_name}</p>
                      {listing.seller_rating && (
                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{listing.seller_rating.toFixed(1)} rating</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/mensajes?listing=${listing.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black hover:bg-white/10 transition"
                  >
                    <MessageCircle className="mr-2 h-4 w-4 inline" />
                    Contactar
                  </Link>
                </div>
              </div>
            )}

            {/* DESCRIPCIÓN */}
            <div className="space-y-4">
              <h2 className="text-xl font-black">Descripción</h2>
              <p className="text-zinc-400 leading-relaxed">{listing.description}</p>
            </div>

            {/* CARACTERÍSTICAS */}
            <div className="space-y-4">
              <h2 className="text-xl font-black">Características</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Garantía</p>
                    <p className="font-black">100% Garantizado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Entrega</p>
                    <p className="font-black">Inmediata</p>
                  </div>
                </div>
                {listing.location && (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
                    <MapPin className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Ubicación</p>
                      <p className="font-black">{listing.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ETIQUETAS */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-black">Etiquetas</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* RESEÑAS Y VALORACIONES */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Reseñas</h2>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-400 hover:bg-yellow-400/20 transition"
                >
                  {showReviewForm ? "Cancelar" : "Escribir reseña"}
                </button>
              </div>

              {/* FORMULARIO DE RESEÑA */}
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-sm font-black text-zinc-400">Tu valoración</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setReviewRating(rating)}
                          className="transition hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              rating <= reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-zinc-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-zinc-400">Tu reseña</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Comparte tu experiencia..."
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm min-h-32"
                    />
                  </div>
                  <button className="rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition">
                    Publicar reseña
                  </button>
                </motion.div>
              )}

              {/* LISTA DE RESEÑAS */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                        <div>
                          <p className="font-black">{review.user}</p>
                          <p className="text-xs text-zinc-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-zinc-400">{review.text}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
                      <button className="flex items-center gap-1 hover:text-white transition">
                        <ThumbsUp className="h-4 w-4" />
                        Útil
                      </button>
                      <button className="hover:text-white transition">Responder</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
