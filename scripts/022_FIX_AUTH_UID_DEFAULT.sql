-- =====================================================
-- SCRIPT PARA CORREGIR VALOR POR DEFECTO DE USER_ID
-- =====================================================

-- El problema: auth.uid() puede no funcionar como valor por defecto en ciertos contextos
-- Solución: Crear una función que maneje esto correctamente

-- 1. ELIMINAR VALOR POR DEFECTO ACTUAL
ALTER TABLE unidades_simplified 
ALTER COLUMN user_id DROP DEFAULT;

-- 2. CREAR FUNCIÓN HELPER PARA OBTENER USER_ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. AGREGAR VALOR POR DEFECTO USANDO LA FUNCIÓN
ALTER TABLE unidades_simplified 
ALTER COLUMN user_id SET DEFAULT get_current_user_id();

-- 4. VERIFICAR QUE SE APLICÓ EL CAMBIO
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'unidades_simplified' 
    AND table_schema = 'public'
    AND column_name = 'user_id';

-- 5. ACTUALIZAR REGISTROS EXISTENTES QUE TENGAN USER_ID NULL
UPDATE unidades_simplified 
SET user_id = get_current_user_id() 
WHERE user_id IS NULL;

-- =====================================================
-- VALOR POR DEFECTO CORREGIDO
-- =====================================================
-- La columna user_id ahora usa get_current_user_id() como valor por defecto
-- Esta función maneja correctamente el contexto de auth.uid()
-- =====================================================










