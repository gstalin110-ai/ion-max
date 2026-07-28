"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { processRefund } from "@/lib/supabase-helpers";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: number;
  onRefundProcessed?: () => void;
}

export function RefundModal({ isOpen, onClose, orderId, orderTotal, onRefundProcessed }: RefundModalProps) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [description, setDescription] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"reason" | "confirm" | "success">("reason");

  const refundReasons = [
    { id: "product_defect", label: "Producto defectuoso", description: "El producto llegó dañado o con defectos" },
    { id: "not_as_described", label: "No coincide con descripción", description: "El producto es diferente a lo anunciado" },
    { id: "wrong_item", label: "Producto equivocado", description: "Recibí un producto diferente al pedido" },
    { id: "changed_mind", label: "Cambié de opinión", description: "Ya no quiero el producto" },
    { id: "other", label: "Otro motivo", description: "Especifica el motivo a continuación" },
  ];

  const handleReasonSelect = (reasonId: string) => {
    setReason(reasonId);
    if (reasonId !== "other") {
      setStep("confirm");
    }
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const finalReason = reason === "other" ? customReason : refundReasons.find(r => r.id === reason)?.label;
      await processRefund(orderId, `${finalReason}: ${description}`);
      setStep("success");
      setTimeout(() => {
        onClose();
        onRefundProcessed?.();
      }, 2000);
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Hubo un error al procesar el reembolso");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Solicitar Reembolso</h2>
                <button
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* STEP 1: SELECCIÓN DE MOTIVO */}
              {step === "reason" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="font-black text-sm">Importante</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          El reembolso se procesará a tu método de pago original en 3-5 días hábiles.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400">Selecciona el motivo del reembolso:</p>

                  <div className="space-y-3">
                    {refundReasons.map((refundReason) => (
                      <button
                        key={refundReason.id}
                        onClick={() => handleReasonSelect(refundReason.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          reason === refundReason.id
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <p className="font-black">{refundReason.label}</p>
                        <p className="text-xs text-zinc-500 mt-1">{refundReason.description}</p>
                      </button>
                    ))}
                  </div>

                  {reason === "other" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-4"
                    >
                      <input
                        type="text"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Especifica el motivo..."
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
                      />
                      <button
                        onClick={() => setStep("confirm")}
                        disabled={!customReason.trim()}
                        className="w-full rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition disabled:opacity-50"
                      >
                        Continuar
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 2: CONFIRMACIÓN */}
              {step === "confirm" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-zinc-400">Monto a reembolsar</span>
                      <span className="text-2xl font-black">${orderTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Método de reembolso</span>
                      <span className="font-black">Tarjeta original</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black mb-2">Describe el problema (opcional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400 resize-none"
                      placeholder="Proporciona más detalles sobre tu solicitud de reembolso..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("reason")}
                      className="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white hover:bg-white/10 transition"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={processing}
                      className="flex-1 rounded-full bg-red-500 px-6 py-3 text-sm font-black text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Confirmar reembolso
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ÉXITO */}
              {step === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">¡Solicitud enviada!</h3>
                  <p className="text-zinc-400 mb-6">
                    Tu solicitud de reembolso ha sido procesada exitosamente. Recibirás el reembolso en 3-5 días hábiles.
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition"
                  >
                    Cerrar
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
