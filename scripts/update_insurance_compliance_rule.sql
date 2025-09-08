-- Script para actualizar la regla de cumplimiento de seguros
-- Ejecutar en Supabase SQL Editor

-- Actualizar la descripción de la regla SEGURO-VIGENTE
UPDATE rules 
SET description = 'Debe existir un Seguro de Incendio Espacios Comunes vigente (requisito normativo obligatorio)'
WHERE id = 'SEGURO-VIGENTE';

-- Verificar que la actualización se aplicó correctamente
SELECT id, description, module, active 
FROM rules 
WHERE id = 'SEGURO-VIGENTE';
