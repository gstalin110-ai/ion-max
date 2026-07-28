"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, Home, ShoppingBag, Users, MessageSquare, User, X } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: "home",
      label: "Ir a Inicio",
      icon: <Home className="h-4 w-4" />,
      action: () => router.push("/"),
      category: "Navegación",
    },
    {
      id: "marketplace",
      label: "Ir al Marketplace",
      icon: <ShoppingBag className="h-4 w-4" />,
      action: () => router.push("/marketplace"),
      category: "Navegación",
    },
    {
      id: "comunidad",
      label: "Ir a Comunidad",
      icon: <Users className="h-4 w-4" />,
      action: () => router.push("/comunidad"),
      category: "Navegación",
    },
    {
      id: "messages",
      label: "Ir a Mensajes",
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => router.push("/messages"),
      category: "Navegación",
    },
    {
      id: "profile",
      label: "Ir a Perfil",
      icon: <User className="h-4 w-4" />,
      action: () => router.push("/profile"),
      category: "Navegación",
    },
    {
      id: "publish",
      label: "Crear Publicación",
      icon: <ShoppingBag className="h-4 w-4" />,
      action: () => router.push("/publish"),
      category: "Acciones",
    },
    {
      id: "settings",
      label: "Configuración",
      icon: <User className="h-4 w-4" />,
      action: () => router.push("/settings"),
      category: "Acciones",
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Search className="h-5 w-5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar comandos, páginas, productos..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none"
            autoFocus
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs text-zinc-500">
            <Command className="h-3 w-3" />
            <span>ESC</span>
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No se encontraron resultados
            </div>
          ) : (
            categories.map((category) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-black text-zinc-500 uppercase tracking-wider">
                  {category}
                </div>
                <div className="space-y-1">
                  {filteredCommands
                    .filter((cmd) => cmd.category === category)
                    .map((command) => (
                      <button
                        key={command.id}
                        onClick={() => handleCommandClick(command)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-left transition group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-zinc-400 group-hover:bg-yellow-400/20 group-hover:text-yellow-400 transition">
                          {command.icon}
                        </div>
                        <span className="text-sm text-zinc-300 group-hover:text-white transition">
                          {command.label}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <kbd className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
            <span>para abrir</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
              <span>ESC</span>
            </kbd>
            <span>para cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
