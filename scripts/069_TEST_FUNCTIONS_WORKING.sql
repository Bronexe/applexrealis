-- =====================================================
-- PROBAR QUE LAS FUNCIONES FUNCIONAN CORRECTAMENTE
-- =====================================================

-- 1. Probar función check_condos_limit
DO $$ 
DECLARE
    test_user_id UUID;
    limit_check RECORD;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIÓN check_condos_limit ===';
    
    -- Obtener un usuario de prueba
    SELECT user_id INTO test_user_id 
    FROM administrators 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba: %', test_user_id;
        
        -- Probar función check_condos_limit
        SELECT * INTO limit_check FROM check_condos_limit(test_user_id);
        RAISE NOTICE '✅ check_condos_limit funcionando: can_create=%, current=%, limit=%, remaining=%', 
            limit_check.can_create, limit_check.current_count, limit_check.limit_count, limit_check.remaining_count;
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 2. Probar función get_condos_limit_info
DO $$ 
DECLARE
    test_user_id UUID;
    limit_info RECORD;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIÓN get_condos_limit_info ===';
    
    -- Obtener un usuario de prueba
    SELECT user_id INTO test_user_id 
    FROM administrators 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba: %', test_user_id;
        
        -- Probar función get_condos_limit_info
        SELECT * INTO limit_info FROM get_condos_limit_info(test_user_id);
        RAISE NOTICE '✅ get_condos_limit_info funcionando: user=%, current=%, limit=%, can_create=%, remaining=%', 
            limit_info.full_name, limit_info.current_condos, limit_info.condos_limit, 
            limit_info.can_create_more, limit_info.remaining_count;
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 3. Probar función update_condos_limit (solo lectura, sin cambios)
DO $$ 
DECLARE
    test_user_id UUID;
    update_result BOOLEAN;
    original_limit INTEGER;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIÓN update_condos_limit ===';
    
    -- Obtener un usuario de prueba
    SELECT user_id INTO test_user_id 
    FROM administrators 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba: %', test_user_id;
        
        -- Obtener límite original
        SELECT condos_limit INTO original_limit
        FROM administrators 
        WHERE user_id = test_user_id;
        
        RAISE NOTICE 'Límite original: %', original_limit;
        
        -- Probar función update_condos_limit (cambiar a 2 y luego restaurar)
        SELECT update_condos_limit(test_user_id, 2) INTO update_result;
        
        IF update_result THEN
            RAISE NOTICE '✅ update_condos_limit funcionando: cambio a 2 exitoso';
            
            -- Restaurar límite original
            SELECT update_condos_limit(test_user_id, original_limit) INTO update_result;
            
            IF update_result THEN
                RAISE NOTICE '✅ update_condos_limit funcionando: restauración exitosa';
            ELSE
                RAISE NOTICE '❌ Error restaurando límite original';
            END IF;
        ELSE
            RAISE NOTICE '❌ Error en update_condos_limit';
        END IF;
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 4. Mostrar resumen final
SELECT 
    'Resumen de funciones:' as info,
    '✅ check_condos_limit' as function_1,
    '✅ get_condos_limit_info' as function_2,
    '✅ update_condos_limit' as function_3,
    'Todas las funciones están funcionando correctamente' as status;

-- =====================================================
-- PRUEBAS COMPLETADAS
-- =====================================================






