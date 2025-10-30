-- =====================================================
-- VERIFICAR QUE LAS FUNCIONES EXISTEN
-- =====================================================

-- 1. Verificar todas las funciones relacionadas con condominios
SELECT 
    'Funciones disponibles:' as info,
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%condos%'
ORDER BY routine_name;

-- 2. Verificar específicamente las funciones que necesitamos
SELECT 
    'Funciones requeridas:' as info,
    CASE 
        WHEN routine_name = 'check_condos_limit' THEN '✅ check_condos_limit'
        WHEN routine_name = 'get_condos_limit_info' THEN '✅ get_condos_limit_info'
        WHEN routine_name = 'update_condos_limit' THEN '✅ update_condos_limit'
        ELSE '❌ ' || routine_name
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('check_condos_limit', 'get_condos_limit_info', 'update_condos_limit')
ORDER BY routine_name;

-- 3. Contar cuántas funciones tenemos
SELECT 
    'Resumen:' as info,
    COUNT(*) as total_functions,
    COUNT(CASE WHEN routine_name = 'check_condos_limit' THEN 1 END) as check_function,
    COUNT(CASE WHEN routine_name = 'get_condos_limit_info' THEN 1 END) as info_function,
    COUNT(CASE WHEN routine_name = 'update_condos_limit' THEN 1 END) as update_function
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('check_condos_limit', 'get_condos_limit_info', 'update_condos_limit');

-- =====================================================
-- VERIFICACIÓN COMPLETADA
-- =====================================================









