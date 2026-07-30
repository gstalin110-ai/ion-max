"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Heart, MessageCircle, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/contexts/auth-context";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "new_post";
  message: string;
  is_read: boolean;
  created_at: string;
  actor_id?: string;
  post_id?: string;
}

export function NotificationsComponent() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    
    // Suscribirse a cambios en tiempo real
    const channel = subscribeToNotifications();
    
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { supabase } = await import("@/src/lib/supabase/client");
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return null;
    
    const supabase = require("@/src/lib/supabase/client").supabase;
    
    return supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      const { supabase } = await import("@/src/lib/supabase/client");
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { supabase } = await import("@/src/lib/supabase/client");
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "new_post":
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full border border-white/10 bg-white/5 p-3 text-zinc-400 hover:text-white transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 z-50 w-96 max-h-[600px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <h3 className="font-black">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-black text-yellow-400 hover:text-yellow-300 transition"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <Bell className="h-12 w-12 mb-4 animate-pulse" />
                    <p>Cargando...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <Bell className="h-12 w-12 mb-4" />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 border-b border-white/10 p-4 hover:bg-white/5 transition ${
                        !notification.is_read ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="rounded-full bg-white/10 p-2">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-black text-sm capitalize">{notification.type.replace('_', ' ')}</p>
                          {!notification.is_read && (
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-yellow-400" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{notification.message}</p>
                        <p className="mt-2 text-[10px] text-zinc-500">{formatTime(notification.created_at)}</p>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0 self-start rounded-full bg-white/10 p-1 text-zinc-400 hover:text-white transition"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-4">
                <Link
                  href="/notificaciones"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-black text-yellow-400 hover:text-yellow-300 transition"
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
