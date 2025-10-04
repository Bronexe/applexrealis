-- =====================================================
-- CREAR FUNCIÓN isSuperAdmin SEGURA
-- =====================================================

-- 1. ELIMINAR FUNCIÓN EXISTENTE SI EXISTE
DROP FUNCTION IF EXISTS is_super_admin();

-- 2. CREAR FUNCIÓN SEGURA PARA VERIFICAR SUPER ADMIN
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
    is_super BOOLEAN := FALSE;
BEGIN
    -- Obtener el usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Obtener el email del usuario
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Verificación específica para sebaleon@gmail.com
    IF user_email = 'sebaleon@gmail.com' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificación en la tabla administrators
    -- Usar SECURITY DEFINER para evitar problemas de RLS
    SELECT EXISTS(
        SELECT 1 FROM administrators 
        WHERE user_id = current_user_id 
        AND role = 'super_admin' 
        AND is_active = true
    ) INTO is_super;
    
    RETURN is_super;
END;
$$;

-- 3. PROBAR LA FUNCIÓN
SELECT 
    'Test de función is_super_admin():' as test,
    is_super_admin() as result;

-- 4. VERIFICAR QUE LA FUNCIÓN FUNCIONA
SELECT 
    'Verificación de función:' as info,
    CASE 
        WHEN is_super_admin() THEN '✅ Función funciona correctamente'
        ELSE '❌ Función no funciona'
    END as status;

-- =====================================================
-- FUNCIÓN isSuperAdmin CORREGIDA
-- =====================================================






