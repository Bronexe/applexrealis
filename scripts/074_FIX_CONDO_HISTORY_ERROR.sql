-- =====================================================
-- SOLUCIONAR ERROR DE TABLA condo_history
-- =====================================================
-- Este script soluciona el error de la tabla condo_history que no existe

-- 1. Verificar si existe la tabla condo_history
SELECT 
    'Verificando existencia de tabla condo_history:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condo_history') 
        THEN '✅ Tabla existe'
        ELSE '❌ Tabla NO existe'
    END as estado;

-- 2. Verificar triggers en la tabla administrators
SELECT 
    'Triggers en tabla administrators:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'administrators';

-- 3. Crear la tabla condo_history si no existe
CREATE TABLE IF NOT EXISTS condo_history (
    id BIGSERIAL PRIMARY KEY,
    condo_id UUID REFERENCES condos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id BIGINT NOT NULL,
    changes JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_condo_history_condo_id ON condo_history(condo_id);
CREATE INDEX IF NOT EXISTS idx_condo_history_user_id ON condo_history(user_id);
CREATE INDEX IF NOT EXISTS idx_condo_history_table_name ON condo_history(table_name);
CREATE INDEX IF NOT EXISTS idx_condo_history_created_at ON condo_history(created_at);

-- 5. Verificar que la tabla se creó correctamente
SELECT 
    'Verificando creación de tabla condo_history:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condo_history') 
        THEN '✅ Tabla creada exitosamente'
        ELSE '❌ Error al crear tabla'
    END as estado;

-- 6. Verificar la estructura de la tabla
SELECT 
    'Estructura de tabla condo_history:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'condo_history'
ORDER BY ordinal_position;

-- 7. Probar la función update_condos_limit nuevamente
DO $$ 
DECLARE
    test_user_id UUID;
    test_user_name TEXT;
    current_condos BIGINT;
    current_limit INTEGER;
    update_result BOOLEAN;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIÓN DESPUÉS DE CREAR TABLA ===';
    
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

-- 8. Verificar que se insertaron registros en condo_history
SELECT 
    'Registros en condo_history:' as info,
    COUNT(*) as total_registros,
    MAX(created_at) as ultimo_registro
FROM condo_history;

-- 9. Mostrar los últimos registros de auditoría
SELECT 
    'Últimos registros de auditoría:' as info,
    id,
    condo_id,
    user_email,
    action_type,
    table_name,
    record_id,
    created_at
FROM condo_history
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- SOLUCIÓN COMPLETADA
-- =====================================================






