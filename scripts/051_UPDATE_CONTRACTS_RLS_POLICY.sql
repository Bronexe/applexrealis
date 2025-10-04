-- =====================================================
-- ACTUALIZAR POLÍTICA RLS EN CONTRACTS CON FUNCIÓN CORREGIDA
-- =====================================================

-- 1. Eliminar la política RLS existente
DROP POLICY IF EXISTS "Allow contract management for condo owners" ON contracts;

-- 2. Crear una nueva política RLS usando la función corregida
CREATE POLICY "Users with condo access can manage contracts" ON contracts
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 3. Verificar que RLS está habilitado
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 4. Verificar la nueva política
SELECT 
    'Nueva política RLS en contracts:' as info,
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 5. Verificar estado de RLS
SELECT 
    'Estado final de RLS en contracts:' as info,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'contracts' 
    AND schemaname = 'public';

-- 6. Probar acceso a la tabla contracts
DO $$ 
DECLARE
    current_user_id UUID;
    condo_count INTEGER;
    test_condo_id UUID;
    can_access BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    RAISE NOTICE '=== PRUEBA DE ACCESO A CONTRACTS ===';
    RAISE NOTICE 'Usuario actual: %', current_user_id;
    
    -- Contar condominios del usuario
    SELECT COUNT(*) INTO condo_count
    FROM condos 
    WHERE user_id = current_user_id;
    
    RAISE NOTICE 'Condominios del usuario: %', condo_count;
    
    -- Obtener un condominio de prueba
    SELECT id INTO test_condo_id 
    FROM condos 
    WHERE user_id = current_user_id 
    LIMIT 1;
    
    IF test_condo_id IS NOT NULL THEN
        -- Probar la función de acceso
        SELECT user_can_access_condo(test_condo_id, current_user_id) INTO can_access;
        RAISE NOTICE '¿Puede acceder al condominio %? %', test_condo_id, can_access;
        
        -- Intentar contar contratos (esto probará la política RLS)
        DECLARE
            contract_count INTEGER;
        BEGIN
            SELECT COUNT(*) INTO contract_count
            FROM contracts 
            WHERE condo_id = test_condo_id;
            
            RAISE NOTICE 'Contratos accesibles en el condominio: %', contract_count;
            RAISE NOTICE '✅ La política RLS permite el acceso';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error al acceder a contracts: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '❌ No hay condominios para probar';
    END IF;
END $$;

-- =====================================================
-- POLÍTICA RLS ACTUALIZADA EN CONTRACTS
-- =====================================================






