"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Item } from "../lib/types";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart] = useState<Item[]>(() => {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem("ion-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const savedWishlist = localStorage.getItem("ion-wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("items")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (data) setItems(data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
      setLoading(false);
    }
    cargarDatos();
  }, []);

  const shopItems = items.filter(i => i.categoria === 'SHOP');
  const academyItems = items.filter(i => i.categoria === 'ACADEMY');
  const serviceItems = items.filter(i => i.categoria === 'SERVICES');

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      localStorage.setItem("ion-wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Cargando experiencia IÓN MAX...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black scroll-smooth">
      
      {/* NAVBAR PREMIUM */}
      <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-2xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-black tracking-widest uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent"
          >
            ⚡ IÓN MAX
          </motion.div>
          <div className="hidden md:flex gap-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {shopItems.length > 0 && <a href="#shop" className="hover:text-white transition duration-300">Shop</a>}
            {academyItems.length > 0 && <a href="#academy" className="hover:text-white transition duration-300">Academy</a>}
            {serviceItems.length > 0 && <a href="#services" className="hover:text-white transition duration-300">Services</a>}
            <Link href="/marketplace" className="hover:text-white transition duration-300">Marketplace</Link>
            <Link href="/dashboard" className="hover:text-white transition duration-300">Dashboard</Link>
            <a href="#confianza" className="hover:text-white transition duration-300">Confianza</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden rounded-full border border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300 transition hover:border-white hover:text-white sm:inline-flex">
              Panel
            </Link>
            <Link href="/carrito" className="bg-gradient-to-r from-white to-zinc-200 text-black px-5 py-2 rounded-full font-black text-xs hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition uppercase tracking-wider">
              🛒 {cart.length}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO BRUTAL */}
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
            className="inline-block text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 px-4 py-2 border border-white/20 rounded-full bg-white/5 backdrop-blur"
          >
            ✨ La Marca de Autoridad Digital
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none"
          >
            <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent drop-shadow-2xl">
              ELEVA TU
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent drop-shadow-2xl">
              AUTORIDAD
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Productos de lujo • Educación transformadora • Servicios de alto impacto
            <br />
            <span className="text-white font-bold">Todo en un ecosistema premium</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <a 
              href="#shop"
              className="group bg-white text-black px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-105"
            >
              🚀 Explorar Ahora
            </a>
            <Link
              href="/marketplace"
              className="group border-2 border-white text-white px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              🛍️ Ver Marketplace
            </Link>
            <a 
              href="https://wa.me/593980887170"
              target="_blank"
              rel="noopener noreferrer"
              className="group border-2 border-white text-white px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              📲 Consulta Gratis
            </a>
          </motion.div>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-3 gap-4 mt-20 max-w-md mx-auto text-center"
          >
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <p className="text-2xl font-black">{items.length}+</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Productos</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <p className="text-2xl font-black">10K+</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Clientes</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <p className="text-2xl font-black">⭐ 4.9</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Calificación</p>
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
            Por Qué Confían En Nosotros
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-4 gap-6"
          >
            {[
              { icon: "✅", title: "100% Garantizado", desc: "O devolvemos tu dinero sin preguntas" },
              { icon: "🔒", title: "Seguridad Total", desc: "Encriptación de nivel bancario" },
              { icon: "⚡", title: "Entrega Rápida", desc: "Acceso inmediato a todos los productos" },
              { icon: "👥", title: "Soporte Premium", desc: "Team dedicado 24/7 para ti" },
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

      {/* ION SHOP - LUJO ABSOLUTO */}
      {shopItems.length > 0 && (
        <section id="shop" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-20 text-center"
            >
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 inline-block px-4 py-2 border border-white/20 rounded-full bg-white/5">
                CATEGORÍA 1 DE 3
              </span>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter mt-6 mb-6">
                ION <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">SHOP</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">Productos de lujo seleccionados que definen tu autoridad. Solo lo mejor para quienes exigen calidad absoluta.</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              className="grid md:grid-cols-3 gap-8"
            >
              {shopItems.map((product) => (
                <motion.div
                  key={product.id}
                  variants={scaleIn}
                  className="group relative bg-gradient-to-br from-blue-950/30 to-black border border-blue-500/20 rounded-3xl overflow-hidden hover:border-blue-400/50 transition-all duration-500"
                >
                  {/* BADGE */}
                  {product.etiqueta && (
                    <div className="absolute top-6 right-6 z-20">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg">
                        {product.etiqueta}
                      </span>
                    </div>
                  )}

                  {/* WISHLIST */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-6 left-6 z-20 text-3xl transition-transform hover:scale-125 drop-shadow-lg"
                  >
                    {wishlist.includes(product.id) ? "❤️" : "🤍"}
                  </button>

                  {/* IMAGEN */}
                  <div className="relative overflow-hidden h-80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* CONTENIDO */}
                  <div className="p-8">
                    <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-blue-400 transition">{product.nombre}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-2">{product.descripcion}</p>

                    {/* PRECIO Y STOCK */}
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className="text-4xl font-black text-blue-400">${product.precio}</p>
                        {product.stock && product.stock < 5 && (
                          <p className="text-xs text-red-400 font-black mt-2 uppercase tracking-wider">⚠️ Solo {product.stock} disponibles</p>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={product.enlace_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-3 rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 uppercase text-sm tracking-wider block text-center group-hover:scale-105 transform"
                    >
                      Adquirir Ahora →
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ION ACADEMY - EDUCACIÓN TRANSFORMADORA */}
      {academyItems.length > 0 && (
        <section id="academy" className="py-32 px-6 bg-gradient-to-b from-purple-950/10 to-black border-y border-purple-500/10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-20 text-center"
            >
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 inline-block px-4 py-2 border border-white/20 rounded-full bg-white/5">
                CATEGORÍA 2 DE 3
              </span>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter mt-6 mb-6">
                ION <span className="text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text">ACADEMY</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">Cursos diseñados por expertos. Transforma tu conocimiento en poder real y monetizable.</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              className="space-y-6"
            >
              {academyItems.map((course) => (
                <motion.div
                  key={course.id}
                  variants={fadeInUp}
                  className="group bg-gradient-to-r from-purple-950/40 to-black border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/50 hover:bg-purple-950/60 transition-all duration-500 flex flex-col md:flex-row gap-8 items-start md:items-center"
                >
                  {/* IMAGEN */}
                  <div className="flex-shrink-0 w-full md:w-48 h-48 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.imagen_url}
                      alt={course.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                  </div>

                  {/* CONTENIDO */}
                  <div className="flex-1">
                    {course.etiqueta && (
                      <span className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3 inline-block">
                        ✨ {course.etiqueta}
                      </span>
                    )}
                    <h3 className="text-3xl font-black mb-3 group-hover:text-purple-400 transition">{course.nombre}</h3>
                    <p className="text-zinc-400 mb-6 leading-relaxed">{course.descripcion}</p>

                    <div className="flex flex-wrap items-center gap-6 mb-6">
                      <div>
                        <p className="text-3xl font-black text-purple-400">${course.precio}</p>
                        <p className="text-xs text-zinc-500 mt-1">Acceso de por vida</p>
                      </div>
                      {course.stock && (
                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                          <p className="text-xs text-zinc-400">📊 {course.stock} inscritos</p>
                        </div>
                      )}
                    </div>

                    <a
                      href={course.enlace_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black py-3 px-8 rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all uppercase text-sm tracking-wider group-hover:scale-105 transform"
                    >
                      Inscribirse Ahora →
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ION SERVICES - OPERACIONES DE ALTO VALOR */}
      {serviceItems.length > 0 && (
        <section id="services" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-20 text-center"
            >
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 inline-block px-4 py-2 border border-white/20 rounded-full bg-white/5">
                CATEGORÍA 3 DE 3
              </span>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter mt-6 mb-6">
                ION <span className="text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text">SERVICES</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">Servicios premium para empresas que exigen excelencia. Operaciones escalables y medibles.</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              className="grid md:grid-cols-2 gap-8"
            >
              {serviceItems.map((service) => (
                <motion.div
                  key={service.id}
                  variants={scaleIn}
                  className="group bg-gradient-to-br from-green-950/30 to-black border border-green-500/20 rounded-3xl p-10 hover:border-green-400/50 hover:bg-green-950/40 transition-all duration-500 flex flex-col"
                >
                  <div className="mb-8">
                    <div className="w-14 h-14 bg-green-600/20 border border-green-500/40 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-green-600/40 transition mb-6">
                      ⚙️
                    </div>
                    {service.etiqueta && (
                      <span className="text-xs font-black uppercase tracking-widest text-green-400 mb-3 inline-block">
                        {service.etiqueta}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black mb-3 group-hover:text-green-400 transition">{service.nombre}</h3>
                  <p className="text-zinc-400 flex-1 mb-8 leading-relaxed">{service.descripcion}</p>

                  <div className="mb-8">
                    <p className="text-3xl font-black text-green-400 mb-2">${service.precio}</p>
                    <p className="text-xs text-zinc-500">Consultoría + Implementación</p>
                  </div>

                  <a
                    href={service.enlace_externo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-black py-3 rounded-xl hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300 uppercase text-sm tracking-wider group-hover:scale-105 transform text-center"
                  >
                    Solicitar Consulta →
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* SECCIÓN CTA PODEROSA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent -z-10"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/20 rounded-3xl p-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            ¿Listo para <span className="text-transparent bg-gradient-to-r from-white to-zinc-400 bg-clip-text">Transformar</span> tu Vida?
          </h2>
          <p className="text-zinc-300 text-lg mb-12 max-w-2xl mx-auto">
            Únete a miles de personas que ya están experimentando el poder de IÓN MAX.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="#shop"
              className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:scale-105 transform"
            >
              Comenzar Ahora
            </a>
            <a
              href="https://wa.me/593980887170"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-12 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all"
            >
              💬 Hablar con Experto
            </a>
          </div>
        </motion.div>
      </section>

      {/* ABOUT MEJORADO */}
      <section id="nosotros" className="py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-8">
              Somos <span className="text-transparent bg-gradient-to-r from-white to-zinc-400 bg-clip-text">IÓN MAX</span>
            </h2>
            <p className="text-xl text-zinc-300 leading-relaxed">
              No solo vendemos productos. Construimos imperios de autoridad digital.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="space-y-8"
          >
            {[
              {
                title: "🎯 Nuestra Misión",
                text: "Conectar emprendedores con herramientas, conocimiento y servicios que los conviertan en autoridades en sus industrias."
              },
              {
                title: "🚀 Nuestra Visión",
                text: "Ser la plataforma de confianza número uno donde la calidad premium y la transformación real son garantizadas."
              },
              {
                title: "💎 Nuestros Valores",
                text: "Excelencia absoluta, transparencia radical, y resultados medibles. Nada mediocre. Nunca."
              }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
                <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                <p className="text-zinc-300 leading-relaxed text-lg">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
              <h3 className="text-xl font-black mb-6">⚡ IÓN MAX</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Autoridad digital. Lujo absoluto. Transformación real.
              </p>
              <p className="text-zinc-600 text-xs mt-4">© 2026 Operaciones Globales</p>
            </div>

            {/* MENÚ */}
            <div>
              <h4 className="font-black uppercase text-xs tracking-widest mb-6 text-zinc-400">Producto</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#shop" className="text-zinc-500 hover:text-white transition">🛍️ Shop</a></li>
                <li><a href="#academy" className="text-zinc-500 hover:text-white transition">📚 Academy</a></li>
                <li><a href="#services" className="text-zinc-500 hover:text-white transition">⚙️ Services</a></li>
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
                Somos la marca de confianza de 10,000+ personas que transformaron sus vidas
              </p>
              <p className="text-xs text-zinc-600">
                ⭐ Rating 4.9/5 — Garantía de Satisfacción 100% — Soporte 24/7
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
