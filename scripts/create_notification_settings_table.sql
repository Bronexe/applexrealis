-- Script para crear la tabla notification_settings
-- Ejecutar en Supabase SQL Editor

-- Crear tabla notification_settings
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

-- Políticas RLS - Los usuarios solo pueden ver/editar sus propias configuraciones
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Comentarios para documentar la tabla
COMMENT ON TABLE notification_settings IS 'Configuraciones de notificaciones por usuario';
COMMENT ON COLUMN notification_settings.expiration_notifications_enabled IS 'Habilitar notificaciones de vencimiento de documentos';
COMMENT ON COLUMN notification_settings.expiration_days_before IS 'Días antes del vencimiento para enviar notificación';
COMMENT ON COLUMN notification_settings.assembly_reminders_enabled IS 'Habilitar recordatorios de asambleas';
COMMENT ON COLUMN notification_settings.assembly_reminder_days_before IS 'Días antes de la asamblea para enviar recordatorio';
COMMENT ON COLUMN notification_settings.general_notifications_enabled IS 'Habilitar notificaciones generales del sistema';
COMMENT ON COLUMN notification_settings.notification_time IS 'Hora del día para enviar notificaciones';
COMMENT ON COLUMN notification_settings.timezone IS 'Zona horaria del usuario';

-- Verificar que la tabla se creó correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
ORDER BY ordinal_position;
