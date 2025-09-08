-- Script para verificar el estado de la tabla notification_settings
-- Ejecutar en Supabase SQL Editor

-- Verificar si la tabla existe
SELECT 
  'Tabla notification_settings' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_settings') 
    THEN 'EXISTE' 
    ELSE 'NO EXISTE' 
  END as status;

-- Verificar la estructura de la tabla
SELECT 
  'Estructura de la tabla' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
ORDER BY ordinal_position;

-- Verificar las relaciones (foreign keys)
SELECT 
  'Relaciones (Foreign Keys)' as check_type,
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

-- Verificar las políticas RLS
SELECT 
  'Políticas RLS' as check_type,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'notification_settings';

-- Verificar si RLS está habilitado
SELECT 
  'RLS Habilitado' as check_type,
  CASE 
    WHEN relrowsecurity THEN 'SÍ' 
    ELSE 'NO' 
  END as status
FROM pg_class 
WHERE relname = 'notification_settings';

-- Verificar índices
SELECT 
  'Índices' as check_type,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'notification_settings';

-- Intentar hacer una consulta simple
SELECT 
  'Consulta de prueba' as check_type,
  COUNT(*) as total_records
FROM notification_settings;
