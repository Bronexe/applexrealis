-- =====================================================
-- SCRIPT FINAL PARA RE-HABILITAR RLS EN UNIDADES_SIMPLIFIED
-- =====================================================

-- Este script re-habilita RLS en unidades_simplified de forma segura
-- después de la importación exitosa

-- 1. CREAR FUNCIÓN HELPER TEMPORAL
-- Creamos una función con un nombre diferente para evitar conflictos
CREATE OR REPLACE FUNCTION user_can_access_condo_v2(p_condo_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admin puede acceder a todo
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'super_admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Usuario es propietario del condominio
  IF EXISTS (
    SELECT 1 FROM condos 
    WHERE id = p_condo_id 
    AND user_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Usuario tiene permisos específicos en el condominio
  IF EXISTS (
    SELECT 1 FROM condo_user_permissions 
    WHERE condo_id = p_condo_id 
    AND user_id = p_user_id
    AND (can_view = TRUE OR can_edit = TRUE OR can_delete = TRUE)
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
DROP POLICY IF EXISTS "Users with condo access can manage unidades_simplified" ON unidades_simplified;
DROP POLICY IF EXISTS "Condo owners can manage unidades_simplified" ON unidades_simplified;

-- 4. CREAR NUEVA POLÍTICA RLS PARA UNIDADES_SIMPLIFIED
CREATE POLICY "Users with condo access can manage unidades_simplified" ON unidades_simplified
FOR ALL USING (user_can_access_condo_v2(condo_id, auth.uid()));

-- 5. HABILITAR RLS EN UNIDADES_SIMPLIFIED
ALTER TABLE unidades_simplified ENABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls
FROM pg_tables 
WHERE tablename = 'unidades_simplified' 
    AND schemaname = 'public';

-- 7. VERIFICAR POLÍTICAS CREADAS
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

-- 8. CREAR ALIAS PARA MANTENER COMPATIBILIDAD
-- Creamos un alias para que la función original siga funcionando
CREATE OR REPLACE FUNCTION user_can_access_condo(condo_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_can_access_condo_v2(condo_id, user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- RLS RE-HABILITADO EXITOSAMENTE
-- =====================================================
-- ✅ RLS habilitado en unidades_simplified
-- ✅ Política de seguridad creada
-- ✅ Función helper verificada/creada
-- ✅ Alias creado para compatibilidad
-- ✅ Alertas de seguridad corregidas
-- =====================================================
