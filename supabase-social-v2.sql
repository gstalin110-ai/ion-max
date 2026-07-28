-- ============================================
-- MIGRACIÓN DE RED SOCIAL V2 Y CONFIGURACIÓN IA (100% AUTÓNOMA Y COMPLETA)
-- IÓN MAX - Ecosistema Profesional
-- ============================================
-- Copia y pega TODO este contenido en el SQL Editor de Supabase y presiona RUN.

-- 1. Asegurar columnas extra en tabla public.profiles
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS gemini_api_key TEXT,
    ADD COLUMN IF NOT EXISTS profession TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Tabla community_posts (Publicaciones de la comunidad)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    images TEXT[],
    media_type TEXT DEFAULT 'text',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla direct_messages (Mensajes directos entre usuarios)
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla community_post_likes (Me gusta en publicaciones)
CREATE TABLE IF NOT EXISTS public.community_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 5. Tabla community_post_comments (Comentarios en publicaciones)
CREATE TABLE IF NOT EXISTS public.community_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla stories (Historias de 24 horas)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 7. Tabla friend_requests (Solicitudes de amistad / seguimiento)
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- 8. Habilitar RLS (Row Level Security) en todas las tablas
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS para community_posts
DROP POLICY IF EXISTS "community_posts_select" ON public.community_posts;
CREATE POLICY "community_posts_select" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_posts_insert" ON public.community_posts;
CREATE POLICY "community_posts_insert" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_posts_update" ON public.community_posts;
CREATE POLICY "community_posts_update" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_posts_delete" ON public.community_posts;
CREATE POLICY "community_posts_delete" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- 10. Políticas RLS para direct_messages
DROP POLICY IF EXISTS "direct_messages_select" ON public.direct_messages;
CREATE POLICY "direct_messages_select" ON public.direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "direct_messages_insert" ON public.direct_messages;
CREATE POLICY "direct_messages_insert" ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "direct_messages_update" ON public.direct_messages;
CREATE POLICY "direct_messages_update" ON public.direct_messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "direct_messages_delete" ON public.direct_messages;
CREATE POLICY "direct_messages_delete" ON public.direct_messages FOR DELETE USING (auth.uid() = sender_id);

-- 11. Políticas RLS para community_post_likes
DROP POLICY IF EXISTS "community_post_likes_select" ON public.community_post_likes;
CREATE POLICY "community_post_likes_select" ON public.community_post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_post_likes_insert" ON public.community_post_likes;
CREATE POLICY "community_post_likes_insert" ON public.community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_post_likes_delete" ON public.community_post_likes;
CREATE POLICY "community_post_likes_delete" ON public.community_post_likes FOR DELETE USING (auth.uid() = user_id);

-- 12. Políticas RLS para community_post_comments
DROP POLICY IF EXISTS "community_post_comments_select" ON public.community_post_comments;
CREATE POLICY "community_post_comments_select" ON public.community_post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_post_comments_insert" ON public.community_post_comments;
CREATE POLICY "community_post_comments_insert" ON public.community_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_post_comments_delete" ON public.community_post_comments;
CREATE POLICY "community_post_comments_delete" ON public.community_post_comments FOR DELETE USING (auth.uid() = user_id);

-- 13. Políticas RLS para stories
DROP POLICY IF EXISTS "stories_select" ON public.stories;
CREATE POLICY "stories_select" ON public.stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "stories_insert" ON public.stories;
CREATE POLICY "stories_insert" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_delete" ON public.stories;
CREATE POLICY "stories_delete" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- 14. Políticas RLS para friend_requests
DROP POLICY IF EXISTS "friend_requests_select" ON public.friend_requests;
CREATE POLICY "friend_requests_select" ON public.friend_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "friend_requests_insert" ON public.friend_requests;
CREATE POLICY "friend_requests_insert" ON public.friend_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "friend_requests_update" ON public.friend_requests;
CREATE POLICY "friend_requests_update" ON public.friend_requests FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "friend_requests_delete" ON public.friend_requests;
CREATE POLICY "friend_requests_delete" ON public.friend_requests FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 15. Índices de velocidad y rendimiento
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.community_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
