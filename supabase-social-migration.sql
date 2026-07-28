-- ============================================
-- MIGRACIÓN DE FUNCIONALIDAD SOCIAL
-- ============================================
-- Este script crea las tablas necesarias para la red social profesional

-- 1. Tabla community_posts (publicaciones de la comunidad)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla direct_messages (mensajes directos entre usuarios)
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS en las nuevas tablas
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para community_posts
-- Los usuarios pueden leer todas las publicaciones
CREATE POLICY "community_posts_select" ON public.community_posts
    FOR SELECT USING (true);

-- Los usuarios pueden crear sus propias publicaciones
CREATE POLICY "community_posts_insert" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias publicaciones
CREATE POLICY "community_posts_update" ON public.community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias publicaciones
CREATE POLICY "community_posts_delete" ON public.community_posts
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Políticas para direct_messages
-- Los usuarios pueden leer mensajes donde son sender o receiver
CREATE POLICY "direct_messages_select" ON public.direct_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Los usuarios pueden enviar mensajes
CREATE POLICY "direct_messages_insert" ON public.direct_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Los usuarios pueden actualizar sus propios mensajes (marcar como leído)
CREATE POLICY "direct_messages_update" ON public.direct_messages
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Los usuarios pueden eliminar sus propios mensajes
CREATE POLICY "direct_messages_delete" ON public.direct_messages
    FOR DELETE USING (auth.uid() = sender_id);

-- 6. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_id ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at);

-- 7. Verificar que la tabla profiles tiene las columnas necesarias
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS profession TEXT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estos comandos para verificar que todo esté correcto:

-- Verificar tablas creadas:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('community_posts', 'direct_messages');

-- Verificar políticas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename IN ('community_posts', 'direct_messages');
