-- =====================================================
-- OPTIMIZACIÓN DE POLÍTICAS RLS PARA TABLA CERTIFICATIONS
-- =====================================================
-- Consolidamos múltiples políticas en una sola optimizada

-- 1. Eliminar todas las políticas existentes problemáticas
DROP POLICY IF EXISTS "Users with condo access can manage certifications" ON certifications;
DROP POLICY IF EXISTS "Users can manage certifications of their condos, super-admin can access all" ON certifications;
DROP POLICY IF EXISTS "Condo owners can manage certifications" ON certifications;

-- 2. Crear política consolidada optimizada
CREATE POLICY "Unified certifications access" ON certifications
FOR ALL USING (
  can_manage_certifications(condo_id)
);

-- Comentario para documentación
COMMENT ON POLICY "Unified certifications access" ON certifications IS 
'Política consolidada que combina todas las verificaciones de acceso para certifications en una sola política optimizada';

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
AND tablename = 'certifications'
ORDER BY cmd, policyname;



