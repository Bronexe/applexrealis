-- =====================================================
-- SCRIPT DE DIAGNÓSTICO DE LA BASE DE DATOS
-- =====================================================

-- Verificar si las tablas existen
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'condos', 'assemblies', 'emergency_plans', 'certifications', 
        'insurances', 'contracts', 'copropietarios', 'unidades_simplified',
        'unidades_historial_simplified', 'archivos_cbr_simplified', 'unidades',
        'alerts', 'rules', 'roles', 'user_roles', 'condo_user_permissions',
        'user_settings', 'report_templates', 'notification_settings'
    )
ORDER BY table_name;

-- Verificar estructura de la tabla condos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'condos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS de la tabla condos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'condos';

-- Verificar si RLS está habilitado en condos
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'condos';

-- Verificar índices de la tabla condos
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'condos';

-- Verificar si hay datos en la tabla condos
SELECT COUNT(*) as total_condos FROM condos;

-- Verificar usuarios autenticados
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar roles y user_roles (solo si las tablas existen)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        RAISE NOTICE 'Tabla roles existe';
    ELSE
        RAISE NOTICE 'Tabla roles NO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Tabla user_roles existe';
    ELSE
        RAISE NOTICE 'Tabla user_roles NO existe';
    END IF;
END $$;

-- Verificar conteos de roles (solo si existen)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') 
        THEN (SELECT COUNT(*) FROM roles)::text
        ELSE 'Tabla no existe'
    END as total_roles,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') 
        THEN (SELECT COUNT(*) FROM user_roles)::text
        ELSE 'Tabla no existe'
    END as total_user_roles;

-- Verificar estructura de la tabla user_roles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar permisos de usuario actual (solo si las tablas existen)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        
        RAISE NOTICE 'Consultando permisos de usuario...';
        
    ELSE
        RAISE NOTICE 'No se pueden consultar permisos - tablas de roles no existen';
    END IF;
END $$;

-- Consulta de permisos (solo si las tablas existen)
SELECT 
    r.name as role_name,
    ur.user_id
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles')
LIMIT 10;
