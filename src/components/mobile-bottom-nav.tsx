"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useDevice } from "@/src/contexts/device-context";
import { Home, ShoppingBag, Users, User, Plus, MessageSquare, ShoppingCart } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();
  const { isMobile } = useDevice();

  const navItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/marketplace", icon: ShoppingBag, label: "Marketplace", badge: cartCount, color: "yellow" },
    { href: "/publish", icon: Plus, label: "Publicar", isCenter: true },
    { href: "/comunidad", icon: Users, label: "Comunidad", color: "blue" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  // Solo mostrar en dispositivos móviles
  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-950/95 backdrop-blur border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // isActive: exacto para "/" y startsWith para el resto
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 ${
                item.isCenter ? "-mt-6" : ""
              }`}
            >
              <div
                className={`relative ${
                  item.isCenter
                    ? "h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/40 ring-4 ring-black"
                    : ""
                }`}
              >
                <Icon
                  className={`transition ${
                    item.isCenter
                      ? "h-7 w-7 text-black"
                      : item.color === "yellow"
                      ? isActive
                      ? "h-6 w-6 text-yellow-400"
                      : "h-6 w-6 text-zinc-500"
                      : item.color === "blue"
                      ? isActive
                      ? "h-6 w-6 text-blue-400"
                      : "h-6 w-6 text-zinc-500"
                      : isActive
                      ? "h-6 w-6 text-yellow-400"
                      : "h-6 w-6 text-zinc-500"
                  }`}
                />
                {/* Badge del carrito */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-medium transition ${
                  item.isCenter
                    ? "text-zinc-300 font-semibold"
                    : item.color === "yellow"
                    ? isActive
                    ? "text-yellow-400"
                    : "text-zinc-500"
                    : item.color === "blue"
                    ? isActive
                    ? "text-blue-400"
                    : "text-zinc-500"
                    : isActive
                    ? "text-yellow-400"
                    : "text-zinc-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
