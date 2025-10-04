-- =====================================================
-- OPTIMIZACIÓN DE POLÍTICAS RLS PARA TABLA COPROPIETARIOS
-- =====================================================
-- Esta tabla tiene múltiples políticas permisivas que causan problemas de rendimiento
-- Específicamente aborda la alerta de la línea 58 del CSV

-- 1. Eliminar todas las políticas existentes problemáticas
DROP POLICY IF EXISTS "Users with condo access can manage copropietarios" ON copropietarios;
DROP POLICY IF EXISTS "Condo owners can manage copropietarios" ON copropietarios;

-- 2. Crear política consolidada optimizada
CREATE POLICY "Unified copropietarios access" ON copropietarios
FOR ALL USING (
  can_manage_copropietarios(condo_id)
);

-- Comentario para documentación
COMMENT ON POLICY "Unified copropietarios access" ON copropietarios IS 
'Política consolidada que elimina las múltiples políticas permisivas y usa funciones optimizadas para mejorar rendimiento';

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
AND tablename = 'copropietarios'
ORDER BY cmd, policyname;

-- Mostrar estadísticas de políticas eliminadas
SELECT 
  'copropietarios' as tabla,
  COUNT(*) as politicas_antes,
  '2 políticas múltiples eliminadas' as optimizacion
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'copropietarios';



