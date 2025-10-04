-- =====================================================
-- CORREGIR FUNCIÓN user_can_access_condo
-- =====================================================

-- 1. Eliminar ambas funciones existentes
DROP FUNCTION IF EXISTS user_can_access_condo(UUID);
DROP FUNCTION IF EXISTS user_can_access_condo(UUID, UUID);

-- 2. Crear una función user_can_access_condo simplificada y segura
CREATE OR REPLACE FUNCTION user_can_access_condo(p_condo_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Verificar si es super admin
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificación específica para sebaleon@gmail.com
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = p_user_id 
    AND email = 'sebaleon@gmail.com'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si el usuario es propietario del condominio
  IF EXISTS (
    SELECT 1 FROM condos 
    WHERE id = p_condo_id 
    AND user_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si el usuario tiene permisos específicos en el condominio
  IF EXISTS (
    SELECT 1 FROM condo_user_permissions 
    WHERE condo_id = p_condo_id 
    AND user_id = p_user_id
    AND can_manage_contracts = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 3. Crear función de conveniencia con un solo parámetro
CREATE OR REPLACE FUNCTION user_can_access_condo(p_condo_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN user_can_access_condo(p_condo_id, auth.uid());
END;
$$;

-- 4. Verificar las funciones creadas
SELECT 
    'Funciones user_can_access_condo creadas:' as info,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'user_can_access_condo'
    AND routine_schema = 'public'
ORDER BY routine_name;

-- 5. Probar la función con el usuario actual
DO $$ 
DECLARE
    test_condo_id UUID;
    test_result BOOLEAN;
    current_user_id UUID;
BEGIN
    -- Obtener el usuario actual
    current_user_id := auth.uid();
    
    -- Obtener el primer condominio del usuario actual
    SELECT id INTO test_condo_id 
    FROM condos 
    WHERE user_id = current_user_id 
    LIMIT 1;
    
    RAISE NOTICE '=== PRUEBA DE FUNCIÓN user_can_access_condo CORREGIDA ===';
    RAISE NOTICE 'Usuario actual: %', current_user_id;
    
    IF test_condo_id IS NOT NULL THEN
        -- Probar la función con dos parámetros
        SELECT user_can_access_condo(test_condo_id, current_user_id) INTO test_result;
        RAISE NOTICE 'Condominio de prueba: %', test_condo_id;
        RAISE NOTICE 'Resultado con 2 parámetros: %', test_result;
        
        -- Probar la función con un parámetro
        SELECT user_can_access_condo(test_condo_id) INTO test_result;
        RAISE NOTICE 'Resultado con 1 parámetro: %', test_result;
        
        IF test_result THEN
            RAISE NOTICE '✅ La función funciona correctamente';
        ELSE
            RAISE NOTICE '❌ La función devuelve FALSE - revisar permisos';
        END IF;
    ELSE
        RAISE NOTICE '❌ No se encontraron condominios para el usuario actual';
    END IF;
END $$;

-- =====================================================
-- FUNCIÓN user_can_access_condo CORREGIDA
-- =====================================================






