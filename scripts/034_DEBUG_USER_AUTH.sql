-- =====================================================
-- DEBUG: VERIFICAR USUARIO AUTENTICADO
-- =====================================================

-- 1. VERIFICAR USUARIO ACTUAL EN AUTH
SELECT 
    'Usuario actual en auth.users:' as info,
    auth.uid() as user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as email,
    (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) as email_confirmed;

-- 2. VERIFICAR SI ESE USUARIO EXISTE EN ADMINISTRATORS
SELECT 
    'Usuario en administrators:' as info,
    id,
    full_name,
    email,
    role,
    is_active,
    user_id
FROM administrators 
WHERE user_id = auth.uid();

-- 3. VERIFICAR USUARIO sebaleon@gmail.com ESPECÍFICAMENTE
SELECT 
    'Usuario sebaleon@gmail.com:' as info,
    id,
    full_name,
    email,
    role,
    is_active,
    user_id
FROM administrators 
WHERE email = 'sebaleon@gmail.com';

-- 4. VERIFICAR SI HAY DISCREPANCIA ENTRE AUTH.USERS Y ADMINISTRATORS
SELECT 
    'Discrepancia entre tablas:' as info,
    au.id as auth_user_id,
    au.email as auth_email,
    ad.id as admin_id,
    ad.email as admin_email,
    ad.role as admin_role
FROM auth.users au
LEFT JOIN administrators ad ON au.id = ad.user_id
WHERE au.email = 'sebaleon@gmail.com';

-- 5. MOSTRAR TODOS LOS USUARIOS EN AUTH.USERS
SELECT 
    'Todos los usuarios en auth.users:' as info,
    id,
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    last_sign_in_at IS NOT NULL as has_signed_in
FROM auth.users 
ORDER BY created_at DESC;

-- 6. MOSTRAR TODOS LOS ADMINISTRATORS
SELECT 
    'Todos los administradores:' as info,
    id,
    full_name,
    email,
    role,
    is_active,
    user_id
FROM administrators 
ORDER BY created_at DESC;

-- =====================================================
-- DEBUG COMPLETADO
-- =====================================================









