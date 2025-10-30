-- =====================================================
-- VERIFICAR USUARIO ACTUAL AUTENTICADO
-- =====================================================

-- 1. VERIFICAR USUARIO ACTUAL EN AUTH
SELECT 
    'Usuario actual autenticado:' as info,
    auth.uid() as current_user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as current_email;

-- 2. VERIFICAR SI ESE USUARIO EXISTE EN ADMINISTRATORS
SELECT 
    'Usuario actual en administrators:' as info,
    id,
    full_name,
    email,
    role,
    is_active,
    user_id
FROM administrators 
WHERE user_id = auth.uid();

-- 3. VERIFICAR SI EL USUARIO ACTUAL ES SUPER ADMIN
SELECT 
    '¿Es super admin el usuario actual?' as question,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM administrators 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        ) THEN 'SÍ es super admin'
        ELSE 'NO es super admin'
    END as answer;

-- 4. MOSTRAR TODOS LOS USUARIOS EN AUTH.USERS
SELECT 
    'Usuarios en auth.users:' as info,
    id,
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    last_sign_in_at IS NOT NULL as has_signed_in,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 5. VERIFICAR SI HAY DISCREPANCIA
SELECT 
    'Discrepancia entre auth y administrators:' as info,
    au.id as auth_user_id,
    au.email as auth_email,
    ad.id as admin_id,
    ad.email as admin_email,
    ad.role as admin_role,
    CASE 
        WHEN ad.id IS NULL THEN 'Usuario en auth pero NO en administrators'
        WHEN au.id IS NULL THEN 'Usuario en administrators pero NO en auth'
        ELSE 'Usuario existe en ambas tablas'
    END as status
FROM auth.users au
FULL OUTER JOIN administrators ad ON au.id = ad.user_id
WHERE au.id = auth.uid() OR ad.user_id = auth.uid();

-- =====================================================
-- VERIFICACIÓN COMPLETADA
-- =====================================================









