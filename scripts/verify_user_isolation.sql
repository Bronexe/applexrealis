-- =====================================================
-- VERIFICACIÓN DE AISLAMIENTO POR USUARIO
-- =====================================================
-- Este script verifica que el aislamiento por usuario esté funcionando correctamente
-- 
-- ⚠️ IMPORTANTE: Ejecuta este script DESPUÉS de implement_user_isolation.sql y migrate_existing_data.sql
-- 
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar que todas las tablas tienen la columna user_id
SELECT 
  'Verificación de columnas user_id' as verificacion,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'user_id'
ORDER BY table_name;

-- =====================================================
-- PASO 2: VERIFICAR ÍNDICES
-- =====================================================

-- Verificar que los índices de user_id se crearon correctamente
SELECT 
  'Verificación de índices user_id' as verificacion,
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname LIKE '%user_id%'
ORDER BY tablename, indexname;

-- =====================================================
-- PASO 3: VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar que las políticas RLS se crearon correctamente
SELECT 
  'Verificación de políticas RLS' as verificacion,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- PASO 4: VERIFICAR POLÍTICAS DE STORAGE
-- =====================================================

-- Verificar que las políticas de storage se crearon correctamente
SELECT 
  'Verificación de políticas de storage' as verificacion,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- =====================================================
-- PASO 5: VERIFICAR DATOS EXISTENTES
-- =====================================================

-- Verificar que no hay registros sin user_id
SELECT 
  'Verificación de datos sin user_id' as verificacion,
  'condos' as tabla,
  COUNT(*) as registros_sin_user_id
FROM condos 
WHERE user_id IS NULL
UNION ALL
SELECT 
  'Verificación de datos sin user_id' as verificacion,
  'assemblies' as tabla,
  COUNT(*) as registros_sin_user_id
FROM assemblies 
WHERE user_id IS NULL
UNION ALL
SELECT 
  'Verificación de datos sin user_id' as verificacion,
  'emergency_plans' as tabla,
  COUNT(*) as registros_sin_user_id
FROM emergency_plans 
WHERE user_id IS NULL
UNION ALL
SELECT 
  'Verificación de datos sin user_id' as verificacion,
  'certifications' as tabla,
  COUNT(*) as registros_sin_user_id
FROM certifications 
WHERE user_id IS NULL
UNION ALL
SELECT 
  'Verificación de datos sin user_id' as verificacion,
  'insurances' as tabla,
  COUNT(*) as registros_sin_user_id
FROM insurances 
WHERE user_id IS NULL
UNION ALL
SELECT 
  'Verificación de datos sin user_id' as verificacion,
  'alerts' as tabla,
  COUNT(*) as registros_sin_user_id
FROM alerts 
WHERE user_id IS NULL;

-- =====================================================
-- PASO 6: VERIFICAR FUNCIONES DE UTILIDAD
-- =====================================================

-- Verificar que las funciones de utilidad se crearon correctamente
SELECT 
  'Verificación de funciones' as verificacion,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_current_user_id', 'user_can_access_condo')
ORDER BY routine_name;

-- =====================================================
-- PASO 7: PRUEBA DE AISLAMIENTO (SIMULACIÓN)
-- =====================================================

-- Crear una función para probar el aislamiento
CREATE OR REPLACE FUNCTION test_user_isolation()
RETURNS TABLE(
  test_name TEXT,
  result TEXT,
  details TEXT
) AS $$
DECLARE
  test_user_id UUID;
  condo_count INTEGER;
  assembly_count INTEGER;
  plan_count INTEGER;
  cert_count INTEGER;
  insurance_count INTEGER;
  alert_count INTEGER;
BEGIN
  -- Obtener el usuario actual
  SELECT auth.uid() INTO test_user_id;
  
  IF test_user_id IS NULL THEN
    RETURN QUERY SELECT 
      'Autenticación'::TEXT,
      'FALLO'::TEXT,
      'No hay usuario autenticado'::TEXT;
    RETURN;
  END IF;
  
  -- Contar registros del usuario actual
  SELECT COUNT(*) INTO condo_count FROM condos WHERE user_id = test_user_id;
  SELECT COUNT(*) INTO assembly_count FROM assemblies WHERE user_id = test_user_id;
  SELECT COUNT(*) INTO plan_count FROM emergency_plans WHERE user_id = test_user_id;
  SELECT COUNT(*) INTO cert_count FROM certifications WHERE user_id = test_user_id;
  SELECT COUNT(*) INTO insurance_count FROM insurances WHERE user_id = test_user_id;
  SELECT COUNT(*) INTO alert_count FROM alerts WHERE user_id = test_user_id;
  
  -- Verificar que solo se pueden ver registros del usuario actual
  RETURN QUERY SELECT 
    'Aislamiento de Condominios'::TEXT,
    CASE WHEN condo_count = (SELECT COUNT(*) FROM condos) THEN 'ÉXITO' ELSE 'FALLO' END::TEXT,
    ('Usuario ve ' || condo_count || ' de ' || (SELECT COUNT(*) FROM condos) || ' condominios totales')::TEXT;
    
  RETURN QUERY SELECT 
    'Aislamiento de Asambleas'::TEXT,
    CASE WHEN assembly_count = (SELECT COUNT(*) FROM assemblies) THEN 'ÉXITO' ELSE 'FALLO' END::TEXT,
    ('Usuario ve ' || assembly_count || ' de ' || (SELECT COUNT(*) FROM assemblies) || ' asambleas totales')::TEXT;
    
  RETURN QUERY SELECT 
    'Aislamiento de Planes de Emergencia'::TEXT,
    CASE WHEN plan_count = (SELECT COUNT(*) FROM emergency_plans) THEN 'ÉXITO' ELSE 'FALLO' END::TEXT,
    ('Usuario ve ' || plan_count || ' de ' || (SELECT COUNT(*) FROM emergency_plans) || ' planes totales')::TEXT;
    
  RETURN QUERY SELECT 
    'Aislamiento de Certificaciones'::TEXT,
    CASE WHEN cert_count = (SELECT COUNT(*) FROM certifications) THEN 'ÉXITO' ELSE 'FALLO' END::TEXT,
    ('Usuario ve ' || cert_count || ' de ' || (SELECT COUNT(*) FROM certifications) || ' certificaciones totales')::TEXT;
    
  RETURN QUERY SELECT 
    'Aislamiento de Seguros'::TEXT,
    CASE WHEN insurance_count = (SELECT COUNT(*) FROM insurances) THEN 'ÉXITO' ELSE 'FALLO' END::TEXT,
    ('Usuario ve ' || insurance_count || ' de ' || (SELECT COUNT(*) FROM insurances) || ' seguros totales')::TEXT;
    
  RETURN QUERY SELECT 
    'Aislamiento de Alertas'::TEXT,
    CASE WHEN alert_count = (SELECT COUNT(*) FROM alerts) THEN 'ÉXITO' ELSE 'FALLO' END::TEXT,
    ('Usuario ve ' || alert_count || ' de ' || (SELECT COUNT(*) FROM alerts) || ' alertas totales')::TEXT;
    
  RETURN QUERY SELECT 
    'Resumen General'::TEXT,
    CASE WHEN condo_count + assembly_count + plan_count + cert_count + insurance_count + alert_count > 0 THEN 'ÉXITO' ELSE 'ADVERTENCIA' END::TEXT,
    ('Usuario tiene ' || (condo_count + assembly_count + plan_count + cert_count + insurance_count + alert_count) || ' registros totales')::TEXT;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar la prueba de aislamiento
SELECT * FROM test_user_isolation();

-- =====================================================
-- PASO 8: VERIFICACIÓN DE SEGURIDAD ADICIONAL
-- =====================================================

-- Verificar que las políticas RLS están activas
SELECT 
  'Verificación de RLS activo' as verificacion,
  schemaname,
  tablename,
  rowsecurity as rls_activo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances', 'alerts')
ORDER BY tablename;

-- =====================================================
-- PASO 9: LIMPIAR FUNCIÓN DE PRUEBA
-- =====================================================

-- Eliminar la función de prueba
DROP FUNCTION IF EXISTS test_user_isolation();

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Verificación de aislamiento por usuario completada. 
🔒 Revisa los resultados para confirmar que el aislamiento está funcionando correctamente.
⚠️ Si algún test falla, revisa la implementación de las políticas RLS.' as status;

