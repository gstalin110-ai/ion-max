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
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'new_post', 'friend_request')),
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
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ion_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "posts_visibility": "public"}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- PASO 8: Crear tabla follows (para seguir usuarios)
-- ============================================
DROP TABLE IF EXISTS follows CASCADE;

CREATE TABLE follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- ============================================
-- PASO 9: Crear índices para follows
-- ============================================
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- ============================================
-- PASO 10: Configurar RLS para follows
-- ============================================
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver follows" ON follows;
DROP POLICY IF EXISTS "Usuarios pueden crear follows" ON follows;
DROP POLICY IF EXISTS "Usuarios pueden eliminar follows" ON follows;

CREATE POLICY "Usuarios pueden ver follows"
ON follows FOR SELECT
TO authenticated
USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Usuarios pueden crear follows"
ON follows FOR INSERT
TO authenticated
WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Usuarios pueden eliminar follows"
ON follows FOR DELETE
TO authenticated
USING (follower_id = auth.uid());

-- ============================================
-- PASO 11: Configurar RLS para profiles (actualizar)
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
-- PASO 12: Activar Realtime para community_posts y notifications
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- PASO 13: Generar IDs únicos ION para usuarios existentes
-- ============================================
UPDATE profiles 
SET ion_id = 'ION-' || LPAD(encode(gen_random_bytes(3), 'hex'), 6, '0')
WHERE ion_id IS NULL;

-- ============================================
-- PASO 14: Verificar configuración
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
WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 
    'follows' AS tabla,
    COUNT(*) AS columnas
FROM information_schema.columns
WHERE table_name = 'follows' AND table_schema = 'public';

SELECT '✅ FIX FINAL IÓN MAX COMPLETADO' AS resultado;
