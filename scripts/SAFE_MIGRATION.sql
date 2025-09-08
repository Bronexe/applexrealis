-- =====================================================
-- MIGRACIÓN SEGURA CON MANEJO DE ERRORES
-- =====================================================
-- Este script maneja errores de políticas existentes
-- Ejecuta este script en Supabase SQL Editor

-- PASO 1: Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PASO 2: Crear tabla condos
CREATE TABLE IF NOT EXISTS condos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  comuna TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 3: Crear tabla assemblies
CREATE TABLE IF NOT EXISTS assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ordinaria', 'extraordinaria')),
  date DATE NOT NULL,
  act_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 4: Crear tabla emergency_plans
CREATE TABLE IF NOT EXISTS emergency_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  version TEXT,
  professional_name TEXT,
  updated_at DATE NOT NULL,
  plan_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 5: Crear tabla certifications
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('gas', 'ascensor', 'otros')),
  valid_from DATE,
  valid_to DATE,
  cert_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 6: Crear tabla insurances
CREATE TABLE IF NOT EXISTS insurances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  policy_number TEXT,
  insurer TEXT,
  valid_from DATE,
  valid_to DATE,
  policy_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 7: Crear tabla rules
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  json_logic JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 8: Crear tabla alerts (con campo id)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES rules(id),
  status TEXT NOT NULL CHECK (status IN ('open', 'ok')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 9: Crear tabla administrators
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  rut TEXT NOT NULL,
  registration_date DATE NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  certification_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- PASO 10: Crear tabla notification_settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expiration_notifications_enabled BOOLEAN DEFAULT TRUE,
  expiration_days_before INTEGER DEFAULT 30,
  expiration_email_enabled BOOLEAN DEFAULT TRUE,
  expiration_sms_enabled BOOLEAN DEFAULT FALSE,
  assembly_reminders_enabled BOOLEAN DEFAULT TRUE,
  assembly_reminder_days_before INTEGER DEFAULT 7,
  assembly_reminder_email_enabled BOOLEAN DEFAULT TRUE,
  assembly_reminder_sms_enabled BOOLEAN DEFAULT FALSE,
  general_notifications_enabled BOOLEAN DEFAULT TRUE,
  general_email_enabled BOOLEAN DEFAULT TRUE,
  general_sms_enabled BOOLEAN DEFAULT FALSE,
  notification_time TIME DEFAULT '09:00',
  timezone TEXT DEFAULT 'America/Santiago',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- PASO 11: Habilitar RLS
ALTER TABLE condos ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- PASO 12: Eliminar políticas existentes (si existen) y crear nuevas
-- Condos
DROP POLICY IF EXISTS "Allow authenticated users to view condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to insert condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to update condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to delete condos" ON condos;

CREATE POLICY "Allow authenticated users to view condos" ON condos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert condos" ON condos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update condos" ON condos FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete condos" ON condos FOR DELETE USING (auth.uid() IS NOT NULL);

-- Assemblies
DROP POLICY IF EXISTS "Allow authenticated users to view assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to insert assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to update assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to delete assemblies" ON assemblies;

CREATE POLICY "Allow authenticated users to view assemblies" ON assemblies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert assemblies" ON assemblies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update assemblies" ON assemblies FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete assemblies" ON assemblies FOR DELETE USING (auth.uid() IS NOT NULL);

-- Emergency Plans
DROP POLICY IF EXISTS "Allow authenticated users to view emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to update emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to delete emergency_plans" ON emergency_plans;

CREATE POLICY "Allow authenticated users to view emergency_plans" ON emergency_plans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert emergency_plans" ON emergency_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update emergency_plans" ON emergency_plans FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete emergency_plans" ON emergency_plans FOR DELETE USING (auth.uid() IS NOT NULL);

-- Certifications
DROP POLICY IF EXISTS "Allow authenticated users to view certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to update certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to delete certifications" ON certifications;

CREATE POLICY "Allow authenticated users to view certifications" ON certifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert certifications" ON certifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update certifications" ON certifications FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete certifications" ON certifications FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insurances
DROP POLICY IF EXISTS "Allow authenticated users to view insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to insert insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to update insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to delete insurances" ON insurances;

CREATE POLICY "Allow authenticated users to view insurances" ON insurances FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert insurances" ON insurances FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update insurances" ON insurances FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete insurances" ON insurances FOR DELETE USING (auth.uid() IS NOT NULL);

-- Alerts
DROP POLICY IF EXISTS "Allow authenticated users to view alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to insert alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to delete alerts" ON alerts;

CREATE POLICY "Allow authenticated users to view alerts" ON alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update alerts" ON alerts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete alerts" ON alerts FOR DELETE USING (auth.uid() IS NOT NULL);

-- Administrators
DROP POLICY IF EXISTS "Users can view own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can insert own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can update own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can delete own administrator data" ON administrators;

CREATE POLICY "Users can view own administrator data" ON administrators FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own administrator data" ON administrators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own administrator data" ON administrators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own administrator data" ON administrators FOR DELETE USING (auth.uid() = user_id);

-- Notification Settings
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON notification_settings;

CREATE POLICY "Users can view own notification settings" ON notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification settings" ON notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON notification_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notification settings" ON notification_settings FOR DELETE USING (auth.uid() = user_id);

-- Rules
DROP POLICY IF EXISTS "Allow authenticated users to view rules" ON rules;
CREATE POLICY "Allow authenticated users to view rules" ON rules FOR SELECT USING (auth.uid() IS NOT NULL);

-- PASO 13: Insertar reglas básicas
INSERT INTO rules (id, description, module, active) VALUES
('ASAMBLEA-ANUAL', 'Debe existir una asamblea ordinaria en los últimos 365 días con acta adjunta', 'assemblies', true),
('PLAN-EVAC-ANUAL', 'El plan de evacuación debe estar actualizado en los últimos 365 días', 'emergency_plans', true),
('SEGURO-VIGENTE', 'Debe existir al menos un seguro vigente', 'insurances', true),
('CERTIF-VIGENTE', 'Debe existir al menos una certificación vigente', 'certifications', true)
ON CONFLICT (id) DO NOTHING;

-- PASO 14: Crear bucket de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

-- PASO 15: Políticas de storage (eliminar existentes primero)
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

-- PASO 16: Verificación final
SELECT '🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE 🎉' as status;
SELECT 'Tablas creadas:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT 'Bucket de storage:' as info;
SELECT id, name, public FROM storage.buckets WHERE id = 'evidence';
SELECT 'Reglas insertadas:' as info;
SELECT id, description, module, active FROM rules ORDER BY id;

