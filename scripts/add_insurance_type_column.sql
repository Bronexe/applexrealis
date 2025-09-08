-- Script para agregar la columna insurance_type a la tabla insurances
-- Ejecutar en Supabase SQL Editor

-- Agregar la columna insurance_type a la tabla insurances
ALTER TABLE insurances 
ADD COLUMN IF NOT EXISTS insurance_type TEXT;

-- Crear un índice para mejorar el rendimiento de consultas por tipo de seguro
CREATE INDEX IF NOT EXISTS idx_insurances_insurance_type ON insurances(insurance_type);

-- Comentario para documentar la columna
COMMENT ON COLUMN insurances.insurance_type IS 'Tipo de seguro: incendio-espacios-comunes, os10-vigilantes-guardias, sismos, responsabilidad-civil, hogar';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'insurances' AND column_name = 'insurance_type';
