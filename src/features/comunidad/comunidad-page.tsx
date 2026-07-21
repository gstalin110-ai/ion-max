"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Sparkles,
  Send,
  Plus,
  Filter,
} from "lucide-react";
import {
  createCommunityPost,
  ensureProfile,
  getCommunityMembers,
  getCommunityPosts,
  getDirectMessages,
  sendDirectMessage,
  type CommunityMember,
  type CommunityPost,
  type DirectMessage,
} from "@/src/services/social";
import { getListings } from "@/lib/supabase-helpers";
import { Listing } from "@/lib/types";
import { StoriesComponent } from "./stories-component";
import { NotificationsComponent } from "./notifications-component";
import { RecommendationsComponent } from "./recommendations-component";

export function ComunidadPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "products" | "posts">("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<CommunityMember | null>(null);
  const [chatMessages, setChatMessages] = useState<DirectMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  // Sugerencias de ayuda para escribir
  const suggestions = [
    "Oferta especial: ",
    "Promoción limitada: ",
    "Nuevo producto disponible: ",
    "Servicio premium: ",
    "Curso exclusivo: ",
    "Oportunidad de negocio: ",
    "¡Gran descuento! ",
    "Solo por hoy: ",
    "Edición limitada: ",
    "Calidad garantizada: "
  ];
  
  // Sistema de likes y comentarios
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedByUser, setLikedByUser] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  
  // Sistema de seguimiento
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedByUser(prev => {
      const isLiked = !prev[postId];
      const updated = { ...prev, [postId]: isLiked };
      setLikes(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + (isLiked ? 1 : -1),
      }));
      return updated;
    });
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const addComment = (postId: string) => {
    if (!newComment[postId]?.trim()) return;
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment[postId]],
    }));
    setNewComment(prev => ({ ...prev, [postId]: "" }));
  };

  const toggleFollow = (memberId: string) => {
    setFollowing(prev => {
      const updated = new Set(prev);
      if (updated.has(memberId)) {
        updated.delete(memberId);
      } else {
        updated.add(memberId);
      }
      return updated;
    });
  };

  const openChat = async (member: CommunityMember) => {
    if (!user) return;
    setSelectedChatUser(member);
    setShowChatPanel(true);
    try {
      const messages = await getDirectMessages(user.id, member.id);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChatUser || !chatInput.trim()) return;
    try {
      await sendDirectMessage(user.id, selectedChatUser.id, chatInput.trim());
      setChatInput("");
      const messages = await getDirectMessages(user.id, selectedChatUser.id);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        await ensureProfile(user.id, user.email ?? "", user.user_metadata?.nombre_completo);
        const [membersData, postsData] = await Promise.all([
          getCommunityMembers(user.id),
          getCommunityPosts(),
        ]);
        setMembers(membersData);
        setPosts(postsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Por favor selecciona solo archivos de imagen');
      return;
    }

    setPostImages(prev => [...prev, ...validFiles]);
    
    // Crear previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToSupabase = async (files: File[]): Promise<string[]> => {
    const { supabase } = await import("@/src/lib/supabase/client");
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `community-posts/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newPost.trim()) return;
    setPosting(true);
    try {
      let imageUrls: string[] = [];
      if (postImages.length > 0) {
        imageUrls = await uploadImagesToSupabase(postImages);
      }
      
      await createCommunityPost(
        user.id, 
        newPost.trim(), 
        imageUrls[0], 
        imageUrls
      );
      setNewPost("");
      setPostImages([]);
      setImagePreviews([]);
      const postsData = await getCommunityPosts();
      setPosts(postsData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo publicar. Verifica las tablas en Supabase.");
    } finally {
      setPosting(false);
    }
  }

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.profession?.toLowerCase().includes(q)
    );
  });

  // Combinar posts y listings en el feed
  const feedItems = [
    ...posts.map((post) => ({
      type: "post" as const,
      data: post,
      id: post.id,
      created_at: post.created_at,
    })),
    ...listings.slice(0, 5).map((listing) => ({
      type: "product" as const,
      data: listing,
      id: listing.id,
      created_at: listing.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredFeed = feedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "products") return item.type === "product";
    if (filter === "posts") return item.type === "post";
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* HEADER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Red social de ventas</p>
            <h1 className="mt-3 text-4xl font-black text-white">Comunidad IÓN MAX</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Conecta con vendedores, descubre productos exclusivos y comparte tus ofertas con la comunidad.
            </p>
          </div>
          <div className="flex gap-3">
            <NotificationsComponent />
            <Link
              href="/marketplace"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition"
            >
              <ShoppingCart className="mr-2 h-4 w-4 inline" />
              Ir al Marketplace
            </Link>
            <Link
              href="/publish"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white hover:bg-white/10 transition"
            >
              <Plus className="mr-2 h-4 w-4 inline" />
              Publicar
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* HISTORIAS (STORIES) */}
          <StoriesComponent />

          {/* FORMULARIO DE PUBLICACIÓN */}
          <form onSubmit={handlePost} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <textarea
                    value={newPost}
                    onChange={(e) => {
                      setNewPost(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(newPost.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Comparte una oferta, promoción o actualización..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                  />
                  
                  {/* Sugerencias de ayuda */}
                  {showSuggestions && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl">
                      <p className="text-xs text-zinc-500 mb-2 px-2">Sugerencias:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewPost(prev => prev + suggestion)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Previews de imágenes */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition">
                    📷
                  </button>
                </label>
                <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition">
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="rounded-full bg-yellow-400 px-6 py-2 text-sm font-black text-black disabled:opacity-50"
              >
                {posting ? "Publicando..." : <><Send className="mr-2 h-4 w-4 inline" /> Publicar</>}
              </button>
            </div>
          </form>

          {/* FILTROS */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                filter === "all"
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-zinc-400"
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilter("products")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                filter === "products"
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-zinc-400"
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setInterval(() => setFilter("posts"), 5000)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                filter === "posts"
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-zinc-400"
              }`}
            >
              Posts
            </button>
          </div>

          {/* FEED */}
          <div className="space-y-4">
            {filteredFeed.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-zinc-500">
                No hay contenido para mostrar.
              </div>
            ) : (
              filteredFeed.map((item) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-white/10 bg-zinc-950/80 overflow-hidden"
                >
                  {item.type === "product" ? (
                    // PRODUCT CARD
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                        <div>
                          <p className="font-bold text-white">
                            {item.data.seller_name || "Vendedor Premium"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.data.seller_rating ? `⭐ ${item.data.seller_rating.toFixed(1)}` : "Vendedor verificado"} ·{" "}
                            {new Date(item.data.created_at).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <span className="ml-auto rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-400">
                          Nuevo producto
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={item.data.images?.[0] || "/placeholder.png"}
                            alt={item.data.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{item.data.title}</h3>
                          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{item.data.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-2xl font-black text-yellow-400">${item.data.price}</span>
                            <div className="flex gap-2">
                              <Link
                                href={`/listing/${item.data.id}`}
                                className="rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200 transition"
                              >
                                Ver más
                              </Link>
                              <button className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition">
                                <Heart className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // POST CARD
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/20 text-sm font-black text-yellow-400">
                          {(item.data.author?.full_name ?? "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {item.data.author?.full_name ?? "Profesional"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.data.author?.profession ?? "Miembro IÓN MAX"} ·{" "}
                            {new Date(item.data.created_at).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-300">{item.data.content}</p>
                      
                      {/* Imágenes del post */}
                      {(item.data.image_url || (item.data.images && item.data.images.length > 0)) && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {item.data.image_url && (
                            <div className="relative h-48 w-full overflow-hidden rounded-xl">
                              <Image
                                src={item.data.image_url}
                                alt="Post image"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          {item.data.images && item.data.images.map((img, idx) => (
                            <div key={idx} className="relative h-48 w-full overflow-hidden rounded-xl">
                              <Image
                                src={img}
                                alt={`Post image ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Likes y Comentarios */}
                      <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 border-t border-white/10 pt-4">
                        <button
                          onClick={() => toggleLike(item.id)}
                          className={`flex items-center gap-1 transition ${
                            likedByUser[item.id] ? "text-red-500" : "hover:text-white"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${likedByUser[item.id] ? "fill-red-500" : ""}`} />
                          {likes[item.id] || 0}
                        </button>
                        <button
                          onClick={() => toggleComments(item.id)}
                          className="flex items-center gap-1 hover:text-white transition"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {comments[item.id]?.length || 0}
                        </button>
                        <button className="flex items-center gap-1 hover:text-white transition">
                          <Share2 className="h-4 w-4" />
                          Compartir
                        </button>
                      </div>

                      {/* Sección de Comentarios */}
                      {showComments[item.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 space-y-3"
                        >
                          {/* Lista de Comentarios */}
                          {(comments[item.id] || []).map((comment, idx) => (
                            <div key={idx} className="rounded-xl bg-black/60 p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                                <span className="text-xs font-black text-white">Usuario</span>
                              </div>
                              <p className="text-xs text-zinc-400">{comment}</p>
                            </div>
                          ))}

                          {/* Formulario de Comentario */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newComment[item.id] || ""}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="Escribe un comentario..."
                              className="flex-1 rounded-full border border-white/10 bg-black px-4 py-2 text-sm text-white placeholder-zinc-500"
                            />
                            <button
                              onClick={() => addComment(item.id)}
                              className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-black hover:bg-yellow-300 transition"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.article>
              ))
            )}
          </div>
        </div>

        {/* PANEL DE CHAT FLOTANTE */}
        {showChatPanel && selectedChatUser && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-4 right-4 w-80 h-96 rounded-3xl border border-white/10 bg-zinc-950/95 backdrop-blur shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-sm font-black text-black">
                  {selectedChatUser.full_name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{selectedChatUser.full_name || "Usuario"}</p>
                  <p className="text-xs text-zinc-500">{selectedChatUser.profession || "Miembro"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatPanel(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm">Inicia una conversación</p>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        msg.sender_id === user?.id
                          ? "bg-yellow-400 text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={sendChatMessage} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-full border border-white/10 bg-black px-4 py-2 text-sm text-white placeholder-zinc-500"
                />
                <button
                  type="submit"
                  className="rounded-full bg-yellow-400 p-2 text-black hover:bg-yellow-300 transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <aside className="space-y-4">
          {/* ESTADÍSTICAS */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <h2 className="text-lg font-black text-white mb-4">Estadísticas</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Users className="h-4 w-4" />
                  Miembros
                </div>
                <span className="font-black">{members.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <ShoppingCart className="h-4 w-4" />
                  Productos
                </div>
                <span className="font-black">{listings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <TrendingUp className="h-4 w-4" />
                  Actividad
                </div>
                <span className="font-black text-green-400">+12%</span>
              </div>
            </div>
          </div>

          {/* RECOMENDACIONS */}
          <RecommendationsComponent />

          {/* VENDEDORES DESTACADOS */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <h2 className="text-lg font-black text-white mb-4">Vendedores destacados</h2>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vendedores..."
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-2 text-sm text-white placeholder-zinc-500 mb-4"
            />
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {filteredMembers.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-black/60 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                    <div className="flex-1">
                      <p className="font-bold text-white">{member.full_name ?? "Sin nombre"}</p>
                      <p className="text-xs text-zinc-500">{member.profession ?? "Profesional"}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400">4.8</span>
                    </div>
                  </div>
                  {member.bio && (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{member.bio}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openChat(member)}
                      className="flex-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20 text-center"
                    >
                      <MessageCircle className="mr-1 h-3 w-3 inline" />
                      Mensaje
                    </button>
                    <button
                      onClick={() => toggleFollow(member.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                        following.has(member.id)
                          ? "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                          : "border-yellow-400/30 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20"
                      }`}
                    >
                      {following.has(member.id) ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <p className="text-sm text-zinc-500">No hay vendedores que coincidan.</p>
              )}
            </div>
          </div>

          {/* PRODUCTOS TRENDING */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <h2 className="text-lg font-black text-white mb-4">Productos Trending</h2>
            <div className="space-y-3">
              {listings.slice(0, 3).map((listing) => (
                <Link
                  key={listing.id}
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
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm line-clamp-1">{listing.title}</p>
                      <p className="text-xs text-zinc-500">{listing.category_name || "General"}</p>
                      <p className="mt-1 font-black text-yellow-400">${listing.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
