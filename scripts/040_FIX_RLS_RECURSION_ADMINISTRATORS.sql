-- =====================================================
-- SOLUCIONAR RECURSIÓN INFINITA EN ADMINISTRATORS
-- =====================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "super_admins_can_view_all" ON administrators;
DROP POLICY IF EXISTS "super_admins_can_insert" ON administrators;
DROP POLICY IF EXISTS "super_admins_can_update" ON administrators;
DROP POLICY IF EXISTS "super_admins_can_delete" ON administrators;

-- 2. CREAR FUNCIÓN HELPER SEGURA PARA EVITAR RECURSIÓN
CREATE OR REPLACE FUNCTION is_super_admin_safe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
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
    
    -- Verificación en la tabla administrators usando SECURITY DEFINER
    -- para evitar recursión
    RETURN EXISTS(
        SELECT 1 FROM administrators 
        WHERE user_id = current_user_id 
        AND role = 'super_admin' 
        AND is_active = true
    );
END;
$$;

-- 3. CREAR POLÍTICAS RLS SIN RECURSIÓN
-- Política para SELECT - Usar función helper
CREATE POLICY "super_admins_select_no_recursion" ON administrators
FOR SELECT USING (is_super_admin_safe());

-- Política para INSERT - Usar función helper
CREATE POLICY "super_admins_insert_no_recursion" ON administrators
FOR INSERT WITH CHECK (is_super_admin_safe());

-- Política para UPDATE - Usar función helper
CREATE POLICY "super_admins_update_no_recursion" ON administrators
FOR UPDATE USING (is_super_admin_safe());

-- Política para DELETE - Usar función helper
CREATE POLICY "super_admins_delete_no_recursion" ON administrators
FOR DELETE USING (is_super_admin_safe());

-- 4. VERIFICAR QUE RLS ESTÁ HABILITADO
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- 5. PROBAR LA FUNCIÓN HELPER
SELECT 
    'Test de función is_super_admin_safe():' as test,
    is_super_admin_safe() as result;

-- 6. PROBAR ACCESO DESPUÉS DE CORREGIR RECURSIÓN
SELECT 
    'Test de acceso sin recursión:' as test,
    COUNT(*) as accessible_records
FROM administrators;

-- 7. MOSTRAR USUARIOS ACCESIBLES
SELECT 
    'Usuarios accesibles:' as info,
    id,
    full_name,
    email,
    role,
    is_active
FROM administrators
ORDER BY created_at DESC
LIMIT 5;

-- 8. VERIFICAR POLÍTICAS CREADAS
SELECT 
    'Políticas RLS sin recursión:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'administrators' 
    AND schemaname = 'public'
ORDER BY policyname;

-- =====================================================
-- RECURSIÓN INFINITA SOLUCIONADA
-- =====================================================






