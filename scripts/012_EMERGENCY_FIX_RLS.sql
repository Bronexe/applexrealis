-- =====================================================
-- SCRIPT DE EMERGENCIA PARA CORREGIR RLS
-- =====================================================

-- Este script deshabilita temporalmente RLS para poder corregir las políticas

-- 1. DESHABILITAR RLS TEMPORALMENTE EN TODAS LAS TABLAS
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE condos DISABLE ROW LEVEL SECURITY;
ALTER TABLE condo_user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurances DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE copropietarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_simplified DISABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_historial_simplified DISABLE ROW LEVEL SECURITY;
ALTER TABLE archivos_cbr_simplified DISABLE ROW LEVEL SECURITY;
ALTER TABLE unidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
-- Roles
DROP POLICY IF EXISTS "Super admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can manage user roles" ON user_roles;

-- Condos
DROP POLICY IF EXISTS "Users can manage condos they own or have permissions for" ON condos;

-- Condo User Permissions
DROP POLICY IF EXISTS "Super admins and owners can manage condo permissions" ON condo_user_permissions;

-- Módulos
DROP POLICY IF EXISTS "Users can manage assemblies of condos they have access to" ON assemblies;
DROP POLICY IF EXISTS "Users can manage emergency_plans of condos they have access to" ON emergency_plans;
DROP POLICY IF EXISTS "Users can manage certifications of condos they have access to" ON certifications;
DROP POLICY IF EXISTS "Users can manage insurances of condos they have access to" ON insurances;
DROP POLICY IF EXISTS "Users can manage contracts of condos they have access to" ON contracts;
DROP POLICY IF EXISTS "Users can manage copropietarios of condos they have access to" ON copropietarios;
DROP POLICY IF EXISTS "Users can manage unidades_simplified of condos they have access to" ON unidades_simplified;
DROP POLICY IF EXISTS "Users can view unidades_historial_simplified of condos they have access to" ON unidades_historial_simplified;
DROP POLICY IF EXISTS "Users can manage archivos_cbr_simplified of condos they have access to" ON archivos_cbr_simplified;
DROP POLICY IF EXISTS "Users can manage unidades of condos they have access to" ON unidades;

-- Alertas y Reglas
DROP POLICY IF EXISTS "Users can view alerts of condos they have access to" ON alerts;
DROP POLICY IF EXISTS "Authenticated users can view rules" ON rules;

-- Configuraciones de usuario
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can manage their own report templates" ON report_templates;
DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;

-- 3. ELIMINAR FUNCIÓN PROBLEMÁTICA SI EXISTE
DROP FUNCTION IF EXISTS is_super_admin(UUID);

-- 4. CREAR FUNCIÓN HELPER SIMPLE
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = is_super_admin.user_id 
      AND ur.role_id = 'super_admin' 
      AND ur.is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREAR POLÍTICAS SIMPLES SIN RECURSIÓN

-- USER_ROLES - Políticas simples
CREATE POLICY "Users can manage their own roles" ON user_roles
FOR ALL USING (auth.uid() = user_id);

-- CONDOS - Política simple
CREATE POLICY "Users can manage their own condos" ON condos
FOR ALL USING (auth.uid() = user_id);

-- CONDO_USER_PERMISSIONS - Solo propietarios del condominio
CREATE POLICY "Condo owners can manage permissions" ON condo_user_permissions
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = condo_user_permissions.condo_id
  )
);

-- MÓDULOS - Solo propietarios del condominio
CREATE POLICY "Condo owners can manage assemblies" ON assemblies
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = assemblies.condo_id
  )
);

CREATE POLICY "Condo owners can manage emergency_plans" ON emergency_plans
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = emergency_plans.condo_id
  )
);

CREATE POLICY "Condo owners can manage certifications" ON certifications
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = certifications.condo_id
  )
);

CREATE POLICY "Condo owners can manage insurances" ON insurances
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = insurances.condo_id
  )
);

CREATE POLICY "Condo owners can manage contracts" ON contracts
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = contracts.condo_id
  )
);

CREATE POLICY "Condo owners can manage copropietarios" ON copropietarios
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = copropietarios.condo_id
  )
);

CREATE POLICY "Condo owners can manage unidades_simplified" ON unidades_simplified
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades_simplified.condo_id
  )
);

CREATE POLICY "Condo owners can view unidades_historial_simplified" ON unidades_historial_simplified
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades_historial_simplified.condo_id
  )
);

CREATE POLICY "Condo owners can manage archivos_cbr_simplified" ON archivos_cbr_simplified
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = archivos_cbr_simplified.condo_id
  )
);

CREATE POLICY "Condo owners can manage unidades" ON unidades
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades.condo_id
  )
);

CREATE POLICY "Condo owners can view alerts" ON alerts
FOR ALL USING (
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = alerts.condo_id
  )
);

-- RULES - Todos pueden leer
CREATE POLICY "Everyone can read rules" ON rules
FOR SELECT USING (true);

-- CONFIGURACIONES DE USUARIO - Solo el propietario
CREATE POLICY "Users can manage their own settings" ON user_settings
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own report templates" ON report_templates
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification settings" ON notification_settings
FOR ALL USING (auth.uid() = user_id);

-- 6. HABILITAR RLS NUEVAMENTE
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE condos ENABLE ROW LEVEL SECURITY;
ALTER TABLE condo_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE copropietarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_simplified ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_historial_simplified ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos_cbr_simplified ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIN DEL SCRIPT DE EMERGENCIA
-- =====================================================







