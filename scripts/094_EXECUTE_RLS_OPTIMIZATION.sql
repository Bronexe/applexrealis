-- =====================================================
-- SCRIPT DE EJECUCIÓN DE OPTIMIZACIÓN RLS
-- =====================================================
-- Este script ejecuta todas las optimizaciones en el orden correcto
-- para evitar dependencias y errores

-- PASO 1: Crear funciones helper optimizadas
\echo 'Paso 1: Creando funciones helper optimizadas...'
\i scripts/088_OPTIMIZE_RLS_FUNCTIONS.sql

-- PASO 2: Optimizar tabla base (condos)
\echo 'Paso 2: Optimizando políticas RLS para tabla condos...'
\i scripts/089_OPTIMIZE_CONDOS_RLS.sql

-- PASO 3: Optimizar assemblies (alta frecuencia)
\echo 'Paso 3: Optimizando políticas RLS para tabla assemblies...'
\i scripts/090_OPTIMIZE_ASSEMBLIES_RLS.sql

-- PASO 4: Optimizar certifications
\echo 'Paso 4: Optimizando políticas RLS para tabla certifications...'
\i scripts/091_OPTIMIZE_CERTIFICATIONS_RLS.sql

-- PASO 5: Optimizar insurances
\echo 'Paso 5: Optimizando políticas RLS para tabla insurances...'
\i scripts/092_OPTIMIZE_INSURANCES_RLS.sql

-- PASO 6: Optimizar copropietarios (línea 58 del CSV)
\echo 'Paso 6: Optimizando políticas RLS para tabla copropietarios...'
\i scripts/093_OPTIMIZE_COPROPIETARIOS_RLS.sql

-- PASO 7: Verificar optimizaciones aplicadas
\echo 'Paso 7: Verificando optimizaciones aplicadas...'

-- Mostrar resumen de políticas optimizadas
SELECT 
  'RESUMEN DE OPTIMIZACIONES APLICADAS' as titulo,
  '' as separador;

SELECT 
  tablename,
  COUNT(*) as politicas_actuales,
  CASE 
    WHEN tablename = 'condos' THEN '1 política optimizada (antes: múltiples)'
    WHEN tablename = 'assemblies' THEN '1 política consolidada (antes: 3 políticas)'
    WHEN tablename = 'certifications' THEN '1 política consolidada (antes: 3 políticas)'
    WHEN tablename = 'insurances' THEN '1 política consolidada (antes: 3 políticas)'
    WHEN tablename = 'copropietarios' THEN '1 política consolidada (antes: 2 políticas)'
    ELSE 'Verificar manualmente'
  END as optimizacion
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('condos', 'assemblies', 'certifications', 'insurances', 'copropietarios')
GROUP BY tablename
ORDER BY tablename;

-- Mostrar funciones helper creadas
SELECT 
  'FUNCIONES HELPER CREADAS' as titulo,
  '' as separador;

SELECT 
  proname as funcion,
  pg_get_function_identity_arguments(oid) as argumentos,
  'STABLE' as estabilidad
FROM pg_proc 
WHERE proname IN (
  'auth_uid', 'is_super_admin', 'has_condo_access', 
  'can_read_condo', 'can_manage_condo', 'can_manage_assemblies',
  'can_manage_certifications', 'can_manage_insurances', 
  'can_manage_copropietarios', 'can_manage_emergency_plans',
  'can_view_alerts', 'can_manage_contracts', 'can_manage_unidades',
  'can_manage_gestiones'
)
ORDER BY proname;

\echo 'Optimización RLS completada exitosamente!'
\echo 'Próximo paso: Ejecutar optimización para emergency_plans, alerts, contracts, etc.'






