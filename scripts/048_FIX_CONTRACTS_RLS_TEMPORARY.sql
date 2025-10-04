-- =====================================================
-- CORRECCIÓN TEMPORARIA DE RLS EN CONTRACTS
-- =====================================================

-- 1. Eliminar la política RLS problemática
DROP POLICY IF EXISTS "Users with condo access can manage contracts" ON contracts;

-- 2. Crear una política RLS más simple y permisiva
-- Esta política permite a los usuarios insertar contratos en condominios que les pertenecen
CREATE POLICY "Allow contract management for condo owners" ON contracts
FOR ALL USING (
  -- El usuario puede gestionar contratos si:
  -- 1. Es el propietario del condominio, O
  -- 2. Es super admin, O
  -- 3. Tiene permisos específicos en el condominio
  EXISTS (
    SELECT 1 FROM condos 
    WHERE condos.id = contracts.condo_id 
    AND (
      condos.user_id = auth.uid() OR  -- Es propietario del condominio
      auth.email() = 'sebaleon@gmail.com' OR  -- Es super admin
      EXISTS (  -- Tiene permisos específicos
        SELECT 1 FROM condo_user_permissions 
        WHERE condo_user_permissions.condo_id = condos.id 
        AND condo_user_permissions.user_id = auth.uid()
        AND condo_user_permissions.can_manage_contracts = true
      )
    )
  )
);

-- 3. Verificar que RLS está habilitado
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 4. Verificar la nueva política
SELECT 
    'Nueva política RLS en contracts:' as info,
    policyname,
    cmd,
    permissive,
    roles
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

-- =====================================================
-- CORRECCIÓN TEMPORARIA COMPLETADA
-- =====================================================






