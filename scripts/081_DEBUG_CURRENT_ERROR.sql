-- =====================================================
-- DIAGNOSTICAR ERROR ACTUAL DE ACTUALIZACIÓN
-- =====================================================
-- Este script diagnostica por qué sigue fallando la actualización

-- 1. Verificar triggers actuales en administrators
SELECT 
    'Triggers actuales en administrators:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'administrators'
ORDER BY trigger_name;

-- 2. Verificar si las funciones existen y están funcionando
SELECT 
    'Funciones de límites:' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('check_condos_limit', 'get_condos_limit_info', 'update_condos_limit')
ORDER BY routine_name;

-- 3. Probar la función update_condos_limit directamente
DO $$ 
DECLARE
    test_user_id UUID;
    test_user_name TEXT;
    current_condos BIGINT;
    current_limit INTEGER;
    update_result BOOLEAN;
    error_message TEXT;
BEGIN
    RAISE NOTICE '=== DIAGNOSTICANDO FUNCIÓN update_condos_limit ===';
    
    -- Obtener un usuario de prueba
    SELECT a.user_id, a.full_name, a.condos_limit, COALESCE(condo_count.count, 0)
    INTO test_user_id, test_user_name, current_limit, current_condos
    FROM administrators a
    LEFT JOIN (
        SELECT condos.user_id, COUNT(*) as count
        FROM condos
        GROUP BY condos.user_id
    ) condo_count ON a.user_id = condo_count.user_id
    WHERE a.condos_limit IS NOT NULL
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba: % (%)', test_user_name, test_user_id;
        RAISE NOTICE 'Condominios actuales: %', current_condos;
        RAISE NOTICE 'Límite actual: %', current_limit;
        
        -- Probar actualización con límite mayor
        BEGIN
            SELECT update_condos_limit(test_user_id, current_limit + 1) INTO update_result;
            RAISE NOTICE 'Aumentar límite a %: %', current_limit + 1, 
                CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO' END;
            
            -- Restaurar límite original
            SELECT update_condos_limit(test_user_id, current_limit) INTO update_result;
            RAISE NOTICE 'Restaurar límite a %: %', current_limit, 
                CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO' END;
                
        EXCEPTION
            WHEN OTHERS THEN
                error_message := SQLERRM;
                RAISE NOTICE '❌ ERROR al ejecutar función: %', error_message;
        END;
        
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 4. Verificar si hay algún trigger que se haya reactivado
DO $$ 
DECLARE
    trigger_record RECORD;
    trigger_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== VERIFICANDO TRIGGERS ACTIVOS ===';
    
    FOR trigger_record IN 
        SELECT trigger_name, action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'administrators'
        AND trigger_name NOT LIKE 'RI_ConstraintTrigger%'
        AND trigger_name NOT LIKE 'pg_%'
    LOOP
        trigger_count := trigger_count + 1;
        RAISE NOTICE 'Trigger activo: %', trigger_record.trigger_name;
        RAISE NOTICE '  Acción: %', trigger_record.action_statement;
    END LOOP;
    
    IF trigger_count = 0 THEN
        RAISE NOTICE '✅ No hay triggers problemáticos activos';
    ELSE
        RAISE NOTICE '⚠️  Hay % triggers que podrían causar problemas', trigger_count;
    END IF;
END $$;

-- 5. Probar actualización directa en la tabla
DO $$ 
DECLARE
    test_user_id UUID;
    test_user_name TEXT;
    current_limit INTEGER;
    new_limit INTEGER;
    rows_affected INTEGER;
BEGIN
    RAISE NOTICE '=== PROBANDO ACTUALIZACIÓN DIRECTA ===';
    
    -- Obtener un usuario de prueba
    SELECT user_id, full_name, condos_limit
    INTO test_user_id, test_user_name, current_limit
    FROM administrators
    WHERE condos_limit IS NOT NULL
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        new_limit := current_limit + 1;
        
        RAISE NOTICE 'Usuario: % (%)', test_user_name, test_user_id;
        RAISE NOTICE 'Límite actual: %', current_limit;
        RAISE NOTICE 'Nuevo límite: %', new_limit;
        
        -- Intentar actualización directa
        UPDATE administrators 
        SET condos_limit = new_limit
        WHERE user_id = test_user_id;
        
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        
        IF rows_affected > 0 THEN
            RAISE NOTICE '✅ Actualización directa exitosa';
            
            -- Restaurar límite original
            UPDATE administrators 
            SET condos_limit = current_limit
            WHERE user_id = test_user_id;
            
            RAISE NOTICE '✅ Límite restaurado';
        ELSE
            RAISE NOTICE '❌ No se pudo actualizar directamente';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 6. Verificar permisos en la tabla administrators
SELECT 
    'Permisos en tabla administrators:' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'administrators'
ORDER BY grantee, privilege_type;

-- =====================================================
-- DIAGNÓSTICO COMPLETADO
-- =====================================================









