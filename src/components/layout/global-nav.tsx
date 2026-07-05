"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/contexts/auth-context";

export function GlobalNav() {
  const { user } = useAuth();

  return (
    <header className="w-full border-b border-white/10 bg-black/90 backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image src="/logo.png" alt="ION MAX" fill className="object-contain" />
          </div>
          <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-300">IÓN MAX</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
          <Link href="/marketplace" className="transition hover:text-white">Marketplace</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="transition hover:text-white">Panel</Link>
              <Link href="/profile" className="transition hover:text-white">Perfil</Link>
            </>
          ) : (
            <Link href="/login" className="transition hover:text-white">Ingresar</Link>
          )}
          {!user && (
            <Link href="/register" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/10">
              Registrarse
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
