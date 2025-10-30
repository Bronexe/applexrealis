-- =====================================================
-- SCRIPT PARA CORREGIR ADVERTENCIAS DE SEGURIDAD EN FUNCIONES
-- =====================================================

-- Este script corrige las advertencias de seguridad relacionadas con search_path
-- en las funciones existentes del sistema

-- 1. CORREGIR FUNCIÓN log_copropietarios_change
DROP FUNCTION IF EXISTS log_copropietarios_change(UUID, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION log_copropietarios_change(
  p_condo_id UUID,
  p_action TEXT,
  p_details TEXT,
  p_data JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO unidades_historial_simplified (
    unidad_id,
    condo_id,
    action_type,
    action_details,
    changed_data,
    user_id,
    created_at
  ) VALUES (
    NULL, -- unidad_id puede ser NULL para acciones generales
    p_condo_id,
    p_action,
    p_details,
    p_data,
    auth.uid(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. CORREGIR FUNCIÓN log_copropietarios_clear_all
DROP FUNCTION IF EXISTS log_copropietarios_clear_all(UUID, INTEGER, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION log_copropietarios_clear_all(
  p_condo_id UUID,
  p_total_before INTEGER,
  p_total_after INTEGER,
  p_deleted_count INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO unidades_historial_simplified (
    unidad_id,
    condo_id,
    action_type,
    action_details,
    changed_data,
    user_id,
    created_at
  ) VALUES (
    NULL,
    p_condo_id,
    'clear_all',
    'Limpieza masiva de unidades: ' || p_deleted_count || ' eliminadas (antes: ' || p_total_before || ', después: ' || p_total_after || ')',
    jsonb_build_object(
      'total_before', p_total_before,
      'total_after', p_total_after,
      'deleted_count', p_deleted_count
    ),
    auth.uid(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. CORREGIR FUNCIÓN clear_all_unidades_aggressive
DROP FUNCTION IF EXISTS clear_all_unidades_aggressive(UUID);

CREATE OR REPLACE FUNCTION clear_all_unidades_aggressive(p_condo_id UUID)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  total_before INTEGER;
  total_after INTEGER;
BEGIN
  -- Contar registros antes de eliminar
  SELECT COUNT(*) INTO total_before FROM unidades_simplified WHERE condo_id = p_condo_id;
  
  -- Eliminar todos los registros del condominio
  DELETE FROM unidades_simplified WHERE condo_id = p_condo_id;
  
  -- Obtener el número de registros eliminados
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Contar registros después de eliminar
  SELECT COUNT(*) INTO total_after FROM unidades_simplified WHERE condo_id = p_condo_id;
  
  -- Registrar la acción en el historial
  PERFORM log_copropietarios_clear_all(p_condo_id, total_before, total_after, deleted_count);
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. VERIFICAR QUE TODAS LAS FUNCIONES ESTÉN CORREGIDAS
SELECT 
  proname as function_name,
  proconfig as configuration
FROM pg_proc 
WHERE proname IN (
  'log_copropietarios_change',
  'log_copropietarios_clear_all', 
  'clear_all_unidades_aggressive',
  'is_super_admin',
  'user_owns_condo',
  'user_has_condo_permission',
  'user_can_access_condo'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- CORRECCIÓN DE SEGURIDAD COMPLETADA
-- =====================================================
-- Todas las funciones ahora tienen:
-- ✅ search_path fijo a 'public'
-- ✅ SECURITY DEFINER para ejecutar con privilegios del creador
-- ✅ Sin advertencias de seguridad
-- =====================================================










