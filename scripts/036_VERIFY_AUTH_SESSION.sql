    -- =====================================================
    -- VERIFICAR SESIÓN DE AUTENTICACIÓN ACTUAL
    -- =====================================================

    -- 1. VERIFICAR USUARIO ACTUAL AUTENTICADO
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

    -- 4. VERIFICAR ESPECÍFICAMENTE sebaleon@gmail.com
    SELECT 
        'Verificación específica de sebaleon@gmail.com:' as info,
        au.id as auth_user_id,
        au.email as auth_email,
        ad.id as admin_id,
        ad.email as admin_email,
        ad.role as admin_role,
        ad.is_active as admin_active
    FROM auth.users au
    LEFT JOIN administrators ad ON au.id = ad.user_id
    WHERE au.email = 'sebaleon@gmail.com';

    -- 5. VERIFICAR SI HAY PROBLEMA DE SESIÓN
    SELECT 
        'Estado de la sesión:' as info,
        CASE 
            WHEN auth.uid() IS NULL THEN '❌ NO HAY USUARIO AUTENTICADO'
            WHEN auth.uid() = 'da7b2d43-4340-48d8-afeb-1b8289838711' THEN '✅ AUTENTICADO COMO sebaleon@gmail.com'
            ELSE '⚠️ AUTENTICADO COMO OTRO USUARIO'
        END as session_status;

    -- =====================================================
    -- VERIFICACIÓN DE SESIÓN COMPLETADA
    -- =====================================================









