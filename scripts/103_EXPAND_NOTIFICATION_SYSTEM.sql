-- =====================================================
-- EXPANSIÓN DEL SISTEMA DE NOTIFICACIONES
-- Incluye todos los módulos con fechas importantes
-- =====================================================

-- 1. Actualizar tabla notification_settings para incluir nuevos módulos
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS contract_expiration_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS contract_expiration_days_before INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS gestiones_deadline_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS gestiones_deadline_days_before INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS emergency_plan_renewal_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS emergency_plan_renewal_days_before INTEGER DEFAULT 30;

-- 2. Actualizar notificaciones existentes con valores por defecto
UPDATE notification_settings 
SET 
  contract_expiration_enabled = COALESCE(contract_expiration_enabled, true),
  contract_expiration_days_before = COALESCE(contract_expiration_days_before, 30),
  gestiones_deadline_enabled = COALESCE(gestiones_deadline_enabled, true),
  gestiones_deadline_days_before = COALESCE(gestiones_deadline_days_before, 3),
  emergency_plan_renewal_enabled = COALESCE(emergency_plan_renewal_enabled, true),
  emergency_plan_renewal_days_before = COALESCE(emergency_plan_renewal_days_before, 30);

-- 3. Función para obtener configuración completa de notificaciones
CREATE OR REPLACE FUNCTION get_user_notification_config(p_user_id UUID)
RETURNS TABLE (
  -- Vencimientos de documentos
  expiration_notifications_enabled BOOLEAN,
  expiration_email_enabled BOOLEAN,
  expiration_days_before INTEGER,
  
  -- Asambleas
  assembly_reminders_enabled BOOLEAN,
  assembly_reminder_email_enabled BOOLEAN,
  assembly_reminder_days_before INTEGER,
  
  -- Contratos
  contract_expiration_enabled BOOLEAN,
  contract_expiration_days_before INTEGER,
  
  -- Gestiones
  gestiones_deadline_enabled BOOLEAN,
  gestiones_deadline_days_before INTEGER,
  
  -- Planes de emergencia
  emergency_plan_renewal_enabled BOOLEAN,
  emergency_plan_renewal_days_before INTEGER,
  
  -- Generales
  general_notifications_enabled BOOLEAN,
  general_email_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ns.expiration_notifications_enabled,
    ns.expiration_email_enabled,
    ns.expiration_days_before,
    ns.assembly_reminders_enabled,
    ns.assembly_reminder_email_enabled,
    ns.assembly_reminder_days_before,
    ns.contract_expiration_enabled,
    ns.contract_expiration_days_before,
    ns.gestiones_deadline_enabled,
    ns.gestiones_deadline_days_before,
    ns.emergency_plan_renewal_enabled,
    ns.emergency_plan_renewal_days_before,
    ns.general_notifications_enabled,
    ns.general_email_enabled
  FROM notification_settings ns
  WHERE ns.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función para obtener contratos próximos a vencer
CREATE OR REPLACE FUNCTION get_expiring_contracts(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  contract_id UUID,
  condo_id UUID,
  condo_name TEXT,
  user_id UUID,
  user_email TEXT,
  contract_type TEXT,
  provider_name TEXT,
  end_date DATE,
  days_until_expiration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as contract_id,
    c.condo_id,
    co.name as condo_name,
    co.user_id,
    u.email as user_email,
    c.contract_type,
    c.provider_name,
    c.end_date,
    (c.end_date - CURRENT_DATE)::INTEGER as days_until_expiration
  FROM contracts c
  INNER JOIN condos co ON c.condo_id = co.id
  INNER JOIN auth.users u ON co.user_id = u.id
  INNER JOIN notification_settings ns ON ns.user_id = u.id
  WHERE 
    c.end_date IS NOT NULL
    AND c.status = 'active'
    AND c.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days)
    AND ns.contract_expiration_enabled = true
  ORDER BY c.end_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para obtener gestiones próximas al límite
CREATE OR REPLACE FUNCTION get_upcoming_gestiones_deadlines(p_days INTEGER DEFAULT 3)
RETURNS TABLE (
  gestion_id UUID,
  condo_id UUID,
  condo_name TEXT,
  user_id UUID,
  user_email TEXT,
  tipo TEXT,
  titulo TEXT,
  prioridad TEXT,
  fecha_limite TIMESTAMPTZ,
  days_until_deadline INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id as gestion_id,
    g.condominio_id as condo_id,
    co.name as condo_name,
    g.responsable_id as user_id,
    u.email as user_email,
    g.tipo,
    g.titulo,
    g.prioridad,
    g.fecha_limite,
    EXTRACT(DAY FROM (g.fecha_limite - NOW()))::INTEGER as days_until_deadline
  FROM gestiones g
  INNER JOIN condos co ON g.condominio_id = co.id
  INNER JOIN auth.users u ON g.responsable_id = u.id
  INNER JOIN notification_settings ns ON ns.user_id = u.id
  WHERE 
    g.fecha_limite IS NOT NULL
    AND g.estado NOT IN ('resuelto', 'cerrado')
    AND g.fecha_limite BETWEEN NOW() AND (NOW() + (p_days || ' days')::INTERVAL)
    AND ns.gestiones_deadline_enabled = true
  ORDER BY g.fecha_limite ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para obtener planes de emergencia que necesitan renovación
CREATE OR REPLACE FUNCTION get_emergency_plans_needing_renewal(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  plan_id UUID,
  condo_id UUID,
  condo_name TEXT,
  user_id UUID,
  user_email TEXT,
  last_updated DATE,
  days_since_update INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id as plan_id,
    ep.condo_id,
    co.name as condo_name,
    co.user_id,
    u.email as user_email,
    ep.updated_at as last_updated,
    (CURRENT_DATE - ep.updated_at)::INTEGER as days_since_update
  FROM emergency_plans ep
  INNER JOIN condos co ON ep.condo_id = co.id
  INNER JOIN auth.users u ON co.user_id = u.id
  INNER JOIN notification_settings ns ON ns.user_id = u.id
  WHERE 
    ep.updated_at IS NOT NULL
    AND (CURRENT_DATE - ep.updated_at) >= (365 - p_days)
    AND ns.emergency_plan_renewal_enabled = true
  ORDER BY ep.updated_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Índices para optimizar consultas de notificaciones
CREATE INDEX IF NOT EXISTS idx_contracts_end_date_status ON contracts(end_date, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_gestiones_fecha_limite_estado ON gestiones(fecha_limite, estado) WHERE estado NOT IN ('resuelto', 'cerrado');
CREATE INDEX IF NOT EXISTS idx_emergency_plans_updated_at ON emergency_plans(updated_at);

-- 8. Vista consolidada de todos los recordatorios
CREATE OR REPLACE VIEW upcoming_notifications AS
SELECT 
  'contract' as notification_type,
  contract_id::TEXT as item_id,
  condo_name,
  user_email,
  'Contrato de ' || contract_type || ' con ' || provider_name as item_description,
  end_date::TIMESTAMPTZ as deadline_date,
  days_until_expiration as days_remaining
FROM get_expiring_contracts(30)

UNION ALL

SELECT 
  'gestion' as notification_type,
  gestion_id::TEXT as item_id,
  condo_name,
  user_email,
  'Gestión ' || tipo || ': ' || titulo as item_description,
  fecha_limite as deadline_date,
  days_until_deadline as days_remaining
FROM get_upcoming_gestiones_deadlines(7)

UNION ALL

SELECT 
  'emergency_plan' as notification_type,
  plan_id::TEXT as item_id,
  condo_name,
  user_email,
  'Plan de Emergencia necesita renovación' as item_description,
  (last_updated + INTERVAL '365 days')::TIMESTAMPTZ as deadline_date,
  (365 - days_since_update) as days_remaining
FROM get_emergency_plans_needing_renewal(30)

ORDER BY days_remaining ASC;

-- 9. Verificación
SELECT 
  'Sistema de notificaciones expandido' as status,
  COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'notification_settings' AND table_schema = 'public';

-- 10. Mostrar estructura actualizada
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notification_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- SISTEMA DE NOTIFICACIONES EXPANDIDO EXITOSAMENTE
-- Ahora incluye:
-- - Vencimientos de Certificaciones ✓
-- - Vencimientos de Seguros ✓
-- - Recordatorios de Asambleas ✓
-- - Vencimientos de Contratos ✓ (NUEVO)
-- - Límites de Gestiones ✓ (NUEVO)
-- - Renovación Planes de Emergencia ✓ (NUEVO)
-- =====================================================

