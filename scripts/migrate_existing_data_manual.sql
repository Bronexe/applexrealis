-- =====================================================
-- MIGRAR DATOS EXISTENTES PARA AISLAMIENTO POR USUARIO - VERSIÓN MANUAL
-- =====================================================
-- Este script migra los datos existentes asignándolos a un usuario específico
-- 
-- ⚠️ IMPORTANTE: Este script debe ejecutarse DESPUÉS de implement_user_isolation_simple.sql
-- 
-- 🔧 VERSIÓN MANUAL: Permite especificar el email del usuario manualmente
-- 
-- Ejecuta este script en Supabase SQL Editor

-- =====================================================
-- PASO 1: CONFIGURAR EL USUARIO DE MIGRACIÓN
-- =====================================================

-- ⚠️ CAMBIA ESTE EMAIL POR EL USUARIO AL QUE QUIERES ASIGNAR LOS DATOS
-- Por ejemplo: 'sebaleon@gmail.com'
DO $$
DECLARE
    target_user_email TEXT := 'sebaleon@gmail.com';  -- ⚠️ CAMBIA ESTE EMAIL
    target_user_id UUID;
    condos_count INTEGER;
    assemblies_count INTEGER;
    plans_count INTEGER;
    certs_count INTEGER;
    insurances_count INTEGER;
    alerts_count INTEGER;
BEGIN
    -- Verificar que las columnas user_id existen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'condos' AND column_name = 'user_id'
    ) THEN
        RAISE EXCEPTION 'La columna user_id no existe en la tabla condos. Ejecuta primero implement_user_isolation_simple.sql';
    END IF;
    
    -- Obtener el user_id del email especificado
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = target_user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado. Verifica que el email sea correcto.', target_user_email;
    END IF;
    
    RAISE NOTICE 'Usuario encontrado: % (ID: %)', target_user_email, target_user_id;
    
    -- =====================================================
    -- PASO 2: MIGRAR DATOS EXISTENTES
    -- =====================================================
    
    -- Migrar condos existentes (asignar al usuario especificado)
    UPDATE condos 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS condos_count = ROW_COUNT;
    RAISE NOTICE 'Condominios migrados: %', condos_count;
    
    -- Migrar assemblies existentes
    UPDATE assemblies 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS assemblies_count = ROW_COUNT;
    RAISE NOTICE 'Asambleas migradas: %', assemblies_count;
    
    -- Migrar emergency_plans existentes
    UPDATE emergency_plans 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS plans_count = ROW_COUNT;
    RAISE NOTICE 'Planes de emergencia migrados: %', plans_count;
    
    -- Migrar certifications existentes
    UPDATE certifications 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS certs_count = ROW_COUNT;
    RAISE NOTICE 'Certificaciones migradas: %', certs_count;
    
    -- Migrar insurances existentes
    UPDATE insurances 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS insurances_count = ROW_COUNT;
    RAISE NOTICE 'Seguros migrados: %', insurances_count;
    
    -- Migrar alerts existentes
    UPDATE alerts 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS alerts_count = ROW_COUNT;
    RAISE NOTICE 'Alertas migradas: %', alerts_count;
    
    -- =====================================================
    -- PASO 3: VERIFICAR MIGRACIÓN
    -- =====================================================
    
    -- Verificar que no quedan registros sin user_id
    IF EXISTS (SELECT 1 FROM condos WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Error: Quedan condominios sin user_id asignado';
    END IF;
    
    IF EXISTS (SELECT 1 FROM assemblies WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Error: Quedan asambleas sin user_id asignado';
    END IF;
    
    IF EXISTS (SELECT 1 FROM emergency_plans WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Error: Quedan planes de emergencia sin user_id asignado';
    END IF;
    
    IF EXISTS (SELECT 1 FROM certifications WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Error: Quedan certificaciones sin user_id asignado';
    END IF;
    
    IF EXISTS (SELECT 1 FROM insurances WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Error: Quedan seguros sin user_id asignado';
    END IF;
    
    IF EXISTS (SELECT 1 FROM alerts WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Error: Quedan alertas sin user_id asignado';
    END IF;
    
    RAISE NOTICE '✅ Migración completada exitosamente';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   - Usuario: %', target_user_email;
    RAISE NOTICE '   - Condominios: %', condos_count;
    RAISE NOTICE '   - Asambleas: %', assemblies_count;
    RAISE NOTICE '   - Planes de emergencia: %', plans_count;
    RAISE NOTICE '   - Certificaciones: %', certs_count;
    RAISE NOTICE '   - Seguros: %', insurances_count;
    RAISE NOTICE '   - Alertas: %', alerts_count;
    
END $$;

-- =====================================================
-- PASO 4: HACER COLUMNAS user_id NOT NULL
-- =====================================================

-- Ahora que todos los datos tienen user_id, hacer las columnas NOT NULL
ALTER TABLE condos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE assemblies ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE emergency_plans ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE certifications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE insurances ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE alerts ALTER COLUMN user_id SET NOT NULL;

-- =====================================================
-- PASO 5: VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las columnas user_id son NOT NULL
SELECT 
    table_name,
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'user_id'
ORDER BY table_name;

-- Verificar que no hay registros sin user_id
SELECT 
    'condos' as tabla,
    COUNT(*) as registros_sin_user_id
FROM condos 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'assemblies' as tabla,
    COUNT(*) as registros_sin_user_id
FROM assemblies 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'emergency_plans' as tabla,
    COUNT(*) as registros_sin_user_id
FROM emergency_plans 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'certifications' as tabla,
    COUNT(*) as registros_sin_user_id
FROM certifications 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'insurances' as tabla,
    COUNT(*) as registros_sin_user_id
FROM insurances 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'alerts' as tabla,
    COUNT(*) as registros_sin_user_id
FROM alerts 
WHERE user_id IS NULL;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Migración de datos completada exitosamente. 
🔒 Todos los datos existentes ahora pertenecen al usuario especificado.
⚠️ IMPORTANTE: Actualiza la aplicación para usar user_id en las consultas.' as status;

