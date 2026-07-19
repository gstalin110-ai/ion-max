"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Heart, MessageCircle, UserPlus, ShoppingCart, Star, Check } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "sale" | "review";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export function NotificationsComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "like",
      title: "Nuevo like",
      message: "A Juan Pérez le gustó tu publicación sobre el iPhone 15 Pro",
      time: "Hace 5 minutos",
      read: false,
    },
    {
      id: "2",
      type: "comment",
      title: "Nuevo comentario",
      message: "María García comentó: '¡Excelente producto! ¿Tienes más disponibles?'",
      time: "Hace 15 minutos",
      read: false,
    },
    {
      id: "3",
      type: "follow",
      title: "Nuevo seguidor",
      message: "Carlos Rodríguez comenzó a seguirte",
      time: "Hace 1 hora",
      read: false,
    },
    {
      id: "4",
      type: "sale",
      title: "¡Nueva venta!",
      message: "Vendiste MacBook Pro M3 por $1,299",
      time: "Hace 2 horas",
      read: true,
    },
    {
      id: "5",
      type: "review",
      title: "Nueva reseña",
      message: "Recibiste una reseña de 5 estrellas en tu producto",
      time: "Hace 3 horas",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "sale":
        return <ShoppingCart className="h-5 w-5 text-yellow-500" />;
      case "review":
        return <Star className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
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
                {notifications.length === 0 ? (
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
                        !notification.read ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="rounded-full bg-white/10 p-2">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-black text-sm">{notification.title}</p>
                          {!notification.read && (
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-yellow-400" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{notification.message}</p>
                        <p className="mt-2 text-[10px] text-zinc-500">{notification.time}</p>
                      </div>
                      {!notification.read && (
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
