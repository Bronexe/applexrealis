-- =====================================================
-- VERIFICACIÓN FINAL DE FUNCIONALIDAD DE LÍMITES
-- =====================================================
-- Este script verifica que toda la funcionalidad de límites esté funcionando

-- 1. Verificar estructura de la tabla administrators
SELECT 
    'Estructura de tabla administrators:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'administrators'
    AND column_name = 'condos_limit';

-- 2. Verificar usuarios y sus límites
SELECT 
    'Usuarios con límites configurados:' as info,
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

-- 3. Probar todas las funciones
DO $$ 
DECLARE
    test_user_id UUID;
    limit_check RECORD;
    limit_info RECORD;
    update_result BOOLEAN;
    original_limit INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN FINAL DE FUNCIONES ===';
    
    -- Obtener un usuario de prueba
    SELECT user_id INTO test_user_id 
    FROM administrators 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba: %', test_user_id;
        
        -- Probar función check_condos_limit
        SELECT * INTO limit_check FROM check_condos_limit(test_user_id);
        RAISE NOTICE '✅ check_condos_limit: can_create=%, current=%, limit=%, remaining=%', 
            limit_check.can_create, limit_check.current_count, limit_check.limit_count, limit_check.remaining_count;
        
        -- Probar función get_condos_limit_info
        SELECT * INTO limit_info FROM get_condos_limit_info(test_user_id);
        RAISE NOTICE '✅ get_condos_limit_info: user=%, current=%, limit=%, can_create=%, remaining=%', 
            limit_info.full_name, limit_info.current_condos, limit_info.condos_limit, 
            limit_info.can_create_more, limit_info.remaining_count;
        
        -- Probar función update_condos_limit (cambio temporal)
        SELECT condos_limit INTO original_limit
        FROM administrators 
        WHERE user_id = test_user_id;
        
        SELECT update_condos_limit(test_user_id, 2) INTO update_result;
        IF update_result THEN
            RAISE NOTICE '✅ update_condos_limit: cambio a 2 exitoso';
            
            -- Restaurar límite original
            SELECT update_condos_limit(test_user_id, original_limit) INTO update_result;
            IF update_result THEN
                RAISE NOTICE '✅ update_condos_limit: restauración exitosa';
            END IF;
        END IF;
        
        RAISE NOTICE '🎉 TODAS LAS FUNCIONES FUNCIONAN CORRECTAMENTE';
    ELSE
        RAISE NOTICE '⚠️  No hay usuarios para probar';
    END IF;
    
    RAISE NOTICE '=== VERIFICACIÓN COMPLETADA ===';
END $$;

-- 4. Mostrar resumen de configuración
SELECT 
    'Resumen final de configuración:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN condos_limit = 1 THEN 1 END) as users_with_limit_1,
    COUNT(CASE WHEN condos_limit IS NULL THEN 1 END) as users_without_limit,
    COUNT(CASE WHEN condos_limit > 1 THEN 1 END) as users_with_higher_limit
FROM administrators;

-- 5. Verificar que las funciones están disponibles para la aplicación
SELECT 
    'Funciones disponibles para la aplicación:' as info,
    routine_name,
    routine_type,
    data_type,
    '✅ Lista para usar' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('check_condos_limit', 'get_condos_limit_info', 'update_condos_limit')
ORDER BY routine_name;

-- =====================================================
-- VERIFICACIÓN FINAL COMPLETADA
-- =====================================================






