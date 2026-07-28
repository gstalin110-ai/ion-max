"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/contexts/auth-context";
import { isOwnerEmail } from "@/lib/constants";
import { LanguageSelector } from "@/src/components/language-selector";
import { useState } from "react";

export function GlobalNav() {
  const { user, signOut } = useAuth();
  const isOwner = isOwnerEmail(user?.email);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image src="/logo.png" alt="ION MAX" fill className="object-contain" />
          </div>
          <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-lg font-black text-transparent">
            IÓN MAX
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
          <LanguageSelector />
          <Link href="/marketplace" className="transition hover:text-white">
            Marketplace
          </Link>
          {user ? (
            <>
              <Link href="/comunidad" className="transition hover:text-white">
                Comunidad
              </Link>
              <Link href="/mensajes" className="transition hover:text-white">
                Mensajes
              </Link>
              {isOwner && (
                <Link
                  href="/admin"
                  className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
                >
                  Administrar App
                </Link>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                >
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
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
                        className="block rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        href="/ordenes"
                        className="block rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Mis Órdenes
                      </Link>
                      <Link
                        href="/carrito"
                        className="block rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Carrito
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          void signOut();
                          setShowProfileMenu(false);
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/invite"
              className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-400 transition hover:bg-yellow-400/20 hover:border-yellow-400/50"
            >
              Acceder
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
