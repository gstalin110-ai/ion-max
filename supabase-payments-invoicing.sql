-- ============================================
-- SISTEMA DE PAGOS Y FACTURACIÓN ELECTRÓNICA
-- IÓN MAX - ECUADOR
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla para métodos de pago del vendedor
CREATE TABLE IF NOT EXISTS public.seller_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment_link', 'qr_code')),
    provider TEXT NOT NULL, -- DEUNA, Kushki, Yape, Plin, etc.
    label TEXT NOT NULL, -- "Mi DEUNA", "Yape Personal", etc.
    value TEXT NOT NULL, -- URL del enlace o base64 del QR
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_seller_payment_methods_seller_id ON public.seller_payment_methods(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_payment_methods_active ON public.seller_payment_methods(seller_id, is_active);

-- 3. Habilitar RLS
ALTER TABLE public.seller_payment_methods ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para métodos de pago
DROP POLICY IF EXISTS "Vendedores pueden ver sus métodos de pago" ON public.seller_payment_methods;
CREATE POLICY "Vendedores pueden ver sus métodos de pago" 
    ON public.seller_payment_methods FOR SELECT 
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendedores pueden crear sus métodos de pago" ON public.seller_payment_methods;
CREATE POLICY "Vendedores pueden crear sus métodos de pago" 
    ON public.seller_payment_methods FOR INSERT 
    WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendedores pueden actualizar sus métodos de pago" ON public.seller_payment_methods;
CREATE POLICY "Vendedores pueden actualizar sus métodos de pago" 
    ON public.seller_payment_methods FOR UPDATE 
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendedores pueden eliminar sus métodos de pago" ON public.seller_payment_methods;
CREATE POLICY "Vendedores pueden eliminar sus métodos de pago" 
    ON public.seller_payment_methods FOR DELETE 
    USING (auth.uid() = seller_id);

-- 5. Crear tabla para facturas electrónicas (SIMPLE - Sin IVA)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL, -- ID único de factura
    invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Hora exacta
    amount DECIMAL(10,2) NOT NULL, -- Monto total (sin IVA)
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Datos del vendedor
    seller_name TEXT NOT NULL,
    seller_id_display TEXT NOT NULL, -- ID único de cuenta del vendedor
    seller_email TEXT,
    
    -- Datos del comprador
    buyer_name TEXT NOT NULL,
    buyer_id_display TEXT NOT NULL, -- ID único de cuenta del comprador
    buyer_email TEXT,
    
    -- Datos de la factura
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent', 'cancelled')),
    pdf_url TEXT, -- URL del PDF en Supabase Storage
    
    -- Referencia para el dueño
    owner_reference BOOLEAN DEFAULT true, -- Copia para el dueño
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices para facturas
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_seller_id ON public.invoices(seller_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_id ON public.invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);

-- 7. Habilitar RLS para facturas
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para facturas
DROP POLICY IF EXISTS "Vendedores pueden ver sus facturas" ON public.invoices;
CREATE POLICY "Vendedores pueden ver sus facturas" 
    ON public.invoices FOR SELECT 
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Compradores pueden ver sus facturas" ON public.invoices;
CREATE POLICY "Compradores pueden ver sus facturas" 
    ON public.invoices FOR SELECT 
    USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Sistema puede crear facturas" ON public.invoices;
CREATE POLICY "Sistema puede crear facturas" 
    ON public.invoices FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Sistema puede actualizar facturas" ON public.invoices;
CREATE POLICY "Sistema puede actualizar facturas" 
    ON public.invoices FOR UPDATE 
    USING (true);

-- 9. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_seller_payment_methods_updated_at ON public.seller_payment_methods;
CREATE TRIGGER update_seller_payment_methods_updated_at
    BEFORE UPDATE ON public.seller_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Crear bucket en Supabase Storage para facturas
-- Nota: Esto debe hacerse manualmente desde el dashboard de Supabase Storage
-- Nombre del bucket: "invoices"
-- Política pública: false (privado)

SELECT 'Sistema de pagos y facturación creado exitosamente.' AS status;
