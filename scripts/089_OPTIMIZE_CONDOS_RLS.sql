-- =====================================================
-- OPTIMIZACIÓN DE POLÍTICAS RLS PARA TABLA CONDOS
-- =====================================================
-- Esta tabla es crítica ya que es la base para muchas otras consultas
-- Optimizamos las funciones auth para mejorar el rendimiento

-- 1. Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can manage their own condos, super-admin can access all" ON condos;

-- 2. Crear política optimizada usando funciones helper
CREATE POLICY "Optimized condos access" ON condos
FOR ALL USING (
  is_super_admin() OR 
  user_id = auth_uid()
);

-- Comentario para documentación
COMMENT ON POLICY "Optimized condos access" ON condos IS 
'Política optimizada que usa funciones STABLE para evitar re-evaluación de auth.uid() en cada fila';

-- Verificar que la política se creó correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'condos';






