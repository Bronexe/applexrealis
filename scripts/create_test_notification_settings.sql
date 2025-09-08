-- Script para crear configuraciones de notificación de prueba
-- Ejecutar en Supabase SQL Editor

-- Crear configuraciones de notificación para usuarios existentes
INSERT INTO notification_settings (
  user_id,
  expiration_notifications_enabled,
  expiration_days_before,
  expiration_email_enabled,
  expiration_sms_enabled,
  assembly_reminders_enabled,
  assembly_reminder_days_before,
  assembly_reminder_email_enabled,
  assembly_reminder_sms_enabled,
  general_notifications_enabled,
  general_email_enabled,
  general_sms_enabled,
  notification_time,
  timezone
)
SELECT 
  id as user_id,
  true as expiration_notifications_enabled,
  30 as expiration_days_before,
  true as expiration_email_enabled,
  false as expiration_sms_enabled,
  true as assembly_reminders_enabled,
  7 as assembly_reminder_days_before,
  true as assembly_reminder_email_enabled,
  false as assembly_reminder_sms_enabled,
  true as general_notifications_enabled,
  true as general_email_enabled,
  false as general_sms_enabled,
  '09:00'::time as notification_time,
  'America/Santiago' as timezone
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM notification_settings
)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar que se crearon las configuraciones
SELECT 
  ns.user_id,
  u.email,
  ns.expiration_notifications_enabled,
  ns.expiration_days_before,
  ns.assembly_reminders_enabled,
  ns.assembly_reminder_days_before
FROM notification_settings ns
JOIN auth.users u ON ns.user_id = u.id
ORDER BY ns.created_at DESC;

-- Mostrar estadísticas
SELECT 
  COUNT(*) as total_configurations,
  COUNT(CASE WHEN expiration_notifications_enabled THEN 1 END) as expiration_enabled,
  COUNT(CASE WHEN assembly_reminders_enabled THEN 1 END) as assembly_enabled,
  COUNT(CASE WHEN general_notifications_enabled THEN 1 END) as general_enabled
FROM notification_settings;
