-- ============================================
-- SCRIPT DE DIAGNÓSTICO - VERIFICACIÓN SOLAMENTE
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Este script SOLO verifica el estado actual
-- NO intenta crear nada, solo diagnostica

-- ============================================
-- PASO 1: Verificar si la tabla listings existe
-- ============================================
SELECT 
    'Tabla listings' AS item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END AS status;

-- ============================================
-- PASO 2: Verificar columnas de listings
-- ============================================
SELECT 
    'Columnas de listings' AS item,
    COUNT(*) AS total_columnas,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS columnas
FROM information_schema.columns
WHERE table_name = 'listings' AND table_schema = 'public';

-- ============================================
-- PASO 3: Verificar si RLS está habilitado en listings
-- ============================================
SELECT 
    'RLS en listings' AS	item,
    CASE 
        WHEN relrowsecurity = true THEN '✅ HABILITADO'
        ELSE '❌ DESHABILITADO'
    END AS status
FROM pg_class
WHERE relname = 'listings';

-- ============================================
-- PASO 4: Verificar políticas existentes en listings
-- ============================================
SELECT 
    'Políticas en listings' AS item,
    policyname AS nombre_politica,
    permissive AS tipo,
    cmd AS comando,
    qual AS condicion_uso,
    with_check AS condicion_check
FROM pg_policies
WHERE tablename = 'listings';

-- ============================================
-- PASO 5: Verificar tabla categories
-- ============================================
SELECT 
    'Tabla categories' AS item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END AS status;

-- ============================================
-- PASO 6: Verificar categorías disponibles
-- ============================================
SELECT 
    'Categorías disponibles' AS item,
    id,
    name
FROM categories
ORDER BY id;

-- ============================================
-- PASO 7: Verificar si el usuario tiene profile
-- ============================================
-- NOTA: Esto requiere que estés autenticado
SELECT 
    'Profile del usuario actual' AS item,
    id,
    username,
    role
FROM profiles
WHERE id = auth.uid();

-- ============================================
-- PASO 8: Verificar listings existentes
-- ============================================
SELECT 
    'Listings en BD' AS item,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE status = 'active') AS activos,
    COUNT(*) FILTER (WHERE seller_id = auth.uid()) AS mis_listings
FROM listings;

-- ============================================
-- PASO 9: Verificar bucket listings en Storage
-- ============================================
-- NOTA: Esto debe verificarse manualmente en el dashboard
SELECT 
    'Bucket Storage' AS item,
    '⚠️ Verificar manualmente en Storage dashboard' AS status;

SELECT '========================================' AS separador;
SELECT 'DIAGNÓSTICO COMPLETADO' AS resultado;
SELECT 'Revisa los resultados arriba para identificar problemas' AS instruccion;
