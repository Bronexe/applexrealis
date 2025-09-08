-- =====================================================
-- CORRECCIÓN DE RLS PARA TABLA ADMINISTRATORS
-- =====================================================
-- Este script corrige los problemas de Row Level Security
-- Ejecuta este script en Supabase SQL Editor

-- PASO 1: Verificar que la tabla existe
SELECT 'Verificando tabla administrators...' as status;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'administrators' 
ORDER BY ordinal_position;

-- PASO 2: Verificar RLS actual
SELECT 'Verificando RLS actual...' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'administrators';

-- PASO 3: Verificar políticas actuales
SELECT 'Verificando políticas actuales...' as status;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'administrators';

-- PASO 4: Eliminar todas las políticas existentes
SELECT 'Eliminando políticas existentes...' as status;
DROP POLICY IF EXISTS "Users can view own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can insert own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can update own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can delete own administrator data" ON administrators;

-- PASO 5: Asegurar que RLS esté habilitado
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- PASO 6: Crear políticas RLS correctas
SELECT 'Creando políticas RLS correctas...' as status;

-- Política para SELECT (ver datos propios)
CREATE POLICY "Users can view own administrator data" ON administrators
FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT (crear datos propios)
CREATE POLICY "Users can insert own administrator data" ON administrators
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (actualizar datos propios)
CREATE POLICY "Users can update own administrator data" ON administrators
FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE (eliminar datos propios)
CREATE POLICY "Users can delete own administrator data" ON administrators
FOR DELETE USING (auth.uid() = user_id);

-- PASO 7: Verificar que las políticas se crearon correctamente
SELECT 'Verificando políticas creadas...' as status;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'administrators'
ORDER BY policyname;

-- PASO 8: Probar acceso (esto debería funcionar si el usuario está autenticado)
SELECT 'Probando acceso a la tabla...' as status;
SELECT 'Si ves este mensaje, la tabla es accesible' as test_result;

-- PASO 9: Verificar estructura de la tabla
SELECT 'Estructura final de la tabla:' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'administrators' 
ORDER BY ordinal_position;

-- PASO 10: Mensaje de éxito
SELECT '🎉 RLS CORREGIDO EXITOSAMENTE 🎉' as status;
SELECT 'La tabla administrators ahora debería ser accesible desde la aplicación' as message;

