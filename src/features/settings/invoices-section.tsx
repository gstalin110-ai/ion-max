"use client";

import { useState, useEffect } from "react";
import { getInvoicesBySeller, getInvoicesByBuyer } from "@/lib/supabase-helpers";
import { Invoice } from "@/lib/types";
import { useAuth } from "@/src/contexts/auth-context";
import { printInvoiceAsPDF, downloadInvoiceAsHTML } from "@/src/services/invoice-pdf-generator";
import toast from "react-hot-toast";
import { FileText, Download, Printer, Calendar, DollarSign, CheckCircle, Clock, TrendingUp, BarChart3, PieChart } from "lucide-react";

export function InvoicesSection() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"seller" | "buyer">("seller");
  const [showStats, setShowStats] = useState(true);

  // Calcular estadísticas
  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.status === 'pending').length,
    generated: invoices.filter(inv => inv.status === 'generated').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    average: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length : 0,
  };

  // Datos para gráficos
  const statusData = [
    { label: 'Pendiente', value: stats.pending, color: 'bg-yellow-400' },
    { label: 'Generada', value: stats.generated, color: 'bg-green-400' },
    { label: 'Enviada', value: stats.sent, color: 'bg-blue-400' },
  ].filter(d => d.value > 0);

  const totalInvoices = statusData.reduce((sum, d) => sum + d.value, 0);

  useEffect(() => {
    loadInvoices();
  }, [viewMode]);

  const loadInvoices = async () => {
    try {
      if (viewMode === "seller") {
        const data = await getInvoicesBySeller(user?.id || "");
        setInvoices(data);
      } else {
        const data = await getInvoicesByBuyer(user?.id || "");
        setInvoices(data);
      }
    } catch (error) {
      toast.error("Error al cargar facturas");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (invoice: Invoice) => {
    printInvoiceAsPDF(invoice);
  };

  const handleDownload = (invoice: Invoice) => {
    downloadInvoiceAsHTML(invoice);
    toast.success("Factura descargada");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        );
      case "generated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-3 py-1 text-xs font-bold text-green-400">
            <CheckCircle className="h-3 w-3" />
            Generada
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-400">
            <CheckCircle className="h-3 w-3" />
            Enviada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-400/10 px-3 py-1 text-xs font-bold text-zinc-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Facturas Electrónicas</h3>
          <p className="text-sm text-zinc-400">Gestiona tus facturas con diseño exclusivo IÓN MAX</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              showStats
                ? "bg-yellow-400 text-black"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            Estadísticas
          </button>
          <button
            onClick={() => setViewMode("seller")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              viewMode === "seller"
                ? "bg-yellow-400 text-black"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Como Vendedor
          </button>
          <button
            onClick={() => setViewMode("buyer")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              viewMode === "buyer"
                ? "bg-yellow-400 text-black"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Como Comprador
          </button>
        </div>
      </div>

      {/* Panel de Estadísticas */}
      {showStats && invoices.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/50 p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-black text-white">${stats.total.toFixed(2)}</p>
                <p className="text-xs text-zinc-400">Total Facturado</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/50 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-black text-white">${stats.average.toFixed(2)}</p>
                <p className="text-xs text-zinc-400">Promedio</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/50 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-black text-white">{invoices.length}</p>
                <p className="text-xs text-zinc-400">Total Facturas</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-black text-white">{stats.generated + stats.sent}</p>
                <p className="text-xs text-zinc-400">Completadas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Distribución por Estado */}
      {showStats && statusData.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Distribución por Estado
          </h4>
          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-3">
              {statusData.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${(item.value / totalInvoices) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">{totalInvoices}</div>
              <p className="text-xs text-zinc-400">Total</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-sm text-zinc-400">No tienes facturas {viewMode === "seller" ? "como vendedor" : "como comprador"}</p>
          <p className="mt-2 text-xs text-zinc-500">
            {viewMode === "seller" 
              ? "Las facturas se generarán automáticamente cuando realices ventas"
              : "Las facturas se generarán automáticamente cuando realices compras"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 transition hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-yellow-400/10 p-2">
                    <FileText className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-white">{invoice.invoice_number}</p>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(invoice.invoice_date).toLocaleString('es-EC')}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${invoice.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(invoice)}
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    title="Imprimir como PDF"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(invoice)}
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    title="Descargar HTML"
                  >
                    <Download className="h-4 w-4" />
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
