-- =====================================================
-- VERIFICAR COLUMNA USER_ID EN CONTRACTS
-- =====================================================

-- 1. Verificar si la columna user_id existe en contracts
SELECT 
    'Verificación de columna user_id:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'contracts' 
            AND column_name = 'user_id' 
            AND table_schema = 'public'
        ) THEN '✅ Columna user_id EXISTE'
        ELSE '❌ Columna user_id NO EXISTE'
    END as user_id_status;

-- 2. Mostrar estructura completa de la tabla contracts
SELECT 
    'Estructura completa de contracts:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Si la columna user_id no existe, crearla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '=== AGREGANDO COLUMNA user_id A CONTRACTS ===';
        
        -- Agregar la columna user_id
        ALTER TABLE contracts 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Establecer el valor por defecto
        ALTER TABLE contracts 
        ALTER COLUMN user_id SET DEFAULT auth.uid();
        
        -- Hacer que la columna sea NOT NULL
        ALTER TABLE contracts 
        ALTER COLUMN user_id SET NOT NULL;
        
        -- Actualizar registros existentes con el usuario actual (si hay alguno)
        UPDATE contracts 
        SET user_id = auth.uid() 
        WHERE user_id IS NULL;
        
        RAISE NOTICE '✅ Columna user_id agregada exitosamente';
    ELSE
        RAISE NOTICE '✅ La columna user_id ya existe en contracts';
    END IF;
END $$;

-- 4. Verificar el estado final de la columna user_id
SELECT 
    'Estado final de columna user_id:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
    AND column_name = 'user_id'
    AND table_schema = 'public';

-- =====================================================
-- VERIFICACIÓN DE USER_ID COMPLETADA
-- =====================================================









