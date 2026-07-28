/**
 * SERVICIO DE FACTURACIÓN ELECTRÓNICA - IÓN MAX
 * Sistema especializado para generar facturas electrónicas con diseño IÓN MAX
 * Formato compatible con SRI Ecuador
 */

import { supabase } from "@/src/lib/supabase/client";
import { Invoice } from "@/lib/types";

// Configuración de IÓN MAX para facturación
const ION_MAX_CONFIG = {
  ruc: "9999999999999", // RUC del dueño (debe configurarse)
  razonSocial: "IÓN MAX MARKET SOCIAL",
  direccion: "Quito, Ecuador",
  telefono: "+593 99 123 4567",
  email: "contacto@ionmax.ec",
  iva: 0.12, // 12% IVA Ecuador
};

/**
 * Generar número de factura único
 * Formato: ION-YYYYMMDD-XXXXX
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `ION-${year}${month}${day}-${random}`;
}

/**
 * Calcular IVA (12% Ecuador)
 */
export function calculateIVA(subtotal: number): number {
  return subtotal * ION_MAX_CONFIG.iva;
}

/**
 * Calcular total con IVA
 */
export function calculateTotal(subtotal: number): number {
  const iva = calculateIVA(subtotal);
  return subtotal + iva;
}

/**
 * Crear factura en base de datos
 */
export async function createInvoice(invoiceData: {
  order_id: string;
  seller_id: string;
  buyer_id: string;
  subtotal: number;
  seller_ruc?: string;
  seller_razon_social?: string;
  seller_address?: string;
  seller_phone?: string;
  seller_email?: string;
  buyer_ruc?: string;
  buyer_razon_social?: string;
  buyer_address?: string;
  buyer_phone?: string;
  buyer_email?: string;
}): Promise<Invoice> {
  const invoice_number = generateInvoiceNumber();
  const tax_amount = calculateIVA(invoiceData.subtotal);
  const total_amount = calculateTotal(invoiceData.subtotal);

  const { data, error } = await supabase
    .from("invoices")
    .insert([{
      invoice_number,
      order_id: invoiceData.order_id,
      seller_id: invoiceData.seller_id,
      buyer_id: invoiceData.buyer_id,
      subtotal: invoiceData.subtotal,
      tax_amount,
      total_amount,
      currency: 'USD',
      seller_ruc: invoiceData.seller_ruc,
      seller_razon_social: invoiceData.seller_razon_social,
      seller_address: invoiceData.seller_address,
      seller_phone: invoiceData.seller_phone,
      seller_email: invoiceData.seller_email,
      buyer_ruc: invoiceData.buyer_ruc,
      buyer_razon_social: invoiceData.buyer_razon_social,
      buyer_address: invoiceData.buyer_address,
      buyer_phone: invoiceData.buyer_phone,
      buyer_email: invoiceData.buyer_email,
      status: 'pending',
      owner_reference: true, // Copia para el dueño
    }])
    .select()
    .single();

  if (error) throw new Error(`Error al crear factura: ${error.message}`);
  return data;
}

/**
 * Obtener factura por ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (error) throw new Error(`Error al obtener factura: ${error.message}`);
  return data;
}

/**
 * Obtener facturas del vendedor
 */
export async function getInvoicesBySeller(sellerId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al obtener facturas: ${error.message}`);
  return data || [];
}

/**
 * Obtener facturas del comprador
 */
export async function getInvoicesByBuyer(buyerId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al obtener facturas: ${error.message}`);
  return data || [];
}

/**
 * Actualizar URLs de factura (PDF/XML)
 */
export async function updateInvoiceUrls(
  invoiceId: string,
  pdfUrl: string,
  xmlUrl?: string
): Promise<void> {
  const { error } = await supabase
    .from("invoices")
    .update({
      pdf_url: pdfUrl,
      xml_url: xmlUrl,
      status: 'generated',
    })
    .eq("id", invoiceId);

  if (error) throw new Error(`Error al actualizar factura: ${error.message}`);
}

/**
 * Marcar factura como enviada
 */
export async function markInvoiceAsSent(invoiceId: string): Promise<void> {
  const { error } = await supabase
    .from("invoices")
    .update({ status: 'sent' })
    .eq("id", invoiceId);

  if (error) throw new Error(`Error al actualizar factura: ${error.message}`);
}
