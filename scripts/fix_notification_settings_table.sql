-- Script para verificar y corregir la tabla notification_settings
-- Ejecutar en Supabase SQL Editor

-- Verificar si la tabla existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'notification_settings';

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
ORDER BY ordinal_position;

-- Verificar las políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notification_settings';

-- Verificar las relaciones (foreign keys)
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='notification_settings';

-- Si la tabla no existe, crearla
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notificaciones de vencimiento
  expiration_notifications_enabled BOOLEAN DEFAULT true,
  expiration_days_before INTEGER DEFAULT 30,
  expiration_email_enabled BOOLEAN DEFAULT true,
  expiration_sms_enabled BOOLEAN DEFAULT false,
  
  -- Recordatorios de asambleas
  assembly_reminders_enabled BOOLEAN DEFAULT true,
  assembly_reminder_days_before INTEGER DEFAULT 7,
  assembly_reminder_email_enabled BOOLEAN DEFAULT true,
  assembly_reminder_sms_enabled BOOLEAN DEFAULT false,
  
  -- Notificaciones generales
  general_notifications_enabled BOOLEAN DEFAULT true,
  general_email_enabled BOOLEAN DEFAULT true,
  general_sms_enabled BOOLEAN DEFAULT false,
  
  -- Configuración de tiempo
  notification_time TIME DEFAULT '09:00',
  timezone TEXT DEFAULT 'America/Santiago',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Asegurar que cada usuario tenga solo una configuración
  UNIQUE(user_id)
);

-- Habilitar Row Level Security
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can insert their own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can delete their own notification settings" ON notification_settings;

-- Crear políticas RLS
CREATE POLICY "Users can view their own notification settings" 
ON notification_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" 
ON notification_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
ON notification_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" 
ON notification_settings FOR DELETE 
USING (auth.uid() = user_id);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Verificar que todo esté correcto
SELECT 'Tabla creada correctamente' as status;

-- Verificar la estructura final
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
ORDER BY ordinal_position;
