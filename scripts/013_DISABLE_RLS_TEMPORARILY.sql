-- =====================================================
-- SCRIPT PARA DESHABILITAR RLS TEMPORALMENTE
-- =====================================================

-- Este script deshabilita RLS en todas las tablas para permitir acceso completo
-- Útil para debugging y verificar que las tablas funcionan correctamente

-- DESHABILITAR RLS EN TODAS LAS TABLAS
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

-- ELIMINAR TODAS LAS POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can manage their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can manage their own condos" ON condos;
DROP POLICY IF EXISTS "Condo owners can manage permissions" ON condo_user_permissions;
DROP POLICY IF EXISTS "Condo owners can manage assemblies" ON assemblies;
DROP POLICY IF EXISTS "Condo owners can manage emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Condo owners can manage certifications" ON certifications;
DROP POLICY IF EXISTS "Condo owners can manage insurances" ON insurances;
DROP POLICY IF EXISTS "Condo owners can manage contracts" ON contracts;
DROP POLICY IF EXISTS "Condo owners can manage copropietarios" ON copropietarios;
DROP POLICY IF EXISTS "Condo owners can manage unidades_simplified" ON unidades_simplified;
DROP POLICY IF EXISTS "Condo owners can view unidades_historial_simplified" ON unidades_historial_simplified;
DROP POLICY IF EXISTS "Condo owners can manage archivos_cbr_simplified" ON archivos_cbr_simplified;
DROP POLICY IF EXISTS "Condo owners can manage unidades" ON unidades;
DROP POLICY IF EXISTS "Condo owners can view alerts" ON alerts;
DROP POLICY IF EXISTS "Everyone can read rules" ON rules;
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can manage their own report templates" ON report_templates;
DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;

-- ELIMINAR FUNCIÓN PROBLEMÁTICA
DROP FUNCTION IF EXISTS is_super_admin(UUID);

-- =====================================================
-- NOTA: RLS DESHABILITADO TEMPORALMENTE
-- =====================================================
-- Este script deshabilita la seguridad RLS para permitir acceso completo
-- a todas las tablas. Úsalo solo para debugging.
-- 
-- Para re-habilitar RLS más tarde, ejecuta:
-- ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
-- =====================================================










