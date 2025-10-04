-- =====================================================
-- SCRIPT PARA VERIFICAR ESTRUCTURA DE TABLA UNIDADES_SIMPLIFIED
-- =====================================================

-- Verificar estructura de la tabla unidades_simplified
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'unidades_simplified' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar si la columna user_id existe y sus propiedades
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'unidades_simplified' 
    AND table_schema = 'public'
    AND column_name = 'user_id';

-- Verificar políticas RLS de la tabla
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'unidades_simplified';

-- Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'unidades_simplified';

-- Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'unidades_simplified';

-- Verificar datos existentes (si los hay)
SELECT COUNT(*) as total_unidades FROM unidades_simplified;

-- Verificar si hay datos de prueba
SELECT 
    id,
    unidad_codigo,
    user_id,
    condo_id,
    created_at
FROM unidades_simplified 
LIMIT 5;







