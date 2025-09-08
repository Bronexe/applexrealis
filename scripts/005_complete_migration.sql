-- Script de migración completa para todas las tablas necesarias
-- Ejecuta este script en Supabase SQL Editor

-- 1. Verificar y habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verificar y corregir la tabla alerts (falta el campo id)
DO $$
BEGIN
    -- Verificar si la tabla alerts existe y tiene el campo id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        -- Verificar si falta el campo id
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'id') THEN
            -- Agregar el campo id faltante
            ALTER TABLE alerts ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
            RAISE NOTICE 'Campo id agregado a la tabla alerts';
        ELSE
            RAISE NOTICE 'La tabla alerts ya tiene el campo id';
        END IF;
    ELSE
        RAISE NOTICE 'La tabla alerts no existe';
    END IF;
END $$;

-- 3. Agregar campo address a condos si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'condos' AND column_name = 'address') THEN
        ALTER TABLE condos ADD COLUMN address TEXT;
        RAISE NOTICE 'Campo address agregado a la tabla condos';
    ELSE
        RAISE NOTICE 'La tabla condos ya tiene el campo address';
    END IF;
END $$;

-- 4. Crear tabla administrators
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

-- 5. Crear tabla notification_settings
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

-- 6. Habilitar Row Level Security
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS para administrators
DROP POLICY IF EXISTS "Users can view own administrator data" ON administrators;
CREATE POLICY "Users can view own administrator data" ON administrators 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own administrator data" ON administrators;
CREATE POLICY "Users can insert own administrator data" ON administrators 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own administrator data" ON administrators;
CREATE POLICY "Users can update own administrator data" ON administrators 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own administrator data" ON administrators;
CREATE POLICY "Users can delete own administrator data" ON administrators 
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Crear políticas RLS para notification_settings
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
CREATE POLICY "Users can view own notification settings" ON notification_settings 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
CREATE POLICY "Users can insert own notification settings" ON notification_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
CREATE POLICY "Users can update own notification settings" ON notification_settings 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notification settings" ON notification_settings;
CREATE POLICY "Users can delete own notification settings" ON notification_settings 
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Verificar que todas las tablas existen
SELECT 'Tablas creadas:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances', 'administrators', 'notification_settings', 'alerts', 'rules')
ORDER BY table_name;

-- 10. Verificar estructura de la tabla administrators
SELECT 'Estructura de tabla administrators:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'administrators' 
ORDER BY ordinal_position;

-- 11. Verificar estructura de la tabla notification_settings
SELECT 'Estructura de tabla notification_settings:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
ORDER BY ordinal_position;

-- 12. Verificar políticas RLS
SELECT 'Políticas RLS activas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('administrators', 'notification_settings')
ORDER BY tablename, policyname;

-- 13. Estado final
SELECT 'Migración completada exitosamente' as status, NOW() as timestamp;

