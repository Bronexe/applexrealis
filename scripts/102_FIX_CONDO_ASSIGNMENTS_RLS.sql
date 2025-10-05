-- =====================================================
-- CORREGIR POLÍTICAS RLS DE CONDO_ASSIGNMENTS
-- Problema: Los usuarios no pueden ver sus propias asignaciones
-- Solución: Agregar política para que los usuarios vean sus asignaciones
-- =====================================================

-- Agregar política para que los usuarios puedan ver sus propias asignaciones
DROP POLICY IF EXISTS "Users can view their own assignments" ON condo_assignments;
CREATE POLICY "Users can view their own assignments" ON condo_assignments
FOR SELECT USING (
    -- El usuario puede ver las asignaciones donde él es el asignado
    user_id = auth.uid()
);

-- Verificar políticas creadas
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'condo_assignments'
ORDER BY policyname;

-- =====================================================
-- POLÍTICA AGREGADA EXITOSAMENTE
-- =====================================================

