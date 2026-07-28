"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Download, Printer, FileText, Calendar, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { Order } from "@/lib/types";

interface InvoiceComponentProps {
  order: Order;
  onClose?: () => void;
}

export function InvoiceComponent({ order, onClose }: InvoiceComponentProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    // Simular generación de PDF
    setTimeout(() => {
      setLoading(false);
      alert("Factura descargada exitosamente");
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address as string) : null;

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">ION MAX</h1>
            <p className="text-zinc-600">Factura #{order.id.slice(0, 8)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-black/10 bg-black px-4 py-2 text-sm font-black text-white hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Descargar
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-black/10 bg-black px-4 py-2 text-sm font-black text-white hover:bg-zinc-800 transition"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-black hover:bg-zinc-100 transition"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>

        {/* INFO DE FACTURA */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <div className="rounded-xl border border-black/10 bg-zinc-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5" />
              <h3 className="font-black">Información del vendedor</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-black">ION MAX Marketplace</p>
              <p className="text-zinc-600">Av. Amazonas N23-45</p>
              <p className="text-zinc-600">Quito, Ecuador</p>
              <p className="text-zinc-600">RUC: 1791234567001</p>
              <p className="text-zinc-600">Tel: +593 99 123 4567</p>
              <p className="text-zinc-600">Email: facturacion@ionmax.com</p>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-zinc-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h3 className="font-black">Información de envío</h3>
            </div>
            {shippingAddress && (
              <div className="space-y-2 text-sm">
                <p className="font-black">{shippingAddress.full_name}</p>
                <p className="text-zinc-600">{shippingAddress.address_line1}</p>
                {shippingAddress.address_line2 && (
                  <p className="text-zinc-600">{shippingAddress.address_line2}</p>
                )}
                <p className="text-zinc-600">{shippingAddress.city}, {shippingAddress.province}</p>
                <p className="text-zinc-600">{shippingAddress.country}</p>
                <p className="text-zinc-600">{shippingAddress.postal_code}</p>
                <p className="text-zinc-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {shippingAddress.phone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FECHA Y ESTADO */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-xl border border-black/10 bg-zinc-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-black">Fecha de emisión</span>
            </div>
            <p className="text-sm text-zinc-600">
              {new Date(order.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-zinc-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-black">Estado</span>
            </div>
            <p className="text-sm text-zinc-600 capitalize">{order.status}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-zinc-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-black">Método de pago</span>
            </div>
            <p className="text-sm text-zinc-600">Tarjeta de crédito</p>
          </div>
        </div>

        {/* TABLA DE ITEMS */}
        <div className="rounded-xl border border-black/10 overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black">Producto</th>
                <th className="px-6 py-4 text-center text-sm font-black">Cantidad</th>
                <th className="px-6 py-4 text-right text-sm font-black">Precio unitario</th>
                <th className="px-6 py-4 text-right text-sm font-black">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items && Array.isArray(order.order_items) && order.order_items.map((item: any) => (
                <tr key={item.id} className="border-t border-black/10">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.listing_image || "/placeholder.png"}
                          alt={item.listing_title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-black">{item.listing_title}</p>
                        <p className="text-sm text-zinc-600">SKU: {item.listing_id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">{item.quantity}</td>
                  <td className="px-6 py-4 text-right">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-black">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RESUMEN */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-black">${order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">IVA (12%)</span>
              <span className="font-black">${(order.total_amount * 0.12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Envío</span>
              <span className="font-black">Gratis</span>
            </div>
            <div className="border-t border-black/10 pt-3 flex justify-between">
              <span className="font-black">Total</span>
              <span className="text-xl font-black">${(order.total_amount * 1.12).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        <div className="rounded-xl border border-black/10 bg-zinc-50 p-6 mb-8">
          <h3 className="font-black mb-2">Notas</h3>
          <p className="text-sm text-zinc-600">
            Esta factura es válida como comprobante de compra. Para cualquier consulta, contacta a nuestro servicio de atención al cliente.
          </p>
        </div>

        {/* FOOTER */}
        <div className="text-center text-sm text-zinc-600">
          <p>ION MAX Marketplace - Todos los derechos reservados</p>
          <p className="mt-1">Esta factura fue generada automáticamente el {new Date().toLocaleDateString("es-ES")}</p>
        </div>
      </div>
    </div>
  );
}
