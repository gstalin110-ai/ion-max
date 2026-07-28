/**
 * GENERADOR DE PDF DE FACTURA - IÓN MAX
 * Diseño exclusivo de IÓN MAX para facturas electrónicas
 * Formato compatible con SRI Ecuador
 */

import { Invoice } from "@/lib/types";

/**
 * Generar HTML de factura con diseño IÓN MAX
 */
export function generateInvoiceHTML(invoice: Invoice, orderDetails?: any): string {
  const date = new Date(invoice.invoice_date).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoice.invoice_number} - IÓN MAX</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      padding: 40px;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    
    .header {
      background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
      padding: 40px;
      position: relative;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.3;
    }
    
    .logo {
      font-size: 48px;
      font-weight: 900;
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      letter-spacing: -2px;
    }
    
    .subtitle {
      font-size: 14px;
      font-weight: 600;
      color: #000000;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .invoice-number {
      position: absolute;
      top: 40px;
      right: 40px;
      text-align: right;
    }
    
    .invoice-number .label {
      font-size: 12px;
      font-weight: 500;
      color: #000000;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .invoice-number .value {
      font-size: 28px;
      font-weight: 800;
      color: #000000;
      margin-top: 4px;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #facc15;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 16px;
    }
    
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .party {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
    }
    
    .party-label {
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    
    .party-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    
    .party-detail {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    
    .party-detail:last-child {
      margin-bottom: 0;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    
    .items-table th {
      font-size: 11px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: left;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .items-table th:last-child {
      text-align: right;
    }
    
    .items-table td {
      font-size: 14px;
      color: #ffffff;
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .items-table td:last-child {
      text-align: right;
      font-weight: 600;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .totals {
      margin-top: 24px;
      background: rgba(250, 204, 21, 0.05);
      border: 1px solid rgba(250, 204, 21, 0.2);
      border-radius: 16px;
      padding: 24px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .total-row:last-child {
      margin-bottom: 0;
      padding-top: 12px;
      border-top: 1px solid rgba(250, 204, 21, 0.2);
    }
    
    .total-label {
      font-size: 13px;
      color: #9ca3af;
    }
    
    .total-label.grand {
      font-size: 14px;
      font-weight: 700;
      color: #facc15;
    }
    
    .total-value {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
    
    .total-value.grand {
      font-size: 24px;
      font-weight: 800;
      color: #facc15;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }
    
    .footer-text {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .footer-brand {
      font-size: 14px;
      font-weight: 700;
      color: #facc15;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 8px;
    }
    
    .status-pending {
      background: rgba(250, 204, 21, 0.2);
      color: #facc15;
    }
    
    .status-generated {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    
    .status-sent {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="logo">IÓN MAX</div>
        <div class="subtitle">MARKET SOCIAL</div>
      </div>
      <div class="invoice-number">
        <div class="label">Factura No.</div>
        <div class="value">${invoice.invoice_number}</div>
        <div class="status-badge status-${invoice.status}">${invoice.status}</div>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Información de la Factura</div>
        <div class="parties">
          <div class="party">
            <div class="party-label">Vendedor</div>
            <div class="party-name">${invoice.seller_razon_social || 'No especificado'}</div>
            <div class="party-detail">RUC: ${invoice.seller_ruc || 'No especificado'}</div>
            <div class="party-detail">${invoice.seller_address || 'No especificado'}</div>
            <div class="party-detail">${invoice.seller_phone || ''}</div>
            <div class="party-detail">${invoice.seller_email || ''}</div>
          </div>
          <div class="party">
            <div class="party-label">Comprador</div>
            <div class="party-name">${invoice.buyer_razon_social || 'No especificado'}</div>
            <div class="party-detail">RUC: ${invoice.buyer_ruc || 'No especificado'}</div>
            <div class="party-detail">${invoice.buyer_address || 'No especificado'}</div>
            <div class="party-detail">${invoice.buyer_phone || ''}</div>
            <div class="party-detail">${invoice.buyer_email || ''}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Fecha de Emisión</div>
        <div style="font-size: 16px; font-weight: 600; color: #ffffff;">
          ${date}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Desglose de Pagos</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Detalle</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>Monto antes de impuestos</td>
              <td>$${invoice.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>IVA (12%)</td>
              <td>Impuesto al Valor Agregado</td>
              <td>$${invoice.tax_amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <div class="total-label">Subtotal</div>
            <div class="total-value">$${invoice.subtotal.toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">IVA (12%)</div>
            <div class="total-value">$${invoice.tax_amount.toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label grand">TOTAL</div>
            <div class="total-value grand">$${invoice.total_amount.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-text">Factura electrónica generada por IÓN MAX MARKET SOCIAL</div>
        <div class="footer-text">Esta factura es válida para fines fiscales en Ecuador</div>
        <div class="footer-brand">IÓN MAX © ${new Date().getFullYear()}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generar PDF desde HTML usando browser print
 * Esta función abre el HTML en una nueva ventana para imprimir como PDF
 */
export function printInvoiceAsPDF(invoice: Invoice, orderDetails?: any): void {
  const html = generateInvoiceHTML(invoice, orderDetails);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Descargar factura como HTML (para guardar localmente)
 */
export function downloadInvoiceAsHTML(invoice: Invoice, orderDetails?: any): void {
  const html = generateInvoiceHTML(invoice, orderDetails);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Factura-${invoice.invoice_number}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
