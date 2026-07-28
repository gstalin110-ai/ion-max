-- ============================================
-- VERIFICACIÓN DE TABLAS NECESARIAS EN SUPABASE
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- Verificar tablas principales
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Tablas que deben existir:
-- - profiles
-- - listings
-- - categories
-- - community_posts
-- - direct_messages
-- - community_post_likes
-- - community_post_comments
-- - user_follows
-- - orders
-- - payments
-- - order_items
-- - shipping_addresses
-- - wishlist
-- - cart_items
-- - notifications
-- - pricing_config
-- - subscription_plans
-- - user_subscriptions

-- Verificar columnas en profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar columnas en listings
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar si bucket listings existe en Storage
-- (Esto debe verificarse manualmente en el dashboard de Supabase Storage)

SELECT 'Verificación completada. Revisa los resultados arriba.' AS status;
