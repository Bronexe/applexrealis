-- =====================================================
-- SCRIPT PARA RE-HABILITAR RLS EN UNIDADES_SIMPLIFIED
-- =====================================================

-- Este script re-habilita RLS en unidades_simplified después de la importación

-- 1. CREAR POLÍTICA RLS PARA UNIDADES_SIMPLIFIED
CREATE POLICY "Users with condo access can manage unidades_simplified" ON unidades_simplified
FOR ALL USING (user_can_access_condo(condo_id, auth.uid()));

-- 2. HABILITAR RLS EN UNIDADES_SIMPLIFIED
ALTER TABLE unidades_simplified ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS RE-HABILITADO EN UNIDADES_SIMPLIFIED
-- =====================================================
-- La seguridad RLS ha sido re-habilitada en unidades_simplified
-- con la política correcta que permite a los usuarios gestionar
-- unidades de condominios a los que tienen acceso
-- =====================================================







