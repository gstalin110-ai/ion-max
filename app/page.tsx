"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/src/contexts/language-context";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black scroll-smooth">
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
          className="text-center z-10"
        >
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs font-black uppercase tracking-widest text-yellow-400 mb-6 px-4 py-2 border border-yellow-400/30 rounded-full bg-yellow-400/10 backdrop-blur"
          >
            La Red Social del Ecosistema Premium
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none"
          >
            <div className="mx-auto mb-8 h-32 w-32 rounded-full border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20">
              <div className="relative h-full w-full">
                <Image src="/logo.png" alt="Logo Ion Max" fill className="object-contain" />
              </div>
            </div>
            <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent drop-shadow-2xl">
              IÓN MAX
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent drop-shadow-2xl">
              RED SOCIAL
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            Conecta, comparte y colabora con marcas, creadores y profesionales de alto impacto en la red social más exclusiva.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Link
              href="/marketplace"
              className="group bg-white text-black px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-105"
            >
              🛒 Marketplace
            </Link>
            <Link
              href="/comunidad"
              className="group border-2 border-white text-white px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              🚀 Entrar a la Comunidad
            </Link>
            <Link
              href="/register"
              className="group border-2 border-white text-white px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              Crear Cuenta
            </Link>
            <a 
              href="https://wa.me/593980887170"
              target="_blank"
              rel="noopener noreferrer"
              className="group border-2 border-white text-white px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              {t("hero.consult")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6"
          >
            <Link
              href="/encuesta"
              className="inline-block text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-4"
            >
              {t("hero.survey")}
            </Link>
          </motion.div>

          {/* STATS MEJORADOS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto text-center"
          >
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">10K+</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Publicaciones</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">50K+</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Miembros Activos</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">98%</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Conexiones Útiles</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition hover:scale-105 transform">
              <p className="text-3xl md:text-4xl font-black text-white">24/7</p>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">Interacción en Vivo</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECCIÓN CONFIANZA */}
      <section id="confianza" className="py-24 px-6 bg-gradient-to-b from-zinc-950 to-black border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-center mb-16 uppercase tracking-wider"
          >
            {t("trust.title")}
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-4 gap-6"
          >
            {[
              { icon: "🛡️", title: "Comunidad Moderada", desc: "Perfiles verificados para asegurar conversaciones de valor real." },
              { icon: "🔒", title: t("trust.security"), desc: t("trust.securityDesc") },
              { icon: "⚡", title: "Conexiones Rápidas", desc: "Interactúa en tiempo real a través de mensajes y publicaciones." },
              { icon: "👥", title: "Networking Premium", desc: "Accede de forma directa a mentores, fundadores y creadores." },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{item.icon}</div>
                <h3 className="font-black uppercase tracking-wider text-sm mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN TESTIMONIOS PREMIUM */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 inline-block px-4 py-2 border border-white/20 rounded-full bg-white/5">
              TESTIMONIOS
            </span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mt-6 mb-6">
              Lo Que Dicen <span className="text-transparent bg-gradient-to-r from-white to-zinc-400 bg-clip-text">Nuestros Miembros</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Resultados reales de personas que transformaron su red de contactos con IÓN MAX Comunidad</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Carlos Mendoza",
                role: "CEO, TechVentures",
                text: "IÓN MAX ha redefinido el significado de hacer networking. Las conversaciones y alianzas creadas en la comunidad son de primer nivel.",
                rating: 5
              },
              {
                name: "Ana Rodríguez",
                role: "Consultora de Negocios",
                text: "El nivel de los profesionales aquí es inigualable. He conseguido socios estratégicos y clientes VIP directamente a través de las publicaciones.",
                rating: 5
              },
              {
                name: "Miguel Torres",
                role: "Fundador, StartupX",
                text: "Tener acceso directo y seguro a un ecosistema tan activo me ha permitido acelerar el crecimiento de mi startup con los consejos indicados.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-zinc-300 leading-relaxed mb-6 text-lg">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-zinc-400 rounded-full flex items-center justify-center text-black font-black text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-white">{testimonial.name}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN CTA PODEROSA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent -z-10"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/20 rounded-3xl p-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            ¿Listo para <span className="text-transparent bg-gradient-to-r from-white to-zinc-400 bg-clip-text">Transformar</span> tu Red de Contactos?
          </h2>
          <p className="text-zinc-300 text-lg mb-12 max-w-2xl mx-auto">
            Únete hoy al círculo exclusivo de profesionales que lideran el ecosistema digital en IÓN MAX.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/comunidad"
              className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:scale-105 transform"
            >
              Comenzar Ahora
            </Link>
            <a
              href="https://wa.me/593980887170"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-12 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all"
            >
              💬 Hablar con un Asesor
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER PREMIUM */}
      <footer className="bg-gradient-to-t from-black via-zinc-950 to-black border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-20"
        >
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* MARCA */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative h-12 w-12">
                  <Image src="/logo.png" alt="Ion Max logo" fill className="object-contain" />
                </div>
                <p className="text-xl font-black uppercase tracking-[0.24em] text-white">IÓN MAX</p>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Ecosistema Profesional. Red Social Exclusiva.
              </p>
              <p className="text-zinc-600 text-xs mt-4">© 2026 Operaciones Globales</p>
            </div>

            {/* MENÚ */}
            <div>
              <h4 className="font-black uppercase text-xs tracking-widest mb-6 text-zinc-400">Comunidad</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/comunidad" className="text-zinc-500 hover:text-white transition">👥 Red Social</Link></li>
                <li><Link href="/mensajes" className="text-zinc-500 hover:text-white transition">💬 Chat</Link></li>
                <li><Link href="/profile" className="text-zinc-500 hover:text-white transition">👤 Mi Perfil</Link></li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h4 className="font-black uppercase text-xs tracking-widest mb-6 text-zinc-400">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-zinc-500 hover:text-white transition">Términos</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-white transition">Garantía</a></li>
              </ul>
            </div>

            {/* CONTACTO */}
            <div>
              <h4 className="font-black uppercase text-xs tracking-widest mb-6 text-zinc-400">Contacto</h4>
              <div className="space-y-3">
                <a
                  href="https://wa.me/593980887170"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-zinc-300 hover:text-white transition font-bold"
                >
                  📲 WhatsApp: +593 98 088 7170
                </a>
                <a
                  href="mailto:gstalin110@gmail.com"
                  className="block text-sm text-zinc-500 hover:text-white transition"
                >
                  ✉️ Email
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="bg-gradient-to-r from-white/5 to-transparent backdrop-blur border border-white/10 rounded-2xl p-6 text-center"
            >
              <p className="text-zinc-400 text-sm mb-4">
                La red de confianza de más de 10,000 profesionales.
              </p>
              <p className="text-xs text-zinc-600">
                ⭐ Rating 4.9/5 — Soporte Premium — Conexiones Verificadas
              </p>
            </motion.div>
          </div>
        </motion.div>
      </footer>

      {/* BOTÓN FLOTANTE MEJORADO */}
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
