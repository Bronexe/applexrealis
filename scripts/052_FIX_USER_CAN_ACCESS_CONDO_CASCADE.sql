-- =====================================================
-- CORREGIR FUNCIÓN user_can_access_condo CON CASCADE
-- =====================================================

-- 1. Eliminar todas las funciones user_can_access_condo con CASCADE
-- Esto eliminará automáticamente todas las políticas RLS que las usan
DROP FUNCTION IF EXISTS user_can_access_condo(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_can_access_condo(UUID, UUID) CASCADE;

-- 2. Verificar que se eliminaron todas las políticas dependientes
SELECT 
    'Políticas RLS eliminadas (deberían estar vacías):' as info,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
    AND (policyname LIKE '%user_can_access_condo%' 
         OR policyname LIKE '%condo access%'
         OR policyname LIKE '%Users with condo access%')
ORDER BY tablename, policyname;

-- 3. Crear la función user_can_access_condo corregida (versión principal)
CREATE OR REPLACE FUNCTION user_can_access_condo(p_condo_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Verificar si el usuario es válido
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificación específica para sebaleon@gmail.com (super admin)
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
    AND (can_manage_contracts = true OR can_manage_documents = true)
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 4. Crear función de conveniencia con un solo parámetro
CREATE OR REPLACE FUNCTION user_can_access_condo(p_condo_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN user_can_access_condo(p_condo_id, auth.uid());
END;
$$;

-- 5. Verificar las funciones creadas
SELECT 
    'Funciones user_can_access_condo recreadas:' as info,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'user_can_access_condo'
    AND routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- FUNCIÓN user_can_access_condo RECREADA CON CASCADE
-- =====================================================






