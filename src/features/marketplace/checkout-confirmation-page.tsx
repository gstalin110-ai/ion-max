"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  ArrowRight,
  Download,
  Home,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { getOrder } from "@/lib/supabase-helpers";
import { Order } from "@/lib/types";

export function CheckoutConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrder(orderId)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-zinc-400">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black mb-4">Orden no encontrada</h1>
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
      <div className="mx-auto max-w-4xl">
        {/* SUCCESS HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-black mb-4">¡Compra completada!</h1>
          <p className="text-zinc-400">Tu pedido #{order.id.slice(0, 8)} ha sido procesado exitosamente</p>
        </motion.div>

        {/* ORDER DETAILS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 mb-6"
        >
          <h2 className="text-xl font-black mb-6">Detalles del pedido</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-zinc-400">Número de orden</span>
              <span className="font-black">#{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-zinc-400">Fecha</span>
              <span className="font-black">{new Date(order.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-zinc-400">Estado</span>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-black text-green-400">
                Pagado
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-zinc-400">Total</span>
              <span className="text-2xl font-black">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* SHIPPING INFO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-yellow-400/10 p-2">
              <Truck className="h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-black">Información de envío</h2>
          </div>

          {order.shipping_address && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-zinc-500 mt-1" />
                <div>
                  <p className="font-black">Dirección de entrega</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    {JSON.parse(order.shipping_address as string).full_name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {JSON.parse(order.shipping_address as string).address_line1}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {JSON.parse(order.shipping_address as string).city}, {JSON.parse(order.shipping_address as string).province}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {JSON.parse(order.shipping_address as string).country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-zinc-500 mt-1" />
                <div>
                  <p className="font-black">Tiempo estimado de entrega</p>
                  <p className="text-sm text-zinc-400 mt-1">3-5 días hábiles</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* NEXT STEPS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 mb-6"
        >
          <h2 className="text-xl font-black mb-6">Próximos pasos</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-400">1</span>
              </div>
              <div>
                <p className="font-black text-sm">Recibirás un email de confirmación</p>
                <p className="text-xs text-zinc-500">Con todos los detalles de tu pedido</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-400">2</span>
              </div>
              <div>
                <p className="font-black text-sm">El vendedor preparará tu pedido</p>
                <p className="text-xs text-zinc-500">Recibirás notificaciones del estado</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-400">3</span>
              </div>
              <div>
                <p className="font-black text-sm">Tu pedido será enviado</p>
                <p className="text-xs text-zinc-500">Con número de seguimiento</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <Link
            href="/ordenes"
            className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-white hover:bg-white/10 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            Ver mis pedidos
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black hover:bg-zinc-200 transition"
          >
            <Home className="h-4 w-4" />
            Ir al marketplace
          </Link>
        </motion.div>

        {/* CONTACT SUPPORT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-zinc-500 text-sm mb-4">¿Necesitas ayuda con tu pedido?</p>
          <Link
            href="/mensajes"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition text-sm font-black"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar soporte
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
