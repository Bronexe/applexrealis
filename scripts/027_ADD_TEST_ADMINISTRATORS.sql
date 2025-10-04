-- =====================================================
-- AGREGAR USUARIOS DE PRUEBA PARA SUPER-ADMIN
-- =====================================================

-- Este script agrega usuarios de prueba a la tabla administrators
-- para que puedas ver la funcionalidad del super-admin

-- 1. VERIFICAR USUARIOS EXISTENTES EN AUTH.USERS
SELECT 
    'Usuarios en auth.users:' as info,
    COUNT(*) as total_users
FROM auth.users;

-- 2. MOSTRAR USUARIOS DISPONIBLES
SELECT 
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. AGREGAR USUARIOS DE PRUEBA A ADMINISTRATORS
-- (Solo si no existen ya)

-- Usuario Admin de prueba 1
DO $$
DECLARE
    test_user_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Buscar usuario con email que contenga 'test' o 'admin'
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email LIKE '%test%' OR email LIKE '%admin%'
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Verificar si ya existe en administrators
        SELECT EXISTS(
            SELECT 1 FROM administrators 
            WHERE user_id = test_user_id
        ) INTO admin_exists;
        
        IF NOT admin_exists THEN
            INSERT INTO administrators (
                user_id,
                full_name,
                rut,
                email,
                registration_date,
                regions,
                role,
                is_active
            ) VALUES (
                test_user_id,
                'Usuario Admin Test',
                '11111111-1',
                (SELECT email FROM auth.users WHERE id = test_user_id),
                CURRENT_DATE,
                ARRAY['Metropolitana'],
                'admin',
                true
            );
            
            RAISE NOTICE 'Usuario admin de prueba agregado: %', test_user_id;
        ELSE
            RAISE NOTICE 'Usuario admin de prueba ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'No se encontró usuario de prueba en auth.users';
    END IF;
END $$;

-- 4. AGREGAR USUARIO REGULAR DE PRUEBA
DO $$
DECLARE
    regular_user_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Buscar cualquier usuario que no sea sebaleon@gmail.com
    SELECT id INTO regular_user_id 
    FROM auth.users 
    WHERE email != 'sebaleon@gmail.com'
    LIMIT 1;
    
    IF regular_user_id IS NOT NULL THEN
        -- Verificar si ya existe en administrators
        SELECT EXISTS(
            SELECT 1 FROM administrators 
            WHERE user_id = regular_user_id
        ) INTO user_exists;
        
        IF NOT user_exists THEN
            INSERT INTO administrators (
                user_id,
                full_name,
                rut,
                email,
                registration_date,
                regions,
                role,
                is_active
            ) VALUES (
                regular_user_id,
                'Usuario Regular',
                '22222222-2',
                (SELECT email FROM auth.users WHERE id = regular_user_id),
                CURRENT_DATE,
                ARRAY['Valparaíso'],
                'user',
                true
            );
            
            RAISE NOTICE 'Usuario regular agregado: %', regular_user_id;
        ELSE
            RAISE NOTICE 'Usuario regular ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'No se encontró usuario regular en auth.users';
    END IF;
END $$;

-- 5. VERIFICAR RESULTADO FINAL
SELECT 
    'Administradores creados:' as info,
    COUNT(*) as total_administrators
FROM administrators;

-- 6. MOSTRAR TODOS LOS ADMINISTRADORES
SELECT 
    id,
    full_name,
    email,
    rut,
    role,
    is_active,
    regions,
    created_at
FROM administrators
ORDER BY 
    CASE role 
        WHEN 'super_admin' THEN 1 
        WHEN 'admin' THEN 2 
        WHEN 'user' THEN 3 
    END,
    created_at DESC;

-- 7. ESTADÍSTICAS POR ROL
SELECT 
    role,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN is_active THEN 1 END) as activos
FROM administrators
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'super_admin' THEN 1 
        WHEN 'admin' THEN 2 
        WHEN 'user' THEN 3 
    END;

-- =====================================================
-- USUARIOS DE PRUEBA AGREGADOS
-- =====================================================






