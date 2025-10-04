    -- =====================================================
    -- DEBUGGING RLS INSERT EN CONTRACTS
    -- =====================================================

    -- 1. Verificar la función user_can_access_condo
    SELECT 
        'Verificando función user_can_access_condo:' as info,
        routine_name,
        routine_type,
        data_type as return_type
    FROM information_schema.routines 
    WHERE routine_name = 'user_can_access_condo'
        AND routine_schema = 'public';

    -- 2. Verificar políticas RLS actuales en contracts
    SELECT 
        'Políticas RLS actuales en contracts:' as info,
        policyname,
        cmd,
        permissive,
        roles,
        qual,
        with_check
    FROM pg_policies 
    WHERE tablename = 'contracts' 
        AND schemaname = 'public'
    ORDER BY policyname;

    -- 3. Verificar usuario actual
    SELECT 
        'Usuario actual:' as info,
        auth.uid() as user_id,
        auth.email() as user_email;

    -- 4. Verificar condominios accesibles por el usuario actual
    SELECT 
        'Condominios accesibles:' as info,
        id,
        name,
        user_id,
        CASE 
            WHEN user_id = auth.uid() THEN '✅ Propietario'
            ELSE '❌ No propietario'
        END as ownership_status
    FROM condos 
    WHERE user_id = auth.uid()
    ORDER BY name;

    -- 5. Probar la función user_can_access_condo con un condominio específico
    DO $$ 
    DECLARE
        test_condo_id UUID;
        test_result BOOLEAN;
    BEGIN
        -- Obtener el primer condominio del usuario actual
        SELECT id INTO test_condo_id 
        FROM condos 
        WHERE user_id = auth.uid() 
        LIMIT 1;
        
        IF test_condo_id IS NOT NULL THEN
            -- Probar la función
            SELECT user_can_access_condo(auth.uid(), test_condo_id) INTO test_result;
            
            RAISE NOTICE '=== PRUEBA DE FUNCIÓN user_can_access_condo ===';
            RAISE NOTICE 'Usuario actual: %', auth.uid();
            RAISE NOTICE 'Condominio de prueba: %', test_condo_id;
            RAISE NOTICE 'Resultado de user_can_access_condo: %', test_result;
            
            IF test_result THEN
                RAISE NOTICE '✅ La función devuelve TRUE - el usuario PUEDE acceder al condominio';
            ELSE
                RAISE NOTICE '❌ La función devuelve FALSE - el usuario NO PUEDE acceder al condominio';
            END IF;
        ELSE
            RAISE NOTICE '❌ No se encontraron condominios para el usuario actual';
        END IF;
    END $$;

    -- 6. Verificar si hay problemas con la función user_can_access_condo
    SELECT 
        'Definición de la función user_can_access_condo:' as info,
        pg_get_functiondef(oid) as function_definition
    FROM pg_proc 
    WHERE proname = 'user_can_access_condo'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

    -- =====================================================
    -- DEBUGGING COMPLETADO
    -- =====================================================






