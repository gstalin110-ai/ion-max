"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/src/contexts/language-context";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function InvitePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* FONDO ANIMADO */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full"
      >
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="relative h-24 w-24 mx-auto mb-6">
            <Image src="/logo.png" alt="ION MAX" fill className="object-contain" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">
              IÓN MAX
            </span>
          </h1>
          <p className="text-zinc-400 mt-4 text-lg">Tu puerta al ecosistema premium</p>
        </motion.div>

        {/* TARJETAS DE ACCIÓN */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8"
        >
          {/* INICIAR SESIÓN */}
          <Link
            href="/login"
            className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/20 rounded-3xl p-10 hover:border-white/40 hover:bg-white/15 transition-all duration-500 hover:scale-105 transform"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-white to-zinc-300 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                🔑
              </div>
              <h2 className="text-2xl font-black mb-4">Iniciar Sesión</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Accede a tu cuenta para continuar donde lo dejaste
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-yellow-400 text-sm font-black uppercase tracking-wider group-hover:gap-4 transition-all">
                <span>Entrar</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* CREAR CUENTA */}
          <Link
            href="/register"
            className="group relative bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 backdrop-blur border border-yellow-400/30 rounded-3xl p-10 hover:border-yellow-400/50 hover:bg-yellow-400/20 transition-all duration-500 hover:scale-105 transform"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                ✨
              </div>
              <h2 className="text-2xl font-black mb-4">Crear Cuenta</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Únete al ecosistema premium y comienza tu transformación
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-yellow-400 text-sm font-black uppercase tracking-wider group-hover:gap-4 transition-all">
                <span>Registrarse</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* INFO ADICIONAL */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 space-y-4"
        >
          <p className="text-zinc-500 text-sm">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
          <Link
            href="/"
            className="inline-block text-zinc-400 hover:text-white text-sm underline underline-offset-4 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
