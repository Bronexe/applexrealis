-- =====================================================
-- AGREGAR LÍMITE DE CONDOMINIOS A LA TABLA ADMINISTRATORS
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

-- 7. Mostrar algunos ejemplos
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
-- LÍMITE DE CONDOMINIOS AGREGADO
-- =====================================================
