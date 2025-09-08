-- =====================================================
-- VERIFICAR Y CREAR DATOS DE ADMINISTRADOR
-- =====================================================
-- Este script verifica si hay datos y crea un registro de prueba
-- Ejecuta este script en Supabase SQL Editor

-- PASO 1: Verificar usuarios autenticados
SELECT '=== USUARIOS AUTENTICADOS ===' as status;
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- PASO 2: Verificar datos existentes en administrators
SELECT '=== DATOS EXISTENTES EN ADMINISTRATORS ===' as status;
SELECT 
    id,
    user_id,
    full_name,
    rut,
    registration_date,
    regions,
    created_at
FROM administrators 
ORDER BY created_at DESC;

-- PASO 3: Verificar si hay datos para cada usuario
SELECT '=== VERIFICACIÓN DE DATOS POR USUARIO ===' as status;
SELECT 
    u.id as user_id,
    u.email,
    CASE 
        WHEN a.id IS NOT NULL THEN 'TIENE DATOS'
        ELSE 'SIN DATOS'
    END as status,
    a.full_name,
    a.created_at as admin_created_at
FROM auth.users u
LEFT JOIN administrators a ON u.id = a.user_id
ORDER BY u.created_at DESC;

-- PASO 4: Contar registros totales
SELECT '=== CONTEO DE REGISTROS ===' as status;
SELECT 
    COUNT(*) as total_users,
    (SELECT COUNT(*) FROM administrators) as total_administrators
FROM auth.users;

-- PASO 5: Verificar políticas RLS
SELECT '=== VERIFICACIÓN DE POLÍTICAS RLS ===' as status;
SELECT 
    policyname, 
    cmd, 
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'administrators'
ORDER BY policyname;

-- PASO 6: Probar inserción de datos (solo si no hay datos)
SELECT '=== PRUEBA DE INSERCIÓN ===' as status;
SELECT 'Si no hay datos, puedes crear un registro de prueba manualmente' as message;

-- PASO 7: Mensaje final
SELECT '=== VERIFICACIÓN COMPLETADA ===' as status;
SELECT 'Revisa los resultados anteriores para entender el estado actual' as message;

