-- =====================================================
-- VERIFICAR RESTRICCIONES CHECK EN CONTRACTS
-- =====================================================

-- 1. Verificar todas las restricciones CHECK en la tabla contracts
SELECT 
    'Restricciones CHECK en contracts:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%contracts%'
ORDER BY constraint_name;

-- 2. Verificar restricciones específicas de la tabla contracts
SELECT 
    'Restricciones de tabla contracts:' as info,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'contracts' 
    AND tc.table_schema = 'public'
    AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;

-- 3. Mostrar la estructura completa de la tabla contracts
SELECT 
    'Estructura completa de contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar si hay restricciones CHECK en la columna contract_type específicamente
SELECT 
    'Restricciones en contract_type:' as info,
    cc.constraint_name,
    cc.check_clause
FROM information_schema.check_constraints cc
WHERE cc.constraint_schema = 'public'
    AND cc.check_clause LIKE '%contract_type%';

-- 5. Probar valores válidos para contract_type (si es un ENUM)
SELECT 
    'Posibles valores para contract_type:' as info,
    enumlabel as valid_values
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'contract_type_enum'
);

-- 6. Verificar si contract_type tiene restricciones de dominio
SELECT 
    'Dominios para contract_type:' as info,
    domain_name,
    data_type,
    domain_default
FROM information_schema.domains 
WHERE domain_schema = 'public'
    AND domain_name LIKE '%contract%';

-- =====================================================
-- DIAGNÓSTICO DE RESTRICCIONES CHECK COMPLETADO
-- =====================================================






