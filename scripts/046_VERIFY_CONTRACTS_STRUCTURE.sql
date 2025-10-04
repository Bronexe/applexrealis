-- =====================================================
-- VERIFICAR ESTRUCTURA COMPLETA DE LA TABLA CONTRACTS
-- =====================================================

-- 1. Verificar si la tabla contracts existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public')
        THEN '✅ Tabla contracts EXISTE'
        ELSE '❌ Tabla contracts NO EXISTE'
    END as status_contracts;

-- 2. Mostrar estructura actual de la tabla
SELECT 
    'Estructura actual de contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar columnas requeridas
SELECT 
    'Columnas requeridas vs existentes:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'id') 
        THEN '✅ id' ELSE '❌ id' END as id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'condo_id') 
        THEN '✅ condo_id' ELSE '❌ condo_id' END as condo_id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'user_id') 
        THEN '✅ user_id' ELSE '❌ user_id' END as user_id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'contract_type') 
        THEN '✅ contract_type' ELSE '❌ contract_type' END as contract_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'provider_name') 
        THEN '✅ provider_name' ELSE '❌ provider_name' END as provider_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'contract_number') 
        THEN '✅ contract_number' ELSE '❌ contract_number' END as contract_number,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'start_date') 
        THEN '✅ start_date' ELSE '❌ start_date' END as start_date,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'end_date') 
        THEN '✅ end_date' ELSE '❌ end_date' END as end_date,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'amount') 
        THEN '✅ amount' ELSE '❌ amount' END as amount,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'currency') 
        THEN '✅ currency' ELSE '❌ currency' END as currency,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'contract_file_url') 
        THEN '✅ contract_file_url' ELSE '❌ contract_file_url' END as contract_file_url,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'status') 
        THEN '✅ status' ELSE '❌ status' END as status;

-- 4. Verificar restricciones CHECK
SELECT 
    'Restricciones CHECK en contracts:' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%contracts%';

-- 5. Contar registros existentes
SELECT 
    'Registros existentes en contracts:' as info,
    COUNT(*) as total_contracts
FROM contracts;

-- =====================================================
-- VERIFICACIÓN DE ESTRUCTURA COMPLETADA
-- =====================================================






