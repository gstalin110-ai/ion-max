"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/src/contexts/auth-context";
import { getWalletSummary } from "@/src/services/account";
import { supabase } from "@/src/lib/supabase/client";
import toast from "react-hot-toast";
import { QrCode, Link as LinkIcon, CreditCard, Wallet } from "lucide-react";

export function WalletPage() {
  const { user } = useAuth();
  const { data: wallet = null, isLoading } = useQuery({
    queryKey: ["walletSummary"],
    queryFn: getWalletSummary,
  });

  const [paymentMethod, setPaymentMethod] = useState<"qr" | "link">("qr");
  const [paymentData, setPaymentData] = useState({
    qr_code: "",
    payment_link: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const cards = [
    {
      label: "Saldo disponible",
      value: wallet?.availableBalance,
      accent: "text-emerald-400",
    },
    {
      label: "Saldo retenido",
      value: wallet?.heldBalance,
      accent: "text-amber-400",
    },
    {
      label: "Saldo pendiente",
      value: wallet?.pendingBalance,
      accent: "text-sky-400",
    },
  ];

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          payment_method: paymentMethod,
          payment_data: paymentData,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Método de pago actualizado exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar método de pago");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Billetera</p>
        <h1 className="mt-3 text-4xl font-black">Tu dinero, organizado y protegido</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">Administra saldos, comisiones, retiros y movimientos desde un centro financiero profesional.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className={`mt-4 text-4xl font-black ${item.accent}`}>
              {isLoading
                ? "Cargando..."
                : item.value !== undefined
                ? `$${item.value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Finanzas</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Ingresos</p>
              <p className="mt-3 text-2xl font-black text-white">
                {isLoading ? "—" : wallet ? `$${wallet.income.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Comisiones</p>
              <p className="mt-3 text-2xl font-black text-white">
                {isLoading ? "—" : wallet ? `$${wallet.commissions.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-400">Datos extraídos directamente desde la tabla de wallet en Supabase. Si el registro no existe, el sistema mostrará valores vacíos.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-zinc-950 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Sugerencias</p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-400">
            <li>• Verifica comisiones y pagos pendientes.</li>
            <li>• Asegura tus métodos de retiro en Supabase.</li>
            <li>• Revisa transacciones recientes periódicamente.</li>
            <li>• Usa extracción de datos para conciliaciones financieras.</li>
          </ul>
        </div>
      </div>

      {/* Configuración de Método de Pago */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-yellow-400/10 p-2">
            <Wallet className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Método de Pago</p>
            <h2 className="text-xl font-black">Configura tu forma de cobro</h2>
          </div>
        </div>

        <form onSubmit={handleSavePaymentMethod} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("qr")}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === "qr"
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-black">Código QR</p>
                  <p className="text-xs text-zinc-500">PayPhone, Kushki u otros</p>
                </div>
                {paymentMethod === "qr" && <div className="h-4 w-4 rounded-full bg-yellow-400" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("link")}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === "link"
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-black">Link de Pago</p>
                  <p className="text-xs text-zinc-500">PayPal, Stripe u otros</p>
                </div>
                {paymentMethod === "link" && <div className="h-4 w-4 rounded-full bg-yellow-400" />}
              </div>
            </button>
          </div>

          {paymentMethod === "qr" && (
            <div className="space-y-4">
              <label className="text-sm text-zinc-400">
                URL del Código QR
                <input
                  type="url"
                  value={paymentData.qr_code}
                  onChange={(e) => setPaymentData({ ...paymentData, qr_code: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                  placeholder="https://payphone.app/qr/..."
                />
              </label>
              <label className="text-sm text-zinc-400">
                Teléfono asociado
                <input
                  type="tel"
                  value={paymentData.phone}
                  onChange={(e) => setPaymentData({ ...paymentData, phone: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                  placeholder="+593 99 123 4567"
                />
              </label>
            </div>
          )}

          {paymentMethod === "link" && (
            <div className="space-y-4">
              <label className="text-sm text-zinc-400">
                Link de Pago
                <input
                  type="url"
                  value={paymentData.payment_link}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_link: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                  placeholder="https://paypal.me/..."
                />
              </label>
              <label className="text-sm text-zinc-400">
                Teléfono asociado
                <input
                  type="tel"
                  value={paymentData.phone}
                  onChange={(e) => setPaymentData({ ...paymentData, phone: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white"
                  placeholder="+593 99 123 4567"
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar Método de Pago"}
          </button>

          <p className="text-xs text-zinc-500">
            Tu método de pago se usará para recibir pagos de tus ventas en el marketplace. Configura tu QR o link de PayPhone/Kushki para Ecuador.
          </p>
        </form>
      </div>
    </div>
  );
}
