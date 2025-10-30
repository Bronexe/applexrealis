-- =====================================================
-- RECREAR TODAS LAS POLÍTICAS RLS ELIMINADAS POR CASCADE
-- =====================================================

-- 1. Recrear política RLS para assemblies
CREATE POLICY "Users with condo access can manage assemblies" ON assemblies
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 2. Recrear política RLS para emergency_plans
CREATE POLICY "Users with condo access can manage emergency_plans" ON emergency_plans
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 3. Recrear política RLS para certifications
CREATE POLICY "Users with condo access can manage certifications" ON certifications
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 4. Recrear política RLS para insurances
CREATE POLICY "Users with condo access can manage insurances" ON insurances
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 5. Recrear política RLS para copropietarios
CREATE POLICY "Users with condo access can manage copropietarios" ON copropietarios
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 6. Recrear política RLS para unidades_historial_simplified
CREATE POLICY "Users with condo access can view unidades_historial_simplified" ON unidades_historial_simplified
FOR SELECT USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 7. Recrear política RLS para archivos_cbr_simplified
CREATE POLICY "Users with condo access can manage archivos_cbr_simplified" ON archivos_cbr_simplified
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 8. Recrear política RLS para unidades
CREATE POLICY "Users with condo access can manage unidades" ON unidades
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 9. Recrear política RLS para alerts
CREATE POLICY "Users with condo access can view alerts" ON alerts
FOR SELECT USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 10. Recrear política RLS para contracts
CREATE POLICY "Users with condo access can manage contracts" ON contracts
FOR ALL USING (
  user_can_access_condo(condo_id, auth.uid())
);

-- 11. Verificar que todas las políticas fueron recreadas
SELECT 
    'Políticas RLS recreadas:' as info,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public'
    AND (policyname LIKE '%condo access%' OR policyname LIKE '%Users with condo access%')
ORDER BY tablename, policyname;

-- 12. Verificar que RLS está habilitado en todas las tablas relevantes
SELECT 
    'Estado de RLS en tablas:' as info,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status
FROM pg_tables 
WHERE tablename IN (
    'assemblies', 'emergency_plans', 'certifications', 'insurances', 
    'copropietarios', 'unidades_historial_simplified', 'archivos_cbr_simplified', 
    'unidades', 'alerts', 'contracts'
)
AND schemaname = 'public'
ORDER BY tablename;

-- 13. Probar la función con el usuario actual
DO $$ 
DECLARE
    test_condo_id UUID;
    test_result BOOLEAN;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    RAISE NOTICE '=== PRUEBA DE FUNCIÓN user_can_access_condo RECREADA ===';
    RAISE NOTICE 'Usuario actual: %', current_user_id;
    
    -- Obtener el primer condominio del usuario actual
    SELECT id INTO test_condo_id 
    FROM condos 
    WHERE user_id = current_user_id 
    LIMIT 1;
    
    IF test_condo_id IS NOT NULL THEN
        -- Probar la función
        SELECT user_can_access_condo(test_condo_id, current_user_id) INTO test_result;
        RAISE NOTICE 'Condominio de prueba: %', test_condo_id;
        RAISE NOTICE 'Resultado de user_can_access_condo: %', test_result;
        
        IF test_result THEN
            RAISE NOTICE '✅ La función funciona correctamente - el usuario PUEDE acceder al condominio';
        ELSE
            RAISE NOTICE '❌ La función devuelve FALSE - el usuario NO PUEDE acceder al condominio';
        END IF;
    ELSE
        RAISE NOTICE '❌ No se encontraron condominios para el usuario actual';
    END IF;
END $$;

-- =====================================================
-- TODAS LAS POLÍTICAS RLS RECREADAS
-- =====================================================









