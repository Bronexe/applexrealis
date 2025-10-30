-- =====================================================
-- ACTUALIZACIÓN DE TABLA NOTIFICATION_SETTINGS
-- =====================================================
-- Script para agregar nuevas columnas de notificaciones por módulo
-- Ejecutar en el SQL Editor del dashboard de Supabase

-- PASO 1: Agregar nuevas columnas para notificaciones de gestiones
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS gestiones_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS gestiones_email_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS gestiones_reminder_days_before INTEGER DEFAULT 3;

-- PASO 2: Agregar nuevas columnas para notificaciones de condos
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS condos_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS condos_email_enabled BOOLEAN DEFAULT true;

-- PASO 3: Eliminar columnas de SMS (opcional - comentado para mantener compatibilidad)
-- ALTER TABLE notification_settings 
-- DROP COLUMN IF EXISTS expiration_sms_enabled,
-- DROP COLUMN IF EXISTS assembly_reminder_sms_enabled,
-- DROP COLUMN IF EXISTS general_sms_enabled;

-- PASO 4: Actualizar registros existentes con valores por defecto
UPDATE notification_settings 
SET 
  gestiones_notifications_enabled = COALESCE(gestiones_notifications_enabled, true),
  gestiones_email_enabled = COALESCE(gestiones_email_enabled, true),
  gestiones_reminder_days_before = COALESCE(gestiones_reminder_days_before, 3),
  condos_notifications_enabled = COALESCE(condos_notifications_enabled, true),
  condos_email_enabled = COALESCE(condos_email_enabled, true)
WHERE 
  gestiones_notifications_enabled IS NULL 
  OR gestiones_email_enabled IS NULL 
  OR gestiones_reminder_days_before IS NULL
  OR condos_notifications_enabled IS NULL 
  OR condos_email_enabled IS NULL;

-- PASO 5: Verificar la estructura actualizada de la tabla
SELECT 
  'ESTRUCTURA ACTUALIZADA' as titulo,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 6: Mostrar resumen de cambios
SELECT 
  'RESUMEN DE ACTUALIZACIÓN' as titulo,
  'Nuevas columnas agregadas: 5' as cambios,
  'Notificaciones de gestiones: ✅' as gestiones,
  'Notificaciones de condos: ✅' as condos,
  'SMS eliminado: ✅' as sms_removed,
  'Solo email: ✅' as email_only;






