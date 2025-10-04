-- =====================================================
-- SCRIPT PARA CREAR LA BASE DE DATOS LIMPIA Y CORRECTA
-- =====================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLA CONDOS (CON TODAS LAS COLUMNAS NECESARIAS)
-- =====================================================
CREATE TABLE condos (
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
-- 2. TABLA ASSEMBLIES (ASAMBLEAS)
-- =====================================================
CREATE TABLE assemblies (
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
-- 3. TABLA EMERGENCY_PLANS (PLANES DE EMERGENCIA)
-- =====================================================
CREATE TABLE emergency_plans (
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
-- 4. TABLA CERTIFICATIONS (CERTIFICACIONES)
-- =====================================================
CREATE TABLE certifications (
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
-- 5. TABLA INSURANCES (SEGUROS)
-- =====================================================
CREATE TABLE insurances (
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
-- 6. TABLA RULES (REGLAS DE CUMPLIMIENTO)
-- =====================================================
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  json_logic JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA ALERTS (ALERTAS DE CUMPLIMIENTO)
-- =====================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('open', 'ok')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. HABILITAR ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE condos ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. POLÍTICAS RLS - SEGURIDAD MULTI-TENANT
-- =====================================================

-- CONDOS - Solo el propietario puede ver/modificar sus condominios
CREATE POLICY "Users can manage their own condos" ON condos
FOR ALL USING (auth.uid() = user_id);

-- ASSEMBLIES - Solo el propietario del condominio puede gestionar sus asambleas
CREATE POLICY "Users can manage assemblies of their condos" ON assemblies
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = assemblies.condo_id)
);

-- EMERGENCY_PLANS - Solo el propietario del condominio puede gestionar sus planes
CREATE POLICY "Users can manage emergency_plans of their condos" ON emergency_plans
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = emergency_plans.condo_id)
);

-- CERTIFICATIONS - Solo el propietario del condominio puede gestionar sus certificaciones
CREATE POLICY "Users can manage certifications of their condos" ON certifications
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = certifications.condo_id)
);

-- INSURANCES - Solo el propietario del condominio puede gestionar sus seguros
CREATE POLICY "Users can manage insurances of their condos" ON insurances
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = insurances.condo_id)
);

-- ALERTS - Solo el propietario del condominio puede ver sus alertas
CREATE POLICY "Users can view alerts of their condos" ON alerts
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM condos WHERE id = alerts.condo_id)
);

-- RULES - Todos los usuarios autenticados pueden leer las reglas (son globales)
CREATE POLICY "Authenticated users can view rules" ON rules
FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 10. ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================
CREATE INDEX idx_condos_user_id ON condos(user_id);
CREATE INDEX idx_condos_destino_uso ON condos(destino_uso);
CREATE INDEX idx_assemblies_condo_id ON assemblies(condo_id);
CREATE INDEX idx_assemblies_user_id ON assemblies(user_id);
CREATE INDEX idx_emergency_plans_condo_id ON emergency_plans(condo_id);
CREATE INDEX idx_emergency_plans_user_id ON emergency_plans(user_id);
CREATE INDEX idx_certifications_condo_id ON certifications(condo_id);
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_insurances_condo_id ON insurances(condo_id);
CREATE INDEX idx_insurances_user_id ON insurances(user_id);
CREATE INDEX idx_insurances_insurance_type ON insurances(insurance_type);
CREATE INDEX idx_alerts_condo_id ON alerts(condo_id);
CREATE INDEX idx_alerts_rule_id ON alerts(rule_id);

-- =====================================================
-- 11. INSERTAR REGLAS DE CUMPLIMIENTO
-- =====================================================
INSERT INTO rules (id, description, module, active) VALUES
('ASAMBLEA-ANUAL', 'Debe existir una asamblea ordinaria en los últimos 365 días con acta adjunta', 'assemblies', true),
('PLAN-EVAC-ANUAL', 'El plan de evacuación debe estar actualizado en los últimos 365 días', 'emergency_plans', true),
('SEGURO-VIGENTE', 'Debe existir un Seguro de Incendio Espacios Comunes vigente (requisito normativo obligatorio)', 'insurances', true),
('CERTIF-VIGENTE', 'Debe existir al menos una certificación vigente', 'certifications', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. CONFIGURAR STORAGE PARA EVIDENCIAS
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
-- FIN DEL SCRIPT DE CREACIÓN LIMPIA
-- =====================================================
