"use client";

import { useState, useEffect } from "react";
import { createSupportTicket, getUserTickets, getTicketMessages, addTicketMessage, updateTicketStatus } from "@/lib/supabase-helpers";
import { SupportTicket, TicketMessage } from "@/lib/types";
import { useAuth } from "@/src/contexts/auth-context";
import toast from "react-hot-toast";
import { MessageSquare, Plus, Send, AlertCircle, CheckCircle, Clock, X } from "lucide-react";

export function SupportTicketsSection() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'issue' as 'complaint' | 'issue' | 'suggestion' | 'other',
    category: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await getUserTickets();
      setTickets(data);
    } catch (error) {
      toast.error("Error al cargar tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const data = await getTicketMessages(ticketId);
      setMessages(data);
    } catch (error) {
      toast.error("Error al cargar mensajes");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await createSupportTicket(formData);
      toast.success("Ticket creado exitosamente");
      setFormData({ type: 'issue', category: '', subject: '', description: '', priority: 'medium' });
      setShowCreateForm(false);
      loadTickets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear ticket");
    }
  };

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadMessages(ticket.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      await addTicketMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      loadMessages(selectedTicket.id);
      toast.success("Mensaje enviado");
    } catch (error) {
      toast.error("Error al enviar mensaje");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-400">
            <Clock className="h-3 w-3" />
            Abierto
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400">
            <Clock className="h-3 w-3" />
            En Progreso
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-3 py-1 text-xs font-bold text-green-400">
            <CheckCircle className="h-3 w-3" />
            Resuelto
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-400/10 px-3 py-1 text-xs font-bold text-zinc-400">
            <X className="h-3 w-3" />
            Cerrado
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <span className="text-xs text-zinc-400">Baja</span>;
      case "medium":
        return <span className="text-xs text-yellow-400">Media</span>;
      case "high":
        return <span className="text-xs text-orange-400">Alta</span>;
      case "urgent":
        return <span className="text-xs text-red-400">Urgente</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Tickets y Quejas</h3>
          <p className="text-sm text-zinc-400">Reporta problemas y recibe soporte</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300"
        >
          <Plus className="h-4 w-4" />
          Nuevo Ticket
        </button>
      </div>

      {/* Formulario de Crear Ticket */}
      {showCreateForm && (
        <form onSubmit={handleCreateTicket} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
              >
                <option value="issue">Problema</option>
                <option value="complaint">Queja</option>
                <option value="suggestion">Sugerencia</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
            >
              <option value="">Selecciona una categoría</option>
              <option value="product_issue">Problema con producto</option>
              <option value="payment_issue">Problema con pago</option>
              <option value="user_issue">Problema con usuario</option>
              <option value="platform_bug">Error de plataforma</option>
              <option value="account_issue">Problema con cuenta</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Asunto</label>
            <input
              type="text"
              placeholder="Describe brevemente el problema"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Descripción</label>
            <textarea
              placeholder="Describe el problema en detalle..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Crear Ticket
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tickets */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-sm text-zinc-400">No tienes tickets creados</p>
          <p className="mt-2 text-xs text-zinc-500">Crea un ticket para reportar un problema o queja</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Lista de Tickets */}
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket)}
                className={`cursor-pointer rounded-xl border p-4 transition hover:border-white/20 ${
                  selectedTicket?.id === ticket.id ? 'border-yellow-400 bg-yellow-400/5' : 'border-white/10 bg-zinc-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{ticket.ticket_number}</p>
                    <p className="text-xs text-zinc-400 mt-1">{ticket.subject}</p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{new Date(ticket.created_at).toLocaleDateString('es-EC')}</span>
                  <span>•</span>
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>
            ))}
          </div>

          {/* Detalles del Ticket */}
          {selectedTicket && (
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-white">{selectedTicket.ticket_number}</p>
                  <p className="text-sm text-zinc-400">{selectedTicket.subject}</p>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No hay mensajes aún</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 ${
                        msg.is_owner ? 'bg-yellow-400/10' : 'bg-white/5'
                      }`}
                    >
                      <p className="text-sm text-white">{msg.message}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(msg.created_at).toLocaleString('es-EC')}
                        {msg.is_owner && ' • Soporte'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black px-4 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-yellow-400 px-4 py-2 text-black transition hover:bg-yellow-300"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
