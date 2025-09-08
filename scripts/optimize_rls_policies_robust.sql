-- =====================================================
-- OPTIMIZAR POLÍTICAS RLS PARA MEJOR RENDIMIENTO (VERSIÓN ROBUSTA)
-- =====================================================
-- Este script optimiza todas las políticas RLS para mejorar el rendimiento
-- Maneja casos donde las políticas ya existen
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- FUNCIÓN AUXILIAR PARA ELIMINAR POLÍTICAS DE FORMA SEGURA
-- =====================================================

-- Función para eliminar políticas de forma segura
CREATE OR REPLACE FUNCTION drop_policy_if_exists(policy_name text, table_name text)
RETURNS void AS $$
BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorar errores si la política no existe
        NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 1: LIMPIAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================

-- Administrators - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('admin_select_policy', 'administrators');
SELECT drop_policy_if_exists('admin_insert_policy', 'administrators');
SELECT drop_policy_if_exists('admin_update_policy', 'administrators');
SELECT drop_policy_if_exists('admin_delete_policy', 'administrators');
SELECT drop_policy_if_exists('Allow authenticated users to view administrators', 'administrators');
SELECT drop_policy_if_exists('Allow authenticated users to insert administrators', 'administrators');
SELECT drop_policy_if_exists('Allow authenticated users to update administrators', 'administrators');
SELECT drop_policy_if_exists('Allow authenticated users to delete administrators', 'administrators');

-- Condos - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('Allow authenticated users to view condos', 'condos');
SELECT drop_policy_if_exists('Allow authenticated users to insert condos', 'condos');
SELECT drop_policy_if_exists('Allow authenticated users to update condos', 'condos');
SELECT drop_policy_if_exists('Allow authenticated users to delete condos', 'condos');

-- Assemblies - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('Allow authenticated users to view assemblies', 'assemblies');
SELECT drop_policy_if_exists('Allow authenticated users to insert assemblies', 'assemblies');
SELECT drop_policy_if_exists('Allow authenticated users to update assemblies', 'assemblies');
SELECT drop_policy_if_exists('Allow authenticated users to delete assemblies', 'assemblies');

-- Emergency Plans - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('Allow authenticated users to view emergency_plans', 'emergency_plans');
SELECT drop_policy_if_exists('Allow authenticated users to insert emergency_plans', 'emergency_plans');
SELECT drop_policy_if_exists('Allow authenticated users to update emergency_plans', 'emergency_plans');
SELECT drop_policy_if_exists('Allow authenticated users to delete emergency_plans', 'emergency_plans');

-- Certifications - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('Allow authenticated users to view certifications', 'certifications');
SELECT drop_policy_if_exists('Allow authenticated users to insert certifications', 'certifications');
SELECT drop_policy_if_exists('Allow authenticated users to update certifications', 'certifications');
SELECT drop_policy_if_exists('Allow authenticated users to delete certifications', 'certifications');

-- Insurances - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('Allow authenticated users to view insurances', 'insurances');
SELECT drop_policy_if_exists('Allow authenticated users to insert insurances', 'insurances');
SELECT drop_policy_if_exists('Allow authenticated users to update insurances', 'insurances');
SELECT drop_policy_if_exists('Allow authenticated users to delete insurances', 'insurances');

-- Alerts - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('Allow authenticated users to view alerts', 'alerts');
SELECT drop_policy_if_exists('Allow authenticated users to insert alerts', 'alerts');
SELECT drop_policy_if_exists('Allow authenticated users to update alerts', 'alerts');
SELECT drop_policy_if_exists('Allow authenticated users to delete alerts', 'alerts');

-- Notification Settings - Eliminar todas las políticas posibles
SELECT drop_policy_if_exists('Users can view own notification settings', 'notification_settings');
SELECT drop_policy_if_exists('Users can insert own notification settings', 'notification_settings');
SELECT drop_policy_if_exists('Users can update own notification settings', 'notification_settings');
SELECT drop_policy_if_exists('Users can delete own notification settings', 'notification_settings');

-- =====================================================
-- PASO 2: CREAR POLÍTICAS OPTIMIZADAS
-- =====================================================

-- Administrators - Políticas optimizadas
CREATE POLICY "Allow authenticated users to view administrators" ON administrators
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert administrators" ON administrators
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update administrators" ON administrators
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete administrators" ON administrators
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Condos - Políticas optimizadas
CREATE POLICY "Allow authenticated users to view condos" ON condos
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert condos" ON condos
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update condos" ON condos
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete condos" ON condos
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Assemblies - Políticas optimizadas
CREATE POLICY "Allow authenticated users to view assemblies" ON assemblies
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert assemblies" ON assemblies
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update assemblies" ON assemblies
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete assemblies" ON assemblies
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Emergency Plans - Políticas optimizadas
CREATE POLICY "Allow authenticated users to view emergency_plans" ON emergency_plans
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert emergency_plans" ON emergency_plans
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update emergency_plans" ON emergency_plans
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete emergency_plans" ON emergency_plans
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Certifications - Políticas optimizadas
CREATE POLICY "Allow authenticated users to view certifications" ON certifications
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert certifications" ON certifications
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update certifications" ON certifications
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete certifications" ON certifications
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Insurances - Políticas optimizadas
CREATE POLICY "Allow authenticated users to view insurances" ON insurances
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert insurances" ON insurances
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update insurances" ON insurances
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete insurances" ON insurances
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Alerts - Políticas optimizadas
CREATE POLICY "Allow authenticated users to view alerts" ON alerts
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert alerts" ON alerts
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update alerts" ON alerts
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete alerts" ON alerts
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Notification Settings - Políticas optimizadas
CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own notification settings" ON notification_settings
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notification settings" ON notification_settings
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 3: LIMPIAR FUNCIÓN AUXILIAR
-- =====================================================

-- Eliminar la función auxiliar
DROP FUNCTION IF EXISTS drop_policy_if_exists(text, text);

-- =====================================================
-- PASO 4: VERIFICAR OPTIMIZACIONES
-- =====================================================

-- Verificar que no hay políticas duplicadas
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
ORDER BY tablename, cmd, policyname;

-- Verificar que las políticas usan SELECT para auth.uid()
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND qual LIKE '%auth.uid()%'
ORDER BY tablename, policyname;

-- Contar políticas por tabla
SELECT 
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(cmd, ', ') as operations
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Mensaje de confirmación
SELECT 'Políticas RLS optimizadas exitosamente para mejor rendimiento' as status;

