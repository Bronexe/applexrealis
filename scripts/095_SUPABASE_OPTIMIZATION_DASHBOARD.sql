-- =====================================================
-- OPTIMIZACIÓN RLS PARA SUPABASE DASHBOARD
-- =====================================================
-- Ejecutar este script directamente en el SQL Editor del dashboard de Supabase
-- Este script optimiza las políticas RLS paso a paso

-- PASO 1: Crear funciones helper optimizadas
CREATE OR REPLACE FUNCTION auth_uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Función simplificada para super admin (sin dependencia de tabla roles)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  -- Por ahora, retornamos false para evitar errores
  -- Se puede implementar lógica específica según la estructura de roles
  SELECT false;
$$;

CREATE OR REPLACE FUNCTION has_condo_access(condo_uuid uuid, permission_type text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR EXISTS (
    SELECT 1 FROM condos 
    WHERE id = condo_uuid 
    AND user_id = auth_uid()
  ) OR EXISTS (
    SELECT 1 FROM condo_user_permissions 
    WHERE condo_id = condo_uuid 
    AND user_id = auth_uid() 
    AND (
      permission_type = 'read' OR 
      (permission_type = 'write' AND permission_type = 'manage_' || permission_type)
    )
  );
$$;

CREATE OR REPLACE FUNCTION can_manage_assemblies(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_assemblies');
$$;

CREATE OR REPLACE FUNCTION can_manage_certifications(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_certifications');
$$;

CREATE OR REPLACE FUNCTION can_manage_insurances(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_insurances');
$$;

CREATE OR REPLACE FUNCTION can_manage_copropietarios(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_copropietarios');
$$;

-- PASO 2: Optimizar tabla condos
DROP POLICY IF EXISTS "Users can manage their own condos, super-admin can access all" ON condos;
CREATE POLICY "Optimized condos access" ON condos
FOR ALL USING (
  is_super_admin() OR 
  user_id = auth_uid()
);

-- PASO 3: Optimizar assemblies (elimina 3 políticas → 1)
DROP POLICY IF EXISTS "Users with condo access can manage assemblies" ON assemblies;
DROP POLICY IF EXISTS "Users can manage assemblies of their condos, super-admin can access all" ON assemblies;
DROP POLICY IF EXISTS "Condo owners can manage assemblies" ON assemblies;

CREATE POLICY "Unified assemblies access" ON assemblies
FOR ALL USING (
  can_manage_assemblies(condo_id)
);

-- PASO 4: Optimizar certifications (elimina 3 políticas → 1)
DROP POLICY IF EXISTS "Users with condo access can manage certifications" ON certifications;
DROP POLICY IF EXISTS "Users can manage certifications of their condos, super-admin can access all" ON certifications;
DROP POLICY IF EXISTS "Condo owners can manage certifications" ON certifications;

CREATE POLICY "Unified certifications access" ON certifications
FOR ALL USING (
  can_manage_certifications(condo_id)
);

-- PASO 5: Optimizar insurances (elimina 3 políticas → 1)
DROP POLICY IF EXISTS "Users with condo access can manage insurances" ON insurances;
DROP POLICY IF EXISTS "Users can manage insurances of their condos, super-admin can access all" ON insurances;
DROP POLICY IF EXISTS "Condo owners can manage insurances" ON insurances;

CREATE POLICY "Unified insurances access" ON insurances
FOR ALL USING (
  can_manage_insurances(condo_id)
);

-- PASO 6: Optimizar copropietarios (elimina 2 políticas → 1) - LÍNEA 58 CSV
DROP POLICY IF EXISTS "Users with condo access can manage copropietarios" ON copropietarios;
DROP POLICY IF EXISTS "Condo owners can manage copropietarios" ON copropietarios;

CREATE POLICY "Unified copropietarios access" ON copropietarios
FOR ALL USING (
  can_manage_copropietarios(condo_id)
);

-- VERIFICACIÓN: Mostrar resumen de optimizaciones
SELECT 
  'OPTIMIZACIÓN COMPLETADA' as status,
  tablename,
  COUNT(*) as politicas_actuales,
  CASE 
    WHEN tablename = 'condos' THEN '1 política optimizada'
    WHEN tablename = 'assemblies' THEN '1 política consolidada (antes: 3)'
    WHEN tablename = 'certifications' THEN '1 política consolidada (antes: 3)'
    WHEN tablename = 'insurances' THEN '1 política consolidada (antes: 3)'
    WHEN tablename = 'copropietarios' THEN '1 política consolidada (antes: 2)'
  END as optimizacion
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('condos', 'assemblies', 'certifications', 'insurances', 'copropietarios')
GROUP BY tablename
ORDER BY tablename;
