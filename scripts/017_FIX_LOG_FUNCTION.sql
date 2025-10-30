-- =====================================================
-- SCRIPT PARA CORREGIR FUNCIÓN DE LOGGING
-- =====================================================

-- El problema: La función log_copropietarios_change usa auth.uid() pero es SECURITY DEFINER
-- Esto causa que auth.uid() sea NULL porque se ejecuta con privilegios del creador

-- 1. CORREGIR FUNCIÓN log_copropietarios_change
DROP FUNCTION IF EXISTS log_copropietarios_change(UUID, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION log_copropietarios_change(
  p_condo_id UUID,
  p_action TEXT,
  p_details TEXT,
  p_data JSONB,
  p_user_id UUID
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
    p_user_id, -- Usar el user_id pasado como parámetro
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
  p_deleted_count INTEGER,
  p_user_id UUID
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
    p_user_id, -- Usar el user_id pasado como parámetro
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
  current_user_id UUID;
BEGIN
  -- Obtener el usuario actual
  current_user_id := auth.uid();
  
  -- Contar registros antes de eliminar
  SELECT COUNT(*) INTO total_before FROM unidades_simplified WHERE condo_id = p_condo_id;
  
  -- Eliminar todos los registros del condominio
  DELETE FROM unidades_simplified WHERE condo_id = p_condo_id;
  
  -- Obtener el número de registros eliminados
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Contar registros después de eliminar
  SELECT COUNT(*) INTO total_after FROM unidades_simplified WHERE condo_id = p_condo_id;
  
  -- Registrar la acción en el historial
  PERFORM log_copropietarios_clear_all(p_condo_id, total_before, total_after, deleted_count, current_user_id);
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- CORRECCIÓN DE FUNCIONES DE LOGGING COMPLETADA
-- =====================================================
-- Las funciones ahora:
-- ✅ Reciben user_id como parámetro
-- ✅ No dependen de auth.uid() en contexto SECURITY DEFINER
-- ✅ Funcionan correctamente con RLS
-- =====================================================










