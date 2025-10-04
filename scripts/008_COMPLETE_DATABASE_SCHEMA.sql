-- =====================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS PARA SISTEMA DE ROLES Y PERMISOS
-- =====================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLA DE ROLES DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA DE USUARIOS CON ROLES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role_id)
);

-- =====================================================
-- 3. TABLA CONDOS (ACTUALIZADA CON ROLES)
-- =====================================================
CREATE TABLE IF NOT EXISTS condos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  region_id TEXT,
  commune_id TEXT,
  comuna TEXT,
  destino_uso TEXT CHECK (destino_uso IN (
    'habitacional',
    'oficinas',
    'local-comercial',
    'bodegaje',
    'estacionamientos',
    'recintos-industriales',
    'sitios-urbanizados'
  )),
  cantidad_copropietarios INTEGER,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA DE PERMISOS DE USUARIOS EN CONDOMINIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS condo_user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(condo_id, user_id)
);

-- =====================================================
-- 5. TABLA ASSEMBLIES (ASAMBLEAS)
-- =====================================================
CREATE TABLE IF NOT EXISTS assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ordinaria', 'extraordinaria')),
  date DATE NOT NULL,
  act_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA EMERGENCY_PLANS (PLANES DE EMERGENCIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS emergency_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version TEXT,
  professional_name TEXT,
  updated_at DATE NOT NULL,
  plan_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at_ts TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA CERTIFICATIONS (CERTIFICACIONES)
-- =====================================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('gas', 'ascensor', 'otros')),
  valid_from DATE,
  valid_to DATE,
  cert_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. TABLA INSURANCES (SEGUROS)
-- =====================================================
CREATE TABLE IF NOT EXISTS insurances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number TEXT,
  insurer TEXT,
  insurance_type TEXT NOT NULL CHECK (insurance_type IN (
    'incendio-espacios-comunes',
    'os10-vigilantes-guardias',
    'sismos',
    'responsabilidad-civil',
    'hogar'
  )),
  valid_from DATE,
  valid_to DATE,
  policy_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TABLA CONTRACTS (CONTRATOS)
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN (
    'administracion',
    'mantenimiento',
    'limpieza',
    'seguridad',
    'jardineria',
    'otros'
  )),
  provider_name TEXT NOT NULL,
  contract_number TEXT,
  start_date DATE,
  end_date DATE,
  amount DECIMAL(15,2),
  currency TEXT DEFAULT 'CLP',
  contract_file_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. TABLA COPROPIETARIOS (COPROPIETARIOS) - ESTRUCTURA SIMPLIFICADA
-- =====================================================
CREATE TABLE IF NOT EXISTS copropietarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rut TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido_paterno TEXT,
  apellido_materno TEXT,
  email TEXT,
  telefono TEXT,
  unidad TEXT,
  alicuota DECIMAL(5,4),
  fecha_ingreso DATE,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(condo_id, rut)
);

-- =====================================================
-- 10B. TABLA UNIDADES_SIMPLIFIED (SISTEMA DE COPROPIETARIOS COMPLETO)
-- =====================================================
CREATE TABLE IF NOT EXISTS unidades_simplified (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unidad_codigo TEXT NOT NULL,
  alicuota DECIMAL(10,6),
  titular_tipo TEXT NOT NULL CHECK (titular_tipo IN ('PersonaNatural', 'PersonaJuridica')),
  nombre_razon_social TEXT NOT NULL,
  tipo_uso JSONB NOT NULL DEFAULT '[]',
  roles JSONB NOT NULL DEFAULT '[]',
  archivo_inscripcion_cbr JSONB,
  archivo_vigencia_cbr JSONB,
  co_titulares JSONB NOT NULL DEFAULT '[]',
  contacto JSONB,
  observaciones TEXT,
  fecha_ultima_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(condo_id, unidad_codigo)
);

-- =====================================================
-- 10C. TABLA UNIDADES_HISTORIAL_SIMPLIFIED (HISTORIAL DE CAMBIOS)
-- =====================================================
CREATE TABLE IF NOT EXISTS unidades_historial_simplified (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unidad_id UUID NOT NULL REFERENCES unidades_simplified(id) ON DELETE CASCADE,
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
  record_name TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10D. TABLA ARCHIVOS_CBR_SIMPLIFIED (ARCHIVOS CBR)
-- =====================================================
CREATE TABLE IF NOT EXISTS archivos_cbr_simplified (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unidad_id UUID NOT NULL REFERENCES unidades_simplified(id) ON DELETE CASCADE,
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_archivo TEXT NOT NULL CHECK (tipo_archivo IN ('inscripcion', 'vigencia')),
  nombre_archivo TEXT NOT NULL,
  url_archivo TEXT NOT NULL,
  tamaño_archivo BIGINT,
  fecha_subida TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. TABLA UNIDADES (UNIDADES DEL CONDOMINIO)
-- =====================================================
CREATE TABLE IF NOT EXISTS unidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('departamento', 'casa', 'local', 'bodega', 'estacionamiento', 'otro')),
  superficie DECIMAL(10,2),
  alicuota DECIMAL(5,4),
  estado TEXT DEFAULT 'ocupada' CHECK (estado IN ('ocupada', 'desocupada', 'en_construccion')),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(condo_id, numero)
);

-- =====================================================
-- 12. TABLA RULES (REGLAS DE CUMPLIMIENTO)
-- =====================================================
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  json_logic JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. TABLA ALERTS (ALERTAS DE CUMPLIMIENTO)
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('open', 'ok')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. TABLA USER_SETTINGS (CONFIGURACIONES DE USUARIO)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- =====================================================
-- 15. TABLA REPORT_TEMPLATES (PLANTILLAS DE REPORTES)
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. TABLA NOTIFICATION_SETTINGS (CONFIGURACIONES DE NOTIFICACIONES)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  assembly_reminders BOOLEAN DEFAULT TRUE,
  document_expiry_alerts BOOLEAN DEFAULT TRUE,
  compliance_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 17. HABILITAR ROW LEVEL SECURITY
-- =====================================================
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
-- 18. POLÍTICAS RLS - SISTEMA DE ROLES Y PERMISOS
-- =====================================================

-- ROLES - Solo super admins pueden ver/gestionar roles
CREATE POLICY "Super admins can manage roles" ON roles
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  )
);

-- USER_ROLES - Solo super admins pueden gestionar roles de usuarios
CREATE POLICY "Super admins can manage user roles" ON user_roles
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  )
);

-- CONDOS - Propietario y usuarios con permisos pueden ver/gestionar
CREATE POLICY "Users can manage condos they own or have permissions for" ON condos
FOR ALL USING (
  auth.uid() = user_id OR
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = condos.id AND cup.is_active = TRUE
  )
);

-- CONDO_USER_PERMISSIONS - Solo super admins y propietarios pueden gestionar permisos
CREATE POLICY "Super admins and owners can manage condo permissions" ON condo_user_permissions
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = condo_user_permissions.condo_id
  )
);

-- ASSEMBLIES - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage assemblies of condos they have access to" ON assemblies
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = assemblies.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = assemblies.condo_id AND cup.is_active = TRUE
  )
);

-- EMERGENCY_PLANS - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage emergency_plans of condos they have access to" ON emergency_plans
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = emergency_plans.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = emergency_plans.condo_id AND cup.is_active = TRUE
  )
);

-- CERTIFICATIONS - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage certifications of condos they have access to" ON certifications
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = certifications.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = certifications.condo_id AND cup.is_active = TRUE
  )
);

-- INSURANCES - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage insurances of condos they have access to" ON insurances
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = insurances.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = insurances.condo_id AND cup.is_active = TRUE
  )
);

-- CONTRACTS - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage contracts of condos they have access to" ON contracts
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = contracts.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = contracts.condo_id AND cup.is_active = TRUE
  )
);

-- COPROPIETARIOS - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage copropietarios of condos they have access to" ON copropietarios
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = copropietarios.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = copropietarios.condo_id AND cup.is_active = TRUE
  )
);

-- UNIDADES_SIMPLIFIED - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage unidades_simplified of condos they have access to" ON unidades_simplified
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades_simplified.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = unidades_simplified.condo_id AND cup.is_active = TRUE
  )
);

-- UNIDADES_HISTORIAL_SIMPLIFIED - Usuarios con permisos en el condominio
CREATE POLICY "Users can view unidades_historial_simplified of condos they have access to" ON unidades_historial_simplified
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades_historial_simplified.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = unidades_historial_simplified.condo_id AND cup.is_active = TRUE
  )
);

-- ARCHIVOS_CBR_SIMPLIFIED - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage archivos_cbr_simplified of condos they have access to" ON archivos_cbr_simplified
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = archivos_cbr_simplified.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = archivos_cbr_simplified.condo_id AND cup.is_active = TRUE
  )
);

-- UNIDADES - Usuarios con permisos en el condominio
CREATE POLICY "Users can manage unidades of condos they have access to" ON unidades
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = unidades.condo_id AND cup.is_active = TRUE
  )
);

-- ALERTS - Usuarios con permisos en el condominio
CREATE POLICY "Users can view alerts of condos they have access to" ON alerts
FOR ALL USING (
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur 
    WHERE ur.role_id = 'super_admin' AND ur.is_active = TRUE
  ) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = alerts.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = alerts.condo_id AND cup.is_active = TRUE
  )
);

-- RULES - Todos los usuarios autenticados pueden leer las reglas
CREATE POLICY "Authenticated users can view rules" ON rules
FOR SELECT USING (auth.uid() IS NOT NULL);

-- USER_SETTINGS - Solo el propietario puede gestionar sus configuraciones
CREATE POLICY "Users can manage their own settings" ON user_settings
FOR ALL USING (auth.uid() = user_id);

-- REPORT_TEMPLATES - Usuarios pueden gestionar sus propias plantillas y ver las públicas
CREATE POLICY "Users can manage their own report templates" ON report_templates
FOR ALL USING (
  auth.uid() = user_id OR 
  is_public = TRUE
);

-- NOTIFICATION_SETTINGS - Solo el propietario puede gestionar sus configuraciones
CREATE POLICY "Users can manage their own notification settings" ON notification_settings
FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 19. ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_condos_user_id ON condos(user_id);
CREATE INDEX idx_condos_destino_uso ON condos(destino_uso);
CREATE INDEX idx_condo_user_permissions_condo_id ON condo_user_permissions(condo_id);
CREATE INDEX idx_condo_user_permissions_user_id ON condo_user_permissions(user_id);
CREATE INDEX idx_assemblies_condo_id ON assemblies(condo_id);
CREATE INDEX idx_assemblies_user_id ON assemblies(user_id);
CREATE INDEX idx_emergency_plans_condo_id ON emergency_plans(condo_id);
CREATE INDEX idx_emergency_plans_user_id ON emergency_plans(user_id);
CREATE INDEX idx_certifications_condo_id ON certifications(condo_id);
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_insurances_condo_id ON insurances(condo_id);
CREATE INDEX idx_insurances_user_id ON insurances(user_id);
CREATE INDEX idx_insurances_insurance_type ON insurances(insurance_type);
CREATE INDEX idx_contracts_condo_id ON contracts(condo_id);
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_copropietarios_condo_id ON copropietarios(condo_id);
CREATE INDEX idx_copropietarios_user_id ON copropietarios(user_id);
CREATE INDEX idx_copropietarios_rut ON copropietarios(rut);
CREATE INDEX idx_unidades_simplified_condo_id ON unidades_simplified(condo_id);
CREATE INDEX idx_unidades_simplified_user_id ON unidades_simplified(user_id);
CREATE INDEX idx_unidades_simplified_unidad_codigo ON unidades_simplified(unidad_codigo);
CREATE INDEX idx_unidades_historial_simplified_unidad_id ON unidades_historial_simplified(unidad_id);
CREATE INDEX idx_unidades_historial_simplified_condo_id ON unidades_historial_simplified(condo_id);
CREATE INDEX idx_archivos_cbr_simplified_unidad_id ON archivos_cbr_simplified(unidad_id);
CREATE INDEX idx_archivos_cbr_simplified_condo_id ON archivos_cbr_simplified(condo_id);
CREATE INDEX idx_archivos_cbr_simplified_tipo ON archivos_cbr_simplified(tipo_archivo);
CREATE INDEX idx_unidades_condo_id ON unidades(condo_id);
CREATE INDEX idx_unidades_user_id ON unidades(user_id);
CREATE INDEX idx_alerts_condo_id ON alerts(condo_id);
CREATE INDEX idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_report_templates_user_id ON report_templates(user_id);
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- =====================================================
-- 20. INSERTAR ROLES DEL SISTEMA
-- =====================================================
INSERT INTO roles (id, name, description, permissions) VALUES
('super_admin', 'Super Administrador', 'Acceso completo al sistema', '{"all": true}'),
('user', 'Usuario', 'Usuario estándar del sistema', '{"condos": {"create": true, "view_own": true, "edit_own": true}}')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 21. INSERTAR REGLAS DE CUMPLIMIENTO
-- =====================================================
INSERT INTO rules (id, description, module, active) VALUES
('ASAMBLEA-ANUAL', 'Debe existir una asamblea ordinaria en los últimos 365 días con acta adjunta', 'assemblies', true),
('PLAN-EVAC-ANUAL', 'El plan de evacuación debe estar actualizado en los últimos 365 días', 'emergency_plans', true),
('SEGURO-VIGENTE', 'Debe existir un Seguro de Incendio Espacios Comunes vigente (requisito normativo obligatorio)', 'insurances', true),
('CERTIF-VIGENTE', 'Debe existir al menos una certificación vigente', 'certifications', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 22. CONFIGURAR STORAGE PARA EVIDENCIAS
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Users can upload files to evidence bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view files in evidence bucket" ON storage.objects
FOR SELECT USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete files in evidence bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update files in evidence bucket" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

-- =====================================================
-- 23. FUNCIONES SQL PARA SISTEMA DE COPROPIETARIOS
-- =====================================================

-- Función para registrar cambios en copropietarios
CREATE OR REPLACE FUNCTION log_copropietarios_change(
  p_condo_id UUID,
  p_action_type TEXT,
  p_record_name TEXT,
  p_changes JSONB
) RETURNS VOID AS $$
BEGIN
  INSERT INTO unidades_historial_simplified (
    unidad_id,
    condo_id,
    user_id,
    action_type,
    record_name,
    changes
  ) VALUES (
    NULL, -- Se puede especificar si es necesario
    p_condo_id,
    auth.uid(),
    p_action_type,
    p_record_name,
    p_changes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar limpieza masiva
CREATE OR REPLACE FUNCTION log_copropietarios_clear_all(
  p_condo_id UUID,
  p_deleted_units INTEGER,
  p_deleted_historial INTEGER,
  p_deleted_archivos INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO unidades_historial_simplified (
    unidad_id,
    condo_id,
    user_id,
    action_type,
    record_name,
    changes
  ) VALUES (
    NULL,
    p_condo_id,
    auth.uid(),
    'clear_all',
    'Limpieza masiva de unidades',
    jsonb_build_object(
      'deleted_units', p_deleted_units,
      'deleted_historial', p_deleted_historial,
      'deleted_archivos', p_deleted_archivos
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función agresiva para limpiar todas las unidades
CREATE OR REPLACE FUNCTION clear_all_unidades_aggressive(p_condo_id UUID)
RETURNS JSONB AS $$
DECLARE
  deleted_count INTEGER := 0;
  hist_count INTEGER := 0;
  arch_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Eliminar historial primero
  DELETE FROM unidades_historial_simplified 
  WHERE condo_id = p_condo_id;
  GET DIAGNOSTICS hist_count = ROW_COUNT;
  
  -- Eliminar archivos CBR
  DELETE FROM archivos_cbr_simplified 
  WHERE condo_id = p_condo_id;
  GET DIAGNOSTICS arch_count = ROW_COUNT;
  
  -- Eliminar unidades principales
  DELETE FROM unidades_simplified 
  WHERE condo_id = p_condo_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  result := jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'hist_count', hist_count,
    'arch_count', arch_count,
    'message', format('Eliminadas %s unidades, %s registros de historial, %s archivos CBR', 
                     deleted_count, hist_count, arch_count)
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error durante la limpieza masiva'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIN DEL ESQUEMA COMPLETO
-- =====================================================
