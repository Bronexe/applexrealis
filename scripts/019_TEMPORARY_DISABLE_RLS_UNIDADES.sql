-- =====================================================
-- SCRIPT PARA DESHABILITAR RLS TEMPORALMENTE EN UNIDADES_SIMPLIFIED
-- =====================================================

-- Este script deshabilita RLS temporalmente solo en unidades_simplified
-- para permitir la importación masiva

-- 1. DESHABILITAR RLS EN UNIDADES_SIMPLIFIED
ALTER TABLE unidades_simplified DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR POLÍTICAS RLS DE UNIDADES_SIMPLIFIED
DROP POLICY IF EXISTS "Users with condo access can manage unidades_simplified" ON unidades_simplified;

-- =====================================================
-- NOTA: RLS DESHABILITADO TEMPORALMENTE EN UNIDADES_SIMPLIFIED
-- =====================================================
-- Este script deshabilita la seguridad RLS solo en unidades_simplified
-- para permitir la importación masiva.
-- 
-- IMPORTANTE: Después de completar la importación, ejecuta el script
-- 020_REENABLE_RLS_UNIDADES.sql para re-habilitar la seguridad
-- =====================================================










