-- ============================================
-- FIX FINAL IÓN MAX - COMPLETO
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Este script corrige todos los problemas para el lanzamiento

-- ============================================
-- PASO 1: Recrear tabla community_posts con columnas correctas
-- ============================================
DROP TABLE IF EXISTS community_posts CASCADE;

CREATE TABLE community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    images TEXT[] DEFAULT '{}',
    type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'product', 'promotion')),
    product_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 2: Crear índices para community_posts
-- ============================================
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_type ON community_posts(type);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);

-- ============================================
-- PASO 3: Configurar RLS para community_posts
-- ============================================
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden ver posts" ON community_posts;
DROP POLICY IF EXISTS "Usuarios pueden crear posts" ON community_posts;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios posts" ON community_posts;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios posts" ON community_posts;

CREATE POLICY "Todos pueden ver posts"
ON community_posts FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Usuarios pueden crear posts"
ON community_posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus propios posts"
ON community_posts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden eliminar sus propios posts"
ON community_posts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- PASO 4: Crear tabla notifications
-- ============================================
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'new_post')),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 5: Crear índices para notifications
-- ============================================
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- PASO 6: Configurar RLS para notifications
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver sus notificaciones" ON notifications;
DROP POLICY IF EXISTS "Usuarios pueden crear notificaciones" ON notifications;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus notificaciones" ON notifications;

CREATE POLICY "Usuarios pueden ver sus notificaciones"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden crear notificaciones"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PASO 7: Agregar columnas role e is_admin a profiles
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- ============================================
-- PASO 8: Configurar RLS para profiles (actualizar)
-- ============================================
DROP POLICY IF EXISTS "Usuarios pueden ver profiles" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su profile" ON profiles;

CREATE POLICY "Usuarios pueden ver profiles"
ON profiles FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Usuarios pueden actualizar su profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- PASO 9: Activar Realtime para community_posts y notifications
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- PASO 10: Verificar configuración
-- ============================================
SELECT 
    'community_posts' AS tabla,
    COUNT(*) AS columnas
FROM information_schema.columns
WHERE table_name = 'community_posts' AND table_schema = 'public'
UNION ALL
SELECT 
    'notifications' AS tabla,
    COUNT(*) AS columnas
FROM information_schema.columns
WHERE table_name = 'notifications' AND table_schema = 'public'
UNION ALL
SELECT 
    'profiles' AS tabla,
    COUNT(*) AS columnas
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public';

SELECT '✅ FIX FINAL IÓN MAX COMPLETADO' AS resultado;
