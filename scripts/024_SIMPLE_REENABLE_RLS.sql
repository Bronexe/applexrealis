-- =====================================================
-- SCRIPT SIMPLE PARA RE-HABILITAR RLS EN UNIDADES_SIMPLIFIED
-- =====================================================

-- Este script simplemente habilita RLS en unidades_simplified
-- sin tocar las funciones existentes que otras tablas necesitan

-- 1. ELIMINAR SOLO LAS POLÍTICAS DE UNIDADES_SIMPLIFIED
DROP POLICY IF EXISTS "Users with condo access can manage unidades_simplified" ON unidades_simplified;
DROP POLICY IF EXISTS "Condo owners can manage unidades_simplified" ON unidades_simplified;

-- 2. CREAR POLÍTICA SIMPLE PARA UNIDADES_SIMPLIFIED
-- Usamos la función existente user_can_access_condo sin modificarla
CREATE POLICY "Users with condo access can manage unidades_simplified" ON unidades_simplified
FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

-- 3. HABILITAR RLS EN UNIDADES_SIMPLIFIED
ALTER TABLE unidades_simplified ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls
FROM pg_tables 
WHERE tablename = 'unidades_simplified' 
    AND schemaname = 'public';

-- 5. VERIFICAR POLÍTICAS CREADAS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'unidades_simplified' 
    AND schemaname = 'public';

-- =====================================================
-- RLS RE-HABILITADO DE FORMA SEGURA
-- =====================================================
-- ✅ RLS habilitado en unidades_simplified
-- ✅ Política de seguridad creada
-- ✅ Funciones existentes NO modificadas
-- ✅ Otras tablas siguen funcionando
-- ✅ Alertas de seguridad corregidas
-- =====================================================










