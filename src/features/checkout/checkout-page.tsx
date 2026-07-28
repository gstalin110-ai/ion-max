"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSellerPaymentMethodsBySellerId } from "@/lib/supabase-helpers";
import { SellerPaymentMethod } from "@/lib/types";
import { useAuth } from "@/src/contexts/auth-context";
import { useCart } from "@/lib/cart-context";
import toast from "react-hot-toast";
import { CreditCard, QrCode, ArrowLeft, CheckCircle, ExternalLink, Copy } from "lucide-react";

interface CheckoutPageProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  title: string;
}

export function CheckoutPage({ listingId, sellerId, sellerName, price, title }: CheckoutPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [paymentMethods, setPaymentMethods] = useState<SellerPaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<SellerPaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Datos de facturación del comprador
  const [buyerRuc, setBuyerRuc] = useState("");
  const [buyerRazonSocial, setBuyerRazonSocial] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");

  useEffect(() => {
    loadPaymentMethods();
  }, [sellerId]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getSellerPaymentMethodsBySellerId(sellerId);
      setPaymentMethods(methods);
    } catch (error) {
      toast.error("Error al cargar métodos de pago");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copiado al portapapeles");
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      toast.error("Selecciona un método de pago");
      return;
    }

    if (!buyerRazonSocial || !buyerPhone) {
      toast.error("Completa los datos de facturación");
      return;
    }

    setIsProcessing(true);

    try {
      // Aquí iría la lógica para crear la orden y la factura
      // Por ahora, simulamos el proceso
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("¡Pago procesado exitosamente!");
      clearCart();
      router.push("/orders");
    } catch (error) {
      toast.error("Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-400">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">Finalizar Compra</h1>
            <p className="text-sm text-zinc-400">Completa tu pago de forma segura</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Resumen del Producto */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Resumen del Producto</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Producto</p>
                <p className="font-medium text-white">{title}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Vendedor</p>
                <p className="font-medium text-white">{sellerName}</p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <p className="text-sm text-zinc-400">Subtotal</p>
                  <p className="font-medium text-white">${price.toFixed(2)}</p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-zinc-400">IVA (12%)</p>
                  <p className="font-medium text-white">${(price * 0.12).toFixed(2)}</p>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                  <p className="font-bold text-white">Total</p>
                  <p className="font-bold text-yellow-400 text-lg">${(price * 1.12).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Facturación */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Datos de Facturación</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">RUC (Opcional)</label>
                <input
                  type="text"
                  placeholder="9999999999999"
                  value={buyerRuc}
                  onChange={(e) => setBuyerRuc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Razón Social / Nombre *</label>
                <input
                  type="text"
                  placeholder="Tu nombre o razón social"
                  value={buyerRazonSocial}
                  onChange={(e) => setBuyerRazonSocial(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Dirección</label>
                <input
                  type="text"
                  placeholder="Tu dirección"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Teléfono *</label>
                <input
                  type="tel"
                  placeholder="+593 99 123 4567"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de Pago del Vendedor */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Métodos de Pago del Vendedor</h2>
          
          {paymentMethods.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/50 p-8 text-center">
              <CreditCard className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
              <p className="text-sm text-zinc-400">El vendedor aún no ha configurado métodos de pago</p>
              <p className="mt-2 text-xs text-zinc-500">Contáctalo para coordinar el pago</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    selectedMethod?.id === method.id
                      ? 'border-yellow-400 bg-yellow-400/5'
                      : 'border-white/10 bg-black/50 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${
                      selectedMethod?.id === method.id ? 'bg-yellow-400' : 'bg-white/10'
                    }`}>
                      {method.type === 'payment_link' ? (
                        <CreditCard className={`h-5 w-5 ${selectedMethod?.id === method.id ? 'text-black' : 'text-zinc-400'}`} />
                      ) : (
                        <QrCode className={`h-5 w-5 ${selectedMethod?.id === method.id ? 'text-black' : 'text-zinc-400'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{method.label}</p>
                        {selectedMethod?.id === method.id && (
                          <CheckCircle className="h-5 w-5 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{method.provider}</p>
                      {selectedMethod?.id === method.id && (
                        <div className="mt-3 space-y-2">
                          {method.type === 'payment_link' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={method.value}
                                readOnly
                                className="flex-1 rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-zinc-400"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCopy(method.value); }}
                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <a
                                href={method.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          ) : (
                            <div className="rounded-lg bg-white p-2">
                              <img
                                src={method.value}
                                alt="Código QR"
                                className="h-32 w-32 object-contain mx-auto"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Confirmar */}
        <div className="mt-6">
          <button
            onClick={handleProcessPayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 text-sm font-black text-black transition hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Procesando..." : `Pagar $${(price * 1.12).toFixed(2)}`}
          </button>
          <p className="mt-3 text-center text-xs text-zinc-500">
            Al confirmar, aceptas los términos y condiciones de IÓN MAX
          </p>
        </div>
      </div>
    </div>
  );
}
