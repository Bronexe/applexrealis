-- =====================================================
-- SCRIPT DE VERIFICACIÓN: POLÍTICAS RLS DE CONDO_ASSIGNMENTS
-- =====================================================

-- 1. Verificar que la tabla existe
SELECT 
    'Tabla condo_assignments existe' as status,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'condo_assignments'
    ) as exists;

-- 2. Listar todas las políticas RLS de condo_assignments
SELECT 
    policyname as "Nombre de Política",
    cmd as "Comando",
    permissive as "Permisiva",
    CASE 
        WHEN policyname LIKE '%Super admin%' THEN 'Super Admin'
        WHEN policyname LIKE '%Users%' THEN 'Usuario Regular'
        ELSE 'Otro'
    END as "Para Quién"
FROM pg_policies
WHERE tablename = 'condo_assignments'
ORDER BY policyname;

-- 3. Verificar que existe la política para usuarios regulares
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'condo_assignments' 
            AND policyname = 'Users can view their own assignments'
        ) THEN '✅ Política para usuarios regulares existe'
        ELSE '❌ FALTA la política para usuarios regulares'
    END as status;

-- 4. Contar asignaciones actuales
SELECT 
    'Total de asignaciones en la base de datos' as descripcion,
    COUNT(*) as cantidad
FROM condo_assignments;

-- 5. Listar asignaciones con detalles (solo para super admin)
SELECT 
    ca.id,
    c.name as condominio,
    a.full_name as usuario_asignado,
    a.email as email_usuario,
    ca.assigned_at as fecha_asignacion,
    ca.notes as notas
FROM condo_assignments ca
LEFT JOIN condos c ON c.id = ca.condo_id
LEFT JOIN administrators a ON a.user_id = ca.user_id
ORDER BY ca.assigned_at DESC;

-- 6. Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'condo_assignments';

-- =====================================================
-- FIN DE VERIFICACIÓN
-- =====================================================

-- RESULTADOS ESPERADOS:
-- ✅ La tabla debe existir
-- ✅ Debe haber 5 políticas RLS:
--    - 4 para super admins (SELECT, INSERT, UPDATE, DELETE)
--    - 1 para usuarios regulares (SELECT sus propias asignaciones)
-- ✅ RLS debe estar habilitado (rowsecurity = true)


