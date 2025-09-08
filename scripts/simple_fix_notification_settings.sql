-- Script simple para corregir la tabla notification_settings
-- Ejecutar en Supabase SQL Editor

-- Eliminar la tabla si existe (para recrearla correctamente)
DROP TABLE IF EXISTS notification_settings CASCADE;

-- Crear la tabla notification_settings correctamente
CREATE TABLE notification_settings (
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
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla notification_settings creada correctamente' as status;

-- Mostrar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
ORDER BY ordinal_position;
