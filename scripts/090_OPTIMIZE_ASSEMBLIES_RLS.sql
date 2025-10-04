-- =====================================================
-- OPTIMIZACIÓN DE POLÍTICAS RLS PARA TABLA ASSEMBLIES
-- =====================================================
-- Tabla de alta frecuencia, optimizamos eliminando políticas múltiples
-- y usando funciones helper optimizadas

-- 1. Eliminar todas las políticas existentes problemáticas
DROP POLICY IF EXISTS "Users with condo access can manage assemblies" ON assemblies;
DROP POLICY IF EXISTS "Users can manage assemblies of their condos, super-admin can access all" ON assemblies;
DROP POLICY IF EXISTS "Condo owners can manage assemblies" ON assemblies;

-- 2. Crear política consolidada optimizada
CREATE POLICY "Unified assemblies access" ON assemblies
FOR ALL USING (
  can_manage_assemblies(condo_id)
);

-- Comentario para documentación
COMMENT ON POLICY "Unified assemblies access" ON assemblies IS 
'Política consolidada que combina todas las verificaciones de acceso en una sola política optimizada';

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
AND tablename = 'assemblies'
ORDER BY cmd, policyname;



