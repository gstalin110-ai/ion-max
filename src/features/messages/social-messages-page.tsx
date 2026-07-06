"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
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
  ];

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
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-6xl gap-4 px-4 py-6">
      <aside className="w-72 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80">
        <div className="border-b border-white/10 p-4">
          <h2 className="font-black text-white">Mensajes</h2>
          <p className="text-xs text-zinc-500">Red profesional privada</p>
        </div>
        <div className="max-h-full overflow-y-auto p-2">
          {contactList.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setSelectedId(contact.id)}
              className={`mb-1 w-full rounded-2xl p-3 text-left transition ${
                selectedId === contact.id ? "bg-yellow-400/20 text-white" : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              <p className="text-sm font-bold">{contact.full_name ?? contact.email}</p>
              <p className="text-xs text-zinc-500">{contact.profession ?? "Profesional"}</p>
            </button>
          ))}
          {contactList.length === 0 && (
            <p className="p-4 text-sm text-zinc-500">Ve a Comunidad para conectar con otros usuarios.</p>
          )}
        </div>
      </aside>

      <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80">
        {selectedContact ? (
          <>
            <div className="border-b border-white/10 p-4">
              <p className="font-black text-white">{selectedContact.full_name ?? selectedContact.email}</p>
              <p className="text-xs text-zinc-500">{selectedContact.profession ?? "Miembro IÓN MAX"}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      msg.sender_id === user?.id
                        ? "bg-yellow-400 font-semibold text-black"
                        : "border border-white/10 bg-zinc-900 text-zinc-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje profesional..."
                className="flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500">
            Selecciona un contacto para iniciar la conversación
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
