-- =====================================================
-- SCRIPT PARA ELIMINAR TODAS LAS TABLAS EXISTENTES
-- =====================================================

-- IMPORTANTE: Este script eliminará TODOS los datos existentes
-- Asegúrate de hacer backup si tienes datos importantes

-- Deshabilitar RLS temporalmente para poder eliminar las políticas
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS condos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS condo_user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assemblies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insurances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS copropietarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unidades_simplified DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unidades_historial_simplified DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archivos_cbr_simplified DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_settings DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas RLS del nuevo esquema (solo si las tablas existen)
-- Roles y User Roles
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        DROP POLICY IF EXISTS "Super admins can manage roles" ON roles;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        DROP POLICY IF EXISTS "Super admins can manage user roles" ON user_roles;
    END IF;
END $$;

-- Condos y Permisos
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condos') THEN
        DROP POLICY IF EXISTS "Users can manage condos they own or have permissions for" ON condos;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condo_user_permissions') THEN
        DROP POLICY IF EXISTS "Super admins and owners can manage condo permissions" ON condo_user_permissions;
    END IF;
END $$;

-- Módulos del condominio
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assemblies') THEN
        DROP POLICY IF EXISTS "Users can manage assemblies of condos they have access to" ON assemblies;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emergency_plans') THEN
        DROP POLICY IF EXISTS "Users can manage emergency_plans of condos they have access to" ON emergency_plans;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certifications') THEN
        DROP POLICY IF EXISTS "Users can manage certifications of condos they have access to" ON certifications;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurances') THEN
        DROP POLICY IF EXISTS "Users can manage insurances of condos they have access to" ON insurances;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts') THEN
        DROP POLICY IF EXISTS "Users can manage contracts of condos they have access to" ON contracts;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'copropietarios') THEN
        DROP POLICY IF EXISTS "Users can manage copropietarios of condos they have access to" ON copropietarios;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unidades_simplified') THEN
        DROP POLICY IF EXISTS "Users can manage unidades_simplified of condos they have access to" ON unidades_simplified;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unidades_historial_simplified') THEN
        DROP POLICY IF EXISTS "Users can view unidades_historial_simplified of condos they have access to" ON unidades_historial_simplified;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'archivos_cbr_simplified') THEN
        DROP POLICY IF EXISTS "Users can manage archivos_cbr_simplified of condos they have access to" ON archivos_cbr_simplified;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unidades') THEN
        DROP POLICY IF EXISTS "Users can manage unidades of condos they have access to" ON unidades;
    END IF;
END $$;

-- Alertas y Reglas
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        DROP POLICY IF EXISTS "Users can view alerts of condos they have access to" ON alerts;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
        DROP POLICY IF EXISTS "Authenticated users can view rules" ON rules;
    END IF;
END $$;

-- Configuraciones de usuario
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_templates') THEN
        DROP POLICY IF EXISTS "Users can manage their own report templates" ON report_templates;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_settings') THEN
        DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;
    END IF;
END $$;

-- Políticas antiguas (por compatibilidad) - Solo si las tablas existen
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condos') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view condos" ON condos;
        DROP POLICY IF EXISTS "Allow authenticated users to insert condos" ON condos;
        DROP POLICY IF EXISTS "Allow authenticated users to update condos" ON condos;
        DROP POLICY IF EXISTS "Allow authenticated users to delete condos" ON condos;
        DROP POLICY IF EXISTS "Users can manage their own condos" ON condos;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assemblies') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view assemblies" ON assemblies;
        DROP POLICY IF EXISTS "Allow authenticated users to insert assemblies" ON assemblies;
        DROP POLICY IF EXISTS "Allow authenticated users to update assemblies" ON assemblies;
        DROP POLICY IF EXISTS "Allow authenticated users to delete assemblies" ON assemblies;
        DROP POLICY IF EXISTS "Users can manage assemblies of their condos" ON assemblies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emergency_plans') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view emergency_plans" ON emergency_plans;
        DROP POLICY IF EXISTS "Allow authenticated users to insert emergency_plans" ON emergency_plans;
        DROP POLICY IF EXISTS "Allow authenticated users to update emergency_plans" ON emergency_plans;
        DROP POLICY IF EXISTS "Allow authenticated users to delete emergency_plans" ON emergency_plans;
        DROP POLICY IF EXISTS "Users can manage emergency_plans of their condos" ON emergency_plans;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certifications') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view certifications" ON certifications;
        DROP POLICY IF EXISTS "Allow authenticated users to insert certifications" ON certifications;
        DROP POLICY IF EXISTS "Allow authenticated users to update certifications" ON certifications;
        DROP POLICY IF EXISTS "Allow authenticated users to delete certifications" ON certifications;
        DROP POLICY IF EXISTS "Users can manage certifications of their condos" ON certifications;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurances') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view insurances" ON insurances;
        DROP POLICY IF EXISTS "Allow authenticated users to insert insurances" ON insurances;
        DROP POLICY IF EXISTS "Allow authenticated users to update insurances" ON insurances;
        DROP POLICY IF EXISTS "Allow authenticated users to delete insurances" ON insurances;
        DROP POLICY IF EXISTS "Users can manage insurances of their condos" ON insurances;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view alerts" ON alerts;
        DROP POLICY IF EXISTS "Allow authenticated users to insert alerts" ON alerts;
        DROP POLICY IF EXISTS "Allow authenticated users to update alerts" ON alerts;
        DROP POLICY IF EXISTS "Allow authenticated users to delete alerts" ON alerts;
        DROP POLICY IF EXISTS "Users can view alerts of their condos" ON alerts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view rules" ON rules;
    END IF;
END $$;

-- Eliminar restricciones
ALTER TABLE IF EXISTS assemblies DROP CONSTRAINT IF EXISTS assemblies_type_check;
ALTER TABLE IF EXISTS certifications DROP CONSTRAINT IF EXISTS certifications_kind_check;
ALTER TABLE IF EXISTS alerts DROP CONSTRAINT IF EXISTS alerts_status_check;
ALTER TABLE IF EXISTS insurances DROP CONSTRAINT IF EXISTS check_insurance_type;
ALTER TABLE IF EXISTS condos DROP CONSTRAINT IF EXISTS check_destino_uso;
ALTER TABLE IF EXISTS contracts DROP CONSTRAINT IF EXISTS contracts_contract_type_check;
ALTER TABLE IF EXISTS contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE IF EXISTS copropietarios DROP CONSTRAINT IF EXISTS copropietarios_estado_check;
ALTER TABLE IF EXISTS unidades_simplified DROP CONSTRAINT IF EXISTS unidades_simplified_titular_tipo_check;
ALTER TABLE IF EXISTS unidades_historial_simplified DROP CONSTRAINT IF EXISTS unidades_historial_simplified_action_type_check;
ALTER TABLE IF EXISTS archivos_cbr_simplified DROP CONSTRAINT IF EXISTS archivos_cbr_simplified_tipo_archivo_check;
ALTER TABLE IF EXISTS unidades DROP CONSTRAINT IF EXISTS unidades_tipo_check;
ALTER TABLE IF EXISTS unidades DROP CONSTRAINT IF EXISTS unidades_estado_check;

-- Eliminar índices
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_user_roles_role_id;
DROP INDEX IF EXISTS idx_condos_user_id;
DROP INDEX IF EXISTS idx_condos_destino_uso;
DROP INDEX IF EXISTS idx_condo_user_permissions_condo_id;
DROP INDEX IF EXISTS idx_condo_user_permissions_user_id;
DROP INDEX IF EXISTS idx_assemblies_condo_id;
DROP INDEX IF EXISTS idx_assemblies_user_id;
DROP INDEX IF EXISTS idx_emergency_plans_condo_id;
DROP INDEX IF EXISTS idx_emergency_plans_user_id;
DROP INDEX IF EXISTS idx_certifications_condo_id;
DROP INDEX IF EXISTS idx_certifications_user_id;
DROP INDEX IF EXISTS idx_insurances_condo_id;
DROP INDEX IF EXISTS idx_insurances_user_id;
DROP INDEX IF EXISTS idx_insurances_insurance_type;
DROP INDEX IF EXISTS idx_contracts_condo_id;
DROP INDEX IF EXISTS idx_contracts_user_id;
DROP INDEX IF EXISTS idx_contracts_status;
DROP INDEX IF EXISTS idx_copropietarios_condo_id;
DROP INDEX IF EXISTS idx_copropietarios_user_id;
DROP INDEX IF EXISTS idx_copropietarios_rut;
DROP INDEX IF EXISTS idx_unidades_simplified_condo_id;
DROP INDEX IF EXISTS idx_unidades_simplified_user_id;
DROP INDEX IF EXISTS idx_unidades_simplified_unidad_codigo;
DROP INDEX IF EXISTS idx_unidades_historial_simplified_unidad_id;
DROP INDEX IF EXISTS idx_unidades_historial_simplified_condo_id;
DROP INDEX IF EXISTS idx_archivos_cbr_simplified_unidad_id;
DROP INDEX IF EXISTS idx_archivos_cbr_simplified_condo_id;
DROP INDEX IF EXISTS idx_archivos_cbr_simplified_tipo;
DROP INDEX IF EXISTS idx_unidades_condo_id;
DROP INDEX IF EXISTS idx_unidades_user_id;
DROP INDEX IF EXISTS idx_alerts_condo_id;
DROP INDEX IF EXISTS idx_alerts_rule_id;
DROP INDEX IF EXISTS idx_user_settings_user_id;
DROP INDEX IF EXISTS idx_report_templates_user_id;
DROP INDEX IF EXISTS idx_notification_settings_user_id;

-- Eliminar todas las tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS rules CASCADE;
DROP TABLE IF EXISTS archivos_cbr_simplified CASCADE;
DROP TABLE IF EXISTS unidades_historial_simplified CASCADE;
DROP TABLE IF EXISTS unidades_simplified CASCADE;
DROP TABLE IF EXISTS unidades CASCADE;
DROP TABLE IF EXISTS copropietarios CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS insurances CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS emergency_plans CASCADE;
DROP TABLE IF EXISTS assemblies CASCADE;
DROP TABLE IF EXISTS condo_user_permissions CASCADE;
DROP TABLE IF EXISTS condos CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Eliminar funciones SQL
DROP FUNCTION IF EXISTS clear_all_unidades_aggressive(UUID);
DROP FUNCTION IF EXISTS log_copropietarios_clear_all(UUID, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS log_copropietarios_change(UUID, TEXT, TEXT, JSONB);

-- Eliminar archivos del bucket evidence primero
DELETE FROM storage.objects WHERE bucket_id = 'evidence';

-- Eliminar el bucket de storage si existe
DELETE FROM storage.buckets WHERE id = 'evidence';

-- Eliminar políticas de storage
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files to evidence bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in evidence bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in evidence bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in evidence bucket" ON storage.objects;

-- =====================================================
-- FIN DEL SCRIPT DE ELIMINACIÓN
-- =====================================================
