-- ============================================
-- VERIFICACIÓN Y CORRECCIÓN DE TABLAS LISTINGS
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Ejecutar en el SQL Editor de Supabase
-- Este script verifica y corrige problemas con la tabla listings

-- ============================================
-- PASO 1: Verificar si la tabla listings existe
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'listings'
    ) THEN
        RAISE NOTICE 'La tabla listings NO existe. Creando tabla...';
    ELSE
        RAISE NOTICE 'La tabla listings existe. Verificando estructura...';
    END IF;
END $$;

-- ============================================
-- PASO 2: Crear tabla listings si no existe
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category_id TEXT NOT NULL,
    location TEXT,
    tags TEXT[],
    images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'rejected')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rejection_reason TEXT
);

-- ============================================
-- PASO 3: Verificar y agregar columnas faltantes
-- ============================================
DO $$
BEGIN
    -- Verificar y agregar columnas una por una
    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna seller_id verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Columna title verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Columna description verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Columna price verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS category_id TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Columna category_id verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS location TEXT;
        RAISE NOTICE 'Columna location verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS tags TEXT[];
        RAISE NOTICE 'Columna tags verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna images verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
        RAISE NOTICE 'Columna status verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna views verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna created_at verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna updated_at verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
        RAISE NOTICE 'Columna rejection_reason verificada/agregada';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;

    RAISE NOTICE 'Verificación de columnas completada';
END $$;

-- ============================================
-- PASO 4: Crear tabla categories si no existe
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 5: Insertar categorías por defecto si no existen
-- ============================================
INSERT INTO categories (id, name, description, icon) VALUES
    ('product', 'Productos Físicos', 'Artículos tangibles y productos físicos', 'package'),
    ('service', 'Servicios', 'Servicios profesionales y consultoría', 'briefcase'),
    ('course', 'Cursos', 'Cursos online y educación', 'graduation-cap'),
    ('affiliate', 'Enlaces Afiliados', 'Productos de afiliados y marketing', 'link')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PASO 6: Crear índices para mejor rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- ============================================
-- PASO 7: Configurar RLS (Row Level Security)
-- ============================================
-- Habilitar RLS en listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver listings activos" ON listings;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios listings" ON listings;
DROP POLICY IF EXISTS "Usuarios pueden crear listings" ON listings;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios listings" ON listings;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios listings" ON listings;

-- Política: Usuarios autenticados pueden ver listings activos
CREATE POLICY "Usuarios pueden ver listings activos"
ON listings FOR SELECT
TO authenticated
USING (status = 'active');

-- Política: Usuarios pueden ver sus propios listings
CREATE POLICY "Usuarios pueden ver sus propios listings"
ON listings FOR SELECT
TO authenticated
USING (seller_id = auth.uid());

-- Política: Usuarios pueden crear listings
CREATE POLICY "Usuarios pueden crear listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (seller_id = auth.uid());

-- Política: Usuarios pueden actualizar sus propios listings
CREATE POLICY "Usuarios pueden actualizar sus propios listings"
ON listings FOR UPDATE
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Política: Usuarios pueden eliminar sus propios listings
CREATE POLICY "Usuarios pueden eliminar sus propios listings"
ON listings FOR DELETE
TO authenticated
USING (seller_id = auth.uid());

-- ============================================
-- PASO 8: Habilitar RLS en categories
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Todos pueden ver categorías" ON categories;

-- Política: Todos pueden ver categorías
CREATE POLICY "Todos pueden ver categorías"
ON categories FOR SELECT
TO authenticated, anon
USING (true);

-- ============================================
-- PASO 9: Verificar bucket 'listings' en Storage
-- ============================================
-- NOTA: Este paso debe hacerse manualmente en el dashboard de Supabase Storage
-- 1. Ve a Storage en el dashboard
-- 2. Crea un bucket llamado 'listings'
-- 3. Configura políticas RLS para permitir lectura/escritura a usuarios autenticados

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 
    'Verificación completada' AS status,
    COUNT(*) AS total_listings
FROM listings;

SELECT 
    'Categorías disponibles' AS status,
    id,
    name
FROM categories;

-- ============================================
-- INSTRUCCIONES ADICIONALES
-- ============================================
-- 1. Si el error persiste, verifica que el usuario tenga un profile en la tabla profiles
-- 2. Ejecuta este query para verificar: SELECT * FROM profiles WHERE id = auth.uid();
-- 3. Si no existe profile, crea uno ejecutando el script de migración de perfiles
