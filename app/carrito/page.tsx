"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { Item } from "../../lib/types";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ion-cart");
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const removeFromCart = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("ion-cart", JSON.stringify(updated));
  };

  const clearCart = () => {
    if (confirm("¿Vaciar carrito completamente?")) {
      setCartItems([]);
      localStorage.removeItem("ion-cart");
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.precio, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Cargando carrito...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-widest hover:text-zinc-400 transition">
            ← IÓN MAX
          </Link>
          <h1 className="text-3xl font-black">🛒 Mi Carrito ({cartItems.length})</h1>
          <div className="w-24"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {cartItems.length === 0 ? (
          // CARRITO VACÍO
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-6">🛍️</div>
            <h2 className="text-4xl font-black mb-4">Carrito Vacío</h2>
            <p className="text-zinc-400 mb-8 text-lg">Aún no has agregado productos. ¡Explora nuestras colecciones!</p>
            <Link 
              href="/" 
              className="inline-block bg-white text-black px-10 py-4 rounded-full font-black hover:scale-105 transition-transform uppercase tracking-widest"
            >
              Ir de Compras
            </Link>
          </motion.div>
        ) : (
          // CARRITO CON ITEMS
          <div className="grid lg:grid-cols-3 gap-12">
            {/* LISTA DE ITEMS */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-2 space-y-6"
            >
              <h2 className="text-2xl font-black mb-8">Productos en tu Carrito</h2>
              
              {cartItems.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-6 bg-zinc-900/40 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all"
                >
                  {/* IMAGEN */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img 
                      src={item.imagen_url} 
                      alt={item.nombre}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                  </div>

                  {/* CONTENIDO */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{item.nombre}</h3>
                          <p className="text-zinc-400 text-sm mt-1">{item.descripcion.substring(0, 80)}...</p>
                        </div>
                        <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {item.categoria}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black">${item.precio}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-400 px-6 py-2 rounded-lg font-bold text-xs transition uppercase tracking-wider"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <button
                onClick={clearCart}
                className="w-full bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-600 text-zinc-400 hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition uppercase tracking-wider"
              >
                ❌ Vaciar Carrito
              </button>
            </motion.div>

            {/* RESUMEN & CHECKOUT */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="bg-gradient-to-br from-zinc-900/50 to-black border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-black mb-8">Resumen</h3>

                {/* DESGLOSE */}
                <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Envío</span>
                    <span className="text-yellow-400">Consultar</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Impuestos</span>
                    <span className="text-yellow-400">A confirmar</span>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-black">Total</span>
                  <span className="text-3xl font-black">${total.toFixed(2)}</span>
                </div>

                {/* BOTÓN CHECKOUT */}
                <a
                  href={`https://wa.me/593980887170?text=Quiero%20comprar%20${cartItems.length}%20item(s)%20del%20carrito.%20Total%3A%20%24${total.toFixed(2)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition uppercase tracking-widest text-center block mb-4"
                >
                  📱 Finalizar Compra por WhatsApp
                </a>

                <Link 
                  href="/"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition uppercase tracking-widest text-center block"
                >
                  ← Seguir Comprando
                </Link>

                {/* INFO */}
                <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 text-xs text-zinc-400 space-y-2">
                  <p>✓ Productos 100% auténticos</p>
                  <p>✓ Pago seguro por WhatsApp</p>
                  <p>✓ Soporte al cliente 24/7</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
