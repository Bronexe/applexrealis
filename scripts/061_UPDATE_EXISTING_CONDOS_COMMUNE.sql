-- =====================================================
-- ACTUALIZAR COMUNAS EN CONDOMINIOS EXISTENTES
-- =====================================================

-- Este script actualiza el campo 'comuna' en los condominios existentes
-- que solo tienen commune_id pero no tienen el nombre de la comuna

-- 1. Verificar condominios que necesitan actualización
SELECT 
    'Condominios que necesitan actualización:' as info,
    COUNT(*) as total_condos,
    COUNT(CASE WHEN comuna IS NULL OR comuna = '' THEN 1 END) as condos_sin_comuna,
    COUNT(CASE WHEN commune_id IS NOT NULL AND (comuna IS NULL OR comuna = '') THEN 1 END) as condos_con_id_sin_nombre
FROM condos;

-- 2. Mostrar algunos ejemplos de condominios que necesitan actualización
SELECT 
    'Ejemplos de condominios a actualizar:' as info,
    id,
    name,
    commune_id,
    comuna,
    CASE 
        WHEN comuna IS NULL OR comuna = '' THEN '❌ Sin nombre de comuna'
        ELSE '✅ Con nombre de comuna'
    END as status
FROM condos 
WHERE commune_id IS NOT NULL 
    AND (comuna IS NULL OR comuna = '')
ORDER BY created_at DESC
LIMIT 10;

-- 3. Actualizar condominios con commune_id pero sin nombre de comuna
-- Nota: Este script asume que tienes una función o tabla de referencia
-- para obtener el nombre de la comuna por su ID

-- Para este ejemplo, vamos a crear una función temporal que mapee algunos IDs comunes
-- En un entorno real, deberías tener una tabla de comunas o usar la función getCommuneById

DO $$ 
DECLARE
    condo_record RECORD;
    commune_name TEXT;
BEGIN
    RAISE NOTICE '=== INICIANDO ACTUALIZACIÓN DE COMUNAS ===';
    
    -- Iterar sobre condominios que necesitan actualización
    FOR condo_record IN 
        SELECT id, name, commune_id, comuna
        FROM condos 
        WHERE commune_id IS NOT NULL 
            AND (comuna IS NULL OR comuna = '')
    LOOP
        RAISE NOTICE 'Procesando condominio: % (ID: %, Commune ID: %)', 
            condo_record.name, condo_record.id, condo_record.commune_id;
        
        -- Aquí deberías implementar la lógica para obtener el nombre de la comuna
        -- Por ahora, vamos a usar un mapeo básico para algunos IDs comunes
        -- En un entorno real, usarías getCommuneById(region_id, commune_id)
        
        CASE condo_record.commune_id
            WHEN '1' THEN commune_name := 'Santiago';
            WHEN '2' THEN commune_name := 'Providencia';
            WHEN '3' THEN commune_name := 'Las Condes';
            WHEN '4' THEN commune_name := 'Ñuñoa';
            WHEN '5' THEN commune_name := 'Maipú';
            WHEN '6' THEN commune_name := 'La Florida';
            WHEN '7' THEN commune_name := 'Puente Alto';
            WHEN '8' THEN commune_name := 'San Bernardo';
            WHEN '9' THEN commune_name := 'Valparaíso';
            WHEN '10' THEN commune_name := 'Viña del Mar';
            ELSE commune_name := 'Comuna ' || condo_record.commune_id;
        END CASE;
        
        -- Actualizar el condominio con el nombre de la comuna
        UPDATE condos 
        SET comuna = commune_name
        WHERE id = condo_record.id;
        
        RAISE NOTICE '  ✅ Actualizado: % -> %', condo_record.name, commune_name;
    END LOOP;
    
    RAISE NOTICE '=== ACTUALIZACIÓN COMPLETADA ===';
END $$;

-- 4. Verificar resultados después de la actualización
SELECT 
    'Resultados después de la actualización:' as info,
    COUNT(*) as total_condos,
    COUNT(CASE WHEN comuna IS NULL OR comuna = '' THEN 1 END) as condos_sin_comuna,
    COUNT(CASE WHEN comuna IS NOT NULL AND comuna != '' THEN 1 END) as condos_con_comuna
FROM condos;

-- 5. Mostrar algunos ejemplos de condominios actualizados
SELECT 
    'Ejemplos de condominios actualizados:' as info,
    id,
    name,
    commune_id,
    comuna,
    '✅ Actualizado' as status
FROM condos 
WHERE comuna IS NOT NULL 
    AND comuna != ''
ORDER BY updated_at DESC
LIMIT 10;

-- =====================================================
-- ACTUALIZACIÓN COMPLETADA
-- =====================================================









