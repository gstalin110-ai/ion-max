-- ============================================
-- VERIFICACIÓN Y CREACIÓN DE TABLAS FALTANTES
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla categories si no existe
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar categorías por defecto si no existen
INSERT INTO public.categories (id, name, description, icon)
VALUES 
    ('product', 'Productos Físicos', 'Artículos tangibles que se pueden enviar', 'package'),
    ('service', 'Servicios', 'Servicios profesionales y consultorías', 'briefcase'),
    ('course', 'Cursos', 'Cursos online y educación', 'book-open'),
    ('affiliate', 'Enlaces Afiliados', 'Productos de afiliados digitales', 'link')
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar tabla listings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings' AND table_schema = 'public') THEN
        CREATE TABLE public.listings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2),
            category_id TEXT REFERENCES public.categories(id),
            seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            location TEXT,
            tags TEXT[],
            images TEXT[],
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla listings creada';
    ELSE
        RAISE NOTICE 'Tabla listings ya existe';
    END IF;
END $$;

-- 4. Verificar y agregar columnas faltantes a listings si es necesario
DO $$
BEGIN
    -- Verificar si la columna rating existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'rating' AND table_schema = 'public') THEN
        ALTER TABLE public.listings ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
        RAISE NOTICE 'Columna rating agregada a listings';
    END IF;
    
    -- Verificar si la columna category_name existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category_name' AND table_schema = 'public') THEN
        ALTER TABLE public.listings ADD COLUMN category_name TEXT;
        RAISE NOTICE 'Columna category_name agregada a listings';
    END IF;
END $$;

-- 5. Habilitar RLS en listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS para listings
DROP POLICY IF EXISTS "Usuarios pueden ver listings activos" ON public.listings;
CREATE POLICY "Usuarios pueden ver listings activos" 
    ON public.listings FOR SELECT 
    USING (status = 'active');

DROP POLICY IF EXISTS "Vendedores pueden crear listings" ON public.listings;
CREATE POLICY "Vendedores pueden crear listings" 
    ON public.listings FOR INSERT 
    WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendedores pueden actualizar sus listings" ON public.listings;
CREATE POLICY "Vendedores pueden actualizar sus listings" 
    ON public.listings FOR UPDATE 
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendedores pueden eliminar sus listings" ON public.listings;
CREATE POLICY "Vendedores pueden eliminar sus listings" 
    ON public.listings FOR DELETE 
    USING (auth.uid() = seller_id);

-- 7. Verificar tabla profiles y agregar columnas faltantes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            username TEXT UNIQUE,
            avatar_url TEXT,
            role TEXT DEFAULT 'user',
            account_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla profiles creada';
    END IF;
END $$;

-- 8. Agregar columnas faltantes a profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN website TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_method' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN payment_method TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_data' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN payment_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gemini_api_key' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN gemini_api_key TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profession' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN profession TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    
    RAISE NOTICE 'Columnas de profiles verificadas/actualizadas';
END $$;

-- 9. Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Crear políticas RLS para profiles
DROP POLICY IF EXISTS "Usuarios pueden ver perfiles públicos" ON public.profiles;
CREATE POLICY "Usuarios pueden ver perfiles públicos" 
    ON public.profiles FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

SELECT 'Verificación y creación de tablas completada. Revisa los mensajes de NOTICIA arriba.' AS status;
