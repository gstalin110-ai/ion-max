"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/contexts/auth-context";
import { isOwnerEmail } from "@/lib/constants";
import { LanguageSelector } from "@/src/components/language-selector";

export function GlobalNav() {
  const { user, signOut } = useAuth();
  const isOwner = isOwnerEmail(user?.email);

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
          <Link href="/" className="transition hover:text-white">
            Inicio
          </Link>
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
              <Link href="/profile" className="transition hover:text-white">
                Perfil
              </Link>
              {isOwner && (
                <Link
                  href="/admin"
                  className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
                >
                  Administrar App
                </Link>
              )}
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 hover:text-white"
              >
                Salir
              </button>
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
