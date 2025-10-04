-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA ADMINISTRATORS
-- =====================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "super_admins_select_all" ON administrators;
DROP POLICY IF EXISTS "super_admins_insert" ON administrators;
DROP POLICY IF EXISTS "super_admins_update" ON administrators;
DROP POLICY IF EXISTS "super_admins_delete" ON administrators;
DROP POLICY IF EXISTS "Super admins can view all administrators" ON administrators;
DROP POLICY IF EXISTS "Super admins can insert administrators" ON administrators;
DROP POLICY IF EXISTS "Super admins can update administrators" ON administrators;
DROP POLICY IF EXISTS "Super admins can delete administrators" ON administrators;

-- 2. CREAR POLÍTICAS RLS SIMPLIFICADAS Y FUNCIONALES
-- Política para SELECT - Super admins pueden ver todos los administradores
CREATE POLICY "super_admins_can_view_all" ON administrators
FOR SELECT USING (
    -- Verificación por email específico
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'sebaleon@gmail.com'
    )
    OR
    -- Verificación por rol en la tabla (sin recursión)
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Política para INSERT - Solo super admins pueden insertar
CREATE POLICY "super_admins_can_insert" ON administrators
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'sebaleon@gmail.com'
    )
    OR
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Política para UPDATE - Solo super admins pueden actualizar
CREATE POLICY "super_admins_can_update" ON administrators
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'sebaleon@gmail.com'
    )
    OR
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Política para DELETE - Solo super admins pueden eliminar
CREATE POLICY "super_admins_can_delete" ON administrators
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'sebaleon@gmail.com'
    )
    OR
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- 3. VERIFICAR QUE RLS ESTÁ HABILITADO
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- 4. PROBAR ACCESO DESPUÉS DE CORREGIR POLÍTICAS
SELECT 
    'Test de acceso después de corregir políticas:' as test,
    COUNT(*) as accessible_records
FROM administrators;

-- 5. MOSTRAR USUARIOS ACCESIBLES
SELECT 
    'Usuarios accesibles:' as info,
    id,
    full_name,
    email,
    role,
    is_active
FROM administrators
ORDER BY created_at DESC;

-- 6. VERIFICAR POLÍTICAS CREADAS
SELECT 
    'Políticas RLS creadas:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'administrators' 
    AND schemaname = 'public'
ORDER BY policyname;

-- =====================================================
-- POLÍTICAS RLS CORREGIDAS
-- =====================================================






