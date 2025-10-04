-- =====================================================
-- VERIFICACIÓN COMPLETA DE SEGURIDAD RLS
-- =====================================================
-- Este script verifica y corrige todos los problemas de RLS en el esquema

-- 1. Verificar todas las tablas públicas y su estado RLS
SELECT 
    'Estado RLS de todas las tablas públicas:' as info,
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname)
        THEN true
        ELSE false
    END as has_rls_policies,
    CASE 
        WHEN t.rowsecurity = true THEN '✅ RLS habilitado'
        WHEN EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname) AND t.rowsecurity = false THEN '⚠️  Políticas sin RLS habilitado'
        ELSE '❌ Sin RLS ni políticas'
    END as estado_seguridad
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY 
    CASE 
        WHEN t.rowsecurity = false AND EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname) THEN 1  -- Prioridad alta: políticas sin RLS
        WHEN t.rowsecurity = false THEN 2  -- Prioridad media: sin RLS
        ELSE 3  -- Prioridad baja: RLS habilitado
    END,
    t.tablename;

-- 2. Identificar tablas con políticas pero sin RLS habilitado
SELECT 
    'Tablas con políticas pero sin RLS habilitado:' as info,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as cantidad_politicas,
    STRING_AGG(p.policyname, ', ') as nombres_politicas
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
  AND t.rowsecurity = false 
  AND p.policyname IS NOT NULL
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- 3. Identificar tablas sin RLS ni políticas
SELECT 
    'Tablas sin RLS ni políticas:' as info,
    t.tablename,
    t.rowsecurity as rls_enabled,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname)
        THEN true
        ELSE false
    END as has_rls_policies
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = false 
  AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname)
ORDER BY t.tablename;

-- 4. Corregir automáticamente tablas con políticas pero sin RLS
DO $$ 
DECLARE
    table_record RECORD;
    corrected_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== CORRIGIENDO TABLAS CON POLÍTICAS SIN RLS ===';
    
    -- Buscar tablas con políticas pero sin RLS habilitado
    FOR table_record IN 
        SELECT DISTINCT t.tablename
        FROM pg_tables t
        INNER JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
        WHERE t.schemaname = 'public' 
          AND t.rowsecurity = false
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
            RAISE NOTICE '✅ RLS habilitado en tabla: %', table_record.tablename;
            corrected_count := corrected_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error habilitando RLS en %: %', table_record.tablename, SQLERRM;
        END;
    END LOOP;
    
    IF corrected_count = 0 THEN
        RAISE NOTICE 'ℹ️  No se encontraron tablas que necesiten corrección';
    ELSE
        RAISE NOTICE '✅ Total de tablas corregidas: %', corrected_count;
    END IF;
    
    RAISE NOTICE '=== CORRECCIÓN COMPLETADA ===';
END $$;

-- 5. Verificar estado después de correcciones
SELECT 
    'Estado RLS después de correcciones:' as info,
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname)
        THEN true
        ELSE false
    END as has_rls_policies,
    CASE 
        WHEN t.rowsecurity = true THEN '✅ RLS habilitado'
        WHEN EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname) AND t.rowsecurity = false THEN '⚠️  Políticas sin RLS habilitado'
        ELSE '❌ Sin RLS ni políticas'
    END as estado_seguridad
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY 
    CASE 
        WHEN t.rowsecurity = false AND EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname) THEN 1
        WHEN t.rowsecurity = false THEN 2
        ELSE 3
    END,
    t.tablename;

-- 6. Mostrar resumen de políticas por tabla
SELECT 
    'Resumen de políticas por tabla:' as info,
    tablename,
    COUNT(*) as cantidad_politicas,
    STRING_AGG(policyname, ', ') as nombres_politicas
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 7. Verificar que no hay alertas de seguridad pendientes
SELECT 
    'Verificación final de seguridad:' as info,
    COUNT(*) as tablas_con_problemas
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = false 
  AND EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname);

-- =====================================================
-- VERIFICACIÓN COMPLETA DE SEGURIDAD COMPLETADA
-- =====================================================
