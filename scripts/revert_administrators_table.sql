-- =====================================================
-- REVERTIR CAMBIOS DE LA TABLA ADMINISTRATORS
-- =====================================================
-- Este script revierte todos los cambios del script update_administrators_table.sql
-- Ejecuta este script en Supabase SQL Editor

-- PASO 1: Eliminar los índices creados
DROP INDEX IF EXISTS idx_administrators_user_id;
DROP INDEX IF EXISTS idx_administrators_rut;

-- PASO 2: Eliminar las políticas RLS modificadas
DROP POLICY IF EXISTS "Allow authenticated users to view all administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to insert administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to update administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to delete administrators" ON administrators;

-- PASO 3: Restaurar las políticas RLS originales
CREATE POLICY "Allow authenticated users to view administrators" ON administrators
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert administrators" ON administrators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update administrators" ON administrators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete administrators" ON administrators
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 4: Eliminar las columnas agregadas
ALTER TABLE administrators DROP COLUMN IF EXISTS admin_type;
ALTER TABLE administrators DROP COLUMN IF EXISTS email;
ALTER TABLE administrators DROP COLUMN IF EXISTS phone;

-- PASO 5: Restaurar la restricción UNIQUE en user_id
ALTER TABLE administrators ADD CONSTRAINT administrators_user_id_key UNIQUE (user_id);

-- PASO 6: Verificar que la tabla esté en su estado original
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'administrators' 
ORDER BY ordinal_position;

-- PASO 7: Verificar las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'administrators';

-- PASO 8: Verificar las restricciones
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'administrators'::regclass;

-- Mensaje de confirmación
SELECT 'Tabla administrators revertida exitosamente a su estado original' as status;

