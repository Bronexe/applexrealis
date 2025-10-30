-- =====================================================
-- TEST: VERIFICAR QUE SUPER ADMINS PUEDEN DESCARGAR ARCHIVOS
-- =====================================================

-- 1. Verificar que el usuario sebaleon@gmail.com existe y es super admin
SELECT 
    'Verificando usuario sebaleon@gmail.com' as test,
    u.email,
    a.role,
    a.is_active,
    CASE 
        WHEN u.email = 'sebaleon@gmail.com' AND a.role = 'super_admin' AND a.is_active = true 
        THEN '✅ Usuario super admin válido'
        ELSE '❌ Usuario no es super admin válido'
    END as status
FROM auth.users u
LEFT JOIN administrators a ON a.user_id = u.id
WHERE u.email = 'sebaleon@gmail.com';

-- 2. Verificar que existen archivos en el storage
SELECT 
    'Archivos en storage' as test,
    COUNT(*) as total_files
FROM storage.objects 
WHERE bucket_id = 'evidence';

-- 3. Verificar estructura de archivos
SELECT 
    'Estructura de archivos' as test,
    name,
    created_at
FROM storage.objects 
WHERE bucket_id = 'evidence'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar políticas RLS del storage
SELECT 
    'Políticas RLS del storage' as test,
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- =====================================================
-- RESULTADOS ESPERADOS:
-- ✅ sebaleon@gmail.com debe ser super admin activo
-- ✅ Debe haber archivos en el storage
-- ✅ Las políticas RLS deben permitir acceso a super admins
-- =====================================================
