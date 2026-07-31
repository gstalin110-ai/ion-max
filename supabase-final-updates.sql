-- ============================================
-- ACTUALIZACIONES FINALES PARA IÓN MAX
-- Para nuevas funcionalidades implementadas
-- ============================================

-- 1. Agregar columnas de suscripción a profiles
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
    ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS subscription_type TEXT;

-- 2. Verificar y actualizar columnas existentes
ALTER TABLE public.profiles 
    ALTER COLUMN username SET DEFAULT NULL,
    ALTER COLUMN avatar_url SET DEFAULT NULL,
    ALTER COLUMN social_links SET DEFAULT '{}'::jsonb;

-- 3. Crear índices para suscripciones
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expiry ON public.profiles(subscription_expiry);

-- 4. Actualizar trigger de profiles para incluir nuevas columnas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar que la función handle_new_user incluya todas las columnas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, username, social_links, subscription_status, subscription_expiry, subscription_type, gemini_api_key, profession, bio)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'nombre_completo',
        NULL,
        NULL,
        '{}'::jsonb,
        'inactive',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSTRUCCIONES PARA STORAGE (BUCKET AVATARS)
-- ============================================
-- 
-- PASOS MANUALES EN SUPABASE DASHBOARD:
--
-- 1. Ve a "Storage" en el menú lateral
-- 2. Haz clic en "Create a new bucket"
-- 3. Configura:
--    - Name: avatars (exactamente en minúsculas)
--    - Public bucket: ✅ MARCAR (debe ser público para mostrar fotos)
--    - File size limit: 2MB (para fotos de perfil)
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--
-- 4. Configura políticas RLS para el bucket:
--    - Política de lectura: authenticated (para todos)
--    - Política de escritura: authenticated (solo propio usuario)
--    - USING: bucket_id = 'avatars'
--    - WITH CHECK: bucket_id = 'avatars'
--
-- ============================================

-- Verificación de columnas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_status', 'subscription_expiry', 'subscription_type', 'username', 'avatar_url', 'social_links')
ORDER BY column_name;

-- Mensaje de éxito
SELECT '✅ Actualizaciones de Supabase completadas exitosamente' AS status;
