-- =====================================================
-- VERIFICAR POLÍTICAS RLS EN ADMINISTRATORS
-- =====================================================

-- 1. VERIFICAR POLÍTICAS EXISTENTES
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'administrators' 
    AND schemaname = 'public';

-- 2. VERIFICAR SI EL USUARIO ACTUAL PUEDE ACCEDER
-- (Esto simula lo que hace la aplicación)
SELECT 
    'Verificando acceso del usuario actual' as test,
    auth.uid() as current_user_id;

-- 3. PROBAR ACCESO COMO SUPER ADMIN
-- Simular la verificación que hace isSuperAdmin()
SELECT 
    'Verificando si usuario actual es super admin' as test,
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    ) as is_super_admin;

-- 4. VERIFICAR USUARIOS CON ROL SUPER_ADMIN
SELECT 
    'Usuarios super admin activos:' as info,
    COUNT(*) as total_super_admins
FROM administrators 
WHERE role = 'super_admin' AND is_active = true;

-- 5. MOSTRAR SUPER ADMINS
SELECT 
    id,
    full_name,
    email,
    role,
    is_active,
    user_id
FROM administrators 
WHERE role = 'super_admin' AND is_active = true;

-- 6. VERIFICAR SI HAY PROBLEMAS CON LAS POLÍTICAS
-- Intentar hacer un SELECT simple
SELECT 
    'Test de acceso directo' as test,
    COUNT(*) as accessible_records
FROM administrators;

-- =====================================================
-- DIAGNÓSTICO DE POLÍTICAS RLS COMPLETADO
-- =====================================================






