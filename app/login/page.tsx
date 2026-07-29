"use client";

import { AuthForm } from "@/src/features/auth/auth-form";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar la app:\n\n📱 Móvil: Toca "Compartir" → "Agregar a inicio"\n💻 PC: Toca el icono de instalación en la barra de dirección');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_42%),linear-gradient(135deg,_#050505,_#111)] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="login" />
        
        {/* PWA Download Section */}
        <div className="rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-transparent p-6 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Download className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h3 className="text-xl font-black text-yellow-400">Descargar App</h3>
          </div>
          
          <button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 text-sm font-black uppercase tracking-wider text-black rounded-xl hover:shadow-[0_0_40px_rgba(250,204,21,0.6)] transition-all duration-300"
          >
            � Instalar en Móvil o PC
          </button>
        </div>
      </div>
    </main>
  );
}
