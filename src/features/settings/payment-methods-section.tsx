"use client";

import { useState, useEffect } from "react";
import { addSellerPaymentMethod, getSellerPaymentMethods, deleteSellerPaymentMethod, updateSellerPaymentMethod } from "@/lib/supabase-helpers";
import { SellerPaymentMethod, PaymentMethodType } from "@/lib/types";
import toast from "react-hot-toast";
import { CreditCard, QrCode, Plus, Trash2, Edit2, Copy, ExternalLink } from "lucide-react";

export function PaymentMethodsSection() {
  const [paymentMethods, setPaymentMethods] = useState<SellerPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'payment_link' as PaymentMethodType,
    provider: '',
    label: '',
    value: '',
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getSellerPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      toast.error("Error al cargar métodos de pago");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.provider || !formData.label || !formData.value) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await addSellerPaymentMethod(formData);
      toast.success("Método de pago agregado exitosamente");
      setFormData({ type: 'payment_link', provider: '', label: '', value: '' });
      setShowAddForm(false);
      loadPaymentMethods();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar método de pago");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este método de pago?")) return;
    
    try {
      await deleteSellerPaymentMethod(id);
      toast.success("Método de pago eliminado");
      loadPaymentMethods();
    } catch (error) {
      toast.error("Error al eliminar método de pago");
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copiado al portapapeles");
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB");
      return;
    }

    setQrFile(file);

    // Crear preview y convertir a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setQrPreview(base64);
      setFormData({ ...formData, value: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = () => {
    setQrFile(null);
    setQrPreview(null);
    setFormData({ ...formData, value: '' });
  };

  const linksCount = paymentMethods.filter(m => m.type === 'payment_link').length;
  const qrCount = paymentMethods.filter(m => m.type === 'qr_code').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Métodos de Pago</h3>
          <p className="text-sm text-zinc-400">Agrega tus enlaces y códigos QR para recibir pagos</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300"
        >
          <Plus className="h-4 w-4" />
          Agregar Método
        </button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-black text-white">{linksCount}/5</p>
              <p className="text-xs text-zinc-400">Enlaces de Pago</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="flex items-center gap-3">
            <QrCode className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-black text-white">{qrCount}/5</p>
              <p className="text-xs text-zinc-400">Códigos QR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Agregar */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Tipo de Método</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethodType })}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
            >
              <option value="payment_link">Enlace de Pago</option>
              <option value="qr_code">Código QR</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Proveedor</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
            >
              <option value="">Selecciona un proveedor</option>
              <option value="DEUNA">DEUNA</option>
              <option value="Kushki">Kushki</option>
              <option value="Yape">Yape</option>
              <option value="Plin">Plin</option>
              <option value="Banco Pichincha">Banco Pichincha</option>
              <option value="Banco Guayaquil">Banco Guayaquil</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Etiqueta</label>
            <input
              type="text"
              placeholder="Ej: Mi DEUNA Personal"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              {formData.type === 'payment_link' ? 'URL del Enlace' : 'Código QR'}
            </label>
            {formData.type === 'payment_link' ? (
              <input
                type="text"
                placeholder="https://..."
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileChange}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:text-black file:font-black file:cursor-pointer"
                />
                {qrPreview && (
                  <div className="relative inline-block">
                    <img 
                      src={qrPreview} 
                      alt="QR Preview" 
                      className="h-32 w-32 rounded-lg object-cover border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveQr}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-zinc-500">
                  Sube una imagen de tu código QR (máx 5MB). La imagen se convertirá automáticamente a base64.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Guardar Método de Pago
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Métodos de Pago */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-12 text-center">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-sm text-zinc-400">No tienes métodos de pago agregados</p>
          <p className="mt-2 text-xs text-zinc-500">Agrega tus enlaces o códigos QR para empezar a recibir pagos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 transition hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-yellow-400/10 p-2">
                    {method.type === 'payment_link' ? (
                      <CreditCard className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <QrCode className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{method.label}</p>
                    <p className="text-xs text-zinc-400">{method.provider}</p>
                    <p className="mt-1 text-xs text-zinc-500 truncate max-w-xs">
                      {method.type === 'payment_link' ? method.value : 'Código QR'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(method.value)}
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    title="Copiar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {method.type === 'payment_link' && (
                    <a
                      href={method.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      title="Abrir enlace"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
