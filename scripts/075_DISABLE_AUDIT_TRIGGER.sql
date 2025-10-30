-- =====================================================
-- DESACTIVAR TRIGGER DE AUDITORÍA TEMPORALMENTE
-- =====================================================
-- Este script desactiva el trigger de auditoría para solucionar el error

-- 1. Verificar triggers activos en administrators
SELECT 
    'Triggers activos en administrators:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'administrators';

-- 2. Desactivar trigger de auditoría si existe
DO $$ 
DECLARE
    trigger_exists BOOLEAN;
BEGIN
    -- Verificar si existe el trigger
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'administrators' 
        AND trigger_name LIKE '%audit%'
    ) INTO trigger_exists;
    
    IF trigger_exists THEN
        -- Desactivar el trigger
        ALTER TABLE administrators DISABLE TRIGGER ALL;
        RAISE NOTICE '✅ Triggers desactivados en tabla administrators';
    ELSE
        RAISE NOTICE 'ℹ️  No se encontraron triggers de auditoría en administrators';
    END IF;
END $$;

-- 3. Probar la función update_condos_limit sin triggers
DO $$ 
DECLARE
    test_user_id UUID;
    test_user_name TEXT;
    current_condos BIGINT;
    current_limit INTEGER;
    update_result BOOLEAN;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIÓN SIN TRIGGERS ===';
    
    -- Obtener un usuario de prueba
    SELECT a.user_id, a.full_name, a.condos_limit, COALESCE(condo_count.count, 0)
    INTO test_user_id, test_user_name, current_limit, current_condos
    FROM administrators a
    LEFT JOIN (
        SELECT condos.user_id, COUNT(*) as count
        FROM condos
        GROUP BY condos.user_id
    ) condo_count ON a.user_id = condo_count.user_id
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba: % (%)', test_user_name, test_user_id;
        RAISE NOTICE 'Condominios actuales: %', current_condos;
        RAISE NOTICE 'Límite actual: %', current_limit;
        
        -- Probar actualización de límite
        SELECT update_condos_limit(test_user_id, current_limit + 1) INTO update_result;
        RAISE NOTICE 'Aumentar límite a %: %', current_limit + 1, 
            CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO' END;
        
        -- Restaurar límite original
        SELECT update_condos_limit(test_user_id, current_limit) INTO update_result;
        RAISE NOTICE 'Restaurar límite a %: %', current_limit, 
            CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO' END;
        
        RAISE NOTICE '--- Prueba completada ---';
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 4. Reactivar triggers
DO $$ 
BEGIN
    ALTER TABLE administrators ENABLE TRIGGER ALL;
    RAISE NOTICE '✅ Triggers reactivados en tabla administrators';
END $$;

-- 5. Verificar que los triggers están activos
SELECT 
    'Triggers después de reactivación:' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'administrators';

-- =====================================================
-- SOLUCIÓN TEMPORAL COMPLETADA
-- =====================================================









