-- =====================================================
-- VERIFICAR ESTADO DE LA TABLA CONTRACTS
-- =====================================================

-- 1. Verificar si la tabla contracts existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public')
        THEN '✅ Tabla contracts EXISTE'
        ELSE '❌ Tabla contracts NO EXISTE'
    END as status_contracts;

-- 2. Mostrar estructura de la tabla contracts (si existe)
DO $$ 
DECLARE
    rec RECORD;
    contract_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public') THEN
        RAISE NOTICE '=== ESTRUCTURA DE LA TABLA CONTRACTS ===';
        
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'contracts' AND table_schema = 'public'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: % (nullable: %, default: %)', rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
        END LOOP;
        
        -- Contar registros
        EXECUTE 'SELECT COUNT(*) FROM contracts' INTO contract_count;
        RAISE NOTICE 'Total de contratos: %', contract_count;
        
    ELSE
        RAISE NOTICE '=== TABLA CONTRACTS NO EXISTE ===';
    END IF;
END $$;

-- 3. Verificar RLS en contracts (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public') THEN
        DECLARE
            rls_enabled BOOLEAN;
        BEGIN
            SELECT rowsecurity INTO rls_enabled 
            FROM pg_tables 
            WHERE tablename = 'contracts' AND schemaname = 'public';
            
            IF rls_enabled THEN
                RAISE NOTICE 'RLS está HABILITADO en contracts';
            ELSE
                RAISE NOTICE 'RLS está DESHABILITADO en contracts';
            END IF;
        END;
    END IF;
END $$;

-- 4. Mostrar políticas RLS (si existen)
SELECT 
    'Políticas RLS en contracts:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- =====================================================
-- DIAGNÓSTICO COMPLETADO
-- =====================================================
