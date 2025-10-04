-- =====================================================
-- DIAGNOSTICAR PROBLEMA "USUARIO NO ENCONTRADO"
-- =====================================================
-- Este script diagnostica por qué no se encuentra el usuario

-- 1. Verificar usuarios en la tabla administrators
SELECT 
    'Usuarios en tabla administrators:' as info,
    user_id,
    full_name,
    email,
    condos_limit,
    created_at
FROM administrators
ORDER BY created_at DESC;

-- 2. Verificar la estructura de la tabla administrators
SELECT 
    'Estructura de tabla administrators:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'administrators'
ORDER BY ordinal_position;

-- 3. Verificar si hay usuarios duplicados
SELECT 
    'Usuarios duplicados por user_id:' as info,
    user_id,
    COUNT(*) as count,
    STRING_AGG(full_name, ', ') as nombres
FROM administrators
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 4. Verificar si hay usuarios duplicados por email
SELECT 
    'Usuarios duplicados por email:' as info,
    email,
    COUNT(*) as count,
    STRING_AGG(full_name, ', ') as nombres
FROM administrators
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- 5. Probar consulta específica que está fallando
DO $$ 
DECLARE
    test_user_id UUID;
    user_count INTEGER;
    user_record RECORD;
BEGIN
    RAISE NOTICE '=== PROBANDO CONSULTAS QUE ESTÁN FALLANDO ===';
    
    -- Obtener un user_id de prueba
    SELECT user_id INTO test_user_id FROM administrators LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'User ID de prueba: %', test_user_id;
        
        -- Contar usuarios con ese ID
        SELECT COUNT(*) INTO user_count FROM administrators WHERE user_id = test_user_id;
        RAISE NOTICE 'Cantidad de usuarios con ese ID: %', user_count;
        
        -- Probar consulta que está fallando en el código
        BEGIN
            SELECT user_id, full_name, condos_limit INTO user_record
            FROM administrators 
            WHERE user_id = test_user_id;
            
            RAISE NOTICE 'Consulta exitosa - Usuario: % (%)', user_record.full_name, user_record.user_id;
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

-- 6. Verificar si hay problemas con el tipo de datos user_id
SELECT 
    'Verificando tipos de datos user_id:' as info,
    user_id,
    pg_typeof(user_id) as tipo_datos,
    LENGTH(user_id::text) as longitud
FROM administrators
LIMIT 5;

-- 7. Verificar si hay usuarios con user_id NULL
SELECT 
    'Usuarios con user_id NULL:' as info,
    COUNT(*) as cantidad
FROM administrators
WHERE user_id IS NULL;

-- 8. Verificar si hay usuarios con user_id inválido
SELECT 
    'Usuarios con user_id inválido:' as info,
    user_id,
    full_name,
    email
FROM administrators
WHERE user_id IS NULL 
   OR user_id::text = ''
   OR user_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- =====================================================
-- DIAGNÓSTICO COMPLETADO
-- =====================================================






