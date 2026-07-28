-- ============================================
-- LIMPIEZA DE DATOS ANTIGUOS INNECESARIOS
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Limpiar listings duplicados o sin datos válidos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings' AND table_schema = 'public') THEN
        DELETE FROM public.listings 
        WHERE title IS NULL 
           OR title = '' 
           OR price IS NULL 
           OR category_id IS NULL;
        RAISE NOTICE 'Listings limpiados';
    ELSE
        RAISE NOTICE 'Tabla listings no existe, saltando...';
    END IF;
END $$;

-- 2. Limpiar posts de comunidad sin contenido
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts' AND table_schema = 'public') THEN
        DELETE FROM public.community_posts 
        WHERE content IS NULL 
           OR content = '' 
           OR content = 'test';
        RAISE NOTICE 'Posts de comunidad limpiados';
    ELSE
        RAISE NOTICE 'Tabla community_posts no existe, saltando...';
    END IF;
END $$;

-- 3. Limpiar mensajes directos vacíos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'direct_messages' AND table_schema = 'public') THEN
        DELETE FROM public.direct_messages 
        WHERE content IS NULL 
           OR content = '';
        RAISE NOTICE 'Mensajes directos limpiados';
    ELSE
        RAISE NOTICE 'Tabla direct_messages no existe, saltando...';
    END IF;
END $$;

-- 4. Limpiar órdenes en estado cancelado hace más de 30 días
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        DELETE FROM public.orders 
        WHERE status = 'cancelled' 
           AND created_at < NOW() - INTERVAL '30 days';
        RAISE NOTICE 'Órdenes canceladas limpiadas';
    ELSE
        RAISE NOTICE 'Tabla orders no existe, saltando...';
    END IF;
END $$;

-- 5. Limpiar notificaciones leídas hace más de 7 días
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        DELETE FROM public.notifications 
        WHERE is_read = true 
           AND created_at < NOW() - INTERVAL '7 days';
        RAISE NOTICE 'Notificaciones limpiadas';
    ELSE
        RAISE NOTICE 'Tabla notifications no existe, saltando...';
    END IF;
END $$;

-- 6. Verificar y limpiar perfiles sin usuario asociado
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        DELETE FROM public.profiles 
        WHERE id NOT IN (SELECT id FROM auth.users);
        RAISE NOTICE 'Perfiles huérfanos limpiados';
    ELSE
        RAISE NOTICE 'Tabla profiles no existe, saltando...';
    END IF;
END $$;

-- 7. Limpiar likes de posts que no existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_post_likes' AND table_schema = 'public') THEN
        DELETE FROM public.community_post_likes 
        WHERE post_id NOT IN (SELECT id FROM public.community_posts);
        RAISE NOTICE 'Likes huérfanos limpiados';
    ELSE
        RAISE NOTICE 'Tabla community_post_likes no existe, saltando...';
    END IF;
END $$;

-- 8. Limpiar comentarios de posts que no existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_post_comments' AND table_schema = 'public') THEN
        DELETE FROM public.community_post_comments 
        WHERE post_id NOT IN (SELECT id FROM public.community_posts);
        RAISE NOTICE 'Comentarios huérfanos limpiados';
    ELSE
        RAISE NOTICE 'Tabla community_post_comments no existe, saltando...';
    END IF;
END $$;

-- 9. Limpiar follows de usuarios que no existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows' AND table_schema = 'public') THEN
        DELETE FROM public.user_follows 
        WHERE follower_id NOT IN (SELECT id FROM auth.users)
           OR following_id NOT IN (SELECT id FROM auth.users);
        RAISE NOTICE 'Follows huérfanos limpiados';
    ELSE
        RAISE NOTICE 'Tabla user_follows no existe, saltando...';
    END IF;
END $$;

-- 10. Limpiar wishlist items de listings que no existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlist' AND table_schema = 'public') THEN
        DELETE FROM public.wishlist 
        WHERE listing_id NOT IN (SELECT id FROM public.listings);
        RAISE NOTICE 'Wishlist items huérfanos limpiados';
    ELSE
        RAISE NOTICE 'Tabla wishlist no existe, saltando...';
    END IF;
END $$;

-- 11. Limpiar cart items de listings que no existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items' AND table_schema = 'public') THEN
        DELETE FROM public.cart_items 
        WHERE listing_id NOT IN (SELECT id FROM public.listings);
        RAISE NOTICE 'Cart items huérfanos limpiados';
    ELSE
        RAISE NOTICE 'Tabla cart_items no existe, saltando...';
    END IF;
END $$;

-- 12. Resetear contadores de likes y comentarios
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts' AND table_schema = 'public') THEN
        UPDATE public.community_posts 
        SET likes_count = (SELECT COUNT(*) FROM public.community_post_likes WHERE post_id = public.community_posts.id),
            comments_count = (SELECT COUNT(*) FROM public.community_post_comments WHERE post_id = public.community_posts.id);
        RAISE NOTICE 'Contadores reseteados';
    ELSE
        RAISE NOTICE 'Tabla community_posts no existe, saltando...';
    END IF;
END $$;

SELECT 'Limpieza completada. Verifica los mensajes de NOTICIA arriba.' AS status;
