-- =====================================================
-- RECREAR TABLA CONTRACTS DE FORMA SEGURA
-- =====================================================

-- 1. Eliminar políticas RLS si existen
DROP POLICY IF EXISTS "Users with condo access can manage contracts" ON contracts;
DROP POLICY IF EXISTS "Condo owners can manage contracts" ON contracts;

-- 2. Eliminar la tabla contracts si existe
DROP TABLE IF EXISTS contracts CASCADE;

-- 3. Crear la tabla contracts nuevamente
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN (
    'administracion',
    'mantenimiento',
    'limpieza',
    'seguridad',
    'jardineria',
    'otros'
  )),
  provider_name TEXT NOT NULL,
  contract_number TEXT,
  start_date DATE,
  end_date DATE,
  amount DECIMAL(15,2),
  currency TEXT DEFAULT 'CLP',
  contract_file_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS
CREATE POLICY "Users with condo access can manage contracts" ON contracts
FOR ALL USING (
  user_can_access_condo(auth.uid(), condo_id)
);

-- 6. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contracts_condo_id ON contracts(condo_id);
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type ON contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON contracts(start_date);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);

-- 7. Verificar que la tabla se creó correctamente
SELECT 
    'Tabla contracts recreada exitosamente' as status,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'contracts' AND table_schema = 'public';

-- 8. Verificar RLS
SELECT 
    'RLS habilitado en contracts' as status,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'contracts' AND schemaname = 'public';

-- 9. Verificar políticas
SELECT 
    'Políticas RLS creadas:' as info,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'contracts' 
    AND schemaname = 'public';

-- =====================================================
-- TABLA CONTRACTS RECREADA EXITOSAMENTE
-- =====================================================









