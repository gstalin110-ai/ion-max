"use client";

import { AuthForm } from "@/src/features/auth/auth-form";
import { Download, Smartphone, Monitor } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_42%),linear-gradient(135deg,_#050505,_#111)] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="login" />
        
        {/* PWA Download Section */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold">Instala IÓN MAX</h3>
          </div>
          
          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-start gap-3">
              <Smartphone className="w-4 h-4 mt-0.5 text-zinc-500" />
              <div>
                <p className="font-medium text-white">En móvil:</p>
                <p className="text-xs">Toca "Compartir" → "Agregar a inicio"</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Monitor className="w-4 h-4 mt-0.5 text-zinc-500" />
              <div>
                <p className="font-medium text-white">En escritorio:</p>
                <p className="text-xs">Toca el icono de instalación en la barra de dirección</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.location.reload();
              }
            }}
            className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 text-sm font-black uppercase tracking-wider text-black rounded-xl hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300"
          >
            Instalar Ahora
          </button>
        </div>
      </div>
    </main>
  );
}
