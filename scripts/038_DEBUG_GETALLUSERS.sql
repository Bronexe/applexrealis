-- =====================================================
-- DEBUG: SIMULAR LA FUNCIÓN getAllUsers() DESDE SQL
-- =====================================================

-- Este script simula exactamente lo que hace la función getAllUsers() en la aplicación

-- 1. VERIFICAR USUARIO ACTUAL (simula auth.uid())
SELECT 
    'Usuario actual (simula auth.uid()):' as step,
    auth.uid() as current_user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as current_email;

-- 2. VERIFICAR SI ES SUPER ADMIN (simula isSuperAdmin())
SELECT 
    'Verificación isSuperAdmin():' as step,
    CASE 
        WHEN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'sebaleon@gmail.com' THEN 'SÍ (verificación por email)'
        WHEN EXISTS(
            SELECT 1 FROM administrators 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        ) THEN 'SÍ (verificación por tabla)'
        ELSE 'NO'
    END as is_super_admin;

-- 3. SIMULAR LA CONSULTA DE getAllUsers() (con RLS aplicado)
SELECT 
    'Consulta getAllUsers() con RLS:' as step,
    COUNT(*) as total_accessible_users
FROM administrators;

-- 4. MOSTRAR USUARIOS ACCESIBLES (lo que debería ver la aplicación)
SELECT 
    'Usuarios accesibles para super admin:' as step,
    id,
    full_name,
    email,
    role,
    is_active,
    created_at
FROM administrators
ORDER BY created_at DESC;

-- 5. VERIFICAR SI HAY PROBLEMA CON LAS POLÍTICAS RLS
-- Probar acceso directo sin RLS (temporalmente)
SET row_security = off;
SELECT 
    'Acceso sin RLS (temporal):' as step,
    COUNT(*) as total_users_without_rls
FROM administrators;
SET row_security = on;

-- 6. VERIFICAR POLÍTICAS ESPECÍFICAS
SELECT 
    'Políticas RLS activas:' as info,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'administrators' 
    AND schemaname = 'public'
    AND cmd = 'SELECT';

-- =====================================================
-- DEBUG COMPLETADO
-- =====================================================









