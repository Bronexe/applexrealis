-- =====================================================
-- IMPLEMENTAR AISLAMIENTO POR USUARIO - VERSIÓN SIMPLE
-- =====================================================
-- Este script implementa el aislamiento completo por usuario
-- agregando user_id a todas las tablas y actualizando las políticas RLS
-- 
-- ⚠️ CRÍTICO: Este script corrige un problema de seguridad grave
-- donde todos los usuarios podían ver datos de otros usuarios
-- 
-- ✅ VERSIÓN SIMPLE: Sin manipulación de storage (evita errores de permisos)
-- 
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- PASO 1: AGREGAR COLUMNAS user_id A TODAS LAS TABLAS
-- =====================================================

-- Agregar user_id a la tabla principal condos
ALTER TABLE condos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Agregar user_id a tablas relacionadas para optimización
ALTER TABLE assemblies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE emergency_plans ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE insurances ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- =====================================================
-- PASO 2: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para mejorar el rendimiento de las consultas por user_id
CREATE INDEX IF NOT EXISTS idx_condos_user_id ON condos(user_id);
CREATE INDEX IF NOT EXISTS idx_assemblies_user_id ON assemblies(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_plans_user_id ON emergency_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_insurances_user_id ON insurances(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_condos_user_created ON condos(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_assemblies_condo_user ON assemblies(condo_id, user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_plans_condo_user ON emergency_plans(condo_id, user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_condo_user ON certifications(condo_id, user_id);
CREATE INDEX IF NOT EXISTS idx_insurances_condo_user ON insurances(condo_id, user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_condo_user ON alerts(condo_id, user_id);

-- =====================================================
-- PASO 3: ELIMINAR POLÍTICAS RLS INSEGURAS EXISTENTES
-- =====================================================

-- Función helper para eliminar políticas de forma segura
CREATE OR REPLACE FUNCTION drop_policy_if_exists(policy_name TEXT, table_name TEXT)
RETURNS void AS $$
BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
EXCEPTION
    WHEN undefined_table THEN
        -- La tabla no existe, no hacer nada
        NULL;
END;
$$ LANGUAGE plpgsql;

-- Eliminar todas las políticas inseguras existentes (solo tablas principales)
SELECT drop_policy_if_exists('Allow authenticated users to view condos', 'condos');
SELECT drop_policy_if_exists('Allow authenticated users to insert condos', 'condos');
SELECT drop_policy_if_exists('Allow authenticated users to update condos', 'condos');
SELECT drop_policy_if_exists('Allow authenticated users to delete condos', 'condos');

SELECT drop_policy_if_exists('Allow authenticated users to view assemblies', 'assemblies');
SELECT drop_policy_if_exists('Allow authenticated users to insert assemblies', 'assemblies');
SELECT drop_policy_if_exists('Allow authenticated users to update assemblies', 'assemblies');
SELECT drop_policy_if_exists('Allow authenticated users to delete assemblies', 'assemblies');

SELECT drop_policy_if_exists('Allow authenticated users to view emergency_plans', 'emergency_plans');
SELECT drop_policy_if_exists('Allow authenticated users to insert emergency_plans', 'emergency_plans');
SELECT drop_policy_if_exists('Allow authenticated users to update emergency_plans', 'emergency_plans');
SELECT drop_policy_if_exists('Allow authenticated users to delete emergency_plans', 'emergency_plans');

SELECT drop_policy_if_exists('Allow authenticated users to view certifications', 'certifications');
SELECT drop_policy_if_exists('Allow authenticated users to insert certifications', 'certifications');
SELECT drop_policy_if_exists('Allow authenticated users to update certifications', 'certifications');
SELECT drop_policy_if_exists('Allow authenticated users to delete certifications', 'certifications');

SELECT drop_policy_if_exists('Allow authenticated users to view insurances', 'insurances');
SELECT drop_policy_if_exists('Allow authenticated users to insert insurances', 'insurances');
SELECT drop_policy_if_exists('Allow authenticated users to update insurances', 'insurances');
SELECT drop_policy_if_exists('Allow authenticated users to delete insurances', 'insurances');

SELECT drop_policy_if_exists('Allow authenticated users to view alerts', 'alerts');
SELECT drop_policy_if_exists('Allow authenticated users to insert alerts', 'alerts');
SELECT drop_policy_if_exists('Allow authenticated users to update alerts', 'alerts');
SELECT drop_policy_if_exists('Allow authenticated users to delete alerts', 'alerts');

-- =====================================================
-- PASO 4: CREAR POLÍTICAS RLS SEGURAS POR USUARIO
-- =====================================================

-- Políticas para condos - Solo el propietario puede acceder
CREATE POLICY "Users can only see their own condos" ON condos
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only insert their own condos" ON condos
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can only update their own condos" ON condos
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only delete their own condos" ON condos
FOR DELETE USING ((select auth.uid()) = user_id);

-- Políticas para assemblies - Acceso directo por user_id
CREATE POLICY "Users can only see their own assemblies" ON assemblies
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only insert their own assemblies" ON assemblies
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can only update their own assemblies" ON assemblies
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only delete their own assemblies" ON assemblies
FOR DELETE USING ((select auth.uid()) = user_id);

-- Políticas para emergency_plans - Acceso directo por user_id
CREATE POLICY "Users can only see their own emergency_plans" ON emergency_plans
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only insert their own emergency_plans" ON emergency_plans
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can only update their own emergency_plans" ON emergency_plans
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only delete their own emergency_plans" ON emergency_plans
FOR DELETE USING ((select auth.uid()) = user_id);

-- Políticas para certifications - Acceso directo por user_id
CREATE POLICY "Users can only see their own certifications" ON certifications
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only insert their own certifications" ON certifications
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can only update their own certifications" ON certifications
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only delete their own certifications" ON certifications
FOR DELETE USING ((select auth.uid()) = user_id);

-- Políticas para insurances - Acceso directo por user_id
CREATE POLICY "Users can only see their own insurances" ON insurances
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only insert their own insurances" ON insurances
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can only update their own insurances" ON insurances
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only delete their own insurances" ON insurances
FOR DELETE USING ((select auth.uid()) = user_id);

-- Políticas para alerts - Acceso directo por user_id
CREATE POLICY "Users can only see their own alerts" ON alerts
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only insert their own alerts" ON alerts
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can only update their own alerts" ON alerts
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can only delete their own alerts" ON alerts
FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 5: CREAR FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener el user_id actual de forma segura
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (select auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede acceder a un condominio
CREATE OR REPLACE FUNCTION user_can_access_condo(condo_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM condos 
    WHERE id = condo_uuid 
    AND user_id = (select auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASO 6: VERIFICACIÓN DE LA IMPLEMENTACIÓN
-- =====================================================

-- Verificar que las columnas user_id se agregaron correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'user_id'
ORDER BY table_name;

-- Verificar que los índices se crearon correctamente
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname LIKE '%user_id%'
ORDER BY tablename, indexname;

-- Verificar que las políticas RLS se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Aislamiento por usuario implementado correctamente (versión simple). 
🔒 Cada usuario ahora solo puede acceder a sus propios datos.
📁 NOTA: Storage no fue modificado (evita errores de permisos).
⚠️ IMPORTANTE: Ejecuta el script de migración de datos existentes.' as status;

