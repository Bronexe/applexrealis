-- =====================================================
-- CONFIGURACIÓN COMPLETA DE LÍMITE DE CONDOMINIOS
-- =====================================================
-- Este script ejecuta toda la configuración necesaria para el límite de condominios
-- en el orden correcto: columna, funciones, y pruebas

-- =====================================================
-- PARTE 1: AGREGAR COLUMNA CONDOS_LIMIT
-- =====================================================

-- 1. Verificar estructura actual de la tabla administrators
SELECT 
    'Estructura actual de administrators:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'administrators'
ORDER BY ordinal_position;

-- 2. Agregar columna condos_limit a la tabla administrators
ALTER TABLE administrators 
ADD COLUMN IF NOT EXISTS condos_limit INTEGER DEFAULT 1;

-- 3. Agregar comentario a la columna
COMMENT ON COLUMN administrators.condos_limit IS 'Límite máximo de condominios que puede crear este usuario (NULL = sin límite)';

-- 4. Verificar que la columna se agregó correctamente
SELECT 
    'Nueva estructura de administrators:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'administrators'
    AND column_name = 'condos_limit';

-- 5. Actualizar usuarios existentes con límite por defecto
UPDATE administrators 
SET condos_limit = 1 
WHERE condos_limit IS NULL;

-- 6. Verificar actualización
SELECT 
    'Usuarios actualizados con límite por defecto:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN condos_limit = 1 THEN 1 END) as users_with_default_limit,
    COUNT(CASE WHEN condos_limit IS NULL THEN 1 END) as users_without_limit
FROM administrators;

-- =====================================================
-- PARTE 2: CREAR FUNCIONES SQL
-- =====================================================

-- 1. Crear función para verificar si un usuario puede crear más condominios
CREATE OR REPLACE FUNCTION check_condos_limit(p_user_id UUID)
RETURNS TABLE(
    can_create BOOLEAN,
    current_count INTEGER,
    limit_count INTEGER,
    remaining_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_limit INTEGER;
    current_condos INTEGER;
    can_create_more BOOLEAN;
    remaining INTEGER;
BEGIN
    -- Obtener el límite del usuario desde la tabla administrators
    SELECT condos_limit INTO user_limit
    FROM administrators 
    WHERE user_id = p_user_id;
    
    -- Si no hay límite definido (NULL), permitir creación ilimitada
    IF user_limit IS NULL THEN
        RETURN QUERY SELECT 
            TRUE as can_create,
            (SELECT COUNT(*) FROM condos WHERE user_id = p_user_id) as current_count,
            NULL::INTEGER as limit_count,
            NULL::INTEGER as remaining_count;
        RETURN;
    END IF;
    
    -- Contar condominios actuales del usuario
    SELECT COUNT(*) INTO current_condos
    FROM condos 
    WHERE user_id = p_user_id;
    
    -- Verificar si puede crear más
    can_create_more := current_condos < user_limit;
    remaining := GREATEST(0, user_limit - current_condos);
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        can_create_more as can_create,
        current_condos as current_count,
        user_limit as limit_count,
        remaining as remaining_count;
END;
$$;

-- 2. Crear función para obtener información del límite de condominios
CREATE OR REPLACE FUNCTION get_condos_limit_info(p_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    email TEXT,
    current_condos INTEGER,
    condos_limit INTEGER,
    can_create_more BOOLEAN,
    remaining_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.user_id,
        a.full_name,
        a.email,
        COALESCE(condo_count.count, 0) as current_condos,
        a.condos_limit,
        CASE 
            WHEN a.condos_limit IS NULL THEN TRUE
            ELSE COALESCE(condo_count.count, 0) < a.condos_limit
        END as can_create_more,
        CASE 
            WHEN a.condos_limit IS NULL THEN NULL
            ELSE GREATEST(0, a.condos_limit - COALESCE(condo_count.count, 0))
        END as remaining_count
    FROM administrators a
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM condos
        GROUP BY user_id
    ) condo_count ON a.user_id = condo_count.user_id
    WHERE a.user_id = p_user_id;
END;
$$;

-- 3. Crear función para actualizar el límite de condominios de un usuario
CREATE OR REPLACE FUNCTION update_condos_limit(
    p_user_id UUID,
    p_new_limit INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    current_condos INTEGER;
BEGIN
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM administrators WHERE user_id = p_user_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Si se está estableciendo un límite, verificar que no sea menor al número actual de condominios
    IF p_new_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO current_condos
        FROM condos 
        WHERE user_id = p_user_id;
        
        IF current_condos > p_new_limit THEN
            RETURN FALSE; -- No se puede establecer un límite menor al número actual
        END IF;
    END IF;
    
    -- Actualizar el límite
    UPDATE administrators 
    SET condos_limit = p_new_limit
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$;

-- =====================================================
-- PARTE 3: PROBAR LA CONFIGURACIÓN
-- =====================================================

-- 1. Verificar que las funciones se crearon correctamente
SELECT 
    'Funciones creadas:' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('check_condos_limit', 'get_condos_limit_info', 'update_condos_limit')
ORDER BY routine_name;

-- 2. Probar las funciones con un usuario existente
DO $$ 
DECLARE
    test_user_id UUID;
    limit_check RECORD;
    limit_info RECORD;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIONES DE LÍMITE ===';
    
    -- Obtener un usuario de prueba
    SELECT user_id INTO test_user_id 
    FROM administrators 
    WHERE condos_limit = 1
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario de prueba con límite 1: %', test_user_id;
        
        -- Probar función check_condos_limit
        SELECT * INTO limit_check FROM check_condos_limit(test_user_id);
        RAISE NOTICE 'check_condos_limit: can_create=%, current=%, limit=%, remaining=%', 
            limit_check.can_create, limit_check.current_count, limit_check.limit_count, limit_check.remaining_count;
        
        -- Probar función get_condos_limit_info
        SELECT * INTO limit_info FROM get_condos_limit_info(test_user_id);
        RAISE NOTICE 'get_condos_limit_info: user=%, current=%, limit=%, can_create=%, remaining=%', 
            limit_info.full_name, limit_info.current_condos, limit_info.condos_limit, 
            limit_info.can_create_more, limit_info.remaining_count;
            
        -- Verificar que el límite es 1
        IF limit_check.limit_count = 1 THEN
            RAISE NOTICE '✅ Límite por defecto funcionando correctamente: %', limit_check.limit_count;
        ELSE
            RAISE NOTICE '❌ Límite por defecto incorrecto: % (debería ser 1)', limit_check.limit_count;
        END IF;
    ELSE
        RAISE NOTICE '⚠️  No hay usuarios con límite 1 para probar';
    END IF;
    
    RAISE NOTICE '=== PRUEBAS DE FUNCIONES COMPLETADAS ===';
END $$;

-- 3. Mostrar resumen final
SELECT 
    'Resumen final de configuración:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN condos_limit = 1 THEN 1 END) as users_with_limit_1,
    COUNT(CASE WHEN condos_limit IS NULL THEN 1 END) as users_without_limit,
    COUNT(CASE WHEN condos_limit > 1 THEN 1 END) as users_with_higher_limit
FROM administrators;

-- 4. Mostrar algunos ejemplos de usuarios
SELECT 
    'Ejemplos de usuarios con límites:' as info,
    id,
    full_name,
    email,
    condos_limit,
    CASE 
        WHEN condos_limit IS NULL THEN 'Sin límite'
        ELSE condos_limit::text || ' condominios'
    END as limit_description
FROM administrators
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- CONFIGURACIÓN COMPLETA DE LÍMITE DE CONDOMINIOS FINALIZADA
-- =====================================================






