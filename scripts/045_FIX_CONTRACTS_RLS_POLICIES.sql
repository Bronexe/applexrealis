-- =====================================================
-- CORREGIR POLÍTICAS RLS DUPLICADAS EN CONTRACTS
-- =====================================================

-- 1. Eliminar todas las políticas RLS existentes en contracts
DROP POLICY IF EXISTS "Condo owners can manage contracts" ON contracts;
DROP POLICY IF EXISTS "Users with condo access can manage contracts" ON contracts;

-- 2. Verificar que se eliminaron todas las políticas
SELECT 
    'Políticas después de eliminar:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 3. Crear una sola política RLS correcta
CREATE POLICY "Users with condo access can manage contracts" ON contracts
FOR ALL USING (
  user_can_access_condo(auth.uid(), condo_id)
);

-- 4. Verificar que RLS está habilitado
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 5. Verificar la política creada
SELECT 
    'Política RLS final en contracts:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public'
ORDER BY policyname;

-- 6. Verificar estado de RLS
SELECT 
    'Estado final de RLS en contracts:' as info,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'contracts' 
    AND schemaname = 'public';

-- =====================================================
-- POLÍTICAS RLS CORREGIDAS EN CONTRACTS
-- =====================================================









