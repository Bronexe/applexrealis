-- =====================================================
-- CORREGIR POLÍTICAS RLS EN ADMINISTRATORS
-- =====================================================

-- 1. ELIMINAR POLÍTICAS EXISTENTES (si hay problemas)
DROP POLICY IF EXISTS "Super admins can view all administrators" ON administrators;
DROP POLICY IF EXISTS "Super admins can insert administrators" ON administrators;
DROP POLICY IF EXISTS "Super admins can update administrators" ON administrators;
DROP POLICY IF EXISTS "Super admins can delete administrators" ON administrators;

-- 2. CREAR POLÍTICAS RLS SIMPLIFICADAS Y FUNCIONALES
-- Política para SELECT - Solo super admins pueden ver todos
CREATE POLICY "super_admins_select_all" ON administrators
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Política para INSERT - Solo super admins pueden insertar
CREATE POLICY "super_admins_insert" ON administrators
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Política para UPDATE - Solo super admins pueden actualizar
CREATE POLICY "super_admins_update" ON administrators
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Política para DELETE - Solo super admins pueden eliminar
CREATE POLICY "super_admins_delete" ON administrators
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- 3. VERIFICAR QUE RLS ESTÁ HABILITADO
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR POLÍTICAS CREADAS
SELECT 
    'Políticas RLS creadas:' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'administrators' 
    AND schemaname = 'public';

-- 5. MOSTRAR POLÍTICAS
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'administrators' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 6. PROBAR ACCESO
SELECT 
    'Test de acceso después de corregir políticas' as test,
    COUNT(*) as accessible_records
FROM administrators;

-- =====================================================
-- POLÍTICAS RLS CORREGIDAS
-- =====================================================






