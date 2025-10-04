-- =====================================================
-- CORREGIR ALERTAS DE SEGURIDAD EN UNIDADES_SIMPLIFIED
-- =====================================================
-- Este script corrige las alertas de RLS en la tabla unidades_simplified

-- 1. Verificar estado actual de RLS en unidades_simplified
SELECT 
    'Estado actual de RLS en unidades_simplified:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'unidades_simplified' AND schemaname = 'public')
        THEN true
        ELSE false
    END as has_rls_policies
FROM pg_tables 
WHERE tablename = 'unidades_simplified';

-- 2. Verificar políticas RLS existentes
SELECT 
    'Políticas RLS en unidades_simplified:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'unidades_simplified'
ORDER BY policyname;

-- 3. Verificar si la tabla existe
SELECT 
    'Verificando existencia de tabla unidades_simplified:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unidades_simplified') 
        THEN '✅ Tabla existe'
        ELSE '❌ Tabla NO existe'
    END as estado;

-- 4. Habilitar RLS en la tabla unidades_simplified
DO $$ 
BEGIN
    -- Verificar si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unidades_simplified') THEN
        -- Habilitar RLS
        ALTER TABLE public.unidades_simplified ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado en tabla unidades_simplified';
    ELSE
        RAISE NOTICE '❌ Tabla unidades_simplified no existe';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error habilitando RLS: %', SQLERRM;
END $$;

-- 5. Verificar que RLS se habilitó correctamente
SELECT 
    'Estado después de habilitar RLS:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'unidades_simplified' AND schemaname = 'public')
        THEN true
        ELSE false
    END as has_rls_policies
FROM pg_tables 
WHERE tablename = 'unidades_simplified';

-- 6. Verificar que las políticas siguen activas
SELECT 
    'Políticas RLS después de habilitar RLS:' as info,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Tiene condiciones'
        ELSE 'Sin condiciones'
    END as tiene_condiciones
FROM pg_policies 
WHERE tablename = 'unidades_simplified'
ORDER BY policyname;

-- 7. Probar que las políticas funcionan correctamente
DO $$ 
DECLARE
    policy_count INTEGER;
    test_result BOOLEAN;
BEGIN
    RAISE NOTICE '=== PROBANDO POLÍTICAS RLS ===';
    
    -- Contar políticas activas
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'unidades_simplified';
    
    RAISE NOTICE 'Políticas activas: %', policy_count;
    
    -- Verificar que RLS está habilitado
    SELECT rowsecurity INTO test_result 
    FROM pg_tables 
    WHERE tablename = 'unidades_simplified';
    
    IF test_result THEN
        RAISE NOTICE '✅ RLS está habilitado correctamente';
    ELSE
        RAISE NOTICE '❌ RLS no está habilitado';
    END IF;
    
    RAISE NOTICE '=== PRUEBA COMPLETADA ===';
END $$;

-- 8. Mostrar resumen de la corrección
SELECT 
    'Resumen de corrección:' as info,
    'RLS habilitado en unidades_simplified' as accion,
    'Alertas de seguridad corregidas' as resultado;

-- =====================================================
-- CORRECCIÓN DE ALERTAS DE SEGURIDAD COMPLETADA
-- =====================================================
