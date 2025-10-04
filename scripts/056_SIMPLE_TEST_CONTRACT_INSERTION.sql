-- =====================================================
-- PRUEBA SIMPLE DE INSERCIÓN DE CONTRATOS
-- =====================================================

-- 1. Verificar que la restricción CHECK fue actualizada correctamente
SELECT 
    'Restricción CHECK actualizada:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name = 'contracts_contract_type_check';

-- 2. Verificar estructura de la tabla contracts
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

-- 3. Verificar si hay condominios disponibles
SELECT 
    'Total de condominios:' as info,
    COUNT(*) as total_condos
FROM condos;

-- 3b. Mostrar el primer condominio disponible
SELECT 
    'Primer condominio:' as info,
    id as first_condo_id,
    name as condo_name
FROM condos 
LIMIT 1;

-- 4. Verificar usuarios en auth.users
SELECT 
    'Usuarios en auth.users:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email = 'sebaleon@gmail.com' THEN 1 END) as sebaleon_count
FROM auth.users;

-- 4b. Mostrar algunos usuarios de ejemplo
SELECT 
    'Ejemplo de usuarios:' as info,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
LIMIT 3;

-- 5. Mostrar el usuario actual (si hay sesión activa)
SELECT 
    'Usuario actual:' as info,
    auth.uid() as user_id,
    auth.email() as user_email;

-- 6. Verificar políticas RLS en contracts
SELECT 
    'Políticas RLS en contracts:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 7. Prueba manual de inserción (solo si hay usuario autenticado)
DO $$ 
DECLARE
    test_condo_id UUID;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        RAISE NOTICE '=== PRUEBA DE INSERCIÓN CON USUARIO AUTENTICADO ===';
        RAISE NOTICE 'Usuario actual: %', current_user_id;
        
        -- Obtener un condominio del usuario actual
        SELECT id INTO test_condo_id 
        FROM condos 
        WHERE user_id = current_user_id 
        LIMIT 1;
        
        IF test_condo_id IS NOT NULL THEN
            RAISE NOTICE 'Condominio de prueba: %', test_condo_id;
            
            -- Intentar inserción
            BEGIN
                INSERT INTO contracts (
                    contract_type, contract_number, provider_name, start_date, 
                    condo_id, user_id, amount, currency
                ) VALUES (
                    'mantenimiento_ascensores', 'TEST-MANUAL-001', 'Test Provider', '2024-01-01',
                    test_condo_id, current_user_id, 100000, 'CLP'
                );
                RAISE NOTICE '✅ Inserción exitosa con usuario autenticado';
                
                -- Eliminar el registro de prueba
                DELETE FROM contracts WHERE contract_number = 'TEST-MANUAL-001';
                
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Error en inserción: %', SQLERRM;
            END;
        ELSE
            RAISE NOTICE '❌ No hay condominios para el usuario actual';
        END IF;
    ELSE
        RAISE NOTICE '=== NO HAY USUARIO AUTENTICADO ===';
        RAISE NOTICE 'Para probar la inserción, ejecuta este script desde la aplicación web';
        RAISE NOTICE 'donde tengas una sesión de usuario activa';
    END IF;
END $$;

-- =====================================================
-- PRUEBA SIMPLE COMPLETADA
-- =====================================================
