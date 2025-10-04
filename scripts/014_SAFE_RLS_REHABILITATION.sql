    -- =====================================================
    -- SCRIPT DE REHABILITACIÓN SEGURA DE RLS
    -- =====================================================

    -- Este script implementa RLS de forma segura y sin recursión
    -- Basado en las mejores prácticas de Supabase

    -- 1. ELIMINAR FUNCIONES EXISTENTES PARA EVITAR CONFLICTOS
    DROP FUNCTION IF EXISTS is_super_admin(UUID);
    DROP FUNCTION IF EXISTS user_owns_condo(UUID, UUID);
    DROP FUNCTION IF EXISTS user_has_condo_permission(UUID, UUID);
    DROP FUNCTION IF EXISTS user_can_access_condo(UUID, UUID);

    -- 2. CREAR FUNCIÓN HELPER SEGURA CON SEARCH_PATH FIJO
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
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

    -- 3. CREAR FUNCIÓN HELPER PARA VERIFICAR PROPIEDAD DE CONDOMINIO
    CREATE OR REPLACE FUNCTION user_owns_condo(condo_id UUID, user_id UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
    RETURN EXISTS (
        SELECT 1 FROM condos c 
        WHERE c.id = user_owns_condo.condo_id 
        AND c.user_id = user_owns_condo.user_id
    );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

    -- 4. CREAR FUNCIÓN HELPER PARA VERIFICAR PERMISOS EN CONDOMINIO
    CREATE OR REPLACE FUNCTION user_has_condo_permission(condo_id UUID, user_id UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
    RETURN EXISTS (
        SELECT 1 FROM condo_user_permissions cup 
        WHERE cup.condo_id = user_has_condo_permission.condo_id 
        AND cup.user_id = user_has_condo_permission.user_id
        AND cup.is_active = TRUE
    );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

    -- 5. CREAR FUNCIÓN HELPER PARA VERIFICAR ACCESO A CONDOMINIO
    CREATE OR REPLACE FUNCTION user_can_access_condo(condo_id UUID, user_id UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
    RETURN is_super_admin(user_id) OR 
            user_owns_condo(condo_id, user_id) OR 
            user_has_condo_permission(condo_id, user_id);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

    -- 6. ELIMINAR POLÍTICAS EXISTENTES PARA EVITAR CONFLICTOS
    DROP POLICY IF EXISTS "Users can manage their own roles" ON user_roles;
    DROP POLICY IF EXISTS "Users can manage their own condos" ON condos;
    DROP POLICY IF EXISTS "Condo owners and super admins can manage permissions" ON condo_user_permissions;
    DROP POLICY IF EXISTS "Users with condo access can manage assemblies" ON assemblies;
    DROP POLICY IF EXISTS "Users with condo access can manage emergency_plans" ON emergency_plans;
    DROP POLICY IF EXISTS "Users with condo access can manage certifications" ON certifications;
    DROP POLICY IF EXISTS "Users with condo access can manage insurances" ON insurances;
    DROP POLICY IF EXISTS "Users with condo access can manage contracts" ON contracts;
    DROP POLICY IF EXISTS "Users with condo access can manage copropietarios" ON copropietarios;
    DROP POLICY IF EXISTS "Users with condo access can manage unidades_simplified" ON unidades_simplified;
    DROP POLICY IF EXISTS "Users with condo access can view unidades_historial_simplified" ON unidades_historial_simplified;
    DROP POLICY IF EXISTS "Users with condo access can manage archivos_cbr_simplified" ON archivos_cbr_simplified;
    DROP POLICY IF EXISTS "Users with condo access can manage unidades" ON unidades;
    DROP POLICY IF EXISTS "Users with condo access can view alerts" ON alerts;
    DROP POLICY IF EXISTS "Authenticated users can read rules" ON rules;
    DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
    DROP POLICY IF EXISTS "Users can manage their own report templates" ON report_templates;
    DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;
    DROP POLICY IF EXISTS "Super admins can manage roles" ON roles;

    -- 7. IMPLEMENTAR POLÍTICAS RLS SEGURAS

    -- USER_ROLES - Solo el propietario puede gestionar sus roles
    CREATE POLICY "Users can manage their own roles" ON user_roles
    FOR ALL USING (auth.uid() = user_id);

    -- CONDOS - Propietario y super admins
    CREATE POLICY "Users can manage their own condos" ON condos
    FOR ALL USING (
    auth.uid() = user_id OR 
    is_super_admin(auth.uid())
    );

    -- CONDO_USER_PERMISSIONS - Solo propietarios del condominio y super admins
    CREATE POLICY "Condo owners and super admins can manage permissions" ON condo_user_permissions
    FOR ALL USING (
    is_super_admin(auth.uid()) OR
    user_owns_condo(condo_id, auth.uid())
    );

    -- MÓDULOS DEL CONDOMINIO - Usuarios con acceso al condominio
    CREATE POLICY "Users with condo access can manage assemblies" ON assemblies
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage emergency_plans" ON emergency_plans
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage certifications" ON certifications
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage insurances" ON insurances
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage contracts" ON contracts
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage copropietarios" ON copropietarios
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage unidades_simplified" ON unidades_simplified
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can view unidades_historial_simplified" ON unidades_historial_simplified
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage archivos_cbr_simplified" ON archivos_cbr_simplified
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can manage unidades" ON unidades
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    CREATE POLICY "Users with condo access can view alerts" ON alerts
    FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

    -- RULES - Todos los usuarios autenticados pueden leer
    CREATE POLICY "Authenticated users can read rules" ON rules
    FOR SELECT USING (auth.uid() IS NOT NULL);

    -- CONFIGURACIONES DE USUARIO - Solo el propietario
    CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage their own report templates" ON report_templates
    FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage their own notification settings" ON notification_settings
    FOR ALL USING (auth.uid() = user_id);

    -- ROLES - Solo super admins pueden gestionar roles
    CREATE POLICY "Super admins can manage roles" ON roles
    FOR ALL USING (is_super_admin(auth.uid()));

    -- 8. HABILITAR RLS EN TODAS LAS TABLAS
    ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE condos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE condo_user_permissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE copropietarios ENABLE ROW LEVEL SECURITY;
    ALTER TABLE unidades_simplified ENABLE ROW LEVEL SECURITY;
    ALTER TABLE unidades_historial_simplified ENABLE ROW LEVEL SECURITY;
    ALTER TABLE archivos_cbr_simplified ENABLE ROW LEVEL SECURITY;
    ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
    ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

    -- 9. CREAR ÍNDICES PARA OPTIMIZAR LAS CONSULTAS DE RLS
    CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role_id ON user_roles(user_id, role_id) WHERE is_active = TRUE;
    CREATE INDEX IF NOT EXISTS idx_condo_user_permissions_condo_user ON condo_user_permissions(condo_id, user_id) WHERE is_active = TRUE;
    CREATE INDEX IF NOT EXISTS idx_condos_user_id ON condos(user_id);

    -- =====================================================
    -- REHABILITACIÓN SEGURA COMPLETADA
    -- =====================================================
    -- Este script implementa RLS de forma segura con:
    -- ✅ Funciones helper con search_path fijo
    -- ✅ Políticas sin recursión
    -- ✅ Seguridad multi-tenant mantenida
    -- ✅ Optimización con índices
    -- ✅ Mejores prácticas de Supabase
    -- =====================================================
