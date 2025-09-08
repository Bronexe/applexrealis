-- =====================================================
-- VERIFICAR ESTADO DEL STORAGE
-- =====================================================
-- Este script verifica el estado actual del storage
-- y te indica si puedes proceder directamente con implement_user_isolation.sql
-- 
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- PASO 1: VERIFICAR SI EL BUCKET EXISTE
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'evidence') 
    THEN '✅ Bucket "evidence" existe'
    ELSE '❌ Bucket "evidence" NO existe'
  END as bucket_status;

-- =====================================================
-- PASO 2: VERIFICAR SI LA TABLA STORAGE.OBJECTS EXISTE
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') 
    THEN '✅ Tabla storage.objects existe'
    ELSE '❌ Tabla storage.objects NO existe'
  END as table_status;

-- =====================================================
-- PASO 3: VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') 
    THEN '✅ Políticas de storage existen'
    ELSE '❌ Políticas de storage NO existen'
  END as policies_status;

-- =====================================================
-- PASO 4: MOSTRAR POLÍTICAS ACTUALES
-- =====================================================

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- =====================================================
-- PASO 5: RECOMENDACIÓN
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'evidence') 
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects')
         AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects')
    THEN '✅ RECOMENDACIÓN: Puedes proceder directamente con implement_user_isolation.sql'
    ELSE '⚠️ RECOMENDACIÓN: Ejecuta primero create_storage_bucket_if_missing.sql'
  END as recommendation;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'Verificación de storage completada. Revisa los resultados arriba.' as status;

