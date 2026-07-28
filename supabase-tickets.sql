-- ============================================
-- SISTEMA DE TICKETS Y QUEJAS
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla para tickets/quejas
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticket_number TEXT UNIQUE NOT NULL, -- Formato: TKT-YYYYMMDD-XXXXX
    type TEXT NOT NULL CHECK (type IN ('complaint', 'issue', 'suggestion', 'other')),
    category TEXT NOT NULL, -- product_issue, payment_issue, user_issue, platform_bug, etc.
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    related_entity_type TEXT, -- 'listing', 'order', 'user', etc.
    related_entity_id TEXT, -- ID de la entidad relacionada
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Para el dueño
    owner_notes TEXT,
    owner_assigned_to UUID REFERENCES auth.users(id), -- Si el dueño asigna a alguien
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. Crear tabla para mensajes de tickets
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_owner BOOLEAN DEFAULT false, -- Si el mensaje es del dueño
    message TEXT NOT NULL,
    attachments TEXT[], -- URLs de archivos adjuntos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_type ON public.support_tickets(type);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

-- 4. Habilitar RLS para tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para tickets
DROP POLICY IF EXISTS "Usuarios pueden ver sus tickets" ON public.support_tickets;
CREATE POLICY "Usuarios pueden ver sus tickets" 
    ON public.support_tickets FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden crear tickets" ON public.support_tickets;
CREATE POLICY "Usuarios pueden crear tickets" 
    ON public.support_tickets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus tickets" ON public.support_tickets;
CREATE POLICY "Usuarios pueden actualizar sus tickets" 
    ON public.support_tickets FOR UPDATE 
    USING (auth.uid() = user_id);

-- 6. Políticas RLS para mensajes de tickets
DROP POLICY IF EXISTS "Usuarios pueden ver mensajes de sus tickets" ON public.ticket_messages;
CREATE POLICY "Usuarios pueden ver mensajes de sus tickets" 
    ON public.ticket_messages FOR SELECT 
    USING (
        ticket_id IN (
            SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuarios pueden crear mensajes en sus tickets" ON public.ticket_messages;
CREATE POLICY "Usuarios pueden crear mensajes en sus tickets" 
    ON public.ticket_messages FOR INSERT 
    WITH CHECK (
        ticket_id IN (
            SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
        )
    );

-- 7. Trigger para updated_at
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Sistema de tickets y quejas creado exitosamente.' AS status;
