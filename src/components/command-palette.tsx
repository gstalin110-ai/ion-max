"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, Home, ShoppingBag, Users, MessageSquare, User, X, Sparkles, TrendingUp, Heart, Bookmark, Settings, LogOut, Zap, Flame, Package, Briefcase, GraduationCap, Wand2, ChevronRight } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  shortcut?: string;
  badge?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const commands: CommandItem[] = [
    // Navegación Principal
    {
      id: "home",
      label: "Ir a Inicio",
      icon: <Home className="h-4 w-4" />,
      action: () => router.push("/"),
      category: "Navegación",
      shortcut: "G H",
    },
    {
      id: "marketplace",
      label: "Ir al Marketplace",
      icon: <ShoppingBag className="h-4 w-4" />,
      action: () => router.push("/marketplace"),
      category: "Navegación",
      shortcut: "G M",
      badge: "Popular",
    },
    {
      id: "comunidad",
      label: "Ir a Comunidad",
      icon: <Users className="h-4 w-4" />,
      action: () => router.push("/comunidad"),
      category: "Navegación",
      shortcut: "G C",
    },
    {
      id: "messages",
      label: "Ir a Mensajes",
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => router.push("/messages"),
      category: "Navegación",
      shortcut: "G I",
    },
    {
      id: "profile",
      label: "Ir a Perfil",
      icon: <User className="h-4 w-4" />,
      action: () => router.push("/profile"),
      category: "Navegación",
      shortcut: "G P",
    },
    
    // Acciones Rápidas
    {
      id: "publish",
      label: "Crear Publicación",
      icon: <Package className="h-4 w-4" />,
      action: () => router.push("/publish"),
      category: "Acciones",
      shortcut: "P",
      badge: "Nuevo",
    },
    {
      id: "trending",
      label: "Ver Trending",
      icon: <Flame className="h-4 w-4" />,
      action: () => router.push("/marketplace?sort=trending"),
      category: "Acciones",
      badge: "Hot",
    },
    {
      id: "bookmarks",
      label: "Mis Guardados",
      icon: <Bookmark className="h-4 w-4" />,
      action: () => router.push("/bookmarks"),
      category: "Acciones",
      shortcut: "B",
    },
    {
      id: "likes",
      label: "Mis Likes",
      icon: <Heart className="h-4 w-4" />,
      action: () => router.push("/likes"),
      category: "Acciones",
    },
    
    // Categorías del Marketplace
    {
      id: "products",
      label: "Productos Físicos",
      icon: <Package className="h-4 w-4" />,
      action: () => router.push("/marketplace?category=product"),
      category: "Marketplace",
    },
    {
      id: "services",
      label: "Servicios",
      icon: <Briefcase className="h-4 w-4" />,
      action: () => router.push("/marketplace?category=service"),
      category: "Marketplace",
    },
    {
      id: "courses",
      label: "Cursos",
      icon: <GraduationCap className="h-4 w-4" />,
      action: () => router.push("/marketplace?category=course"),
      category: "Marketplace",
    },
    {
      id: "affiliates",
      label: "Enlaces de Afiliado",
      icon: <Wand2 className="h-4 w-4" />,
      action: () => router.push("/marketplace?category=affiliate"),
      category: "Marketplace",
    },
    
    // Configuración
    {
      id: "settings",
      label: "Configuración",
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push("/settings"),
      category: "Cuenta",
      shortcut: "⌘ ,",
    },
    {
      id: "logout",
      label: "Cerrar Sesión",
      icon: <LogOut className="h-4 w-4" />,
      action: () => router.push("/logout"),
      category: "Cuenta",
      badge: "Danger",
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const categories = Array.from(new Set(filteredCommands.map((cmd) => cmd.category)));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommandClick = (command: CommandItem) => {
    command.action();
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Premium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header Premium */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="relative">
                <Search className="h-5 w-5 text-zinc-500" />
                {query && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500"
                  />
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar comandos, páginas, productos..."
                className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
                autoFocus
              />
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setQuery("")}
                  className="rounded-full bg-white/5 p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-zinc-500 border border-white/10">
                <Command className="h-3 w-3" />
                <span>ESC</span>
              </kbd>
            </div>

            {/* Results Premium */}
            <div className="max-h-[450px] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Sparkles className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">No se encontraron resultados</p>
                  <p className="text-xs text-zinc-600 mt-1">Intenta con otra búsqueda</p>
                </motion.div>
              ) : (
                categories.map((category, categoryIdx) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIdx * 0.05 }}
                    className="mb-4"
                  >
                    <div className="px-4 py-2 text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      {category}
                    </div>
                    <div className="space-y-1">
                      {filteredCommands
                        .filter((cmd) => cmd.category === category)
                        .map((command, cmdIdx) => (
                          <motion.button
                            key={command.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (categoryIdx * 0.05) + (cmdIdx * 0.02) }}
                            onClick={() => handleCommandClick(command)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 text-left transition group relative overflow-hidden"
                          >
                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-white/10 text-zinc-400 group-hover:from-yellow-400/20 group-hover:to-yellow-400/10 group-hover:text-yellow-400 transition border border-white/5 group-hover:border-yellow-400/20">
                              {command.icon}
                            </div>
                            <div className="relative flex-1">
                              <span className="text-sm text-zinc-300 group-hover:text-white transition font-medium">
                                {command.label}
                              </span>
                              {command.badge && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  command.badge === "Danger" 
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : command.badge === "Hot"
                                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}>
                                  {command.badge}
                                </span>
                              )}
                            </div>
                            <div className="relative flex items-center gap-2">
                              {command.shortcut && (
                                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-zinc-500 border border-white/10 group-hover:border-white/20 transition">
                                  {command.shortcut}
                                </kbd>
                              )}
                              <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                          </motion.button>
                        ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Premium */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <kbd className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </kbd>
                <span>para abrir</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  <span>ESC</span>
                </kbd>
                <span>para cerrar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  <span>↑↓</span>
                </kbd>
                <span>navegar</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
