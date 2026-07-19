"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import {
  CreditCard,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  MapPin,
  Phone,
  User,
  Building2,
} from "lucide-react";
import { Listing } from "@/lib/types";
import {
  createOrder,
  createPayment,
  updatePaymentStatus,
  updateOrderStatus,
} from "@/lib/supabase-helpers";
import {
  type ShippingAddress,
  type PaymentMethod,
  type OrderItem,
} from "@/lib/types";

interface CartItem extends Listing {
  quantity: number;
}

export function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping");

  // Formulario de dirección de envío
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Ecuador",
  });

  // Método de pago seleccionado
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [notes, setNotes] = useState("");

  // Datos de tarjeta (simulados para Stripe)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  useEffect(() => {
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProcessing(true);

    try {
      // Crear orden
      const orderItems = cart.map(item => ({
        listing_id: item.id,
        listing_title: item.title,
        listing_image: item.images?.[0] || "",
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      // Obtener seller_id del primer item (en producción esto sería por item)
      const sellerId = cart[0].user_id;

      const order = await createOrder(
        user.id,
        sellerId,
        orderItems,
        shippingAddress,
        total
      );

      // Crear registro de pago
      const payment = await createPayment(order.id, paymentMethod, total);

      // Simular procesamiento de pago (en producción esto sería con Stripe)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar estado del pago
      await updatePaymentStatus(payment.id, "completed", "simulated_transaction_id");

      // Actualizar estado de la orden
      await updateOrderStatus(order.id, "paid");

      // Limpiar carrito
      localStorage.removeItem("ion-cart");
      setCart([]);

      // Redirigir a confirmación
      router.push(`/checkout/confirmation?order_id=${order.id}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Hubo un error al procesar el pago. Por favor intenta nuevamente.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          <p className="text-zinc-400">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black mb-4">Tu carrito está vacío</h1>
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
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </Link>
          <h1 className="text-4xl font-black">Checkout</h1>
          <p className="mt-2 text-zinc-400">Completa tu compra de forma segura</p>
        </div>

        {/* PROGRESS STEPS */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step === "shipping" ? "text-yellow-400" : "text-zinc-500"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step === "shipping" ? "bg-yellow-400 text-black" : "bg-white/10"
            }`}>
              {step === "shipping" ? "1" : <Check className="h-4 w-4" />}
            </div>
            <span className="font-black text-sm">Envío</span>
          </div>
          <div className="h-0.5 w-16 bg-white/10" />
          <div className={`flex items-center gap-2 ${step === "payment" ? "text-yellow-400" : "text-zinc-500"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step === "payment" ? "bg-yellow-400 text-black" : "bg-white/10"
            }`}>
              {step === "payment" ? "2" : step === "confirmation" ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <span className="font-black text-sm">Pago</span>
          </div>
          <div className="h-0.5 w-16 bg-white/10" />
          <div className={`flex items-center gap-2 ${step === "confirmation" ? "text-yellow-400" : "text-zinc-500"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step === "confirmation" ? "bg-yellow-400 text-black" : "bg-white/10"
            }`}>
              {step === "confirmation" ? "3" : "3"}
            </div>
            <span className="font-black text-sm">Confirmación</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* FORMULARIO PRINCIPAL */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-full bg-yellow-400/10 p-2">
                      <Truck className="h-5 w-5 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-black">Dirección de envío</h2>
                  </div>

                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-black mb-2">Nombre completo</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            type="text"
                            value={shippingAddress.full_name}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                            required
                            className="w-full rounded-xl border border-white/10 bg-black pl-12 pr-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                            placeholder="Juan Pérez"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-black mb-2">Teléfono</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            type="tel"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            required
                            className="w-full rounded-xl border border-white/10 bg-black pl-12 pr-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                            placeholder="+593 99 123 4567"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black mb-2">Dirección principal</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          value={shippingAddress.address_line1}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                          required
                          className="w-full rounded-xl border border-white/10 bg-black pl-12 pr-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                          placeholder="Av. Amazonas N23-45"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black mb-2">Dirección secundaria (opcional)</label>
                      <input
                        type="text"
                        value={shippingAddress.address_line2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                        placeholder="Apartamento 302"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-black mb-2">Ciudad</label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                          placeholder="Quito"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black mb-2">Provincia</label>
                        <input
                          type="text"
                          value={shippingAddress.province}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                          required
                          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                          placeholder="Pichincha"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-black mb-2">Código postal</label>
                        <input
                          type="text"
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                          required
                          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                          placeholder="170150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black mb-2">País</label>
                        <input
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          required
                          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                          placeholder="Ecuador"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-white px-6 py-4 text-sm font-black text-black hover:bg-zinc-200 transition flex items-center justify-center gap-2"
                    >
                      Continuar al pago
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-full bg-yellow-400/10 p-2">
                      <CreditCard className="h-5 w-5 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-black">Método de pago</h2>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    {/* MÉTODOS DE PAGO */}
                    <div className="space-y-3">
                      <label className="block text-sm font-black mb-3">Selecciona un método de pago</label>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("credit_card")}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          paymentMethod === "credit_card"
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div className="flex-1">
                            <p className="font-black">Tarjeta de crédito/débito</p>
                            <p className="text-xs text-zinc-500">Visa, Mastercard, American Express</p>
                          </div>
                          {paymentMethod === "credit_card" && <Check className="h-5 w-5 text-yellow-400" />}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          paymentMethod === "paypal"
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5" />
                          <div className="flex-1">
                            <p className="font-black">PayPal</p>
                            <p className="text-xs text-zinc-500">Pago seguro con PayPal</p>
                          </div>
                          {paymentMethod === "paypal" && <Check className="h-5 w-5 text-yellow-400" />}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank_transfer")}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          paymentMethod === "bank_transfer"
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5" />
                          <div className="flex-1">
                            <p className="font-black">Transferencia bancaria</p>
                            <p className="text-xs text-zinc-500">Pago directo desde tu banco</p>
                          </div>
                          {paymentMethod === "bank_transfer" && <Check className="h-5 w-5 text-yellow-400" />}
                        </div>
                      </button>
                    </div>

                    {/* DATOS DE TARJETA (simulado) */}
                    {paymentMethod === "credit_card" && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <label className="block text-sm font-black mb-3">Datos de la tarjeta</label>
                        
                        <div>
                          <input
                            type="text"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            placeholder="Número de tarjeta"
                            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                              placeholder="MM/YY"
                              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={cardData.cvv}
                              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                              placeholder="CVV"
                              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={cardData.name}
                              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                              placeholder="Nombre en tarjeta"
                              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GUARDAR MÉTODO */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={savePaymentMethod}
                        onChange={(e) => setSavePaymentMethod(e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-black text-yellow-400 focus:ring-yellow-400"
                      />
                      <span className="text-sm text-zinc-400">Guardar método de pago para futuras compras</span>
                    </label>

                    {/* NOTAS */}
                    <div>
                      <label className="block text-sm font-black mb-2">Notas adicionales (opcional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400 resize-none"
                        placeholder="Instrucciones especiales de entrega..."
                      />
                    </div>

                    {/* SEGURIDAD */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="font-black text-sm">Pago 100% seguro</p>
                          <p className="text-xs text-zinc-500">Tu información está protegida con encriptación SSL</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep("shipping")}
                        className="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-white hover:bg-white/10 transition"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 px-6 py-4 text-sm font-black text-black hover:from-yellow-300 hover:to-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            Pagar ${total.toFixed(2)}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </div>

          {/* RESUMEN DEL PEDIDO */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
              <h2 className="text-xl font-black mb-6">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.images?.[0] || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm line-clamp-1">{item.title}</p>
                      <p className="text-xs text-zinc-500">Cantidad: {item.quantity}</p>
                      <p className="font-black text-yellow-400">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4">
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
            </div>

            {/* GARANTÍA */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="font-black text-sm">Compra protegida</p>
                  <p className="text-xs text-zinc-400 mt-1">100% garantía de devolución si no estás satisfecho</p>
                </div>
              </div>
            </div>

            {/* MÉTODOS DE PAGO ACEPTADOS */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
              <h3 className="text-sm font-black mb-4">Métodos de pago aceptados</h3>
              <div className="flex gap-3">
                <div className="h-8 w-12 rounded bg-white/10 flex items-center justify-center text-xs">💳</div>
                <div className="h-8 w-12 rounded bg-white/10 flex items-center justify-center text-xs">🏦</div>
                <div className="h-8 w-12 rounded bg-white/10 flex items-center justify-center text-xs">💰</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
