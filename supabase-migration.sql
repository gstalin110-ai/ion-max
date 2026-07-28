-- ============================================
-- MIGRACIÓN SUPABASE PARA IÓN MAX
-- ============================================
-- Este script corrige inconsistencias y prepara la DB
-- ✅ YA EJECUTADO - Base de datos limpia y segura
-- ============================================

-- CAMBIOS REALIZADOS:
-- 1. ✅ Eliminadas tablas viejas (productos, servicios, redes, configuracion, sociales, usuarios)
-- 2. ✅ Eliminada tabla items (datos de prueba sin owner)
-- 3. ✅ Habilitado RLS en listings, orders, payments, wallets
-- 4. ✅ Creadas políticas de seguridad básicas
-- 5. ✅ Asegurados roles iniciales (admin, user, business)
-- 6. ✅ Corregido trigger para usar full_name en lugar de nombre_completo

-- ============================================
-- CORRECCIÓN DEL TRIGGER DE PERFIL
-- ============================================
-- El trigger anterior usaba 'nombre_completo' pero el formulario envía 'full_name'
-- Este script actualiza el trigger para usar el campo correcto

-- Eliminar trigger antiguo si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger actualizado con el campo correcto
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Asegurar que la función handle_new_user use full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, account_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
        'user',
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nombre_completo', profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO FINAL: Asignar rol admin al usuario dueño
-- ============================================
-- UUID del usuario: 229ef0aa-417f-4b85-98f6-a13fba2eb932

-- Asignar el rol admin:
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
    '229ef0aa-417f-4b85-98f6-a13fba2eb932',
    (SELECT id FROM public.roles WHERE name = 'admin')
ON CONFLICT DO NOTHING;

-- Verifica que el rol fue asignado correctamente:
-- SELECT 
--     u.email,
--     r.name as role
-- FROM public.user_roles ur
-- JOIN auth.users u ON u.id = ur.user_id
-- JOIN public.roles r ON r.id = ur.role_id;

-- ============================================
-- TABLA DE RESPUESTAS DE ENCUESTA (SURVEY)
-- ============================================
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para survey_responses
-- Cualquiera puede insertar (incluso usuarios no autenticados, ya que la encuesta es opcional y accesible desde el landing)
DROP POLICY IF EXISTS "Permitir inserción de encuestas para todos" ON public.survey_responses;
CREATE POLICY "Permitir inserción de encuestas para todos" 
    ON public.survey_responses FOR INSERT 
    WITH CHECK (true);

-- Solo el dueño/admin puede leer las respuestas
DROP POLICY IF EXISTS "Solo admin/owner puede leer las respuestas de encuestas" ON public.survey_responses;
CREATE POLICY "Solo admin/owner puede leer las respuestas de encuestas" 
    ON public.survey_responses FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'admin' OR profiles.role = 'owner' OR profiles.email = 'gstalin110@gmail.com')
        )
    );
