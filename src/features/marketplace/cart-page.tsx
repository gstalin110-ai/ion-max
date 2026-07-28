"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Listing } from "@/lib/types";

interface CartItem extends Listing {
  quantity: number;
}

export function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem("ion-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Guardar carrito en localStorage cuando cambie
    localStorage.setItem("ion-cart", JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-zinc-400">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <ShoppingBag className="mx-auto h-20 w-20 text-zinc-600 mb-6" />
          <h1 className="text-3xl font-black mb-4">Tu carrito está vacío</h1>
          <p className="text-zinc-400 mb-8">Explora nuestro marketplace y encuentra productos increíbles</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition"
          >
            Ir al marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black">Tu Carrito</h1>
          <p className="mt-2 text-zinc-400">{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.images?.[0] || "/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-black">{item.title}</h3>
                    <p className="text-sm text-zinc-400">{item.category_name || "General"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black px-3 py-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-zinc-400 hover:text-white transition"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-black w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-zinc-400 hover:text-white transition"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-black">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-zinc-500">${item.price} c/u</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 space-y-4">
              <h2 className="text-xl font-black">Resumen</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Envío</span>
                  <span className="font-black">{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                </div>
                {subtotal < 100 && (
                  <p className="text-xs text-yellow-400">
                    Agrega ${(100 - subtotal).toFixed(2)} más para envío gratis
                  </p>
                )}
                <div className="border-t border-white/10 pt-4 flex justify-between">
                  <span className="font-black">Total</span>
                  <span className="text-2xl font-black">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full rounded-full bg-white px-6 py-4 text-sm font-black text-black hover:bg-zinc-200 transition text-center"
              >
                Proceder al pago
              </Link>

              <button
                onClick={clearCart}
                className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-zinc-400 hover:border-white/20 hover:bg-white/10 transition"
              >
                Limpiar carrito
              </button>
            </div>

            {/* MÉTODOS DE PAGO */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
              <h3 className="text-sm font-black mb-4">Métodos de pago aceptados</h3>
              <div className="flex gap-3">
                <div className="h-8 w-12 rounded bg-white/10 flex items-center justify-center text-xs">💳</div>
                <div className="h-8 w-12 rounded bg-white/10 flex items-center justify-center text-xs">🏦</div>
                <div className="h-8 w-12 rounded bg-white/10 flex items-center justify-center text-xs">💰</div>
              </div>
            </div>

            {/* GARANTÍA */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-400">🛡️</span>
                </div>
                <div>
                  <p className="font-black text-sm">Compra protegida</p>
                  <p className="text-xs text-zinc-400 mt-1">100% garantía de devolución si no estás satisfecho</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
