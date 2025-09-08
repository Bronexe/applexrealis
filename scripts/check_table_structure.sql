-- =====================================================
-- VERIFICAR ESTRUCTURA DE TABLAS PARA POLÍTICAS RLS
-- =====================================================
-- Este script verifica la estructura de las tablas para identificar las columnas correctas
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- VERIFICAR ESTRUCTURA DE TODAS LAS TABLAS
-- =====================================================

-- Verificar estructura de administrators
SELECT 
  'administrators' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'administrators' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de condos
SELECT 
  'condos' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'condos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de assemblies
SELECT 
  'assemblies' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'assemblies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de emergency_plans
SELECT 
  'emergency_plans' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'emergency_plans' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de certifications
SELECT 
  'certifications' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'certifications' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de insurances
SELECT 
  'insurances' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'insurances' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de alerts
SELECT 
  'alerts' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'alerts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de notification_settings
SELECT 
  'notification_settings' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================

-- Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- VERIFICAR SI LAS TABLAS TIENEN COLUMNA user_id
-- =====================================================

-- Verificar qué tablas tienen columna user_id
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'user_id'
ORDER BY table_name;

-- Verificar qué tablas tienen columna condo_id (para tablas relacionadas)
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'condo_id'
ORDER BY table_name;

-- =====================================================
-- RESUMEN DE ESTRUCTURA
-- =====================================================

-- Resumen de todas las tablas y sus columnas
SELECT 
  table_name,
  COUNT(*) as column_count,
  STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- Mensaje de confirmación
SELECT 'Verificación de estructura de tablas completada' as status;

