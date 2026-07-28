"use client";

import { useState, useEffect } from "react";
import { getAllTicketsForOwner, getAllTicketsByStatus, updateTicketStatus, addTicketMessage, updateTicketOwnerNotes, getTicketMessages } from "@/lib/supabase-helpers";
import { SupportTicket, TicketMessage } from "@/lib/types";
import toast from "react-hot-toast";
import { MessageSquare, Clock, CheckCircle, X, AlertCircle, Send, Filter } from "lucide-react";

export function TicketsManagementSection() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [newMessage, setNewMessage] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      let data;
      if (filter === "all") {
        data = await getAllTicketsForOwner();
      } else {
        data = await getAllTicketsByStatus(filter);
      }
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

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setOwnerNotes(ticket.owner_notes || "");
    loadMessages(ticket.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      await addTicketMessage(selectedTicket.id, newMessage, true);
      setNewMessage('');
      loadMessages(selectedTicket.id);
      toast.success("Mensaje enviado como dueño");
    } catch (error) {
      toast.error("Error al enviar mensaje");
    }
  };

  const handleUpdateStatus = async (status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    if (!selectedTicket) return;
    
    try {
      await updateTicketStatus(selectedTicket.id, status);
      toast.success("Estado actualizado");
      loadTickets();
      setSelectedTicket({ ...selectedTicket, status });
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedTicket) return;
    
    try {
      await updateTicketOwnerNotes(selectedTicket.id, ownerNotes);
      toast.success("Notas guardadas");
    } catch (error) {
      toast.error("Error al guardar notas");
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
          <h3 className="text-lg font-bold text-white">Gestión de Tickets</h3>
          <p className="text-sm text-zinc-400">Administra tickets y quejas de usuarios</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === "all" ? "bg-yellow-400 text-black" : "bg-white/5 text-zinc-400"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === "open" ? "bg-yellow-400 text-black" : "bg-white/5 text-zinc-400"
            }`}
          >
            Abiertos
          </button>
          <button
            onClick={() => setFilter("in_progress")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === "in_progress" ? "bg-yellow-400 text-black" : "bg-white/5 text-zinc-400"
            }`}
          >
            En Progreso
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === "resolved" ? "bg-yellow-400 text-black" : "bg-white/5 text-zinc-400"
            }`}
          >
            Resueltos
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-sm text-zinc-400">No hay tickets</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Lista de Tickets */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
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

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-zinc-500">Descripción</p>
                  <p className="text-sm text-white">{selectedTicket.description}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Categoría</p>
                  <p className="text-sm text-white">{selectedTicket.category}</p>
                </div>
              </div>

              {/* Acciones de estado */}
              <div className="mb-4 p-3 rounded-lg bg-white/5">
                <p className="text-xs text-zinc-500 mb-2">Cambiar Estado</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleUpdateStatus('open')}
                    className="px-3 py-1 rounded-lg bg-blue-400/10 text-blue-400 text-xs font-bold hover:bg-blue-400/20"
                  >
                    Abierto
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="px-3 py-1 rounded-lg bg-yellow-400/10 text-yellow-400 text-xs font-bold hover:bg-yellow-400/20"
                  >
                    En Progreso
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className="px-3 py-1 rounded-lg bg-green-400/10 text-green-400 text-xs font-bold hover:bg-green-400/20"
                  >
                    Resuelto
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('closed')}
                    className="px-3 py-1 rounded-lg bg-zinc-400/10 text-zinc-400 text-xs font-bold hover:bg-zinc-400/20"
                  >
                    Cerrado
                  </button>
                </div>
              </div>

              {/* Notas del dueño */}
              <div className="mb-4 p-3 rounded-lg bg-white/5">
                <p className="text-xs text-zinc-500 mb-2">Notas Internas</p>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  placeholder="Notas para ti como dueño..."
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                  rows={2}
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 px-3 py-1 rounded-lg bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-300"
                >
                  Guardar Notas
                </button>
              </div>

              {/* Mensajes */}
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No hay mensajes</p>
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
                        {msg.is_owner && ' • Dueño'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Responder como dueño..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-yellow-400 px-3 py-2 text-black transition hover:bg-yellow-300"
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
