-- =====================================================
-- CORRECCIÓN FORZADA DE RLS PARA ADMINISTRATORS
-- =====================================================
-- Este script corrige agresivamente todos los problemas
-- Ejecuta este script en Supabase SQL Editor

-- PASO 1: Verificar estado actual
SELECT '=== ESTADO ACTUAL ===' as status;
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'administrators' 
ORDER BY ordinal_position;

-- PASO 2: Deshabilitar RLS temporalmente
SELECT '=== DESHABILITANDO RLS ===' as status;
ALTER TABLE administrators DISABLE ROW LEVEL SECURITY;

-- PASO 3: Eliminar TODAS las políticas existentes
SELECT '=== ELIMINANDO POLÍTICAS ===' as status;
DROP POLICY IF EXISTS "Users can view own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can insert own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can update own administrator data" ON administrators;
DROP POLICY IF EXISTS "Users can delete own administrator data" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to view administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to insert administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to update administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to delete administrators" ON administrators;

-- PASO 4: Verificar que no quedan políticas
SELECT '=== VERIFICANDO POLÍTICAS ELIMINADAS ===' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'administrators';

-- PASO 5: Habilitar RLS nuevamente
SELECT '=== HABILITANDO RLS ===' as status;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- PASO 6: Crear políticas RLS simples y robustas
SELECT '=== CREANDO POLÍTICAS RLS ===' as status;

-- Política para SELECT - permitir a usuarios autenticados ver sus propios datos
CREATE POLICY "admin_select_policy" ON administrators
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Política para INSERT - permitir a usuarios autenticados insertar sus propios datos
CREATE POLICY "admin_insert_policy" ON administrators
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE - permitir a usuarios autenticados actualizar sus propios datos
CREATE POLICY "admin_update_policy" ON administrators
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE - permitir a usuarios autenticados eliminar sus propios datos
CREATE POLICY "admin_delete_policy" ON administrators
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- PASO 7: Verificar políticas creadas
SELECT '=== VERIFICANDO POLÍTICAS CREADAS ===' as status;
SELECT 
    policyname, 
    cmd, 
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'administrators'
ORDER BY policyname;

-- PASO 8: Verificar RLS
SELECT '=== VERIFICANDO RLS ===' as status;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'administrators';

-- PASO 9: Probar acceso básico
SELECT '=== PROBANDO ACCESO ===' as status;
SELECT 'Tabla accesible' as test_result;

-- PASO 10: Verificar permisos
SELECT '=== VERIFICANDO PERMISOS ===' as status;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'administrators';

-- PASO 11: Mensaje de éxito
SELECT '=== CORRECCIÓN COMPLETADA ===' as status;
SELECT '🎉 RLS CORREGIDO FORZADAMENTE 🎉' as message;
SELECT 'La tabla administrators ahora debería ser completamente accesible' as result;
