-- =====================================================
-- CORREGIR INCONSISTENCIA DE LÍMITES DE USUARIOS
-- =====================================================
-- Este script corrige usuarios que tienen más condominios que su límite

-- 1. Identificar usuarios con inconsistencias
SELECT 
    'Usuarios con inconsistencias:' as info,
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
WHERE COALESCE(condo_count.count, 0) > a.condos_limit
ORDER BY COALESCE(condo_count.count, 0) DESC;

-- 2. Corregir inconsistencias automáticamente
DO $$ 
DECLARE
    user_record RECORD;
    new_limit INTEGER;
    update_result BOOLEAN;
    corrected_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== CORRIGIENDO INCONSISTENCIAS DE LÍMITES ===';
    
    -- Buscar usuarios con inconsistencias
    FOR user_record IN 
        SELECT 
            a.user_id,
            a.full_name,
            a.email,
            a.condos_limit as limite_actual,
            COALESCE(condo_count.count, 0) as condominios_actuales
        FROM administrators a
        LEFT JOIN (
            SELECT condos.user_id, COUNT(*) as count
            FROM condos
            GROUP BY condos.user_id
        ) condo_count ON a.user_id = condo_count.user_id
        WHERE COALESCE(condo_count.count, 0) > a.condos_limit
    LOOP
        -- Establecer nuevo límite = condominios actuales + 1 (para permitir crear uno más)
        new_limit := user_record.condominios_actuales + 1;
        
        RAISE NOTICE 'Corrigiendo usuario: % (%)', user_record.full_name, user_record.email;
        RAISE NOTICE '  Condominios actuales: %', user_record.condominios_actuales;
        RAISE NOTICE '  Límite actual: %', user_record.limite_actual;
        RAISE NOTICE '  Nuevo límite: %', new_limit;
        
        -- Actualizar el límite
        SELECT update_condos_limit(user_record.user_id, new_limit) INTO update_result;
        
        IF update_result THEN
            RAISE NOTICE '  ✅ Límite actualizado exitosamente';
            corrected_count := corrected_count + 1;
        ELSE
            RAISE NOTICE '  ❌ Error al actualizar límite';
        END IF;
        
        RAISE NOTICE '  ---';
    END LOOP;
    
    IF corrected_count = 0 THEN
        RAISE NOTICE 'ℹ️  No se encontraron inconsistencias para corregir';
    ELSE
        RAISE NOTICE '✅ Total de usuarios corregidos: %', corrected_count;
    END IF;
    
    RAISE NOTICE '=== CORRECCIÓN COMPLETADA ===';
END $$;

-- 3. Verificar que las correcciones funcionaron
SELECT 
    'Estado después de correcciones:' as info,
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

-- 4. Probar que la función update_condos_limit funciona correctamente
DO $$ 
DECLARE
    test_user_id UUID;
    test_user_name TEXT;
    current_condos BIGINT;
    current_limit INTEGER;
    update_result BOOLEAN;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIÓN DESPUÉS DE CORRECCIONES ===';
    
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

-- =====================================================
-- CORRECCIÓN DE INCONSISTENCIAS COMPLETADA
-- =====================================================






