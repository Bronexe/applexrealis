-- =====================================================
-- SCRIPT MAESTRO DE MIGRACIÓN COMPLETA (CORREGIDO)
-- =====================================================
-- Este script ejecuta TODOS los scripts necesarios en el orden correcto
-- Ejecuta este script ÚNICAMENTE en Supabase SQL Editor

-- =====================================================
-- PASO 1: CREAR TABLAS PRINCIPALES
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Condominiums table
CREATE TABLE IF NOT EXISTS condos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  comuna TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assemblies table
CREATE TABLE IF NOT EXISTS assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ordinaria', 'extraordinaria')),
  date DATE NOT NULL,
  act_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Plans table
CREATE TABLE IF NOT EXISTS emergency_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  version TEXT,
  professional_name TEXT,
  updated_at DATE NOT NULL,
  plan_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('gas', 'ascensor', 'otros')),
  valid_from DATE,
  valid_to DATE,
  cert_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurances table
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

-- Rules table for compliance evaluation
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  json_logic JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table for compliance tracking (CORREGIDO - agregando campo id faltante)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES rules(id),
  status TEXT NOT NULL CHECK (status IN ('open', 'ok')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PASO 2: CREAR TABLAS NUEVAS (ADMINISTRADORES Y NOTIFICACIONES)
-- =====================================================

-- Administrators table
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

-- Notification Settings table
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

-- =====================================================
-- PASO 3: HABILITAR ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE condos ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 4: CREAR POLÍTICAS RLS (CORREGIDAS)
-- =====================================================

-- RLS Policies for condos
DROP POLICY IF EXISTS "Allow authenticated users to view condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to insert condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to update condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to delete condos" ON condos;

CREATE POLICY "Allow authenticated users to view condos" ON condos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert condos" ON condos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update condos" ON condos FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete condos" ON condos FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for assemblies
DROP POLICY IF EXISTS "Allow authenticated users to view assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to insert assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to update assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to delete assemblies" ON assemblies;

CREATE POLICY "Allow authenticated users to view assemblies" ON assemblies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert assemblies" ON assemblies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update assemblies" ON assemblies FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete assemblies" ON assemblies FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for emergency_plans
DROP POLICY IF EXISTS "Allow authenticated users to view emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to update emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to delete emergency_plans" ON emergency_plans;

CREATE POLICY "Allow authenticated users to view emergency_plans" ON emergency_plans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert emergency_plans" ON emergency_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update emergency_plans" ON emergency_plans FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete emergency_plans" ON emergency_plans FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for certifications
DROP POLICY IF EXISTS "Allow authenticated users to view certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to update certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to delete certifications" ON certifications;

CREATE POLICY "Allow authenticated users to view certifications" ON certifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert certifications" ON certifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update certifications" ON certifications FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete certifications" ON certifications FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for insurances
DROP POLICY IF EXISTS "Allow authenticated users to view insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to insert insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to update insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to delete insurances" ON insurances;

CREATE POLICY "Allow authenticated users to view insurances" ON insurances FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert insurances" ON insurances FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update insurances" ON insurances FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete insurances" ON insurances FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for alerts
DROP POLICY IF EXISTS "Allow authenticated users to view alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to insert alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to delete alerts" ON alerts;

CREATE POLICY "Allow authenticated users to view alerts" ON alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update alerts" ON alerts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete alerts" ON alerts FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for administrators
DROP POLICY IF EXISTS "Users can view own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can insert own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can update own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can delete own administrator data" ON administrators;

CREATE POLICY "Users can view own administrator data" ON administrators FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own administrator data" ON administrators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own administrator data" ON administrators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own administrator data" ON administrators FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notification_settings
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON notification_settings;

CREATE POLICY "Users can view own notification settings" ON notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification settings" ON notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON notification_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notification settings" ON notification_settings FOR DELETE USING (auth.uid() = user_id);

-- Allow everyone to read rules (they're system-wide)
DROP POLICY IF EXISTS "Allow authenticated users to view rules" ON rules;
CREATE POLICY "Allow authenticated users to view rules" ON rules FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PASO 5: INSERTAR DATOS DE REGLAS
-- =====================================================

-- Seed compliance rules
INSERT INTO rules (id, description, module, active) VALUES
('ASAMBLEA-ANUAL', 'Debe existir una asamblea ordinaria en los últimos 365 días con acta adjunta', 'assemblies', true),
('PLAN-EVAC-ANUAL', 'El plan de evacuación debe estar actualizado en los últimos 365 días', 'emergency_plans', true),
('SEGURO-VIGENTE', 'Debe existir al menos un seguro vigente', 'insurances', true),
('CERTIF-VIGENTE', 'Debe existir al menos una certificación vigente', 'certifications', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 6: CREAR BUCKET DE STORAGE
-- =====================================================

-- Create the evidence bucket for file storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the evidence bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
CREATE POLICY "Allow authenticated users to view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'evidence' AND 
  auth.uid() IS NOT NULL
);

-- =====================================================
-- PASO 7: CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_administrators_user_id ON administrators(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_assemblies_condo_id ON assemblies(condo_id);
CREATE INDEX IF NOT EXISTS idx_emergency_plans_condo_id ON emergency_plans(condo_id);
CREATE INDEX IF NOT EXISTS idx_certifications_condo_id ON certifications(condo_id);
CREATE INDEX IF NOT EXISTS idx_insurances_condo_id ON insurances(condo_id);
CREATE INDEX IF NOT EXISTS idx_alerts_condo_id ON alerts(condo_id);

-- =====================================================
-- PASO 8: VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas existen
SELECT 'TABLAS CREADAS:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances', 'administrators', 'notification_settings', 'alerts', 'rules')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 'POLÍTICAS RLS ACTIVAS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances', 'administrators', 'notification_settings', 'alerts', 'rules')
ORDER BY tablename, policyname;

-- Verificar bucket de storage
SELECT 'BUCKET DE STORAGE:' as info;
SELECT id, name, public FROM storage.buckets WHERE id = 'evidence';

-- Verificar reglas insertadas
SELECT 'REGLAS INSERTADAS:' as info;
SELECT id, description, module, active FROM rules ORDER BY id;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT '🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE 🎉' as status, 
       NOW() as timestamp,
       'Todas las tablas, políticas RLS y configuraciones han sido creadas correctamente' as message;

