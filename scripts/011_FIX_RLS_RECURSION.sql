-- =====================================================
-- SCRIPT PARA CORREGIR RECURSIÓN INFINITA EN RLS
-- =====================================================

-- El problema: Las políticas RLS de user_roles están consultando la misma tabla
-- que están protegiendo, creando una recursión infinita.

-- SOLUCIÓN: Eliminar las políticas problemáticas y crear políticas más simples

-- 1. Eliminar políticas problemáticas de user_roles
DROP POLICY IF EXISTS "Super admins can manage user roles" ON user_roles;

-- 2. Crear política simple para user_roles (sin recursión)
-- Permitir que todos los usuarios autenticados vean sus propios roles
CREATE POLICY "Users can view their own roles" ON user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Permitir que todos los usuarios autenticados inserten sus propios roles
CREATE POLICY "Users can insert their own roles" ON user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir que todos los usuarios autenticados actualicen sus propios roles
CREATE POLICY "Users can update their own roles" ON user_roles
FOR UPDATE USING (auth.uid() = user_id);

-- Permitir que todos los usuarios autenticados eliminen sus propios roles
CREATE POLICY "Users can delete their own roles" ON user_roles
FOR DELETE USING (auth.uid() = user_id);

-- 3. Crear función helper para verificar si un usuario es super admin
-- Esta función evita la recursión al no usar políticas RLS
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = is_super_admin.user_id 
      AND ur.role_id = 'super_admin' 
      AND ur.is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Actualizar políticas de condos para usar la función helper
DROP POLICY IF EXISTS "Users can manage condos they own or have permissions for" ON condos;

CREATE POLICY "Users can manage condos they own or have permissions for" ON condos
FOR ALL USING (
  auth.uid() = user_id OR
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = condos.id AND cup.is_active = TRUE
  )
);

-- 5. Actualizar políticas de condo_user_permissions
DROP POLICY IF EXISTS "Super admins and owners can manage condo permissions" ON condo_user_permissions;

CREATE POLICY "Super admins and owners can manage condo permissions" ON condo_user_permissions
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = condo_user_permissions.condo_id
  )
);

-- 6. Actualizar todas las políticas de módulos para usar la función helper
-- ASSEMBLIES
DROP POLICY IF EXISTS "Users can manage assemblies of condos they have access to" ON assemblies;
CREATE POLICY "Users can manage assemblies of condos they have access to" ON assemblies
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = assemblies.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = assemblies.condo_id AND cup.is_active = TRUE
  )
);

-- EMERGENCY_PLANS
DROP POLICY IF EXISTS "Users can manage emergency_plans of condos they have access to" ON emergency_plans;
CREATE POLICY "Users can manage emergency_plans of condos they have access to" ON emergency_plans
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = emergency_plans.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = emergency_plans.condo_id AND cup.is_active = TRUE
  )
);

-- CERTIFICATIONS
DROP POLICY IF EXISTS "Users can manage certifications of condos they have access to" ON certifications;
CREATE POLICY "Users can manage certifications of condos they have access to" ON certifications
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = certifications.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = certifications.condo_id AND cup.is_active = TRUE
  )
);

-- INSURANCES
DROP POLICY IF EXISTS "Users can manage insurances of condos they have access to" ON insurances;
CREATE POLICY "Users can manage insurances of condos they have access to" ON insurances
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = insurances.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = insurances.condo_id AND cup.is_active = TRUE
  )
);

-- CONTRACTS
DROP POLICY IF EXISTS "Users can manage contracts of condos they have access to" ON contracts;
CREATE POLICY "Users can manage contracts of condos they have access to" ON contracts
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = contracts.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = contracts.condo_id AND cup.is_active = TRUE
  )
);

-- COPROPIETARIOS
DROP POLICY IF EXISTS "Users can manage copropietarios of condos they have access to" ON copropietarios;
CREATE POLICY "Users can manage copropietarios of condos they have access to" ON copropietarios
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = copropietarios.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = copropietarios.condo_id AND cup.is_active = TRUE
  )
);

-- UNIDADES_SIMPLIFIED
DROP POLICY IF EXISTS "Users can manage unidades_simplified of condos they have access to" ON unidades_simplified;
CREATE POLICY "Users can manage unidades_simplified of condos they have access to" ON unidades_simplified
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades_simplified.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = unidades_simplified.condo_id AND cup.is_active = TRUE
  )
);

-- UNIDADES_HISTORIAL_SIMPLIFIED
DROP POLICY IF EXISTS "Users can view unidades_historial_simplified of condos they have access to" ON unidades_historial_simplified;
CREATE POLICY "Users can view unidades_historial_simplified of condos they have access to" ON unidades_historial_simplified
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades_historial_simplified.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = unidades_historial_simplified.condo_id AND cup.is_active = TRUE
  )
);

-- ARCHIVOS_CBR_SIMPLIFIED
DROP POLICY IF EXISTS "Users can manage archivos_cbr_simplified of condos they have access to" ON archivos_cbr_simplified;
CREATE POLICY "Users can manage archivos_cbr_simplified of condos they have access to" ON archivos_cbr_simplified
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = archivos_cbr_simplified.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = archivos_cbr_simplified.condo_id AND cup.is_active = TRUE
  )
);

-- UNIDADES
DROP POLICY IF EXISTS "Users can manage unidades of condos they have access to" ON unidades;
CREATE POLICY "Users can manage unidades of condos they have access to" ON unidades
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = unidades.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = unidades.condo_id AND cup.is_active = TRUE
  )
);

-- ALERTS
DROP POLICY IF EXISTS "Users can view alerts of condos they have access to" ON alerts;
CREATE POLICY "Users can view alerts of condos they have access to" ON alerts
FOR ALL USING (
  is_super_admin(auth.uid()) OR
  auth.uid() IN (
    SELECT c.user_id FROM condos c WHERE c.id = alerts.condo_id
  ) OR
  auth.uid() IN (
    SELECT cup.user_id FROM condo_user_permissions cup 
    WHERE cup.condo_id = alerts.condo_id AND cup.is_active = TRUE
  )
);

-- =====================================================
-- FIN DEL SCRIPT DE CORRECCIÓN
-- =====================================================







