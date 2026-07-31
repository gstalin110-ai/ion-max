"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { motion } from "framer-motion";
import { Send, ShoppingCart, Star, Clock, Search, MoreVertical, X, Package, Smile, Sparkles, Camera, Image as ImageIcon, Video } from "lucide-react";
import {
  getCommunityMembers,
  getConversationPartners,
  getDirectMessages,
  sendDirectMessage,
  type CommunityMember,
  type DirectMessage,
} from "@/src/services/social";
import { getListings } from "@/lib/supabase-helpers";

function MensajesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("con");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [partners, setPartners] = useState<CommunityMember[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAiEnhance, setShowAiEnhance] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaQuality, setMediaQuality] = useState<'high' | 'low'>('high');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function load() {
      try {
        const [allMembers, conversationPartners] = await Promise.all([
          getCommunityMembers(userId),
          getConversationPartners(userId),
        ]);
        setMembers(allMembers);
        setPartners(conversationPartners);
        if (preselectedId) setSelectedId(preselectedId);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user, preselectedId]);

  useEffect(() => {
    if (!user || !selectedId) {
      setMessages([]);
      return;
    }
    const userId = user.id;
    const otherId = selectedId;
    async function loadMessages() {
      const data = await getDirectMessages(userId, otherId);
      setMessages(data);
    }
    void loadMessages();
    const interval = setInterval(() => void loadMessages(), 5000);
    return () => clearInterval(interval);
  }, [user, selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const contactList = [
    ...partners,
    ...members.filter((m) => !partners.some((p) => p.id === m.id)),
  ].filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.full_name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.profession?.toLowerCase().includes(query)
    );
  });

  const selectedContact = contactList.find((c) => c.id === selectedId);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const listings = await getListings();
      setProducts(listings);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleShareProduct = async (product: any) => {
    if (!user || !selectedId) return;
    const productMessage = `📦 ${product.title}\n💰 $${product.price}\n🔗 https://ion-max.vercel.app/listing/${product.id}`;
    await sendDirectMessage(user.id, selectedId, productMessage);
    setShowProductModal(false);
    const data = await getDirectMessages(user.id, selectedId);
    setMessages(data);
  };

  const emojis = [
    "😀", "😂", "🥰", "😎", "🤔", "👍", "👎", "❤️", "🔥", "⭐",
    "🎉", "🎁", "💯", "✨", "🚀", "💪", "🙏", "👋", "😊", "🤗",
    "😜", "🤩", "😇", "🥳", "😈", "💀", "👻", "🤖", "👽", "🎃",
    "🦄", "🐱", "🐶", "🦊", "🐼", "🐸", "🦁", "🐯", "🦉", "🦋",
    "🌈", "☀️", "🌙", "⭐", "🌟", "💫", "🔥", "💧", "🌊", "🍀",
    "🍕", "🍔", "🍟", "🌮", "🍦", "🍪", "☕", "🥤", "🍺", "🍷"
  ];

  const handleAddEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleAiEnhance = async () => {
    if (!input.trim()) {
      alert("Escribe algo primero para mejorar con IA");
      return;
    }

    let enhancedText = input.trim();
    
    // Mejora local si no hay API key
    const emojiMap: Record<string, string> = {
      'gracias': '🙏',
      'hola': '👋',
      'bueno': '👍',
      'genial': '🤩',
      'excelente': '⭐',
      'precio': '💰',
      'producto': '📦',
      'envío': '🚚',
      'oferta': '🔥',
      'descuento': '💸'
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
    
    setInput(enhancedText);
    setShowAiEnhance(false);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("El archivo no puede superar 50MB");
      return;
    }

    setMediaFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedId || !input.trim()) return;
    setSending(true);
    try {
      await sendDirectMessage(user.id, selectedId, input.trim());
      setInput("");
      const data = await getDirectMessages(user.id, selectedId);
      setMessages(data);
      if (!partners.some((p) => p.id === selectedId)) {
        const updated = await getConversationPartners(user.id);
        setPartners(updated);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-7xl gap-6 px-4 py-6">
      {/* SIDEBAR DE CONTACTOS */}
      <aside className="w-80 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-white text-xl">Mensajes</h2>
              <p className="text-xs text-zinc-500">Chat de ventas</p>
            </div>
            <ShoppingCart className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar vendedores..."
              className="w-full rounded-xl border border-white/10 bg-black pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
            />
          </div>
        </div>
        <div className="max-h-full overflow-y-auto p-3">
          {contactList.map((contact) => (
            <motion.button
              key={contact.id}
              type="button"
              onClick={() => setSelectedId(contact.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-2 w-full rounded-2xl p-4 text-left transition ${
                selectedId === contact.id ? "bg-yellow-400/20 border border-yellow-400/30" : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-white truncate">{contact.full_name ?? contact.email}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400">4.8</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{contact.profession ?? "Miembro de la comunidad"}</p>
                  {partners.some((p) => p.id === contact.id) && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-green-400">
                      <Clock className="h-3 w-3" />
                      <span>En línea</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
          {contactList.length === 0 && (
            <div className="p-6 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-sm text-zinc-500">Ve a Comunidad para conectar con vendedores</p>
            </div>
          )}
        </div>
      </aside>

      {/* ÁREA DE CHAT */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80">
        {selectedContact ? (
          <>
            {/* HEADER DEL CHAT */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                  <div>
                    <p className="font-black text-white text-lg">{selectedContact.full_name ?? selectedContact.email}</p>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <span>{selectedContact.profession ?? "Miembro de la comunidad"}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400">4.8 rating</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <ShoppingCart className="h-16 w-16 mb-4" />
                  <p className="text-sm">Inicia la conversación sobre productos</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                        msg.sender_id === user?.id
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 font-semibold text-black"
                          : "border border-white/10 bg-zinc-900 text-zinc-100"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${
                        msg.sender_id === user?.id ? "text-black/60" : "text-zinc-500"
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* FORMULARIO DE ENVÍO */}
            <form onSubmit={handleSend} className="flex gap-3 border-t border-white/10 p-6 relative">
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(true);
                  loadProducts();
                }}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <Package className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <Smile className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleAiEnhance}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <Sparkles className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('media-upload')?.click()}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe sobre productos, precios, envíos..."
                className="flex-1 rounded-xl border border-white/10 bg-black px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 px-6 py-3 text-sm font-black text-black disabled:opacity-50 hover:from-yellow-300 hover:to-yellow-400 transition"
              >
                {sending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>

              {/* Preview de multimedia */}
              {mediaPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-20 left-0 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50"
                >
                  <div className="relative">
                    {mediaFile?.type.startsWith('video/') ? (
                      <video src={mediaPreview} className="h-40 w-auto rounded-lg" controls />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="h-40 w-auto rounded-lg object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setMediaQuality('high')}
                        className={`px-3 py-1 text-xs font-black rounded-lg transition ${
                          mediaQuality === 'high' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/10 text-zinc-400 hover:bg-white/20'
                        }`}
                      >
                        Alta
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaQuality('low')}
                        className={`px-3 py-1 text-xs font-black rounded-lg transition ${
                          mediaQuality === 'low' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-white/10 text-zinc-400 hover:bg-white/20'
                        }`}
                      >
                        Baja
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Implementar envío de media con calidad seleccionada
                        handleRemoveMedia();
                      }}
                      className="flex-1 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-black text-black hover:bg-yellow-500 transition"
                    >
                      Enviar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-black text-white hover:bg-white/20 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-20 left-0 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50"
                >
                  <div className="grid grid-cols-10 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleAddEmoji(emoji)}
                        className="text-2xl hover:scale-125 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-zinc-500">
            <ShoppingCart className="h-24 w-24 mb-6" />
            <p className="text-lg font-black mb-2">Selecciona un vendedor</p>
            <p className="text-sm">Inicia una conversación sobre productos</p>
          </div>
        )}
      </section>

      {/* MODAL DE PRODUCTOS */}
      {showProductModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowProductModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-950 border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-yellow-400" />
                <h3 className="text-xl font-black text-white">Compartir Producto</h3>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="rounded-full bg-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/20 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No hay productos disponibles
                </div>
              ) : (
                products.map((product) => (
                  <motion.button
                    key={product.id}
                    onClick={() => handleShareProduct(product)}
                    whileHover={{ scale: 1.02 }}
                    className="w-full rounded-2xl border border-white/10 bg-black p-4 hover:border-yellow-400/30 transition text-left"
                  >
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-xl bg-zinc-800 flex-shrink-0 overflow-hidden">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm line-clamp-2">{product.title}</p>
                        <p className="text-xs text-zinc-500 mt-1">{product.category_name || "General"}</p>
                        <p className="text-lg font-black text-yellow-400 mt-2">${product.price}</p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export function SocialMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <MensajesContent />
    </Suspense>
  );
}
