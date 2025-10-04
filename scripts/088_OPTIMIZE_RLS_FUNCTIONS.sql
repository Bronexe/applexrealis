-- =====================================================
-- OPTIMIZACIÓN DE FUNCIONES RLS PARA MEJORAR RENDIMIENTO
-- =====================================================
-- Este script optimiza las funciones auth para evitar re-evaluación en cada fila
-- y crea funciones helper para simplificar las políticas RLS

-- 1. Función optimizada para obtener auth.uid()
-- Esta función es STABLE, lo que permite al planner optimizar mejor las consultas
CREATE OR REPLACE FUNCTION auth_uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- 2. Función para verificar si un usuario es super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth_uid() 
    AND role = 'super_admin'
  );
$$;

-- 3. Función para verificar acceso a un condominio específico
CREATE OR REPLACE FUNCTION has_condo_access(condo_uuid uuid, permission_type text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth_uid() 
    AND role = 'super_admin'
  ) OR EXISTS (
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

-- 4. Función para verificar acceso de lectura a un condominio
CREATE OR REPLACE FUNCTION can_read_condo(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT has_condo_access(condo_uuid, 'read');
$$;

-- 5. Función para verificar acceso de escritura a un condominio
CREATE OR REPLACE FUNCTION can_manage_condo(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT has_condo_access(condo_uuid, 'write');
$$;

-- 6. Función específica para verificar acceso a assemblies
CREATE OR REPLACE FUNCTION can_manage_assemblies(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_assemblies');
$$;

-- 7. Función específica para verificar acceso a certifications
CREATE OR REPLACE FUNCTION can_manage_certifications(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_certifications');
$$;

-- 8. Función específica para verificar acceso a insurances
CREATE OR REPLACE FUNCTION can_manage_insurances(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_insurances');
$$;

-- 9. Función específica para verificar acceso a copropietarios
CREATE OR REPLACE FUNCTION can_manage_copropietarios(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_copropietarios');
$$;

-- 10. Función específica para verificar acceso a emergency_plans
CREATE OR REPLACE FUNCTION can_manage_emergency_plans(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_emergency_plans');
$$;

-- 11. Función específica para verificar acceso a alerts
CREATE OR REPLACE FUNCTION can_view_alerts(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'view_alerts');
$$;

-- 12. Función específica para verificar acceso a contracts
CREATE OR REPLACE FUNCTION can_manage_contracts(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_contracts');
$$;

-- 13. Función específica para verificar acceso a unidades
CREATE OR REPLACE FUNCTION can_manage_unidades(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_unidades');
$$;

-- 14. Función específica para verificar acceso a gestiones
CREATE OR REPLACE FUNCTION can_manage_gestiones(condo_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT is_super_admin() OR has_condo_access(condo_uuid, 'manage_gestiones');
$$;

-- Comentarios para documentación
COMMENT ON FUNCTION auth_uid() IS 'Función optimizada para obtener auth.uid() evitando re-evaluación en cada fila';
COMMENT ON FUNCTION is_super_admin() IS 'Verifica si el usuario actual es super administrador';
COMMENT ON FUNCTION has_condo_access(uuid, text) IS 'Verifica acceso general a un condominio con tipo de permiso específico';
COMMENT ON FUNCTION can_read_condo(uuid) IS 'Verifica acceso de lectura a un condominio';
COMMENT ON FUNCTION can_manage_condo(uuid) IS 'Verifica acceso de escritura a un condominio';
COMMENT ON FUNCTION can_manage_assemblies(uuid) IS 'Verifica acceso específico para gestionar assemblies';
COMMENT ON FUNCTION can_manage_certifications(uuid) IS 'Verifica acceso específico para gestionar certifications';
COMMENT ON FUNCTION can_manage_insurances(uuid) IS 'Verifica acceso específico para gestionar insurances';
COMMENT ON FUNCTION can_manage_copropietarios(uuid) IS 'Verifica acceso específico para gestionar copropietarios';
COMMENT ON FUNCTION can_manage_emergency_plans(uuid) IS 'Verifica acceso específico para gestionar emergency_plans';
COMMENT ON FUNCTION can_view_alerts(uuid) IS 'Verifica acceso específico para ver alerts';
COMMENT ON FUNCTION can_manage_contracts(uuid) IS 'Verifica acceso específico para gestionar contracts';
COMMENT ON FUNCTION can_manage_unidades(uuid) IS 'Verifica acceso específico para gestionar unidades';
COMMENT ON FUNCTION can_manage_gestiones(uuid) IS 'Verifica acceso específico para gestionar gestiones';



