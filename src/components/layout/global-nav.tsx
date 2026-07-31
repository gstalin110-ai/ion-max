"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/contexts/auth-context";
import { isOwnerEmail } from "@/lib/constants";
import { LanguageSelector } from "@/src/components/language-selector";
import { useState } from "react";
import { Store, Users, ShoppingCart, MessageSquare, User, LogOut, Menu, X } from "lucide-react";
import { useDevice } from "@/src/contexts/device-context";

export function GlobalNav() {
  const { user, signOut } = useAuth();
  const isOwner = isOwnerEmail(user?.email);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isMobile } = useDevice();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image src="/logo.png" alt="ION MAX" fill className="object-contain" />
          </div>
          <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-lg font-black text-transparent">
            IÓN MAX
          </span>
        </Link>

        {/* Botón de menú hamburguesa para móviles */}
        {isMobile && (
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="rounded-lg p-2 text-white transition hover:bg-white/10"
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}

        {/* Navegación Desktop */}
        {!isMobile && (
          <nav className="flex items-center gap-3 text-sm text-zinc-300">
            <LanguageSelector />
            
            {/* MARKETPLACE SECTION */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <Store className="w-4 h-4 text-yellow-400" />
              <Link href="/marketplace" className="transition hover:text-white font-semibold">
                Marketplace
              </Link>
            </div>

            {/* RED SOCIAL SECTION */}
            {user ? (
              <>
                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <Link href="/comunidad" className="transition hover:text-white font-semibold">
                    Comunidad
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <Link href="/mensajes" className="transition hover:text-white">
                    Mensajes
                  </Link>
                </div>

                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                  <ShoppingCart className="w-4 h-4 text-zinc-400" />
                  <Link href="/carrito" className="transition hover:text-white">
                    Carrito
                  </Link>
                </div>

                {isOwner && (
                  <Link
                    href="/admin"
                    className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
                  >
                    Administrar
                  </Link>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 backdrop-blur shadow-2xl">
                      <div className="mb-3 border-b border-white/10 pb-3">
                        <p className="text-sm font-bold text-white">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs text-zinc-400">{user.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Mi Perfil
                        </Link>
                        <Link
                          href="/ordenes"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Store className="w-4 h-4" />
                          Mis Órdenes
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            void signOut();
                            setShowProfileMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-400 transition hover:bg-yellow-400/20 hover:border-yellow-400/50"
              >
                Iniciar Sesión
              </Link>
            )}
          </nav>
        )}

        {/* Menú móvil */}
        {isMobile && showMobileMenu && (
          <nav className="absolute top-full left-0 right-0 border-b border-white/10 bg-black/95 backdrop-blur p-4 space-y-3">
            <LanguageSelector />
            
            <Link
              href="/marketplace"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-white/10"
              onClick={() => setShowMobileMenu(false)}
            >
              <Store className="w-5 h-5 text-yellow-400" />
              Marketplace
            </Link>

            {user ? (
              <>
                <Link
                  href="/comunidad"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-white/10"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Users className="w-5 h-5 text-blue-400" />
                  Comunidad
                </Link>
                
                <Link
                  href="/mensajes"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-white/10"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <MessageSquare className="w-5 h-5 text-zinc-400" />
                  Mensajes
                </Link>

                <Link
                  href="/carrito"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-white/10"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <ShoppingCart className="w-5 h-5 text-zinc-400" />
                  Carrito
                </Link>

                {isOwner && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-white/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Store className="w-5 h-5 text-yellow-400" />
                    Administrar
                  </Link>
                )}

                <div className="border-t border-white/10 pt-3 space-y-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-white/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="w-5 h-5" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/ordenes"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-white/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Store className="w-5 h-5" />
                    Mis Órdenes
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void signOut();
                      setShowMobileMenu(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm font-black text-yellow-400 transition hover:bg-yellow-400/20"
                onClick={() => setShowMobileMenu(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
