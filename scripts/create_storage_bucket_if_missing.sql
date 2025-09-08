-- =====================================================
-- CREAR BUCKET DE STORAGE SI NO EXISTE
-- =====================================================
-- Este script crea el bucket 'evidence' si no existe
-- y configura las políticas RLS básicas
-- 
-- Ejecuta este script en Supabase SQL Editor ANTES de implement_user_isolation.sql

-- =====================================================
-- PASO 1: VERIFICAR SI EL BUCKET EXISTE
-- =====================================================

-- Verificar si el bucket 'evidence' ya existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'evidence') 
    THEN 'Bucket "evidence" ya existe'
    ELSE 'Bucket "evidence" no existe - será creado'
  END as status;

-- =====================================================
-- PASO 2: CREAR EL BUCKET SI NO EXISTE
-- =====================================================

-- Crear el bucket 'evidence' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence', 
  'evidence', 
  false,  -- No público por seguridad
  20971520,  -- 20MB límite
  ARRAY['application/pdf']  -- Solo PDFs
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 3: VERIFICAR QUE EL BUCKET SE CREÓ
-- =====================================================

-- Verificar que el bucket se creó correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'evidence';

-- =====================================================
-- PASO 4: CREAR POLÍTICAS RLS BÁSICAS TEMPORALES
-- =====================================================

-- Función helper para eliminar políticas de forma segura
CREATE OR REPLACE FUNCTION drop_policy_if_exists(policy_name TEXT, table_name TEXT)
RETURNS void AS $$
BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
EXCEPTION
    WHEN undefined_table THEN
        -- La tabla no existe, no hacer nada
        NULL;
END;
$$ LANGUAGE plpgsql;

-- Eliminar políticas existentes si las hay (con manejo de errores)
DO $$
BEGIN
    -- Intentar eliminar políticas existentes
    BEGIN
        PERFORM drop_policy_if_exists('Allow authenticated users to upload files', 'storage.objects');
        PERFORM drop_policy_if_exists('Allow authenticated users to view files', 'storage.objects');
        PERFORM drop_policy_if_exists('Allow authenticated users to delete files', 'storage.objects');
        PERFORM drop_policy_if_exists('Allow authenticated users to update files', 'storage.objects');
        RAISE NOTICE 'Políticas existentes eliminadas correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'No se pudieron eliminar las políticas existentes (puede ser normal): %', SQLERRM;
    END;
END $$;

-- Crear políticas RLS básicas temporales (solo si no existen)
DO $$
BEGIN
    -- Crear políticas solo si no existen
    BEGIN
        EXECUTE 'CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = ''evidence'' AND 
          auth.uid() IS NOT NULL
        )';
        RAISE NOTICE 'Política de upload creada';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Política de upload ya existe, saltando...';
    END;

    BEGIN
        EXECUTE 'CREATE POLICY "Allow authenticated users to view files" ON storage.objects
        FOR SELECT USING (
          bucket_id = ''evidence'' AND 
          auth.uid() IS NOT NULL
        )';
        RAISE NOTICE 'Política de view creada';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Política de view ya existe, saltando...';
    END;

    BEGIN
        EXECUTE 'CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
        FOR DELETE USING (
          bucket_id = ''evidence'' AND 
          auth.uid() IS NOT NULL
        )';
        RAISE NOTICE 'Política de delete creada';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Política de delete ya existe, saltando...';
    END;

    BEGIN
        EXECUTE 'CREATE POLICY "Allow authenticated users to update files" ON storage.objects
        FOR UPDATE USING (
          bucket_id = ''evidence'' AND 
          auth.uid() IS NOT NULL
        )';
        RAISE NOTICE 'Política de update creada';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Política de update ya existe, saltando...';
    END;
END $$;

-- =====================================================
-- PASO 5: VERIFICAR POLÍTICAS CREADAS
-- =====================================================

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Bucket de storage "evidence" creado correctamente. 
🔒 Políticas RLS básicas configuradas.
⚠️ IMPORTANTE: Ahora puedes ejecutar implement_user_isolation.sql' as status;
