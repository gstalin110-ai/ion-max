-- ============================================
-- TRIGGER PARA CREAR PROFILES AUTOMÁTICAMENTE
-- IÓN MAX MARKET SOCIAL
-- ============================================
-- Este script crea un trigger que automáticamente crea un profile
-- cuando un usuario se registra en auth.users
-- Si el email es gstalin110@gmail.com, se asigna role='owner'

-- ============================================
-- PASO 1: Eliminar trigger y función si existen
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- ============================================
-- PASO 2: Crear función para manejar nuevo usuario
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'gstalin110@gmail.com' THEN 'owner'
      ELSE 'user'
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 3: Crear trigger en auth.users
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PASO 4: Verificar trigger creado correctamente
-- ============================================
SELECT 
  'Trigger creado' AS status,
  tgname AS trigger_name,
  tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- PASO 5: Verificar función creada correctamente
-- ============================================
SELECT 
  'Función creada' AS status,
  proname AS function_name,
  prosrc AS function_body
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ============================================
-- PASO 6: Crear profiles para usuarios existentes si no tienen
-- ============================================
INSERT INTO public.profiles (id, username, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  CASE 
    WHEN email = 'gstalin110@gmail.com' THEN 'owner'
    ELSE 'user'
  END,
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- ============================================
-- PASO 7: Verificar profiles creados
-- ============================================
SELECT 
  COUNT(*) AS total_profiles,
  COUNT(*) FILTER (WHERE role = 'owner') AS owners,
  COUNT(*) FILTER (WHERE role = 'user') AS users
FROM public.profiles;

SELECT 
  '✅ TRIGGER PROFILES COMPLETADO' AS resultado;
