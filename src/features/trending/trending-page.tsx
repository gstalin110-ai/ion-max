"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/contexts/auth-context";
import { getCommunityPosts } from "@/src/services/social";
import { Flame, Heart, MessageCircle, Clock, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function TrendingPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viralThreshold, setViralThreshold] = useState(5000); // Personalizable desde admin

  useEffect(() => {
    async function loadTrendingPosts() {
      try {
        const allPosts = await getCommunityPosts();
        // Filtrar posts virales (likes > threshold)
        const viralPosts = allPosts.filter(post => (post.likes_count || 0) >= viralThreshold);
        // Ordenar por likes descendente
        viralPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        setPosts(viralPosts);
      } catch (error) {
        console.error("Error loading trending posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTrendingPosts();
  }, [viralThreshold]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-900 to-black p-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-full bg-orange-500/20 p-3">
            <Flame className="h-8 w-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Trending</h1>
            <p className="text-sm text-zinc-400">Contenido viral de la comunidad</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Umbral viral:</span>
          <span className="font-black text-orange-400">{viralThreshold.toLocaleString()} likes</span>
        </div>
      </motion.div>

      {/* Lista de posts virales */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-zinc-500">
            No hay contenido viral todavía. ¡Sé el primero en crear algo increíble!
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 hover:border-orange-400/30 transition relative overflow-hidden"
            >
              {/* Sombra de fondo según color */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 pointer-events-none" />
              
              <div className="relative">
                {/* Header del post */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-sm font-black text-white">
                    {(post.author?.full_name ?? "?")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{post.author?.full_name || "Usuario"}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  {/* Badge de ranking */}
                  <div className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white">
                    #{index + 1}
                  </div>
                </div>

                {/* Contenido */}
                <p className="text-sm leading-relaxed text-zinc-300 mb-4">{post.content}</p>

                {/* Imágenes */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {post.images.slice(0, 4).map((image: string, i: number) => (
                      <div key={i} className="relative h-48 rounded-xl overflow-hidden">
                        <Image
                          src={image}
                          alt={`Post image ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Estadísticas */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-red-400">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="font-black">{(post.likes_count || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-black">{(post.comments_count || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Eye className="h-4 w-4" />
                    <span className="font-black">{(post.likes_count || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Badge viral */}
                {(post.likes_count || 0) >= viralThreshold && (
                  <div className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 w-fit">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-black text-orange-400">VIRAL</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
