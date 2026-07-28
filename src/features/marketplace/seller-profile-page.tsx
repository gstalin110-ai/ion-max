"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/src/contexts/auth-context";
import {
  Star,
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Shield,
  Award,
  Heart,
  Share2,
  Edit,
} from "lucide-react";
import { getListings } from "@/lib/supabase-helpers";
import { Listing } from "@/lib/types";

interface SellerProfilePageProps {
  sellerId?: string;
}

export function SellerProfilePage({ sellerId }: SellerProfilePageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "about">("products");
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });

  // Filtrar listings del vendedor (en producción esto vendría de Supabase)
  const sellerListings = sellerId 
    ? listings.filter(l => l.user_id === sellerId)
    : listings.filter(l => l.user_id === user?.id);

  // Estadísticas simuladas del vendedor
  const sellerStats = {
    totalSales: 156,
    totalRevenue: 12450,
    averageRating: 4.8,
    totalReviews: 89,
    followers: 234,
    following: 45,
    memberSince: "Enero 2024",
    responseTime: "1-2 horas",
    lastActive: "Hace 2 horas",
    verified: true,
    topSeller: true,
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* HEADER DEL PERFIL */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            {/* Avatar y Info Básica */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                {sellerStats.verified && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black">Vendedor Premium</h1>
                  {sellerStats.topSeller && (
                    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-400">
                      <Award className="mr-1 h-3 w-3 inline" />
                      Top Seller
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-black">{sellerStats.averageRating}</span>
                    <span>({sellerStats.totalReviews} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{sellerStats.followers} seguidores</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Quito, Ecuador</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-3 lg:ml-auto">
              <button
                onClick={toggleFollow}
                className={`rounded-full px-6 py-3 text-sm font-black transition ${
                  isFollowing
                    ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </button>
              <Link
                href={`/mensajes?con=${sellerId || user?.id}`}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white hover:bg-white/10 transition"
              >
                <MessageCircle className="mr-2 h-4 w-4 inline" />
                Contactar
              </Link>
              <button className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white hover:bg-white/10 transition">
                <Share2 className="mr-2 h-4 w-4 inline" />
                Compartir
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{sellerStats.totalSales}</p>
              <p className="text-xs text-zinc-500">Ventas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-yellow-400">${sellerStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-zinc-500">Ingresos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">{sellerListings.length}</p>
              <p className="text-xs text-zinc-500">Productos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-green-400">98%</p>
              <p className="text-xs text-zinc-500">Satisfacción</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`rounded-full px-6 py-3 text-sm font-black transition ${
              activeTab === "products"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            <ShoppingCart className="mr-2 h-4 w-4 inline" />
            Productos ({sellerListings.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`rounded-full px-6 py-3 text-sm font-black transition ${
              activeTab === "reviews"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            <Star className="mr-2 h-4 w-4 inline" />
            Reseñas ({sellerStats.totalReviews})
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`rounded-full px-6 py-3 text-sm font-black transition ${
              activeTab === "about"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            <Users className="mr-2 h-4 w-4 inline" />
            Sobre mí
          </button>
        </div>

        {/* CONTENIDO DE LOS TABS */}
        {activeTab === "products" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {sellerListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 hover:border-white/20 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={listing.images?.[0] || "/placeholder.png"}
                    alt={listing.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                    unoptimized
                  />
                  {listing.rating && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-black">{listing.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                      {listing.category_name || "General"}
                    </span>
                    <span className="text-lg font-black text-white">${listing.price}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black line-clamp-2">{listing.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{listing.description}</p>
                  </div>
                  <Link
                    href={`/listing/${listing.id}`}
                    className="block w-full rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200 transition text-center"
                  >
                    Ver más
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {/* Reseñas de ejemplo */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                    <div>
                      <p className="font-black">Cliente Satisfecho {i + 1}</p>
                      <p className="text-xs text-zinc-500">Hace {i + 1} semana(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-zinc-400">
                  Excelente producto, llegó en tiempo y forma. El vendedor fue muy amable y profesional. 
                  Definitivamente volveré a comprar.
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
                  <button className="flex items-center gap-1 hover:text-white transition">
                    <Heart className="h-4 w-4" />
                    Útil
                  </button>
                  <button className="hover:text-white transition">Responder</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8">
            <h2 className="text-2xl font-black mb-6">Sobre el Vendedor</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Miembro desde</p>
                    <p className="font-black">{sellerStats.memberSince}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Tiempo de respuesta</p>
                    <p className="font-black">{sellerStats.responseTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Estado</p>
                    <p className="font-black text-green-400">Verificado</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Descripción</p>
                  <p className="text-zinc-400 leading-relaxed">
                    Vendedor premium con más de 5 años de experiencia en el marketplace. 
                    Especializado en productos de alta calidad con excelente servicio al cliente. 
                    Garantizo satisfacción en cada compra.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                      Tecnología
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                      Electrónica
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                      Accesorios
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
