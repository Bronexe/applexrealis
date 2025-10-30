-- =====================================================
-- OPTIMIZACIÓN DE POLÍTICAS RLS PARA TABLA INSURANCES
-- =====================================================
-- Consolidamos múltiples políticas en una sola optimizada

-- 1. Eliminar todas las políticas existentes problemáticas
DROP POLICY IF EXISTS "Users with condo access can manage insurances" ON insurances;
DROP POLICY IF EXISTS "Users can manage insurances of their condos, super-admin can access all" ON insurances;
DROP POLICY IF EXISTS "Condo owners can manage insurances" ON insurances;

-- 2. Crear política consolidada optimizada
CREATE POLICY "Unified insurances access" ON insurances
FOR ALL USING (
  can_manage_insurances(condo_id)
);

-- Comentario para documentación
COMMENT ON POLICY "Unified insurances access" ON insurances IS 
'Política consolidada que combina todas las verificaciones de acceso para insurances en una sola política optimizada';

-- Verificar que solo existe una política por acción
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'insurances'
ORDER BY cmd, policyname;






