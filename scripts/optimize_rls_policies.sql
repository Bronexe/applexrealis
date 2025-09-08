-- =====================================================
-- OPTIMIZAR POLÍTICAS RLS PARA MEJOR RENDIMIENTO
-- =====================================================
-- Este script optimiza todas las políticas RLS para mejorar el rendimiento
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- PASO 1: LIMPIAR POLÍTICAS DUPLICADAS EN ADMINISTRATORS
-- =====================================================

-- Eliminar TODAS las políticas existentes en administrators (incluyendo duplicadas)
DROP POLICY IF EXISTS "admin_select_policy" ON administrators;
DROP POLICY IF EXISTS "admin_insert_policy" ON administrators;
DROP POLICY IF EXISTS "admin_update_policy" ON administrators;
DROP POLICY IF EXISTS "admin_delete_policy" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to view administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to insert administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to update administrators" ON administrators;
DROP POLICY IF EXISTS "Allow authenticated users to delete administrators" ON administrators;

-- =====================================================
-- PASO 2: OPTIMIZAR POLÍTICAS DE ADMINISTRATORS
-- =====================================================

-- Políticas optimizadas para administrators (usando SELECT para auth.uid())
CREATE POLICY "Allow authenticated users to view administrators" ON administrators
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert administrators" ON administrators
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update administrators" ON administrators
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete administrators" ON administrators
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 3: OPTIMIZAR POLÍTICAS DE CONDOS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to insert condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to update condos" ON condos;
DROP POLICY IF EXISTS "Allow authenticated users to delete condos" ON condos;

-- Políticas optimizadas para condos
CREATE POLICY "Allow authenticated users to view condos" ON condos
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert condos" ON condos
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update condos" ON condos
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete condos" ON condos
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 4: OPTIMIZAR POLÍTICAS DE ASSEMBLIES
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to insert assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to update assemblies" ON assemblies;
DROP POLICY IF EXISTS "Allow authenticated users to delete assemblies" ON assemblies;

-- Políticas optimizadas para assemblies
CREATE POLICY "Allow authenticated users to view assemblies" ON assemblies
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert assemblies" ON assemblies
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update assemblies" ON assemblies
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete assemblies" ON assemblies
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 5: OPTIMIZAR POLÍTICAS DE EMERGENCY_PLANS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to update emergency_plans" ON emergency_plans;
DROP POLICY IF EXISTS "Allow authenticated users to delete emergency_plans" ON emergency_plans;

-- Políticas optimizadas para emergency_plans
CREATE POLICY "Allow authenticated users to view emergency_plans" ON emergency_plans
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert emergency_plans" ON emergency_plans
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update emergency_plans" ON emergency_plans
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete emergency_plans" ON emergency_plans
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 6: OPTIMIZAR POLÍTICAS DE CERTIFICATIONS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to update certifications" ON certifications;
DROP POLICY IF EXISTS "Allow authenticated users to delete certifications" ON certifications;

-- Políticas optimizadas para certifications
CREATE POLICY "Allow authenticated users to view certifications" ON certifications
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert certifications" ON certifications
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update certifications" ON certifications
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete certifications" ON certifications
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 7: OPTIMIZAR POLÍTICAS DE INSURANCES
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to insert insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to update insurances" ON insurances;
DROP POLICY IF EXISTS "Allow authenticated users to delete insurances" ON insurances;

-- Políticas optimizadas para insurances
CREATE POLICY "Allow authenticated users to view insurances" ON insurances
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert insurances" ON insurances
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update insurances" ON insurances
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete insurances" ON insurances
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 8: OPTIMIZAR POLÍTICAS DE ALERTS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to insert alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to delete alerts" ON alerts;

-- Políticas optimizadas para alerts
CREATE POLICY "Allow authenticated users to view alerts" ON alerts
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to insert alerts" ON alerts
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to update alerts" ON alerts
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Allow authenticated users to delete alerts" ON alerts
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 9: OPTIMIZAR POLÍTICAS DE NOTIFICATION_SETTINGS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON notification_settings;

-- Políticas optimizadas para notification_settings
CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own notification settings" ON notification_settings
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notification settings" ON notification_settings
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- PASO 10: VERIFICAR OPTIMIZACIONES
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

-- Mensaje de confirmación
SELECT 'Políticas RLS optimizadas exitosamente para mejor rendimiento' as status;
