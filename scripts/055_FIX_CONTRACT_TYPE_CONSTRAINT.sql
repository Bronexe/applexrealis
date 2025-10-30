-- =====================================================
-- CORREGIR RESTRICCIÓN CHECK EN CONTRACT_TYPE
-- =====================================================

-- 1. Eliminar la restricción CHECK restrictiva
ALTER TABLE contracts 
DROP CONSTRAINT IF EXISTS contracts_contract_type_check;

-- 2. Crear una nueva restricción CHECK que permita todos los valores de la aplicación
ALTER TABLE contracts 
ADD CONSTRAINT contracts_contract_type_check 
CHECK (contract_type IN (
    -- Mantenimiento
    'mantenimiento_ascensores',
    'mantenimiento_calderas',
    'mantenimiento_generadores',
    'mantenimiento_bombas',
    'mantenimiento_incendios',
    'mantenimiento_portones',
    'mantenimiento_jardines',
    'mantenimiento_piscinas',
    'mantenimiento_antenas',
    
    -- Limpieza
    'limpieza_comunes',
    'limpieza_vidrios',
    
    -- Servicios
    'control_plagas',
    'servicios_conserjeria',
    'seguridad_privada',
    'monitoreo_cctv',
    'internet_redes',
    'plataforma_admin',
    
    -- Profesionales
    'auditoria_contable',
    'asesoria_legal',
    'gestion_seguros',
    
    -- Compras
    'compra_insumos',
    'compra_repuestos',
    'abastecimiento_gas',
    
    -- Obras y reparaciones
    'reparacion_cubiertas',
    'pintura_fachadas',
    'obras_accesibilidad',
    'eventos_decoracion',
    'paneles_solares',
    
    -- Valores genéricos (para compatibilidad)
    'administracion',
    'mantenimiento',
    'limpieza',
    'seguridad',
    'jardineria',
    'otros'
));

-- 3. Verificar que la nueva restricción fue creada
SELECT 
    'Nueva restricción CHECK creada:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name = 'contracts_contract_type_check';

-- 4. Probar la nueva restricción con algunos valores
DO $$ 
BEGIN
    RAISE NOTICE '=== PRUEBA DE NUEVA RESTRICCIÓN CHECK ===';
    
    -- Probar valores válidos
    BEGIN
        INSERT INTO contracts (
            contract_type, contract_number, provider_name, start_date, 
            condo_id, user_id, amount, currency
        ) VALUES (
            'mantenimiento_ascensores', 'TEST-001', 'Test Provider', '2024-01-01',
            (SELECT id FROM condos LIMIT 1), auth.uid(), 100000, 'CLP'
        );
        RAISE NOTICE '✅ Valor "mantenimiento_ascensores" ACEPTADO';
        
        -- Eliminar el registro de prueba
        DELETE FROM contracts WHERE contract_number = 'TEST-001';
        
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '❌ Valor "mantenimiento_ascensores" RECHAZADO: %', SQLERRM;
    END;
    
    BEGIN
        INSERT INTO contracts (
            contract_type, contract_number, provider_name, start_date, 
            condo_id, user_id, amount, currency
        ) VALUES (
            'limpieza_comunes', 'TEST-002', 'Test Provider', '2024-01-01',
            (SELECT id FROM condos LIMIT 1), auth.uid(), 100000, 'CLP'
        );
        RAISE NOTICE '✅ Valor "limpieza_comunes" ACEPTADO';
        
        -- Eliminar el registro de prueba
        DELETE FROM contracts WHERE contract_number = 'TEST-002';
        
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '❌ Valor "limpieza_comunes" RECHAZADO: %', SQLERRM;
    END;
    
    -- Probar valor inválido
    BEGIN
        INSERT INTO contracts (
            contract_type, contract_number, provider_name, start_date, 
            condo_id, user_id, amount, currency
        ) VALUES (
            'valor_invalido', 'TEST-003', 'Test Provider', '2024-01-01',
            (SELECT id FROM condos LIMIT 1), auth.uid(), 100000, 'CLP'
        );
        RAISE NOTICE '❌ Valor "valor_invalido" ACEPTADO (esto es malo)';
        
        -- Eliminar el registro de prueba
        DELETE FROM contracts WHERE contract_number = 'TEST-003';
        
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✅ Valor "valor_invalido" RECHAZADO correctamente: %', SQLERRM;
    END;
    
    RAISE NOTICE '=== PRUEBA COMPLETADA ===';
END $$;

-- 5. Mostrar la estructura final de la tabla contracts
SELECT 
    'Estructura final de contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- RESTRICCIÓN CHECK EN CONTRACT_TYPE CORREGIDA
-- =====================================================









