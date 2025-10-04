-- =====================================================
-- CREAR SISTEMA DE ASIGNACIÓN DE CONDOMINIOS A USUARIOS
-- =====================================================

-- 1. CREAR TABLA DE ASIGNACIONES
CREATE TABLE IF NOT EXISTS condo_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(condo_id, user_id) -- Un usuario no puede estar asignado dos veces al mismo condominio
);

-- 2. CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_condo_assignments_condo_id ON condo_assignments(condo_id);
CREATE INDEX IF NOT EXISTS idx_condo_assignments_user_id ON condo_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_condo_assignments_assigned_by ON condo_assignments(assigned_by);

-- 3. HABILITAR RLS
ALTER TABLE condo_assignments ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS RLS PARA condo_assignments
-- Super admins pueden ver todas las asignaciones
DROP POLICY IF EXISTS "Super admins can view all assignments" ON condo_assignments;
CREATE POLICY "Super admins can view all assignments" ON condo_assignments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Super admins pueden crear asignaciones
DROP POLICY IF EXISTS "Super admins can create assignments" ON condo_assignments;
CREATE POLICY "Super admins can create assignments" ON condo_assignments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Super admins pueden actualizar asignaciones
DROP POLICY IF EXISTS "Super admins can update assignments" ON condo_assignments;
CREATE POLICY "Super admins can update assignments" ON condo_assignments
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- Super admins pueden eliminar asignaciones
DROP POLICY IF EXISTS "Super admins can delete assignments" ON condo_assignments;
CREATE POLICY "Super admins can delete assignments" ON condo_assignments
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM administrators a 
        WHERE a.user_id = auth.uid() 
        AND a.role = 'super_admin' 
        AND a.is_active = true
    )
);

-- 5. ACTUALIZAR POLÍTICAS RLS DE CONDOS
-- Permitir que usuarios asignados puedan ver los condominios
DROP POLICY IF EXISTS "Users can manage their own condos" ON condos;
CREATE POLICY "Users can view and manage their own condos" ON condos
FOR ALL USING (
    auth.uid() = user_id -- Propietario del condominio
    OR 
    EXISTS ( -- Usuario asignado al condominio
        SELECT 1 FROM condo_assignments ca
        WHERE ca.condo_id = condos.id
        AND ca.user_id = auth.uid()
    )
    OR
    EXISTS ( -- Super administrador
        SELECT 1 FROM administrators a
        WHERE a.user_id = auth.uid()
        AND a.role = 'super_admin'
        AND a.is_active = true
    )
);

-- 6. ACTUALIZAR POLÍTICAS RLS PARA ASSEMBLIES
DROP POLICY IF EXISTS "Users can manage assemblies for their condos" ON assemblies;
CREATE POLICY "Users can manage assemblies for their condos" ON assemblies
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM condos c
        WHERE c.id = assemblies.condo_id
        AND (
            c.user_id = auth.uid() -- Propietario
            OR
            EXISTS ( -- Usuario asignado
                SELECT 1 FROM condo_assignments ca
                WHERE ca.condo_id = c.id
                AND ca.user_id = auth.uid()
            )
            OR
            EXISTS ( -- Super admin
                SELECT 1 FROM administrators a
                WHERE a.user_id = auth.uid()
                AND a.role = 'super_admin'
                AND a.is_active = true
            )
        )
    )
);

-- 7. ACTUALIZAR POLÍTICAS RLS PARA EMERGENCY_PLANS
DROP POLICY IF EXISTS "Users can manage emergency plans for their condos" ON emergency_plans;
CREATE POLICY "Users can manage emergency plans for their condos" ON emergency_plans
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM condos c
        WHERE c.id = emergency_plans.condo_id
        AND (
            c.user_id = auth.uid()
            OR
            EXISTS (
                SELECT 1 FROM condo_assignments ca
                WHERE ca.condo_id = c.id
                AND ca.user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM administrators a
                WHERE a.user_id = auth.uid()
                AND a.role = 'super_admin'
                AND a.is_active = true
            )
        )
    )
);

-- 8. ACTUALIZAR POLÍTICAS RLS PARA CERTIFICATIONS
DROP POLICY IF EXISTS "Users can manage certifications for their condos" ON certifications;
CREATE POLICY "Users can manage certifications for their condos" ON certifications
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM condos c
        WHERE c.id = certifications.condo_id
        AND (
            c.user_id = auth.uid()
            OR
            EXISTS (
                SELECT 1 FROM condo_assignments ca
                WHERE ca.condo_id = c.id
                AND ca.user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM administrators a
                WHERE a.user_id = auth.uid()
                AND a.role = 'super_admin'
                AND a.is_active = true
            )
        )
    )
);

-- 9. ACTUALIZAR POLÍTICAS RLS PARA INSURANCES
DROP POLICY IF EXISTS "Users can manage insurances for their condos" ON insurances;
CREATE POLICY "Users can manage insurances for their condos" ON insurances
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM condos c
        WHERE c.id = insurances.condo_id
        AND (
            c.user_id = auth.uid()
            OR
            EXISTS (
                SELECT 1 FROM condo_assignments ca
                WHERE ca.condo_id = c.id
                AND ca.user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM administrators a
                WHERE a.user_id = auth.uid()
                AND a.role = 'super_admin'
                AND a.is_active = true
            )
        )
    )
);

-- 10. ACTUALIZAR POLÍTICAS RLS PARA ALERTS
DROP POLICY IF EXISTS "Users can view alerts for their condos" ON alerts;
CREATE POLICY "Users can view alerts for their condos" ON alerts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM condos c
        WHERE c.id = alerts.condo_id
        AND (
            c.user_id = auth.uid()
            OR
            EXISTS (
                SELECT 1 FROM condo_assignments ca
                WHERE ca.condo_id = c.id
                AND ca.user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM administrators a
                WHERE a.user_id = auth.uid()
                AND a.role = 'super_admin'
                AND a.is_active = true
            )
        )
    )
);

-- 11. CREAR TRIGGER PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_condo_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_condo_assignments_updated_at ON condo_assignments;
CREATE TRIGGER trigger_update_condo_assignments_updated_at
    BEFORE UPDATE ON condo_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_condo_assignments_updated_at();

-- 12. CREAR FUNCIÓN PARA OBTENER CONDOMINIOS ACCESIBLES POR UN USUARIO
CREATE OR REPLACE FUNCTION get_accessible_condos(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    is_owner BOOLEAN,
    is_assigned BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.address,
        (c.user_id = p_user_id) as is_owner,
        EXISTS(
            SELECT 1 FROM condo_assignments ca 
            WHERE ca.condo_id = c.id AND ca.user_id = p_user_id
        ) as is_assigned
    FROM condos c
    WHERE 
        c.user_id = p_user_id  -- Propietario
        OR
        EXISTS ( -- Usuario asignado
            SELECT 1 FROM condo_assignments ca
            WHERE ca.condo_id = c.id
            AND ca.user_id = p_user_id
        )
        OR
        EXISTS ( -- Super admin
            SELECT 1 FROM administrators a
            WHERE a.user_id = p_user_id
            AND a.role = 'super_admin'
            AND a.is_active = true
        )
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. CREAR FUNCIÓN PARA OBTENER ASIGNACIONES DE UN CONDOMINIO
CREATE OR REPLACE FUNCTION get_condo_assignments_with_details(p_condo_id UUID)
RETURNS TABLE (
    assignment_id UUID,
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    assigned_at TIMESTAMPTZ,
    assigned_by_name TEXT,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.id as assignment_id,
        ca.user_id,
        a.full_name as user_name,
        a.email as user_email,
        ca.assigned_at,
        ab.full_name as assigned_by_name,
        ca.notes
    FROM condo_assignments ca
    LEFT JOIN administrators a ON a.user_id = ca.user_id
    LEFT JOIN administrators ab ON ab.user_id = ca.assigned_by
    WHERE ca.condo_id = p_condo_id
    ORDER BY ca.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. VERIFICAR CREACIÓN
SELECT 
    'Tabla condo_assignments creada' as status,
    COUNT(*) as total_assignments
FROM condo_assignments;

-- =====================================================
-- SISTEMA DE ASIGNACIÓN DE CONDOMINIOS CREADO EXITOSAMENTE
-- =====================================================

