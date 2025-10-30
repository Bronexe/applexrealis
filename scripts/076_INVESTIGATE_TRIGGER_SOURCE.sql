-- =====================================================
-- INVESTIGAR ORIGEN DEL TRIGGER DE AUDITORÍA
-- =====================================================
-- Este script investiga de dónde viene el trigger que causa el error

-- 1. Verificar todos los triggers en la tabla administrators
SELECT 
    'Triggers en tabla administrators:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'administrators'
ORDER BY trigger_name;

-- 2. Verificar funciones de trigger
SELECT 
    'Funciones de trigger:' as info,
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%audit%' 
   OR routine_name LIKE '%administrator%'
   OR routine_name LIKE '%history%'
ORDER BY routine_name;

-- 3. Verificar si existe la función audit_administrators_changes
SELECT 
    'Función audit_administrators_changes:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'audit_administrators_changes'
        ) 
        THEN '✅ Función existe'
        ELSE '❌ Función NO existe'
    END as estado;

-- 4. Si existe, mostrar su definición
DO $$ 
DECLARE
    func_exists BOOLEAN;
    func_definition TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'audit_administrators_changes'
    ) INTO func_exists;
    
    IF func_exists THEN
        SELECT routine_definition INTO func_definition
        FROM information_schema.routines 
        WHERE routine_name = 'audit_administrators_changes';
        
        RAISE NOTICE '=== DEFINICIÓN DE LA FUNCIÓN audit_administrators_changes ===';
        RAISE NOTICE '%', func_definition;
        RAISE NOTICE '=== FIN DE LA DEFINICIÓN ===';
    ELSE
        RAISE NOTICE '❌ La función audit_administrators_changes no existe';
    END IF;
END $$;

-- 5. Verificar si hay algún script que haya creado este trigger
SELECT 
    'Buscando referencias a condo_history:' as info,
    'Esta consulta busca en el esquema si hay referencias a condo_history';

-- 6. Verificar si la tabla condo_history existe realmente
SELECT 
    'Verificando existencia de condo_history:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condo_history') 
        THEN '✅ Tabla existe'
        ELSE '❌ Tabla NO existe'
    END as estado;

-- 7. Verificar si hay algún trigger que use condo_history
SELECT 
    'Triggers que mencionan condo_history:' as info,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%condo_history%';

-- 8. Verificar si hay algún script reciente que haya creado triggers
SELECT 
    'Verificando si hay scripts recientes con triggers:' as info,
    'Revisar manualmente los scripts en la carpeta scripts/';

-- =====================================================
-- INVESTIGACIÓN COMPLETADA
-- =====================================================









