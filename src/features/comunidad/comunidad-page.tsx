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
  Flame,
  Clock,
  Award,
  Eye,
  Bookmark,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  createCommunityPost,
  ensureProfile,
  getCommunityMembers,
  getCommunityPosts,
  getDirectMessages,
  sendDirectMessage,
  togglePostLike,
  addPostComment,
  getPostComments,
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAiModal, setShowAiModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "products" | "posts">("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<CommunityMember | null>(null);
  const [chatMessages, setChatMessages] = useState<DirectMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
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
  
  // Sistema de likes y comentarios persistentes
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  
  // Sistema de seguimiento
  const [following, setFollowing] = useState<Set<string>>(new Set());
  
  // Sistema de bookmarks
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const toggleLike = async (postId: string) => {
    if (!user) return;
    // Optimistic update del corazón
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: (p.likes_count ?? 0) + 1 }
          : p
      )
    );
    try {
      await togglePostLike(postId, user.id);
      const postsData = await getCommunityPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error al dar like:', error);
      // Revertir optimistic update si falla
      const postsData = await getCommunityPosts();
      setPosts(postsData);
    }
  };

  const toggleComments = async (postId: string) => {
    const isOpening = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: isOpening }));
    
    if (isOpening) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      try {
        const commentsData = await getPostComments(postId);
        setComments(prev => ({ ...prev, [postId]: commentsData }));
      } catch (error) {
        console.error('Error al cargar comentarios:', error);
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;
    try {
      await addPostComment(postId, user.id, newComment[postId]);
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      // Recargar comentarios
      const commentsData = await getPostComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsData }));
      // Recargar posts para actualizar contador
      const postsData = await getCommunityPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const toggleFollow = async (memberId: string) => {
    setFollowing(prev => {
      const updated = new Set(prev);
      if (updated.has(memberId)) {
        updated.delete(memberId);
      } else {
        updated.add(memberId);
      }
      return updated;
    });
    // Persistir en Supabase si no está siguiendo aún
    if (!following.has(memberId) && user) {
      try {
        const { sendFriendRequest } = await import("@/src/services/social");
        await sendFriendRequest(user.id, memberId);
      } catch {
        // Ignorar si ya existe la solicitud (UNIQUE constraint)
      }
    }
  };

  const isFollowing = (memberId: string) => following.has(memberId);

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const updated = new Set(prev);
      if (updated.has(postId)) {
        updated.delete(postId);
      } else {
        updated.add(postId);
      }
      return updated;
    });
    // Persistir en localStorage
    const bookmarks = Array.from(bookmarkedPosts);
    localStorage.setItem('ion-bookmarks', JSON.stringify(bookmarks));
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
    
    setIsTyping(true);
    try {
      await sendDirectMessage(user.id, selectedChatUser.id, chatInput.trim());
      setChatInput("");
      const messages = await getDirectMessages(user.id, selectedChatUser.id);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
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
    
    const file = files[0];
    
    if (file.type.startsWith('image/')) {
      const validFiles = files.filter(f => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        alert('Por favor selecciona solo archivos de imagen');
        return;
      }

      setPostImages(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } else if (file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        alert('El video no puede superar 100MB');
        return;
      }
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleImageUpload({ target } as React.ChangeEvent<HTMLInputElement>);
      }
    };
    input.click();
  };

  const handleAiEnhance = async () => {
    if (!newPost.trim()) {
      alert('Escribe algo primero para mejorar con IA');
      return;
    }

    // Mejora local si no hay API key
    let enhancedText = newPost.trim();
    
    // Añadir emojis relevantes
    const emojiMap: Record<string, string> = {
      'oferta': '🔥',
      'descuento': '💰',
      'promoción': '🎉',
      'producto': '📦',
      'servicio': '💼',
      'curso': '📚',
      'nuevo': '✨',
      'premium': '⭐',
      'limitado': '⏰',
      'gratis': '🆓'
    };
    
    Object.entries(emojiMap).forEach(([keyword, emoji]) => {
      if (enhancedText.toLowerCase().includes(keyword) && !enhancedText.includes(emoji)) {
        enhancedText = `${emoji} ${enhancedText}`;
      }
    });
    
    // Primera letra mayúscula
    enhancedText = enhancedText.charAt(0).toUpperCase() + enhancedText.slice(1);
    
    // Corregir espacios dobles
    enhancedText = enhancedText.replace(/\s+/g, ' ');
    
    // Añadir hashtags relevantes
    const hashtags = ['#IONMAX', '#Ecuador', '#Ofertas'];
    if (!enhancedText.includes('#')) {
      enhancedText += '\n\n' + hashtags.join(' ');
    }
    
    setNewPost(enhancedText);
    setShowAiModal(false);
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
      let uploadedImageUrl: string | null = null;
      let uploadedVideoUrl: string | null = null;
      
      if (postImages.length > 0) {
        const imageUrls = await uploadImagesToSupabase(postImages);
        uploadedImageUrl = imageUrls[0] || null;
      }
      
      const { supabase } = await import("@/src/lib/supabase/client");
      const payload = {
        user_id: user.id,
        content: newPost.trim(),
        image_url: uploadedImageUrl,
        video_url: uploadedVideoUrl
      };
      
      console.log('PAYLOAD', payload);
      
      const { error } = await supabase.from('community_posts').insert(payload);
      
      console.log('ERROR', error);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setNewPost("");
      setPostImages([]);
      setImagePreviews([]);
      const postsData = await getCommunityPosts();
      setPosts(postsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo publicar. Verifica las tablas en Supabase.";
      alert(errorMessage);
      console.error('Error al publicar:', error);
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

  // Combinar posts y listings en el feed con algoritmo personalizado
  const feedItems = [
    ...posts.map((post) => ({
      type: "post" as const,
      data: post,
      id: post.id,
      created_at: post.created_at,
      engagement: (post.likes_count || 0) + (post.comments_count || 0),
    })),
    ...listings.slice(0, 5).map((listing) => ({
      type: "product" as const,
      data: listing,
      id: listing.id,
      created_at: listing.created_at,
      engagement: Math.floor(Math.random() * 100),
    })),
  ].sort((a, b) => {
    // Algoritmo: Engagement + Recency
    const aScore = a.engagement + (new Date(a.created_at).getTime() / 1000000);
    const bScore = b.engagement + (new Date(b.created_at).getTime() / 1000000);
    return bScore - aScore;
  });

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
                
                {/* Preview de video */}
                {videoPreview && (
                  <div className="relative group">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={handleCameraClick}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
                >
                  📷
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAiModal(true)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
                >
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

          {/* Modal de IA */}
          {showAiModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 max-w-md w-full">
                <h3 className="text-xl font-black text-white mb-4">Mejorar con IA ✨</h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Mejoraremos tu texto añadiendo emojis relevantes, corrigiendo espacios y añadiendo hashtags para mayor alcance.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white hover:bg-white/10 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAiEnhance}
                    className="flex-1 rounded-full bg-yellow-400 px-4 py-3 text-sm font-black text-black hover:bg-yellow-300 transition"
                  >
                    Mejorar ahora
                  </button>
                </div>
              </div>
            </div>
          )}

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
              onClick={() => setFilter("posts")}
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
                    // POST CARD PREMIUM
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-black text-white">
                          {(item.data.author?.full_name ?? "?")[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">
                              {item.data.author?.full_name ?? "Profesional"}
                            </p>
                            {item.data.author?.profession && (
                              <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-[10px] font-black text-blue-400">
                                {item.data.author.profession}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(item.data.created_at).toLocaleDateString("es-ES")} · 
                            <Eye className="h-3 w-3" />
                            {Math.floor(Math.random() * 500) + 100}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleBookmark(item.id)}
                            className={`rounded-full p-2 transition ${
                              bookmarkedPosts.has(item.id)
                                ? "bg-yellow-400 text-black"
                                : "bg-white/10 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                          <button className="rounded-full bg-white/10 p-2 text-zinc-400 hover:text-white transition">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm leading-relaxed text-zinc-300">{item.data.content}</p>
                      
                      {/* Badges Premium */}
                      {(item.data.likes_count || 0) > 10 && (
                        <div className="mt-3 flex gap-2">
                          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-[10px] font-black text-black">
                            <Flame className="h-3 w-3" />
                            <span>Trending</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Imágenes del post — sin duplicar image_url si ya está en images[] */}
                      {(() => {
                        const allImages = item.data.images && item.data.images.length > 0
                          ? item.data.images
                          : item.data.image_url
                          ? [item.data.image_url]
                          : [];
                        if (allImages.length === 0) return null;
                        return (
                          <div className={`mt-4 grid gap-2 ${allImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {allImages.map((img, idx) => (
                              <div key={idx} className={`relative overflow-hidden rounded-xl ${allImages.length === 1 ? 'h-64' : 'h-40'} group`}>
                                <Image
                                  src={img}
                                  alt={`Imagen del post ${idx + 1}`}
                                  fill
                                  className="object-cover transition duration-500 group-hover:scale-110"
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      
                      {/* Likes y Comentarios Premium */}
                      <div className="mt-4 flex items-center justify-between text-sm text-zinc-500 border-t border-white/10 pt-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleLike(item.id)}
                            className={`flex items-center gap-1 transition ${
                              (item.data.likes_count || 0) > 0 ? "text-red-400" : "hover:text-white"
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${item.data.likes_count ? "fill-red-400" : ""}`} />
                            {item.data.likes_count || 0}
                          </button>
                          <button
                            onClick={() => toggleComments(item.id)}
                            className="flex items-center gap-1 hover:text-white transition"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {item.data.comments_count || 0}
                          </button>
                          <button className="flex items-center gap-1 hover:text-white transition">
                            <Share2 className="h-4 w-4" />
                            Compartir
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Award className="h-3 w-3 text-yellow-400" />
                          <span className="text-yellow-400 font-black">
                            {item.data.likes_count && item.data.likes_count > 5 ? "Top Post" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Sección de Comentarios */}
                      {showComments[item.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 space-y-3"
                        >
                          {/* Lista de Comentarios */}
                          {loadingComments[item.id] ? (
                            <div className="text-center text-zinc-500 text-sm py-4">
                              Cargando comentarios...
                            </div>
                          ) : (comments[item.id] || []).length === 0 ? (
                            <div className="text-center text-zinc-500 text-sm py-4">
                              No hay comentarios aún. ¡Sé el primero!
                            </div>
                          ) : (
                            (comments[item.id] || []).map((comment: any, idx: number) => (
                              <div key={comment.id || idx} className="rounded-xl bg-black/60 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-black text-black">
                                    {(comment.profiles?.full_name || "U")[0]?.toUpperCase()}
                                  </div>
                                  <span className="text-xs font-black text-white">
                                    {comment.profiles?.full_name || "Usuario"}
                                  </span>
                                  <span className="text-xs text-zinc-500">
                                    {new Date(comment.created_at).toLocaleDateString("es-ES")}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400">{comment.content}</p>
                              </div>
                            ))
                          )}

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

        {/* PANEL DE CHAT FLOTANTE PREMIUM */}
        {showChatPanel && selectedChatUser && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            className="fixed bottom-4 right-4 w-96 h-[500px] rounded-3xl border border-white/10 bg-zinc-950/95 backdrop-blur shadow-2xl z-50 flex flex-col"
          >
            {/* Header Premium */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black text-white">
                    {selectedChatUser.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-green-500 p-1">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{selectedChatUser.full_name || "Usuario"}</p>
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-black text-green-400">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{selectedChatUser.profession || "Miembro IÓN MAX"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatPanel(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-12 w-12 text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-500">Inicia una conversación</p>
                  <p className="text-xs text-zinc-600 mt-1">Envía un mensaje para comenzar</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        msg.sender_id === user?.id
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                          : "bg-white/10 text-white rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${
                        msg.sender_id === user?.id ? "text-blue-200" : "text-zinc-500"
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Input Area Premium */}
            <form onSubmit={sendChatMessage} className="p-4 border-t border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-full border border-white/10 bg-black px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-400 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-2 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* VENDEDORES DESTACADOS PREMIUM */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Vendedores destacados
              </h2>
              <span className="text-xs text-zinc-500">{members.length} miembros</span>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vendedores..."
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-2 text-sm text-white placeholder-zinc-500 mb-4"
            />
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {filteredMembers.slice(0, 5).map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-black/60 p-4 hover:border-white/20 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black text-white">
                        {(member.full_name ?? "?")[0]?.toUpperCase()}
                      </div>
                      {member.profession && (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{member.full_name ?? "Sin nombre"}</p>
                        {member.profession && (
                          <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-[10px] font-black text-blue-400">
                            {member.profession}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 flex items-center gap-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        4.8 · {Math.floor(Math.random() * 500) + 100} seguidores
                      </p>
                    </div>
                  </div>
                  {member.bio && (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{member.bio}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openChat(member)}
                      className="flex-1 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Mensaje
                    </button>
                    <button
                      onClick={() => toggleFollow(member.id)}
                      className={`flex-1 rounded-full border px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isFollowing(member.id)
                          ? "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                          : "border-yellow-400/30 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 hover:border-yellow-400/50"
                      }`}
                    >
                      {isFollowing(member.id) ? (
                        <>
                          <Heart className="h-3 w-3 fill-current" />
                          Siguiendo
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          Seguir
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredMembers.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No hay vendedores que coincidan.</p>
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
