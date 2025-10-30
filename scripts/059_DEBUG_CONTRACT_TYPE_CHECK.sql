-- =====================================================
-- DEBUGGING RESTRICCIÓN CHECK EN CONTRACT_TYPE
-- =====================================================

-- 1. Verificar la restricción CHECK actual
SELECT 
    'Restricción CHECK actual:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name = 'contracts_contract_type_check';

-- 2. Probar valores específicos manualmente
DO $$ 
BEGIN
    RAISE NOTICE '=== PROBANDO VALORES PARA CONTRACT_TYPE ===';
    
    -- Probar el valor que falla
    BEGIN
        PERFORM 'mantenimiento_ascensores' = ANY (ARRAY['mantenimiento_ascensores'::text, 'mantenimiento_calderas'::text]);
        RAISE NOTICE '✅ "mantenimiento_ascensores" está en el array';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error probando "mantenimiento_ascensores": %', SQLERRM;
    END;
    
    -- Probar otros valores
    BEGIN
        PERFORM 'limpieza_comunes' = ANY (ARRAY['mantenimiento_ascensores'::text, 'mantenimiento_calderas'::text]);
        RAISE NOTICE '❌ "limpieza_comunes" NO está en el array (esperado)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error probando "limpieza_comunes": %', SQLERRM;
    END;
    
END $$;

-- 3. Verificar si la restricción se aplicó correctamente
SELECT 
    'Verificación de restricción:' as info,
    CASE 
        WHEN 'mantenimiento_ascensores' IN (
            'mantenimiento_ascensores', 'mantenimiento_calderas', 'mantenimiento_generadores',
            'mantenimiento_bombas', 'mantenimiento_incendios', 'mantenimiento_portones',
            'mantenimiento_jardines', 'mantenimiento_piscinas', 'mantenimiento_antenas',
            'limpieza_comunes', 'limpieza_vidrios', 'control_plagas', 'servicios_conserjeria',
            'seguridad_privada', 'monitoreo_cctv', 'internet_redes', 'plataforma_admin',
            'auditoria_contable', 'asesoria_legal', 'gestion_seguros', 'compra_insumos',
            'compra_repuestos', 'abastecimiento_gas', 'reparacion_cubiertas', 'pintura_fachadas',
            'obras_accesibilidad', 'eventos_decoracion', 'paneles_solares', 'administracion',
            'mantenimiento', 'limpieza', 'seguridad', 'jardineria', 'otros'
        ) THEN '✅ Valor permitido'
        ELSE '❌ Valor NO permitido'
    END as test_result;

-- 4. Recrear la restricción CHECK con valores explícitos
DO $$ 
BEGIN
    RAISE NOTICE '=== RECREANDO RESTRICCIÓN CHECK ===';
    
    -- Eliminar restricción existente
    ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_contract_type_check;
    RAISE NOTICE '✅ Restricción anterior eliminada';
    
    -- Crear nueva restricción con valores explícitos
    ALTER TABLE contracts 
    ADD CONSTRAINT contracts_contract_type_check 
    CHECK (contract_type IN (
        'mantenimiento_ascensores',
        'mantenimiento_calderas', 
        'mantenimiento_generadores',
        'mantenimiento_bombas',
        'mantenimiento_incendios',
        'mantenimiento_portones',
        'mantenimiento_jardines',
        'mantenimiento_piscinas',
        'mantenimiento_antenas',
        'limpieza_comunes',
        'limpieza_vidrios',
        'control_plagas',
        'servicios_conserjeria',
        'seguridad_privada',
        'monitoreo_cctv',
        'internet_redes',
        'plataforma_admin',
        'auditoria_contable',
        'asesoria_legal',
        'gestion_seguros',
        'compra_insumos',
        'compra_repuestos',
        'abastecimiento_gas',
        'reparacion_cubiertas',
        'pintura_fachadas',
        'obras_accesibilidad',
        'eventos_decoracion',
        'paneles_solares',
        'administracion',
        'mantenimiento',
        'limpieza',
        'seguridad',
        'jardineria',
        'otros'
    ));
    
    RAISE NOTICE '✅ Nueva restricción CHECK creada';
    
END $$;

-- 5. Verificar la nueva restricción
SELECT 
    'Nueva restricción CHECK:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name = 'contracts_contract_type_check';

-- 6. Probar inserción manual
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
            RAISE NOTICE '=== PROBANDO INSERCIÓN MANUAL ===';
            RAISE NOTICE 'Condominio: %', test_condo_id;
            RAISE NOTICE 'Usuario: %', current_user_id;
            
            BEGIN
                INSERT INTO contracts (
                    condo_id, user_id, contract_number, contract_type,
                    start_date, amount, currency, provider_name, status
                ) VALUES (
                    test_condo_id, current_user_id, 'TEST-MANUAL-002', 'mantenimiento_ascensores',
                    '2024-01-01', 100000, 'CLP', 'Test Provider Manual', 'vigente'
                );
                
                RAISE NOTICE '✅ Inserción manual exitosa!';
                
                -- Limpiar
                DELETE FROM contracts WHERE contract_number = 'TEST-MANUAL-002';
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

-- =====================================================
-- DEBUGGING COMPLETADO
-- =====================================================









