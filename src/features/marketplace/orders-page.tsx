"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/src/contexts/auth-context";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  RefreshCw,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { getUserOrders, processRefund } from "@/lib/supabase-helpers";
import { Order, OrderStatus } from "@/lib/types";
import { RefundModal } from "./refund-modal";
import { InvoiceComponent } from "./invoice-component";

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    
    getUserOrders(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch = searchQuery === "" || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pendiente" };
      case "paid":
        return { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", label: "Pagado" };
      case "processing":
        return { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-400/10", label: "Procesando" };
      case "shipped":
        return { icon: Truck, color: "text-purple-400", bg: "bg-purple-400/10", label: "Enviado" };
      case "delivered":
        return { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", label: "Entregado" };
      case "cancelled":
        return { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Cancelado" };
      case "refunded":
        return { icon: RefreshCw, color: "text-orange-400", bg: "bg-orange-400/10", label: "Reembolsado" };
      default:
        return { icon: Clock, color: "text-zinc-400", bg: "bg-zinc-400/10", label: status };
    }
  };

  const handleRefund = (order: Order) => {
    setSelectedOrderForRefund(order);
    setRefundModalOpen(true);
  };

  const handleRefundProcessed = () => {
    if (user) {
      getUserOrders(user.id)
        .then(setOrders)
        .catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-zinc-400">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black">Mis Pedidos</h1>
          <p className="mt-2 text-zinc-400">Gestiona y rastrea tus compras</p>
        </div>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                filter === "all"
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                filter === "paid"
                  ? "bg-green-400 text-black"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              Pagados
            </button>
            <button
              onClick={() => setFilter("shipped")}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                filter === "shipped"
                  ? "bg-purple-400 text-black"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              Enviados
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                filter === "delivered"
                  ? "bg-green-400 text-black"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              Entregados
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pedidos..."
              className="w-full md:w-64 rounded-xl border border-white/10 bg-black pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        {/* LISTA DE PEDIDOS */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-20 w-20 text-zinc-600 mb-6" />
            <h2 className="text-2xl font-black mb-4">No hay pedidos</h2>
            <p className="text-zinc-400 mb-8">Explora nuestro marketplace y realiza tu primera compra</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition"
            >
              Ir al marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* INFO PRINCIPAL */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-black">#{order.id.slice(0, 8)}</span>
                            <span className={`rounded-full ${statusInfo.bg} ${statusInfo.color} px-3 py-1 text-xs font-black flex items-center gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500">
                            {new Date(order.created_at).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="text-2xl font-black">${order.total_amount.toFixed(2)}</p>
                      </div>

                      {/* ITEMS DEL PEDIDO */}
                      <div className="space-y-3">
                        {order.order_items && Array.isArray(order.order_items) && order.order_items.slice(0, 2).map((item: any) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={item.listing_image || "/placeholder.png"}
                                alt={item.listing_title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-sm line-clamp-1">{item.listing_title}</p>
                              <p className="text-xs text-zinc-500">Cantidad: {item.quantity}</p>
                              <p className="font-black text-yellow-400">${item.subtotal.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                        {order.order_items && Array.isArray(order.order_items) && order.order_items.length > 2 && (
                          <p className="text-xs text-zinc-500">
                            +{order.order_items.length - 2} productos más
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ACCIONES */}
                    <div className="flex flex-col gap-3 lg:min-w-[200px]">
                      <Link
                        href={`/ordenes/${order.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white hover:bg-white/10 transition text-center"
                      >
                        Ver detalles
                      </Link>
                      
                      {(order.status === "delivered" || order.status === "paid") && (
                        <button
                          onClick={() => handleRefund(order)}
                          className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-400 hover:bg-red-500/20 transition"
                        >
                          Solicitar reembolso
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedOrderForInvoice(order);
                          setInvoiceModalOpen(true);
                        }}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-zinc-400 hover:bg-white/10 transition flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Factura
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE REEMBOLSO */}
      {selectedOrderForRefund && (
        <RefundModal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          orderId={selectedOrderForRefund.id}
          orderTotal={selectedOrderForRefund.total_amount}
          onRefundProcessed={handleRefundProcessed}
        />
      )}

      {/* MODAL DE FACTURA */}
      {selectedOrderForInvoice && invoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <InvoiceComponent
            order={selectedOrderForInvoice}
            onClose={() => setInvoiceModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
