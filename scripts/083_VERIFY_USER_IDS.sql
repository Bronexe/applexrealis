-- =====================================================
-- VERIFICAR COINCIDENCIA DE USER_IDS
-- =====================================================
-- Este script verifica que los user_id en administrators coincidan con auth.users

-- 1. Mostrar usuarios en administrators con sus user_ids
SELECT 
    'Usuarios en tabla administrators:' as info,
    id as admin_id,
    user_id,
    full_name,
    email,
    condos_limit
FROM administrators
ORDER BY created_at DESC;

-- 2. Verificar si los user_ids de administrators existen en auth.users
SELECT 
    'Verificando user_ids en auth.users:' as info,
    a.user_id,
    a.full_name,
    a.email,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ Existe en auth.users'
        ELSE '❌ NO existe en auth.users'
    END as estado_auth,
    au.email as auth_email,
    au.created_at as auth_created_at
FROM administrators a
LEFT JOIN auth.users au ON a.user_id = au.id
ORDER BY a.created_at DESC;

-- 3. Mostrar usuarios en auth.users que NO están en administrators
SELECT 
    'Usuarios en auth.users pero NO en administrators:' as info,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN administrators a ON au.id = a.user_id
WHERE a.user_id IS NULL
ORDER BY au.created_at DESC;

-- 4. Verificar si hay problemas con el formato de user_id
SELECT 
    'Verificando formato de user_ids:' as info,
    user_id,
    full_name,
    LENGTH(user_id::text) as longitud,
    pg_typeof(user_id) as tipo_datos,
    CASE 
        WHEN user_id IS NULL THEN '❌ NULL'
        WHEN user_id::text = '' THEN '❌ VACÍO'
        WHEN user_id = '00000000-0000-0000-0000-000000000000'::uuid THEN '❌ UUID POR DEFECTO'
        WHEN LENGTH(user_id::text) != 36 THEN '⚠️  LONGITUD INCORRECTA'
        ELSE '✅ FORMATO CORRECTO'
    END as estado_formato
FROM administrators
ORDER BY created_at DESC;

-- 5. Probar consulta específica que está fallando
DO $$ 
DECLARE
    test_user_id UUID;
    user_exists BOOLEAN;
    user_record RECORD;
BEGIN
    RAISE NOTICE '=== PROBANDO CONSULTAS ESPECÍFICAS ===';
    
    -- Obtener un user_id de prueba de administrators
    SELECT user_id INTO test_user_id FROM administrators LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'User ID de prueba: %', test_user_id;
        
        -- Verificar si existe en auth.users
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = test_user_id) INTO user_exists;
        RAISE NOTICE 'Existe en auth.users: %', user_exists;
        
        -- Probar consulta que está fallando
        BEGIN
            SELECT user_id, full_name, condos_limit INTO user_record
            FROM administrators 
            WHERE user_id = test_user_id;
            
            RAISE NOTICE 'Consulta administrators exitosa - Usuario: % (%)', user_record.full_name, user_record.user_id;
            RAISE NOTICE 'Límite actual: %', user_record.condos_limit;
            
        EXCEPTION
            WHEN TOO_MANY_ROWS THEN
                RAISE NOTICE '❌ ERROR: Múltiples usuarios con el mismo user_id';
            WHEN NO_DATA_FOUND THEN
                RAISE NOTICE '❌ ERROR: No se encontró usuario';
            WHEN OTHERS THEN
                RAISE NOTICE '❌ ERROR: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE '❌ No hay usuarios en la tabla administrators';
    END IF;
END $$;

-- 6. Mostrar estadísticas generales
SELECT 
    'Estadísticas generales:' as info,
    (SELECT COUNT(*) FROM administrators) as total_administrators,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM administrators a 
     INNER JOIN auth.users au ON a.user_id = au.id) as usuarios_coincidentes,
    (SELECT COUNT(*) FROM administrators a 
     LEFT JOIN auth.users au ON a.user_id = au.id 
     WHERE au.id IS NULL) as usuarios_sin_auth;

-- =====================================================
-- VERIFICACIÓN COMPLETADA
-- =====================================================






