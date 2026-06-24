"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Item } from "../lib/types";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Item[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

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

    // Cargar carrito y wishlist del localStorage
    const savedCart = localStorage.getItem("ion-cart");
    const savedWishlist = localStorage.getItem("ion-wishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
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

  const addToCart = (item: Item) => {
    setCart(prev => {
      const updated = [...prev, item];
      localStorage.setItem("ion-cart", JSON.stringify(updated));
      return updated;
    });
  };
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black scroll-smooth">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <span className="text-xl font-black tracking-widest uppercase">IÓN MAX</span>
          <div className="hidden md:flex gap-8 text-sm font-bold text-zinc-400 uppercase tracking-wide">
            {shopItems.length > 0 && <a href="#shop" className="hover:text-white transition">Shop</a>}
            {academyItems.length > 0 && <a href="#academy" className="hover:text-white transition">Academy</a>}
            {serviceItems.length > 0 && <a href="#services" className="hover:text-white transition">Services</a>}
            <a href="#nosotros" className="hover:text-white transition">V1.0</a>
          </div>
          <a href="/carrito" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs hover:bg-zinc-200 transition uppercase tracking-widest">
            🛒 Carrito ({cart.length})
          </a>
        </div>
      </nav>

      {/* HERO - PANTALLA DE INICIO */}
      <section className="h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black -z-10"></div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-gradient-to-br from-white to-zinc-600 bg-clip-text text-transparent drop-shadow-2xl">
          IÓN MAX
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-10 font-light tracking-wide">
          La marca que redefine la autoridad digital. Lujo, conocimiento avanzado y servicios operativos de alto impacto.
        </p>
        <a href="#shop" className="bg-white text-black px-12 py-4 rounded-full font-black text-sm hover:scale-105 transition-transform duration-300 uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Ingresar al Sistema
        </a>
      </section>
      {/* PILAR 1: ION SHOP */}
      {shopItems.length > 0 && (
        <section id="shop" className="max-w-7xl mx-auto py-24 px-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-5xl font-black mb-16 border-l-4 border-white pl-6 uppercase tracking-wider"
          >
            ION Shop — Lujo & Tecnología
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            {shopItems.map((p) => (
              <motion.div 
                key={p.id} 
                variants={itemVariants}
                className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:border-white/30 transition-all duration-500 overflow-hidden"
              >
                {p.etiqueta && (
                  <span className="absolute top-8 right-8 z-10 bg-white text-black text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    {p.etiqueta}
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-6 left-6 z-10 text-2xl transition-transform hover:scale-125"
                >
                  {wishlist.includes(p.id) ? "❤️" : "🤍"}
                </button>
                <img 
                  src={p.imagen_url} 
                  alt={p.nombre} 
                  className="w-full h-72 object-cover rounded-2xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
                <h3 className="text-2xl font-bold tracking-tight">{p.nombre}</h3>
                <p className="text-zinc-400 mt-2 text-sm line-clamp-2">{p.descripcion}</p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-3xl font-black">${p.precio}</span>
                  <a 
                    href={p.enlace_externo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold text-xs hover:bg-zinc-200 transition uppercase tracking-wider"
                  >
                    Adquirir
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
      {/* PILAR 2: ION ACADEMY */}
      {academyItems.length > 0 && (
        <section id="academy" className="bg-zinc-950 py-24 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-5xl font-black mb-16 border-l-4 border-zinc-500 pl-6 uppercase tracking-wider text-white"
            >
              ION Academy — Educación & Innovación
            </motion.h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid md:grid-cols-2 gap-8"
            >
              {academyItems.map((p) => (
                <motion.div 
                  key={p.id} 
                  variants={itemVariants}
                  className="flex flex-col md:flex-row bg-black border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500"
                >
                  <img 
                    src={p.imagen_url} 
                    alt={p.nombre} 
                    className="w-full md:w-48 h-48 md:h-auto object-cover opacity-80 hover:opacity-100 transition-opacity"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  <div className="p-8 flex flex-col justify-center flex-1">
                    {p.etiqueta && <span className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">✨ {p.etiqueta}</span>}
                    <h3 className="text-2xl font-bold">{p.nombre}</h3>
                    <p className="text-zinc-400 mt-2 text-sm">{p.descripcion}</p>
                    <div className="mt-6 flex items-center gap-6">
                      <span className="text-2xl font-black">${p.precio}</span>
                      <a 
                        href={p.enlace_externo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-zinc-800 text-white border border-white/10 px-6 py-3 rounded-xl font-bold text-xs hover:bg-white hover:text-black transition uppercase tracking-wider"
                      >
                        Inscribirse
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* PILAR 3: ION SERVICES */}
      {serviceItems.length > 0 && (
        <section id="services" className="max-w-7xl mx-auto py-24 px-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-5xl font-black mb-16 border-l-4 border-white pl-6 uppercase tracking-wider"
          >
            ION Services — Operaciones de Alto Valor
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            {serviceItems.map((p) => (
              <motion.div 
                key={p.id} 
                variants={itemVariants}
                className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 hover:border-white/30 hover:-translate-y-4 transition-all duration-500 group"
              >
                <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <span className="text-3xl">⚙️</span>
                </div>
                {p.etiqueta && (
                  <span className="inline-block bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                    {p.etiqueta}
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-3">{p.nombre}</h3>
                <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{p.descripcion}</p>
                <a 
                  href={p.enlace_externo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-transparent border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-white hover:text-black transition uppercase tracking-wider group-hover:border-white"
                >
                  Solicitar Operación
                </a>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ABOUT - VISIÓN & MISIÓN */}
      <section id="nosotros" className="py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent -z-10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-6xl md:text-7xl font-black mb-12 tracking-tighter">
            Somos <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">IÓN MAX</span>
          </h2>
          <div className="space-y-8">
            <p className="text-zinc-300 text-xl leading-relaxed font-light">
              No somos una marca común. <strong className="text-white">Somos la infraestructura</strong> donde la autoridad digital y el valor convergen.
            </p>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Comenzamos como una visión: <strong className="text-white">conectar a quienes generan valor con quienes lo buscan</strong>. 
              Hoy operamos como una red organizada, escalable y tecnológicamente imparable.
            </p>
            <div className="grid md:grid-cols-3 gap-6 py-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                <p className="text-3xl font-black text-white mb-2">SHOP</p>
                <p className="text-zinc-400 text-sm">Productos de lujo y tecnología que imponen autoridad</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                <p className="text-3xl font-black text-white mb-2">ACADEMY</p>
                <p className="text-zinc-400 text-sm">Cursos que transforman aprendices en expertos</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                <p className="text-3xl font-black text-white mb-2">SERVICES</p>
                <p className="text-zinc-400 text-sm">Operaciones de alto valor para empresas en crecimiento</p>
              </div>
            </div>
            <p className="text-zinc-300 text-lg font-light pt-4">
              <strong className="text-white block mb-2">Nuestra Meta:</strong>
              Ser la marca más confiable en la venta de valor. No competimos por precio — 
              competimos por <strong className="text-white">impacto, calidad y transformación</strong>.
            </p>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center border-t border-white/10 bg-zinc-950/50 backdrop-blur px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-6">Contacto Directo</p>
          <p className="text-4xl font-black text-white mb-4">WhatsApp Business</p>
          <a 
            href="https://wa.me/593980887170" 
            className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            📱 +593 98 088 7170
          </a>
          <p className="text-zinc-400 mt-6 text-sm">Director General: STALIN</p>
        </motion.div>
        <div className="border-t border-white/10 pt-8">
          <p className="text-zinc-600 text-xs tracking-widest uppercase">© 2026 IÓN MAX - Operaciones Globales en Expansión</p>
          <p className="text-zinc-700 text-xs mt-2">Diseño Arquitectónico de Presencia Digital | Marca de Autoridad Global</p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE MEJORADO */}
      <motion.a 
        href="https://wa.me/593980887170" 
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.15 }}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-white to-zinc-100 text-black p-4 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] transition-all duration-300 flex items-center justify-center"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.67-1.613-.916-2.207-.242-.579-.487-.5-.67-.51-.172-.008-.37-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a5.494 5.494 0 0 1-2.801-.768l-.201-.118-2.083.546.556-2.031-.131-.211a5.495 5.495 0 0 1-.84-2.887c0-3.033 2.467-5.501 5.5-5.501 1.465 0 2.842.57 3.875 1.605s1.605 2.41 1.605 3.875c0 3.033-2.467 5.501-5.5 5.501"/>
        </svg>
      </motion.a>

    </main>
  );
}
