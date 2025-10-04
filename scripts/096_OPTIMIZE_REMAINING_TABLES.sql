-- =====================================================
-- OPTIMIZACIÓN DE TABLAS RESTANTES
-- =====================================================
-- Continuamos optimizando las tablas con más alertas de políticas múltiples

-- PASO 1: Optimizar emergency_plans (elimina 3 políticas → 1)
DROP POLICY IF EXISTS "Users with condo access can manage emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Users can manage emergency_plans of their condos, super-admin can access all" ON emergency_plans;
DROP POLICY IF EXISTS "Condo owners can manage emergency_plans" ON emergency_plans;

CREATE OR REPLACE FUNCTION can_manage_emergency_plans(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_emergency_plans');
$$;

CREATE POLICY "Unified emergency_plans access" ON emergency_plans
FOR ALL USING (
  can_manage_emergency_plans(condo_id)
);

-- PASO 2: Optimizar alerts (elimina múltiples políticas → 1)
DROP POLICY IF EXISTS "Users with condo access can view alerts" ON alerts;
DROP POLICY IF EXISTS "Users can view alerts of their condos, super-admin can access all" ON alerts;
DROP POLICY IF EXISTS "Condo owners can view alerts" ON alerts;

CREATE OR REPLACE FUNCTION can_view_alerts(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'view_alerts');
$$;

CREATE POLICY "Unified alerts access" ON alerts
FOR ALL USING (
  can_view_alerts(condo_id)
);

-- PASO 3: Optimizar contracts (elimina múltiples políticas → 1)
DROP POLICY IF EXISTS "Users with condo access can manage contracts" ON contracts;

CREATE OR REPLACE FUNCTION can_manage_contracts(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_contracts');
$$;

CREATE POLICY "Unified contracts access" ON contracts
FOR ALL USING (
  can_manage_contracts(condo_id)
);

-- PASO 4: Optimizar unidades (elimina 2 políticas → 1)
DROP POLICY IF EXISTS "Users with condo access can manage unidades" ON unidades;
DROP POLICY IF EXISTS "Condo owners can manage unidades" ON unidades;

CREATE OR REPLACE FUNCTION can_manage_unidades(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_unidades');
$$;

CREATE POLICY "Unified unidades access" ON unidades
FOR ALL USING (
  can_manage_unidades(condo_id)
);

-- PASO 5: Optimizar unidades_simplified
DROP POLICY IF EXISTS "Condo owners can manage unidades_simplified" ON unidades_simplified;

CREATE POLICY "Unified unidades_simplified access" ON unidades_simplified
FOR ALL USING (
  can_manage_unidades(condo_id)
);

-- PASO 6: Optimizar unidades_historial_simplified
DROP POLICY IF EXISTS "Users with condo access can view unidades_historial_simplified" ON unidades_historial_simplified;
DROP POLICY IF EXISTS "Condo owners can view unidades_historial_simplified" ON unidades_historial_simplified;

CREATE POLICY "Unified unidades_historial_simplified access" ON unidades_historial_simplified
FOR ALL USING (
  can_manage_unidades(condo_id)
);

-- PASO 7: Optimizar archivos_cbr_simplified
DROP POLICY IF EXISTS "Users with condo access can manage archivos_cbr_simplified" ON archivos_cbr_simplified;
DROP POLICY IF EXISTS "Condo owners can manage archivos_cbr_simplified" ON archivos_cbr_simplified;

CREATE POLICY "Unified archivos_cbr_simplified access" ON archivos_cbr_simplified
FOR ALL USING (
  can_manage_unidades(condo_id)
);

-- PASO 8: Optimizar gestiones
DROP POLICY IF EXISTS "Users can manage their own gestiones, super-admin can access all" ON gestiones;

CREATE OR REPLACE FUNCTION can_manage_gestiones(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_gestiones');
$$;

CREATE POLICY "Unified gestiones access" ON gestiones
FOR ALL USING (
  can_manage_gestiones(condo_id)
);

-- PASO 9: Optimizar condo_user_permissions
DROP POLICY IF EXISTS "Condo owners and super admins can manage permissions" ON condo_user_permissions;
DROP POLICY IF EXISTS "Condo owners can manage permissions" ON condo_user_permissions;

CREATE POLICY "Unified condo_user_permissions access" ON condo_user_permissions
FOR ALL USING (
  is_super_admin() OR 
  EXISTS (SELECT 1 FROM condos WHERE id = condo_user_permissions.condo_id AND user_id = auth_uid())
);

-- PASO 10: Optimizar rules (elimina política duplicada)
DROP POLICY IF EXISTS "Authenticated users can read rules" ON rules;
-- Mantener solo "Everyone can read rules" que es más amplia

-- VERIFICACIÓN FINAL
SELECT 
  'OPTIMIZACIÓN COMPLETADA - TABLAS RESTANTES' as status,
  tablename,
  COUNT(*) as politicas_actuales,
  CASE 
    WHEN tablename = 'emergency_plans' THEN '1 política consolidada (antes: 3)'
    WHEN tablename = 'alerts' THEN '1 política consolidada (antes: múltiples)'
    WHEN tablename = 'contracts' THEN '1 política consolidada (antes: múltiples)'
    WHEN tablename = 'unidades' THEN '1 política consolidada (antes: 2)'
    WHEN tablename = 'unidades_simplified' THEN '1 política consolidada'
    WHEN tablename = 'unidades_historial_simplified' THEN '1 política consolidada (antes: 2)'
    WHEN tablename = 'archivos_cbr_simplified' THEN '1 política consolidada (antes: 2)'
    WHEN tablename = 'gestiones' THEN '1 política consolidada'
    WHEN tablename = 'condo_user_permissions' THEN '1 política consolidada (antes: 2)'
    WHEN tablename = 'rules' THEN '1 política (eliminada duplicada)'
    ELSE 'Verificar manualmente'
  END as optimizacion
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'emergency_plans', 'alerts', 'contracts', 'unidades', 
  'unidades_simplified', 'unidades_historial_simplified',
  'archivos_cbr_simplified', 'gestiones', 'condo_user_permissions', 'rules'
)
GROUP BY tablename
ORDER BY tablename;



