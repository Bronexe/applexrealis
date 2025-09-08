-- =====================================================
-- PRUEBA DE ACCESO A ADMINISTRATORS
-- =====================================================
-- Este script prueba el acceso a la tabla administrators
-- Ejecuta este script en Supabase SQL Editor

-- PASO 1: Verificar que la tabla existe
SELECT '=== VERIFICACIÓN DE TABLA ===' as status;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'administrators' 
ORDER BY ordinal_position;

-- PASO 2: Verificar RLS
SELECT '=== VERIFICACIÓN DE RLS ===' as status;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'administrators';

-- PASO 3: Verificar políticas RLS
SELECT '=== VERIFICACIÓN DE POLÍTICAS ===' as status;
SELECT 
    policyname, 
    cmd, 
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'administrators'
ORDER BY policyname;

-- PASO 4: Verificar permisos
SELECT '=== VERIFICACIÓN DE PERMISOS ===' as status;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'administrators';

-- PASO 5: Verificar usuarios autenticados
SELECT '=== VERIFICACIÓN DE USUARIOS ===' as status;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- PASO 6: Probar acceso directo
SELECT '=== PRUEBA DE ACCESO DIRECTO ===' as status;
SELECT 'Si ves este mensaje, la tabla es accesible' as test_result;

-- PASO 7: Verificar configuración de RLS
SELECT '=== VERIFICACIÓN DE CONFIGURACIÓN RLS ===' as status;
SELECT 
    name,
    setting,
    context
FROM pg_settings 
WHERE name = 'row_security';

-- PASO 8: Mensaje final
SELECT '=== PRUEBA COMPLETADA ===' as status;
SELECT 'Revisa los resultados anteriores' as message;
