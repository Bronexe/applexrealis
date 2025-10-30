-- =====================================================
-- SCRIPT PARA VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar políticas RLS de unidades_simplified
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'unidades_simplified';

-- Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'unidades_simplified';

-- Verificar función user_can_access_condo
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'user_can_access_condo';

-- Probar la función user_can_access_condo con datos de prueba
SELECT user_can_access_condo(
    '00000000-0000-0000-0000-000000000000'::UUID, 
    '00000000-0000-0000-0000-000000000000'::UUID
) as can_access_test;

-- Verificar si hay condominios en la base de datos
SELECT COUNT(*) as total_condos FROM condos;

-- Verificar si hay usuarios en la base de datos
SELECT COUNT(*) as total_users FROM auth.users;

-- Verificar estructura de la tabla unidades_simplified
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'unidades_simplified' 
    AND table_schema = 'public'
ORDER BY ordinal_position;










