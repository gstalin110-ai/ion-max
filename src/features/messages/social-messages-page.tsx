"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { motion } from "framer-motion";
import { Send, ShoppingCart, Star, Clock, Search, MoreVertical } from "lucide-react";
import {
  getCommunityMembers,
  getConversationPartners,
  getDirectMessages,
  sendDirectMessage,
  type CommunityMember,
  type DirectMessage,
} from "@/src/services/social";

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
                  <p className="text-xs text-zinc-500 truncate">{contact.profession ?? "Vendedor Premium"}</p>
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
                      <span>{selectedContact.profession ?? "Vendedor Premium"}</span>
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
            <form onSubmit={handleSend} className="flex gap-3 border-t border-white/10 p-6">
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
