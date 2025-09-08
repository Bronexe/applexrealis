-- Script para agregar las columnas destino_uso y cantidad_copropietarios a la tabla condos
-- Ejecutar en Supabase SQL Editor

-- Agregar la columna destino_uso a la tabla condos
ALTER TABLE condos 
ADD COLUMN IF NOT EXISTS destino_uso TEXT;

-- Agregar la columna cantidad_copropietarios a la tabla condos
ALTER TABLE condos 
ADD COLUMN IF NOT EXISTS cantidad_copropietarios INTEGER;

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_condos_destino_uso ON condos(destino_uso);
CREATE INDEX IF NOT EXISTS idx_condos_cantidad_copropietarios ON condos(cantidad_copropietarios);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN condos.destino_uso IS 'Destino/Uso del inmueble: habitacional, oficinas, local-comercial, bodegaje, estacionamientos, recintos-industriales, sitios-urbanizados';
COMMENT ON COLUMN condos.cantidad_copropietarios IS 'Cantidad total de copropietarios del condominio, importante para calcular quórum en asambleas';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'condos' 
AND column_name IN ('destino_uso', 'cantidad_copropietarios')
ORDER BY column_name;
