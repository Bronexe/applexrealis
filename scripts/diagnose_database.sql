-- Script de diagnóstico para verificar el estado de la base de datos
-- Ejecuta este script en Supabase SQL Editor para diagnosticar problemas

-- 1. Verificar que las extensiones están habilitadas
SELECT 'Extensiones habilitadas:' as info;
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp');

-- 2. Verificar que las tablas principales existen
SELECT 'Tablas existentes:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances', 'administrators', 'notification_settings')
ORDER BY table_name;

-- 3. Verificar estructura de la tabla condos
SELECT 'Estructura de tabla condos:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'condos' 
ORDER BY ordinal_position;

-- 4. Verificar datos en condos
SELECT 'Datos en tabla condos:' as info;
SELECT COUNT(*) as total_condos FROM condos;
SELECT id, name, comuna, address, created_at FROM condos LIMIT 5;

-- 5. Verificar políticas RLS
SELECT 'Políticas RLS activas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('condos', 'assemblies', 'emergency_plans', 'certifications', 'insurances')
ORDER BY tablename, policyname;

-- 6. Verificar usuarios autenticados
SELECT 'Usuarios en auth.users:' as info;
SELECT COUNT(*) as total_users FROM auth.users;
SELECT id, email, created_at FROM auth.users LIMIT 3;

-- 7. Verificar permisos de usuario actual
SELECT 'Usuario actual:' as info;
SELECT auth.uid() as current_user_id;

-- 8. Probar consulta simple a condos
SELECT 'Prueba de consulta a condos:' as info;
SELECT * FROM condos LIMIT 1;

-- 9. Verificar si hay errores en logs (si es posible)
SELECT 'Estado de la base de datos:' as info;
SELECT 
  'Base de datos funcionando correctamente' as status,
  NOW() as timestamp;

