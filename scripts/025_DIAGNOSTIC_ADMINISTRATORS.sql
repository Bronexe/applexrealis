-- =====================================================
-- DIAGNÓSTICO ULTRA SIMPLE PARA SUPER-ADMIN
-- =====================================================

-- 1. VERIFICAR SI LA TABLA ADMINISTRATORS EXISTE
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'administrators' AND table_schema = 'public')
        THEN '✅ Tabla administrators EXISTE'
        ELSE '❌ Tabla administrators NO EXISTE - ESTE ES EL PROBLEMA'
    END as status_administrators;

-- 2. CONTAR USUARIOS EN AUTH.USERS
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- 3. MOSTRAR USUARIOS EN AUTH.USERS
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    last_sign_in_at IS NOT NULL as has_signed_in,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 4. VERIFICAR ADMINISTRATORS (solo si existe)
SELECT 
    'Tabla administrators existe' as info,
    COUNT(*) as total_administrators
FROM administrators
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'administrators' AND table_schema = 'public');

-- 5. MOSTRAR ADMINISTRATORS (solo si existen)
SELECT 
    id,
    full_name,
    email,
    role,
    is_active,
    created_at
FROM administrators
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'administrators' AND table_schema = 'public')
ORDER BY created_at DESC;

-- 6. VERIFICAR RLS EN ADMINISTRATORS
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'administrators' AND schemaname = 'public';

-- =====================================================
-- DIAGNÓSTICO COMPLETADO
-- =====================================================
