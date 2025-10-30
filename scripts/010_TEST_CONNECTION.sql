-- =====================================================
-- SCRIPT DE PRUEBA DE CONEXIÓN Y CREACIÓN DE DATOS DE PRUEBA
-- =====================================================

-- 1. Verificar que podemos acceder a la tabla condos
SELECT 'Tabla condos accesible' as test_result;

-- 2. Verificar estructura básica
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'condos' 
ORDER BY ordinal_position;

-- 3. Insertar un condominio de prueba (solo si no existe)
INSERT INTO condos (
    name, 
    address, 
    comuna, 
    region_id, 
    commune_id,
    destino_uso,
    cantidad_copropietarios,
    user_id
) 
SELECT 
    'Condominio de Prueba',
    'Dirección de Prueba 123',
    'Santiago',
    '13',
    '13101',
    'habitacional',
    50,
    auth.uid()
WHERE NOT EXISTS (
    SELECT 1 FROM condos WHERE name = 'Condominio de Prueba'
);

-- 4. Verificar que se insertó correctamente
SELECT 
    id,
    name,
    address,
    comuna,
    user_id,
    created_at
FROM condos 
WHERE name = 'Condominio de Prueba';

-- 5. Verificar políticas RLS
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'condos';

-- 6. Probar consulta como usuario autenticado
SELECT 
    COUNT(*) as total_condos,
    'Consulta exitosa' as status
FROM condos 
WHERE user_id = auth.uid();










