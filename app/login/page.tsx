"use client";

import { AuthForm } from "@/src/features/auth/auth-form";
import { Download, Smartphone, Monitor } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_42%),linear-gradient(135deg,_#050505,_#111)] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="login" />
        
        {/* PWA Download Section */}
        <div className="rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-transparent p-6 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h3 className="text-xl font-black text-yellow-400">¡Descarga IÓN MAX!</h3>
          </div>
          
          <p className="text-sm text-white mb-4">
            Instala la app en tu dispositivo para acceder más rápido y tener una mejor experiencia.
          </p>
          
          <div className="space-y-3 text-sm text-zinc-300 mb-4">
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <Smartphone className="w-5 h-5 mt-0.5 text-yellow-400" />
              <div>
                <p className="font-bold text-white">📱 En móvil:</p>
                <p className="text-xs text-zinc-400">Toca "Compartir" → "Agregar a inicio"</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <Monitor className="w-5 h-5 mt-0.5 text-yellow-400" />
              <div>
                <p className="font-bold text-white">💻 En escritorio:</p>
                <p className="text-xs text-zinc-400">Toca el icono de instalación en la barra de dirección</p>
              </div>
            </div>
          </div>
          
          <a
            href="/"
            className="block mt-4 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 text-sm font-black uppercase tracking-wider text-black rounded-xl hover:shadow-[0_0_40px_rgba(250,204,21,0.6)] transition-all duration-300 text-center"
          >
            🚀 Instalar Ahora
          </a>
          
          <p className="mt-3 text-xs text-center text-zinc-500">
            Es gratis y funciona sin conexión
          </p>
        </div>
      </div>
    </main>
  );
}
