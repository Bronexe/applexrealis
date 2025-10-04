-- =====================================================
-- PROBAR LÍMITE POR DEFECTO DE 1 CONDOMINIO
-- =====================================================
-- NOTA: Este script asume que las funciones ya fueron creadas con el script 063

-- 1. Verificar que la columna condos_limit existe y tiene el valor por defecto correcto
SELECT 
    'Verificación de columna condos_limit:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'administrators'
    AND column_name = 'condos_limit';

-- 2. Verificar usuarios existentes y sus límites
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

-- 3. Simular inserción de un nuevo usuario para verificar el valor por defecto
-- (Esto es solo para verificar la configuración, no inserta realmente)
DO $$ 
DECLARE
    test_user_id UUID;
    test_limit INTEGER;
BEGIN
    RAISE NOTICE '=== PROBANDO VALOR POR DEFECTO ===';
    
    -- Simular la inserción de un nuevo usuario
    -- En un entorno real, esto se haría con INSERT INTO administrators
    -- Por ahora, solo verificamos que el valor por defecto esté configurado
    
    -- Verificar que el valor por defecto es 1
    SELECT column_default INTO test_limit
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
        AND table_name = 'administrators'
        AND column_name = 'condos_limit';
    
    IF test_limit = '1' THEN
        RAISE NOTICE '✅ Valor por defecto correcto: %', test_limit;
    ELSE
        RAISE NOTICE '❌ Valor por defecto incorrecto: % (debería ser 1)', test_limit;
    END IF;
    
    RAISE NOTICE '=== PRUEBA COMPLETADA ===';
END $$;

-- 4. Verificar que las funciones existen
SELECT 
    'Verificación de funciones existentes:' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('check_condos_limit', 'get_condos_limit_info', 'update_condos_limit')
ORDER BY routine_name;

-- 5. Verificar que las funciones de límite funcionan correctamente
DO $$ 
DECLARE
    test_user_id UUID;
    limit_check RECORD;
    limit_info RECORD;
    function_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIONES DE LÍMITE ===';
    
    -- Verificar que las funciones existen
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
            AND routine_name = 'check_condos_limit'
    ) INTO function_exists;
    
    IF NOT function_exists THEN
        RAISE NOTICE '❌ La función check_condos_limit no existe. Ejecuta primero el script 063.';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Las funciones existen, procediendo con las pruebas...';
    
    -- Obtener un usuario de prueba
    SELECT user_id INTO test_user_id 
    FROM administrators 
    WHERE condos_limit = 1
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba con límite 1: %', test_user_id;
        
        -- Probar función check_condos_limit
        SELECT * INTO limit_check FROM check_condos_limit(test_user_id);
        RAISE NOTICE 'check_condos_limit: can_create=%, current=%, limit=%, remaining=%', 
            limit_check.can_create, limit_check.current_count, limit_check.limit_count, limit_check.remaining_count;
        
        -- Probar función get_condos_limit_info
        SELECT * INTO limit_info FROM get_condos_limit_info(test_user_id);
        RAISE NOTICE 'get_condos_limit_info: user=%, current=%, limit=%, can_create=%, remaining=%', 
            limit_info.full_name, limit_info.current_condos, limit_info.condos_limit, 
            limit_info.can_create_more, limit_info.remaining_count;
            
        -- Verificar que el límite es 1
        IF limit_check.limit_count = 1 THEN
            RAISE NOTICE '✅ Límite por defecto funcionando correctamente: %', limit_check.limit_count;
        ELSE
            RAISE NOTICE '❌ Límite por defecto incorrecto: % (debería ser 1)', limit_check.limit_count;
        END IF;
    ELSE
        RAISE NOTICE '⚠️  No hay usuarios con límite 1 para probar';
    END IF;
    
    RAISE NOTICE '=== PRUEBAS DE FUNCIONES COMPLETADAS ===';
END $$;

-- 6. Probar función de actualización de límites (solo si existe)
DO $$ 
DECLARE
    test_user_id UUID;
    update_result BOOLEAN;
    update_function_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== PROBANDO ACTUALIZACIÓN DE LÍMITES ===';
    
    -- Verificar que la función de actualización existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
            AND routine_name = 'update_condos_limit'
    ) INTO update_function_exists;
    
    IF NOT update_function_exists THEN
        RAISE NOTICE '⚠️  La función update_condos_limit no existe. Saltando prueba de actualización.';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ La función update_condos_limit existe, procediendo con la prueba...';
    
    -- Obtener un usuario de prueba
    SELECT user_id INTO test_user_id 
    FROM administrators 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Probando actualización de límite para usuario: %', test_user_id;
        
        -- Probar actualizar límite a 3
        SELECT update_condos_limit(test_user_id, 3) INTO update_result;
        
        IF update_result THEN
            RAISE NOTICE '✅ Actualización de límite exitosa';
            
            -- Verificar que se actualizó correctamente
            SELECT * FROM get_condos_limit_info(test_user_id);
            
            -- Restaurar límite a 1
            SELECT update_condos_limit(test_user_id, 1) INTO update_result;
            RAISE NOTICE '✅ Límite restaurado a 1';
        ELSE
            RAISE NOTICE '❌ Error en actualización de límite';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  No hay usuarios para probar actualización';
    END IF;
    
    RAISE NOTICE '=== PRUEBAS DE ACTUALIZACIÓN COMPLETADAS ===';
END $$;

-- 7. Mostrar resumen de configuración
SELECT 
    'Resumen de configuración de límites:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN condos_limit = 1 THEN 1 END) as users_with_limit_1,
    COUNT(CASE WHEN condos_limit IS NULL THEN 1 END) as users_without_limit,
    COUNT(CASE WHEN condos_limit > 1 THEN 1 END) as users_with_higher_limit
FROM administrators;

-- =====================================================
-- PRUEBA DE LÍMITE POR DEFECTO COMPLETADA
-- =====================================================
-- Este script es solo para pruebas y verificación
-- Las funciones deben existir previamente (creadas con script 063)
-- Si las funciones no existen, el script mostrará un error informativo
