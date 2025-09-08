-- Script para corregir problemas en la base de datos
-- Ejecuta este script en Supabase SQL Editor

-- 1. Verificar y corregir la tabla alerts (falta el campo id)
DO $$
BEGIN
    -- Verificar si la tabla alerts existe y tiene el campo id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        -- Verificar si falta el campo id
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'id') THEN
            -- Agregar el campo id faltante
            ALTER TABLE alerts ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
            RAISE NOTICE 'Campo id agregado a la tabla alerts';
        ELSE
            RAISE NOTICE 'La tabla alerts ya tiene el campo id';
        END IF;
    ELSE
        RAISE NOTICE 'La tabla alerts no existe';
    END IF;
END $$;

-- 2. Verificar que la tabla condos existe y tiene los campos correctos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condos') THEN
        RAISE NOTICE 'La tabla condos existe';
        
        -- Verificar campos
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'condos' AND column_name = 'name') THEN
            RAISE NOTICE 'Campo name existe en condos';
        ELSE
            RAISE NOTICE 'Campo name NO existe en condos';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'condos' AND column_name = 'comuna') THEN
            RAISE NOTICE 'Campo comuna existe en condos';
        ELSE
            RAISE NOTICE 'Campo comuna NO existe en condos';
        END IF;
    ELSE
        RAISE NOTICE 'La tabla condos NO existe - necesitas ejecutar el script de migración';
    END IF;
END $$;

-- 3. Verificar políticas RLS
SELECT 'Políticas RLS para condos:' as info;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'condos'
ORDER BY policyname;

-- 4. Verificar datos de prueba
SELECT 'Datos en tabla condos:' as info;
SELECT COUNT(*) as total_condos FROM condos;

-- 5. Si no hay datos, insertar un condominio de prueba
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM condos) = 0 THEN
        INSERT INTO condos (name, comuna) VALUES 
        ('Condominio de Prueba', 'Santiago'),
        ('Residencial Las Flores', 'Providencia'),
        ('Torre Central', 'Las Condes');
        RAISE NOTICE 'Se insertaron 3 condominios de prueba';
    ELSE
        RAISE NOTICE 'Ya existen condominios en la tabla';
    END IF;
END $$;

-- 6. Verificar usuario autenticado
SELECT 'Usuario actual:' as info;
SELECT auth.uid() as current_user_id;

-- 7. Probar consulta simple
SELECT 'Prueba de consulta:' as info;
SELECT id, name, comuna FROM condos LIMIT 3;

-- 8. Verificar extensiones
SELECT 'Extensiones habilitadas:' as info;
SELECT extname, extversion FROM pg_extension WHERE extname = 'uuid-ossp';

-- 9. Estado final
SELECT 'Estado de la base de datos:' as info;
SELECT 
    'Base de datos verificada y corregida' as status,
    NOW() as timestamp,
    (SELECT COUNT(*) FROM condos) as total_condos;

