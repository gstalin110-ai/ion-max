-- ============================================
-- LIMPIEZA DE DATOS ANTIGUOS INNECESARIOS
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Limpiar listings duplicados o sin datos válidos
DELETE FROM public.listings 
WHERE title IS NULL 
   OR title = '' 
   OR price IS NULL 
   OR category_id IS NULL;

-- 2. Limpiar posts de comunidad sin contenido
DELETE FROM public.community_posts 
WHERE content IS NULL 
   OR content = '' 
   OR content = 'test';

-- 3. Limpiar mensajes directos vacíos
DELETE FROM public.direct_messages 
WHERE content IS NULL 
   OR content = '';

-- 4. Limpiar órdenes en estado cancelado hace más de 30 días
DELETE FROM public.orders 
WHERE status = 'cancelled' 
   AND created_at < NOW() - INTERVAL '30 days';

-- 5. Limpiar pagos fallidos hace más de 30 días
DELETE FROM public.payments 
WHERE status = 'failed' 
   AND created_at < NOW() - INTERVAL '30 days';

-- 6. Limpiar notificaciones leídas hace más de 7 días
DELETE FROM public.notifications 
WHERE is_read = true 
   AND created_at < NOW() - INTERVAL '7 days';

-- 7. Verificar y limpiar perfiles sin usuario asociado
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 8. Limpiar likes de posts que no existen
DELETE FROM public.community_post_likes 
WHERE post_id NOT IN (SELECT id FROM public.community_posts);

-- 9. Limpiar comentarios de posts que no existen
DELETE FROM public.community_post_comments 
WHERE post_id NOT IN (SELECT id FROM public.community_posts);

-- 10. Limpiar follows de usuarios que no existen
DELETE FROM public.user_follows 
WHERE follower_id NOT IN (SELECT id FROM auth.users)
   OR following_id NOT IN (SELECT id FROM auth.users);

-- 11. Limpiar wishlist items de listings que no existen
DELETE FROM public.wishlist 
WHERE listing_id NOT IN (SELECT id FROM public.listings);

-- 12. Limpiar cart items de listings que no existen
DELETE FROM public.cart_items 
WHERE listing_id NOT IN (SELECT id FROM public.listings);

-- 13. Resetear contadores de likes y comentarios
UPDATE public.community_posts 
SET likes_count = (SELECT COUNT(*) FROM public.community_post_likes WHERE post_id = public.community_posts.id),
    comments_count = (SELECT COUNT(*) FROM public.community_post_comments WHERE post_id = public.community_posts.id);

-- 14. Limpiar imágenes en storage que no están asociadas a listings
-- (Esto requiere ejecución manual desde el dashboard de Supabase Storage)

SELECT 'Limpieza completada. Verifica los resultados arriba.' AS status;
