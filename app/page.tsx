"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Store, Users, TrendingUp, ArrowRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black scroll-smooth">
      {/* HERO SECTION - Landing Page Clara */}
      <section className="min-h-screen relative flex flex-col justify-center items-center pt-20 px-6 overflow-hidden">
        {/* FONDO ANIMADO */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center z-10 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <div className="mx-auto mb-8 h-32 w-32 rounded-full border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20">
              <div className="relative h-full w-full">
                <Image src="/logo.png" alt="Logo Ion Max" fill className="object-contain" />
              </div>
            </div>
            <motion.h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
              <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent drop-shadow-2xl">
                IÓN MAX
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto mb-8 font-light"
            >
              Tu plataforma todo en uno para vender, conectar y crecer
            </motion.p>
          </motion.div>

          {/* DOS SISTEMAS CLAROS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {/* MARKETPLACE CARD */}
            <Link href="/marketplace" className="group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 rounded-2xl">
                    <Store className="w-12 h-12 text-black" />
                  </div>
                </div>
                <h2 className="text-3xl font-black mb-4 text-white">MARKETPLACE</h2>
                <p className="text-zinc-400 mb-6 text-lg">
                  Compra y vende productos y servicios. Encuentra oportunidades de negocio y conecta con vendedores verificados.
                </p>
                <div className="flex items-center gap-2 text-yellow-400 font-black uppercase tracking-wider">
                  <span>Explorar Marketplace</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            </Link>

            {/* RED SOCIAL CARD */}
            <Link href="/comunidad" className="group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-4 rounded-2xl">
                    <Users className="w-12 h-12 text-black" />
                  </div>
                </div>
                <h2 className="text-3xl font-black mb-4 text-white">RED SOCIAL</h2>
                <p className="text-zinc-400 mb-6 text-lg">
                  Conecta con profesionales, comparte contenido y construye tu red de contactos de alto impacto.
                </p>
                <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-wider">
                  <span>Entrar a Comunidad</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* EMPRENDIMIENTO CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-yellow-400/20 to-transparent border border-yellow-400/30 rounded-3xl p-8 mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <h3 className="text-2xl font-black text-yellow-400">¿Quieres iniciar tu emprendimiento?</h3>
            </div>
            <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
              Únete a IÓN MAX como vendedor y accede a herramientas para vender tus productos, gestionar pedidos y crecer tu negocio.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-wider hover:shadow-[0_0_40px_rgba(250,204,21,0.6)] transition-all transform hover:scale-105"
              >
                🚀 Crear Cuenta de Vendedor
              </Link>
              <Link
                href="/publish"
                className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-full font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-all"
              >
                Publicar Producto
              </Link>
            </div>
          </motion.div>

          {/* LOGIN CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href="/login"
              className="inline-block text-zinc-400 hover:text-white transition underline underline-offset-4"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS MEJORADOS */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-950 to-black border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          >
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">10K+</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Productos</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">50K+</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Usuarios</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">98%</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Satisfacción</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">24/7</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Soporte</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER PREMIUM */}
      <footer className="bg-gradient-to-t from-black via-zinc-950 to-black border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative h-12 w-12">
              <Image src="/logo.png" alt="Ion Max logo" fill className="object-contain" />
            </div>
            <p className="text-xl font-black uppercase tracking-[0.24em] text-white">IÓN MAX</p>
          </div>
          <p className="text-zinc-500 text-sm mb-4">
            Marketplace + Red Social - Tu plataforma todo en uno
          </p>
          <p className="text-zinc-600 text-xs">© 2026 IÓN MAX v1.0.1</p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <motion.a
        href="https://wa.me/593980887170"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.2, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-white to-zinc-100 text-black p-5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] transition-all duration-300 flex items-center justify-center font-black text-sm"
      >
        💬
      </motion.a>
    </main>
  );
}
