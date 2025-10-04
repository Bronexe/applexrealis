-- =====================================================
-- PRUEBA SEGURA DE LÍMITE DE CONDOMINIOS
-- =====================================================
-- Este script verifica qué funciones existen y las prueba de manera segura

-- 1. Verificar qué funciones están disponibles
SELECT 
    'Funciones disponibles en la base de datos:' as info,
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%condos%'
ORDER BY routine_name;

-- 2. Verificar estructura de la tabla administrators
SELECT 
    'Estructura de la tabla administrators:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'administrators'
    AND column_name = 'condos_limit';

-- 3. Verificar usuarios existentes y sus límites
SELECT 
    'Usuarios existentes y sus límites:' as info,
    id,
    full_name,
    email,
    condos_limit,
    CASE 
        WHEN condos_limit IS NULL THEN 'Sin límite'
        ELSE condos_limit::text || ' condominios'
    END as limit_description
FROM administrators
ORDER BY created_at DESC;

-- 4. Probar funciones de manera segura
DO $$ 
DECLARE
    test_user_id UUID;
    function_exists BOOLEAN;
    limit_check RECORD;
    limit_info RECORD;
BEGIN
    RAISE NOTICE '=== INICIANDO PRUEBAS SEGURAS ===';
    
    -- Verificar si existe la función check_condos_limit
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
            AND routine_name = 'check_condos_limit'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Función check_condos_limit encontrada';
        
        -- Obtener un usuario de prueba
        SELECT user_id INTO test_user_id 
        FROM administrators 
        LIMIT 1;
        
        IF test_user_id IS NOT NULL THEN
            RAISE NOTICE 'Probando con usuario: %', test_user_id;
            
            -- Probar función check_condos_limit
            BEGIN
                SELECT * INTO limit_check FROM check_condos_limit(test_user_id);
                RAISE NOTICE 'check_condos_limit: can_create=%, current=%, limit=%, remaining=%', 
                    limit_check.can_create, limit_check.current_count, limit_check.limit_count, limit_check.remaining_count;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Error en check_condos_limit: %', SQLERRM;
            END;
        ELSE
            RAISE NOTICE '⚠️  No hay usuarios para probar';
        END IF;
    ELSE
        RAISE NOTICE '❌ Función check_condos_limit no encontrada';
    END IF;
    
    -- Verificar si existe la función get_condos_limit_info
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
            AND routine_name = 'get_condos_limit_info'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Función get_condos_limit_info encontrada';
        
        IF test_user_id IS NOT NULL THEN
            -- Probar función get_condos_limit_info
            BEGIN
                SELECT * INTO limit_info FROM get_condos_limit_info(test_user_id);
                RAISE NOTICE 'get_condos_limit_info: user=%, current=%, limit=%, can_create=%, remaining=%', 
                    limit_info.full_name, limit_info.current_condos, limit_info.condos_limit, 
                    limit_info.can_create_more, limit_info.remaining_count;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Error en get_condos_limit_info: %', SQLERRM;
            END;
        END IF;
    ELSE
        RAISE NOTICE '❌ Función get_condos_limit_info no encontrada';
    END IF;
    
    -- Verificar si existe la función update_condos_limit
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
            AND routine_name = 'update_condos_limit'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Función update_condos_limit encontrada';
        RAISE NOTICE 'ℹ️  Función de actualización disponible (no se probará para evitar cambios)';
    ELSE
        RAISE NOTICE '❌ Función update_condos_limit no encontrada';
    END IF;
    
    RAISE NOTICE '=== PRUEBAS SEGURAS COMPLETADAS ===';
END $$;

-- 5. Mostrar resumen de configuración
SELECT 
    'Resumen de configuración de límites:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN condos_limit = 1 THEN 1 END) as users_with_limit_1,
    COUNT(CASE WHEN condos_limit IS NULL THEN 1 END) as users_without_limit,
    COUNT(CASE WHEN condos_limit > 1 THEN 1 END) as users_with_higher_limit
FROM administrators;

-- 6. Mostrar algunos ejemplos de usuarios
SELECT 
    'Ejemplos de usuarios con límites:' as info,
    id,
    full_name,
    email,
    condos_limit,
    CASE 
        WHEN condos_limit IS NULL THEN 'Sin límite'
        ELSE condos_limit::text || ' condominios'
    END as limit_description
FROM administrators
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- PRUEBA SEGURA COMPLETADA
-- =====================================================






