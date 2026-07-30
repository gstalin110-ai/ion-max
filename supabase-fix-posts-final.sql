-- ============================================
-- FIX TABLA POSTS - COLUMNAS CORRECTAS
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Este script recrea la tabla community_posts con las columnas exactas
-- que el frontend necesita para evitar error 400

-- ============================================
-- PASO 1: Eliminar tabla existente si existe
-- ============================================
DROP TABLE IF EXISTS community_posts CASCADE;

-- ============================================
-- PASO 2: Crear tabla community_posts con columnas correctas
-- ============================================
CREATE TABLE community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'product', 'promotion')),
    product_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 3: Crear índices para mejor rendimiento
-- ============================================
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_type ON community_posts(type);
CREATE INDEX idx_community_posts_product_id ON community_posts(product_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);

-- ============================================
-- PASO 4: Configurar RLS (Row Level Security)
-- ============================================
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver posts
CREATE POLICY "Todos pueden ver posts"
ON community_posts FOR SELECT
TO authenticated, anon
USING (true);

-- Política: Usuarios pueden crear posts
CREATE POLICY "Usuarios pueden crear posts"
ON community_posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Política: Usuarios pueden actualizar sus propios posts
CREATE POLICY "Usuarios pueden actualizar sus propios posts"
ON community_posts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política: Usuarios pueden eliminar sus propios posts
CREATE POLICY "Usuarios pueden eliminar sus propios posts"
ON community_posts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- PASO 5: Verificar tabla creada correctamente
-- ============================================
SELECT 
    'Tabla community_posts creada' AS status,
    COUNT(*) AS total_columnas
FROM information_schema.columns
WHERE table_name = 'community_posts' AND table_schema = 'public';

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'community_posts' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '✅ FIX TABLA POSTS COMPLETADO' AS resultado;
