-- =====================================================
-- SCRIPT PARA AGREGAR VALOR POR DEFECTO A USER_ID
-- =====================================================

-- Este script agrega un valor por defecto a la columna user_id
-- para evitar errores de NOT NULL constraint

-- 1. VERIFICAR ESTRUCTURA ACTUAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'unidades_simplified' 
    AND table_schema = 'public'
    AND column_name = 'user_id';

-- 2. AGREGAR VALOR POR DEFECTO A USER_ID
-- Usar auth.uid() como valor por defecto
ALTER TABLE unidades_simplified 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. VERIFICAR QUE SE APLICÓ EL CAMBIO
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'unidades_simplified' 
    AND table_schema = 'public'
    AND column_name = 'user_id';

-- 4. ACTUALIZAR REGISTROS EXISTENTES QUE TENGAN USER_ID NULL
-- (Si los hay)
UPDATE unidades_simplified 
SET user_id = auth.uid() 
WHERE user_id IS NULL;

-- =====================================================
-- VALOR POR DEFECTO AGREGADO
-- =====================================================
-- La columna user_id ahora tiene auth.uid() como valor por defecto
-- Esto evitará errores de NOT NULL constraint
-- =====================================================










