-- =====================================================
-- CREACIÓN DE TABLA GESTIONES - MÓDULO DE WORKFLOW
-- =====================================================
-- Este script crea la tabla de gestiones para seguimiento de trámites y gestiones pendientes

-- 1. Crear tabla gestiones
CREATE TABLE IF NOT EXISTS gestiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN (
    'administrativo',
    'cobranza', 
    'mantencion',
    'asamblea',
    'legal',
    'financiero',
    'mantenimiento',
    'seguridad',
    'otro'
  )),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN (
    'borrador',
    'en_gestion',
    'pendiente',
    'resuelto',
    'cerrado'
  )),
  prioridad TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN (
    'baja',
    'media',
    'alta',
    'critica'
  )),
  condominio_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  unidad_id UUID NULL, -- Referencia a unidades si aplica
  solicitante_id UUID NULL, -- Copropietario/proveedor/usuario que origina
  responsable_id UUID NOT NULL REFERENCES auth.users(id), -- Dueño interno del trámite
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_limite TIMESTAMPTZ NULL,
  fecha_cierre TIMESTAMPTZ NULL,
  tags TEXT[] NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_gestiones_condominio_id ON gestiones(condominio_id);
CREATE INDEX IF NOT EXISTS idx_gestiones_responsable_id ON gestiones(responsable_id);
CREATE INDEX IF NOT EXISTS idx_gestiones_estado ON gestiones(estado);
CREATE INDEX IF NOT EXISTS idx_gestiones_prioridad ON gestiones(prioridad);
CREATE INDEX IF NOT EXISTS idx_gestiones_tipo ON gestiones(tipo);
CREATE INDEX IF NOT EXISTS idx_gestiones_fecha_creacion ON gestiones(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_gestiones_fecha_limite ON gestiones(fecha_limite);

-- 3. Habilitar RLS
ALTER TABLE gestiones ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS
-- Los usuarios pueden ver sus propias gestiones y las del super-admin puede ver todas
CREATE POLICY "Users can manage their own gestiones, super-admin can access all" ON gestiones
FOR ALL USING (
  responsable_id = auth.uid() OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = gestiones.condominio_id) OR
  is_super_admin()
);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_gestiones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_gestiones_updated_at ON gestiones;
CREATE TRIGGER trigger_update_gestiones_updated_at
  BEFORE UPDATE ON gestiones
  FOR EACH ROW
  EXECUTE FUNCTION update_gestiones_updated_at();

-- 7. Crear función para obtener estadísticas de gestiones
CREATE OR REPLACE FUNCTION get_gestiones_stats(p_condominio_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_gestiones BIGINT,
  gestiones_borrador BIGINT,
  gestiones_en_gestion BIGINT,
  gestiones_pendiente BIGINT,
  gestiones_resuelto BIGINT,
  gestiones_cerrado BIGINT,
  gestiones_criticas BIGINT,
  gestiones_vencidas BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_gestiones,
    COUNT(*) FILTER (WHERE estado = 'borrador') as gestiones_borrador,
    COUNT(*) FILTER (WHERE estado = 'en_gestion') as gestiones_en_gestion,
    COUNT(*) FILTER (WHERE estado = 'pendiente') as gestiones_pendiente,
    COUNT(*) FILTER (WHERE estado = 'resuelto') as gestiones_resuelto,
    COUNT(*) FILTER (WHERE estado = 'cerrado') as gestiones_cerrado,
    COUNT(*) FILTER (WHERE prioridad = 'critica') as gestiones_criticas,
    COUNT(*) FILTER (WHERE fecha_limite < NOW() AND estado NOT IN ('resuelto', 'cerrado')) as gestiones_vencidas
  FROM gestiones 
  WHERE (p_condominio_id IS NULL OR condominio_id = p_condominio_id);
END;
$$;

-- 8. Insertar datos de ejemplo (opcional - solo para desarrollo)
-- INSERT INTO gestiones (tipo, titulo, descripcion, estado, prioridad, condominio_id, responsable_id) VALUES
-- ('administrativo', 'Renovación de póliza de seguro', 'Renovar póliza de seguro contra incendios que vence el próximo mes', 'en_gestion', 'alta', (SELECT id FROM condos LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
-- ('cobranza', 'Cobro de gastos comunes atrasados', 'Seguimiento de deudores morosos del edificio', 'pendiente', 'media', (SELECT id FROM condos LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
-- ('mantencion', 'Reparación ascensor', 'El ascensor presenta fallas intermitentes en el piso 3', 'en_gestion', 'critica', (SELECT id FROM condos LIMIT 1), (SELECT id FROM auth.users LIMIT 1));

-- 9. Verificar que la tabla se creó correctamente
SELECT 
  'Verificación de tabla gestiones:' as info,
  COUNT(*) as total_gestiones
FROM gestiones;

-- 10. Mostrar estructura de la tabla
SELECT 
  'Estructura de tabla gestiones:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'gestiones' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- TABLA GESTIONES CREADA EXITOSAMENTE
-- =====================================================








