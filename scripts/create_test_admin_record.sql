-- =====================================================
-- CREAR REGISTRO DE PRUEBA DE ADMINISTRADOR
-- =====================================================
-- Este script crea un registro de prueba para el primer usuario
-- Ejecuta este script en Supabase SQL Editor

-- PASO 1: Obtener el primer usuario autenticado
SELECT '=== OBTENIENDO PRIMER USUARIO ===' as status;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at ASC 
LIMIT 1;

-- PASO 2: Crear registro de prueba (solo si no existe)
SELECT '=== CREANDO REGISTRO DE PRUEBA ===' as status;

-- Insertar registro de prueba para el primer usuario
INSERT INTO administrators (
    user_id,
    full_name,
    rut,
    registration_date,
    regions,
    certification_file_url
)
SELECT 
    u.id,
    'Administrador de Prueba',
    '12.345.678-9',
    CURRENT_DATE,
    ARRAY['Metropolitana', 'Valparaíso'],
    NULL
FROM auth.users u
WHERE u.id = (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM administrators a WHERE a.user_id = u.id
);

-- PASO 3: Verificar que se creó el registro
SELECT '=== VERIFICANDO REGISTRO CREADO ===' as status;
SELECT 
    id,
    user_id,
    full_name,
    rut,
    registration_date,
    regions,
    created_at
FROM administrators 
ORDER BY created_at DESC;

-- PASO 4: Verificar datos por usuario
SELECT '=== VERIFICACIÓN FINAL ===' as status;
SELECT 
    u.id as user_id,
    u.email,
    CASE 
        WHEN a.id IS NOT NULL THEN 'TIENE DATOS'
        ELSE 'SIN DATOS'
    END as status,
    a.full_name,
    a.rut,
    a.regions
FROM auth.users u
LEFT JOIN administrators a ON u.id = a.user_id
ORDER BY u.created_at ASC;

-- PASO 5: Mensaje de éxito
SELECT '=== REGISTRO DE PRUEBA CREADO ===' as status;
SELECT '🎉 Ahora deberías poder acceder a la página de administradores 🎉' as message;

