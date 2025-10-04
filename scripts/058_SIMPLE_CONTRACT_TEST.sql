-- =====================================================
-- PRUEBA SIMPLE DE CONTRACTS SIN AUTENTICACIÓN
-- =====================================================

-- 1. Verificar estructura de contracts
SELECT 
    'Estructura de contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar restricciones CHECK
SELECT 
    'Restricciones CHECK:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%contracts%';

-- 3. Verificar políticas RLS
SELECT 
    'Políticas RLS:' as info,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 4. Verificar estado de RLS
SELECT 
    'Estado de RLS:' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'contracts' 
    AND schemaname = 'public';

-- 5. Verificar si hay condominios
SELECT 
    'Condominios disponibles:' as info,
    COUNT(*) as total_condos
FROM condos;

-- 6. Verificar si hay usuarios
SELECT 
    'Usuarios disponibles:' as info,
    COUNT(*) as total_users
FROM auth.users;

-- 7. Mostrar algunos condominios
SELECT 
    'Ejemplo de condominios:' as info,
    id,
    name,
    user_id
FROM condos 
LIMIT 3;

-- 8. Mostrar algunos usuarios
SELECT 
    'Ejemplo de usuarios:' as info,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
LIMIT 3;

-- 9. Verificar función user_can_access_condo
SELECT 
    'Función user_can_access_condo:' as info,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'user_can_access_condo'
    AND routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- DIAGNÓSTICO SIMPLE COMPLETADO
-- =====================================================






