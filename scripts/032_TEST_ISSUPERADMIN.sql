-- =====================================================
-- PROBAR LA FUNCIÓN isSuperAdmin() DESDE SQL
-- =====================================================

-- 1. VERIFICAR USUARIO ACTUAL
SELECT 
    'Usuario actual en auth:' as info,
    auth.uid() as user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as email;

-- 2. PROBAR ACCESO DIRECTO A ADMINISTRATORS
SELECT 
    'Acceso directo a administrators:' as test,
    COUNT(*) as total_records
FROM administrators;

-- 3. PROBAR LA CONSULTA QUE HACE isSuperAdmin()
-- (Esta es la consulta que podría estar fallando)
SELECT 
    'Test de consulta isSuperAdmin:' as test,
    role,
    is_active,
    user_id
FROM administrators 
WHERE user_id = auth.uid();

-- 4. PROBAR CON EMAIL ESPECÍFICO
SELECT 
    'Test con email sebaleon@gmail.com:' as test,
    role,
    is_active,
    user_id,
    email
FROM administrators 
WHERE email = 'sebaleon@gmail.com';

-- 5. VERIFICAR SI HAY RECURSIÓN EN LAS POLÍTICAS
-- Intentar hacer la consulta que hace isSuperAdmin() paso a paso
SELECT 
    'Paso 1: Verificar si existe el usuario' as step,
    EXISTS(
        SELECT 1 FROM administrators 
        WHERE user_id = auth.uid()
    ) as user_exists;

SELECT 
    'Paso 2: Obtener datos del usuario' as step,
    role,
    is_active
FROM administrators 
WHERE user_id = auth.uid()
LIMIT 1;

SELECT 
    'Paso 3: Verificar si es super admin' as step,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM administrators 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        ) THEN 'SÍ es super admin'
        ELSE 'NO es super admin'
    END as result;

-- =====================================================
-- TEST DE isSuperAdmin COMPLETADO
-- =====================================================









