-- =====================================================
-- SOLUCIÓN DEFINITIVA: ACCESO SUPER-ADMIN A TODOS LOS CONDOMINIOS
-- =====================================================
-- Este script corrige las políticas RLS para permitir que el super-admin
-- pueda ver, acceder y editar todos los condominios del sistema

-- 1. Verificar que la función is_super_admin existe
SELECT 
    'Verificando función is_super_admin:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_super_admin') 
        THEN '✅ Función existe'
        ELSE '❌ Función NO existe - ejecutar scripts/033_FIX_ISSUPERADMIN_FUNCTION.sql primero'
    END as status;

-- 2. Mostrar políticas actuales para condos
SELECT 
    'Políticas actuales para tabla condos:' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'condos' AND schemaname = 'public';

-- 3. Eliminar políticas existentes de condos
DROP POLICY IF EXISTS "Users can manage their own condos" ON condos;
DROP POLICY IF EXISTS "Users can manage condos they own or have permissions for" ON condos;

-- 4. Crear nueva política que permite acceso completo al super-admin
CREATE POLICY "Users can manage their own condos, super-admin can access all" ON condos
FOR ALL USING (
    auth.uid() = user_id OR 
    is_super_admin()
);

-- 5. Aplicar la misma lógica a todas las tablas relacionadas
-- ASSEMBLIES
DROP POLICY IF EXISTS "Users can manage assemblies of their condos" ON assemblies;
DROP POLICY IF EXISTS "Users can manage assemblies of condos they have access to" ON assemblies;

CREATE POLICY "Users can manage assemblies of their condos, super-admin can access all" ON assemblies
FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM condos WHERE id = assemblies.condo_id) OR
    is_super_admin()
);

-- EMERGENCY_PLANS
DROP POLICY IF EXISTS "Users can manage emergency_plans of their condos" ON emergency_plans;
DROP POLICY IF EXISTS "Users can manage emergency_plans of condos they have access to" ON emergency_plans;

CREATE POLICY "Users can manage emergency_plans of their condos, super-admin can access all" ON emergency_plans
FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM condos WHERE id = emergency_plans.condo_id) OR
    is_super_admin()
);

-- CERTIFICATIONS
DROP POLICY IF EXISTS "Users can manage certifications of their condos" ON certifications;
DROP POLICY IF EXISTS "Users can manage certifications of condos they have access to" ON certifications;

CREATE POLICY "Users can manage certifications of their condos, super-admin can access all" ON certifications
FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM condos WHERE id = certifications.condo_id) OR
    is_super_admin()
);

-- INSURANCES
DROP POLICY IF EXISTS "Users can manage insurances of their condos" ON insurances;
DROP POLICY IF EXISTS "Users can manage insurances of condos they have access to" ON insurances;

CREATE POLICY "Users can manage insurances of their condos, super-admin can access all" ON insurances
FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM condos WHERE id = insurances.condo_id) OR
    is_super_admin()
);

-- ALERTS
DROP POLICY IF EXISTS "Users can view alerts of their condos" ON alerts;
DROP POLICY IF EXISTS "Users can view alerts of condos they have access to" ON alerts;

CREATE POLICY "Users can view alerts of their condos, super-admin can access all" ON alerts
FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM condos WHERE id = alerts.condo_id) OR
    is_super_admin()
);

-- 6. Verificar que RLS está habilitado en todas las tablas
SELECT 
    'Verificando RLS habilitado:' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances', 'alerts')
ORDER BY tablename;

-- 7. Mostrar las nuevas políticas creadas
SELECT 
    'Nuevas políticas creadas:' as info,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances', 'alerts')
ORDER BY tablename, policyname;

-- 8. Test de la función is_super_admin
SELECT 
    'Test función is_super_admin:' as test,
    is_super_admin() as result,
    auth.uid() as current_user_id;

-- 9. Test de acceso a condos (debería mostrar todos si es super-admin)
SELECT 
    'Test acceso a condos:' as test,
    COUNT(*) as total_condos_visibles,
    COUNT(DISTINCT user_id) as propietarios_diferentes
FROM condos;

-- =====================================================
-- SOLUCIÓN APLICADA - SUPER-ADMIN AHORA PUEDE ACCEDER A TODOS LOS CONDOMINIOS
-- =====================================================





