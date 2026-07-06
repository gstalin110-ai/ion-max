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
