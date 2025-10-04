-- =====================================================
-- CORREGIR RESTRICCIÓN CHECK EN CONTRACT STATUS
-- =====================================================

-- 1. Verificar la restricción CHECK actual en status
SELECT 
    'Restricción CHECK actual en status:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name = 'contracts_status_check';

-- 2. Verificar todas las restricciones CHECK en la tabla contracts
SELECT 
    'Todas las restricciones CHECK en contracts:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name LIKE 'contracts_%_check';

-- 3. Probar valores de status manualmente
DO $$ 
BEGIN
    RAISE NOTICE '=== PROBANDO VALORES PARA STATUS ===';
    
    -- Probar el valor que falla
    BEGIN
        PERFORM 'vigente' = ANY (ARRAY['vigente'::text, 'vencido'::text, 'suspendido'::text]);
        RAISE NOTICE '✅ "vigente" está en el array';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error probando "vigente": %', SQLERRM;
    END;
    
    -- Probar otros valores
    BEGIN
        PERFORM 'activo' = ANY (ARRAY['vigente'::text, 'vencido'::text, 'suspendido'::text]);
        RAISE NOTICE '❌ "activo" NO está en el array (esperado)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error probando "activo": %', SQLERRM;
    END;
    
END $$;

-- 4. Recrear la restricción CHECK en status con valores correctos
DO $$ 
BEGIN
    RAISE NOTICE '=== RECREANDO RESTRICCIÓN CHECK EN STATUS ===';
    
    -- Eliminar restricción existente
    ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
    RAISE NOTICE '✅ Restricción status anterior eliminada';
    
    -- Crear nueva restricción con valores explícitos
    ALTER TABLE contracts 
    ADD CONSTRAINT contracts_status_check 
    CHECK (status IN ('vigente', 'vencido', 'suspendido', 'finalizado', 'cancelado'));
    
    RAISE NOTICE '✅ Nueva restricción CHECK en status creada';
    
END $$;

-- 5. Verificar la nueva restricción
SELECT 
    'Nueva restricción CHECK en status:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name = 'contracts_status_check';

-- 6. Probar inserción manual con status correcto
DO $$ 
DECLARE
    test_condo_id UUID;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Obtener un condominio
        SELECT id INTO test_condo_id 
        FROM condos 
        WHERE user_id = current_user_id 
        LIMIT 1;
        
        IF test_condo_id IS NOT NULL THEN
            RAISE NOTICE '=== PROBANDO INSERCIÓN MANUAL CON STATUS ===';
            RAISE NOTICE 'Condominio: %', test_condo_id;
            RAISE NOTICE 'Usuario: %', current_user_id;
            
            BEGIN
                INSERT INTO contracts (
                    condo_id, user_id, contract_number, contract_type,
                    start_date, amount, currency, provider_name, status
                ) VALUES (
                    test_condo_id, current_user_id, 'TEST-STATUS-003', 'mantenimiento_ascensores',
                    '2024-01-01', 100000, 'CLP', 'Test Provider Status', 'vigente'
                );
                
                RAISE NOTICE '✅ Inserción manual con status exitosa!';
                
                -- Limpiar
                DELETE FROM contracts WHERE contract_number = 'TEST-STATUS-003';
                RAISE NOTICE '✅ Registro de prueba eliminado';
                
            EXCEPTION
                WHEN check_violation THEN
                    RAISE NOTICE '❌ Error de restricción CHECK: %', SQLERRM;
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Error inesperado: %', SQLERRM;
            END;
        END IF;
    END IF;
END $$;

-- 7. Verificar estructura completa de la tabla contracts
SELECT 
    'Estructura de tabla contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'contracts'
ORDER BY ordinal_position;

-- 8. Verificar todas las restricciones finales
SELECT 
    'Restricciones finales en contracts:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name LIKE 'contracts_%_check'
ORDER BY constraint_name;

-- =====================================================
-- CORRECCIÓN DE STATUS COMPLETADA
-- =====================================================






