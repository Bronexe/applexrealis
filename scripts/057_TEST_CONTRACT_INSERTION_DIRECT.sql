-- =====================================================
-- PRUEBA DIRECTA DE INSERCIÓN DE CONTRATOS
-- =====================================================

-- 1. Verificar usuario actual
SELECT 
    'Usuario actual:' as info,
    auth.uid() as user_id,
    auth.email() as user_email;

-- 2. Verificar condominios del usuario actual
SELECT 
    'Condominios del usuario actual:' as info,
    id,
    name,
    user_id
FROM condos 
WHERE user_id = auth.uid()
LIMIT 3;

-- 3. Verificar estructura de contracts
SELECT 
    'Estructura de contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar restricciones CHECK
SELECT 
    'Restricciones CHECK:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%contracts%';

-- 5. Probar inserción directa (solo si hay usuario autenticado)
DO $$ 
DECLARE
    test_condo_id UUID;
    current_user_id UUID;
    test_contract_data JSON;
    insert_result RECORD;
BEGIN
    current_user_id := auth.uid();
    
    RAISE NOTICE '=== PRUEBA DIRECTA DE INSERCIÓN ===';
    RAISE NOTICE 'Usuario actual: %', current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        -- Obtener un condominio del usuario actual
        SELECT id INTO test_condo_id 
        FROM condos 
        WHERE user_id = current_user_id 
        LIMIT 1;
        
        IF test_condo_id IS NOT NULL THEN
            RAISE NOTICE 'Condominio de prueba: %', test_condo_id;
            
            -- Preparar datos de prueba (igual que la aplicación)
            test_contract_data := json_build_object(
                'condo_id', test_condo_id,
                'user_id', current_user_id,
                'contract_number', 'TEST-DIRECT-001',
                'contract_type', 'mantenimiento_ascensores',
                'start_date', '2024-01-01',
                'end_date', '2024-12-31',
                'amount', 100000,
                'currency', 'CLP',
                'provider_name', 'Test Provider Direct',
                'status', 'vigente',
                'contract_file_url', null
            );
            
            RAISE NOTICE 'Datos de prueba: %', test_contract_data;
            
            -- Intentar inserción
            BEGIN
                INSERT INTO contracts (
                    condo_id, user_id, contract_number, contract_type,
                    start_date, end_date, amount, currency,
                    provider_name, status, contract_file_url
                ) VALUES (
                    test_condo_id, current_user_id, 'TEST-DIRECT-001', 'mantenimiento_ascensores',
                    '2024-01-01', '2024-12-31', 100000, 'CLP',
                    'Test Provider Direct', 'vigente', null
                ) RETURNING * INTO insert_result;
                
                RAISE NOTICE '✅ Inserción exitosa! ID: %', insert_result.id;
                
                -- Eliminar el registro de prueba
                DELETE FROM contracts WHERE id = insert_result.id;
                RAISE NOTICE 'Registro de prueba eliminado';
                
            EXCEPTION
                WHEN check_violation THEN
                    RAISE NOTICE '❌ Error de restricción CHECK: %', SQLERRM;
                WHEN not_null_violation THEN
                    RAISE NOTICE '❌ Error de campo NOT NULL: %', SQLERRM;
                WHEN foreign_key_violation THEN
                    RAISE NOTICE '❌ Error de clave foránea: %', SQLERRM;
                WHEN unique_violation THEN
                    RAISE NOTICE '❌ Error de valor único: %', SQLERRM;
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Error inesperado: %', SQLERRM;
                    RAISE NOTICE 'Código de error: %', SQLSTATE;
            END;
        ELSE
            RAISE NOTICE '❌ No hay condominios para el usuario actual';
        END IF;
    ELSE
        RAISE NOTICE '❌ No hay usuario autenticado';
        RAISE NOTICE 'Ejecuta este script desde la aplicación web donde tengas sesión activa';
    END IF;
END $$;

-- 6. Verificar políticas RLS
SELECT 
    'Políticas RLS en contracts:' as info,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- =====================================================
-- PRUEBA DIRECTA COMPLETADA
-- =====================================================









