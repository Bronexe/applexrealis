-- =====================================================
-- VERIFICACIÓN SIMPLE DE LA TABLA CONTRACTS
-- =====================================================

-- 1. Verificar si la tabla contracts existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public')
        THEN '✅ Tabla contracts EXISTE'
        ELSE '❌ Tabla contracts NO EXISTE'
    END as status_contracts;

-- 2. Mostrar estructura de la tabla contracts (si existe)
SELECT 
    'Estructura de contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Contar registros en contracts (si existe)
SELECT 
    'Total de contratos:' as info,
    COUNT(*) as total_contracts
FROM contracts
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public');

-- 4. Verificar RLS en contracts (si existe)
SELECT 
    'RLS en contracts:' as info,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'contracts' 
    AND schemaname = 'public';

-- 5. Mostrar políticas RLS (si existen)
SELECT 
    'Políticas RLS en contracts:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 6. Verificar restricciones CHECK
SELECT 
    'Restricciones CHECK en contracts:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%contracts%';

-- =====================================================
-- DIAGNÓSTICO SIMPLE COMPLETADO
-- =====================================================






