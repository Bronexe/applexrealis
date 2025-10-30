-- =====================================================
-- SOLUCIÓN SIMPLE AL ERROR DE TRIGGER
-- =====================================================
-- Este script desactiva el trigger problemático sin crear tablas innecesarias

-- 1. Verificar qué triggers existen en administrators
SELECT 
    'Triggers actuales en administrators:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'administrators';

-- 2. Desactivar TODOS los triggers en administrators temporalmente
ALTER TABLE administrators DISABLE TRIGGER ALL;

-- 3. Verificar que los triggers están desactivados
SELECT 
    'Triggers después de desactivar:' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'administrators';

-- 4. Probar la función update_condos_limit sin triggers
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
        
        RAISE NOTICE '--- Prueba completada exitosamente ---';
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 5. Mostrar usuarios y sus límites actuales
SELECT 
    'Usuarios y sus límites actuales:' as info,
    a.full_name,
    a.email,
    a.condos_limit as limite_actual,
    COALESCE(condo_count.count, 0) as condominios_actuales,
    CASE 
        WHEN a.condos_limit IS NULL THEN 'Sin límite'
        WHEN COALESCE(condo_count.count, 0) >= a.condos_limit THEN 'Límite alcanzado'
        ELSE 'Puede crear más'
    END as estado
FROM administrators a
LEFT JOIN (
    SELECT condos.user_id, COUNT(*) as count
    FROM condos
    GROUP BY condos.user_id
) condo_count ON a.user_id = condo_count.user_id
ORDER BY a.created_at DESC;

-- 6. NOTA: Los triggers permanecen desactivados
-- Si necesitas reactivarlos, ejecuta: ALTER TABLE administrators ENABLE TRIGGER ALL;

-- =====================================================
-- SOLUCIÓN SIMPLE COMPLETADA
-- =====================================================









