-- =====================================================
-- DIAGNOSTICAR ERROR DE ACTUALIZACIÓN DE LÍMITES
-- =====================================================
-- Este script diagnostica por qué falla la actualización de límites

-- 1. Verificar usuarios y sus condominios actuales
SELECT 
    'Usuarios y sus condominios actuales:' as info,
    a.id,
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

-- 2. Probar la función update_condos_limit con diferentes escenarios
DO $$ 
DECLARE
    test_user_id UUID;
    test_user_name TEXT;
    current_condos BIGINT;
    current_limit INTEGER;
    update_result BOOLEAN;
BEGIN
    RAISE NOTICE '=== DIAGNOSTICANDO ERROR DE ACTUALIZACIÓN ===';
    
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
        
        -- Probar diferentes escenarios
        RAISE NOTICE '--- Probando escenarios ---';
        
        -- Escenario 1: Aumentar límite
        SELECT update_condos_limit(test_user_id, current_limit + 1) INTO update_result;
        RAISE NOTICE 'Aumentar límite a %: %', current_limit + 1, 
            CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO' END;
        
        -- Restaurar límite original
        SELECT update_condos_limit(test_user_id, current_limit) INTO update_result;
        
        -- Escenario 2: Establecer límite igual al actual
        SELECT update_condos_limit(test_user_id, current_limit) INTO update_result;
        RAISE NOTICE 'Mantener límite en %: %', current_limit, 
            CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO' END;
        
        -- Escenario 3: Establecer límite menor (debería fallar si hay condominios)
        IF current_condos > 0 THEN
            SELECT update_condos_limit(test_user_id, current_condos - 1) INTO update_result;
            RAISE NOTICE 'Reducir límite a % (menor que condominios actuales): %', current_condos - 1, 
                CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO (esperado)' END;
        END IF;
        
        -- Escenario 4: Establecer límite a NULL (sin límite)
        SELECT update_condos_limit(test_user_id, NULL) INTO update_result;
        RAISE NOTICE 'Establecer límite a NULL (sin límite): %', 
            CASE WHEN update_result THEN '✅ ÉXITO' ELSE '❌ FALLO' END;
        
        -- Restaurar límite original
        SELECT update_condos_limit(test_user_id, current_limit) INTO update_result;
        
        RAISE NOTICE '--- Diagnóstico completado ---';
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar';
    END IF;
END $$;

-- 3. Verificar la lógica de la función update_condos_limit
DO $$ 
DECLARE
    test_user_id UUID;
    test_user_name TEXT;
    current_condos BIGINT;
    current_limit INTEGER;
    user_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== VERIFICANDO LÓGICA DE LA FUNCIÓN ===';
    
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
        RAISE NOTICE 'Usuario: % (%)', test_user_name, test_user_id;
        RAISE NOTICE 'Condominios actuales: %', current_condos;
        RAISE NOTICE 'Límite actual: %', current_limit;
        
        -- Verificar que el usuario existe
        SELECT EXISTS (SELECT 1 FROM administrators WHERE administrators.user_id = test_user_id) INTO user_exists;
        RAISE NOTICE 'Usuario existe en administrators: %', user_exists;
        
        -- Verificar condominios del usuario
        SELECT COUNT(*) INTO current_condos FROM condos WHERE condos.user_id = test_user_id;
        RAISE NOTICE 'Condominios contados directamente: %', current_condos;
        
        -- Verificar lógica de validación
        IF current_condos > 0 THEN
            RAISE NOTICE '⚠️  Usuario tiene % condominios, no se puede establecer límite menor', current_condos;
        ELSE
            RAISE NOTICE '✅ Usuario no tiene condominios, se puede establecer cualquier límite';
        END IF;
        
    END IF;
END $$;

-- 4. Mostrar usuarios que podrían tener problemas
SELECT 
    'Usuarios que podrían tener problemas:' as info,
    a.full_name,
    a.email,
    a.condos_limit as limite_actual,
    COALESCE(condo_count.count, 0) as condominios_actuales,
    CASE 
        WHEN COALESCE(condo_count.count, 0) > a.condos_limit THEN '❌ PROBLEMA: Más condominios que límite'
        WHEN COALESCE(condo_count.count, 0) = a.condos_limit THEN '⚠️  Límite alcanzado'
        ELSE '✅ OK'
    END as estado
FROM administrators a
LEFT JOIN (
    SELECT condos.user_id, COUNT(*) as count
    FROM condos
    GROUP BY condos.user_id
) condo_count ON a.user_id = condo_count.user_id
WHERE COALESCE(condo_count.count, 0) >= a.condos_limit
ORDER BY COALESCE(condo_count.count, 0) DESC;

-- =====================================================
-- DIAGNÓSTICO COMPLETADO
-- =====================================================









