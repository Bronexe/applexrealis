-- =====================================================
-- FIX: PERMITIR A SUPER ADMINS DESCARGAR ARCHIVOS DE OTROS USUARIOS
-- =====================================================

-- Verificar que la tabla administrators existe y tiene la estructura correcta
SELECT 
    'Verificando tabla administrators' as status,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'administrators'
    ) as table_exists;

-- Verificar que hay super admins en el sistema
SELECT 
    'Super admins en el sistema' as status,
    COUNT(*) as total_super_admins
FROM administrators 
WHERE role = 'super_admin' AND is_active = true;

-- Verificar estructura de la tabla administrators
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'administrators'
ORDER BY ordinal_position;

-- Verificar que el bucket de storage existe
SELECT 
    'Bucket evidence existe' as status,
    EXISTS (
        SELECT 1 
        FROM storage.buckets 
        WHERE name = 'evidence'
    ) as bucket_exists;

-- =====================================================
-- VERIFICACIÓN COMPLETA
-- =====================================================

-- RESULTADOS ESPERADOS:
-- ✅ Tabla administrators debe existir
-- ✅ Debe haber al menos 1 super admin activo
-- ✅ Debe tener columnas: id, user_id, role, is_active
-- ✅ Bucket evidence debe existir

-- NOTA: El fix se aplicó en el código TypeScript:
-- - lib/actions/storage-direct.ts
-- - Función getSignedUrl(): Ahora verifica si es super admin
-- - Función deleteFile(): Ahora verifica si es super admin
-- - Los super admins pueden descargar/eliminar archivos de cualquier usuario
