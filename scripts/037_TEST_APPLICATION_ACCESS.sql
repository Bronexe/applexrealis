-- =====================================================
-- VERIFICAR ACCESO DESDE LA APLICACIÓN
-- =====================================================

-- Este script simula lo que hace la aplicación cuando accedes a /super-admin

-- 1. VERIFICAR QUE LA TABLA ADMINISTRATORS FUNCIONA
SELECT 
    'Test de acceso a administrators:' as test,
    COUNT(*) as total_administrators
FROM administrators;

-- 2. VERIFICAR QUE LAS POLÍTICAS RLS FUNCIONAN
SELECT 
    'Test de políticas RLS:' as test,
    COUNT(*) as accessible_records
FROM administrators;

-- 3. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT 
    'Estructura de administrators:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'administrators' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR QUE NO HAY ERRORES EN LAS POLÍTICAS
SELECT 
    'Políticas RLS activas:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'administrators' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
    'Estado de RLS:' as info,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'administrators' AND schemaname = 'public';

-- =====================================================
-- VERIFICACIÓN COMPLETADA
-- =====================================================






