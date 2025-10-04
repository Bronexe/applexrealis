-- Create main tables for Property Compliance Dashboard
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Condominiums table
CREATE TABLE IF NOT EXISTS condos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  region_id TEXT,
  commune_id TEXT,
  destino_uso TEXT CHECK (destino_uso IN (
    'habitacional',
    'oficinas',
    'local-comercial',
    'bodegaje',
    'estacionamientos',
    'recintos-industriales',
    'sitios-urbanizados'
  )),
  cantidad_copropietarios INTEGER,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assemblies table
CREATE TABLE IF NOT EXISTS assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ordinaria', 'extraordinaria')),
  date DATE NOT NULL,
  act_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Plans table
CREATE TABLE IF NOT EXISTS emergency_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version TEXT,
  professional_name TEXT,
  updated_at DATE NOT NULL,
  plan_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at_ts TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('gas', 'ascensor', 'otros')),
  valid_from DATE,
  valid_to DATE,
  cert_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurances table
CREATE TABLE IF NOT EXISTS insurances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number TEXT,
  insurer TEXT,
  insurance_type TEXT NOT NULL CHECK (insurance_type IN (
    'incendio-espacios-comunes',
    'os10-vigilantes-guardias',
    'sismos',
    'responsabilidad-civil',
    'hogar'
  )),
  valid_from DATE,
  valid_to DATE,
  policy_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules table for compliance evaluation
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  json_logic JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table for compliance tracking
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('open', 'ok')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE condos ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Multi-tenant security (users can only access their own data)

-- CONDOS - Solo el propietario puede ver/modificar sus condominios
CREATE POLICY "Users can manage their own condos" ON condos
FOR ALL USING (auth.uid() = user_id);

-- ASSEMBLIES - Solo el propietario del condominio puede gestionar sus asambleas
CREATE POLICY "Users can manage assemblies of their condos" ON assemblies
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = assemblies.condo_id)
);

-- EMERGENCY_PLANS - Solo el propietario del condominio puede gestionar sus planes
CREATE POLICY "Users can manage emergency_plans of their condos" ON emergency_plans
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = emergency_plans.condo_id)
);

-- CERTIFICATIONS - Solo el propietario del condominio puede gestionar sus certificaciones
CREATE POLICY "Users can manage certifications of their condos" ON certifications
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = certifications.condo_id)
);

-- INSURANCES - Solo el propietario del condominio puede gestionar sus seguros
CREATE POLICY "Users can manage insurances of their condos" ON insurances
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM condos WHERE id = insurances.condo_id)
);

-- ALERTS - Solo el propietario del condominio puede ver sus alertas
CREATE POLICY "Users can view alerts of their condos" ON alerts
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM condos WHERE id = alerts.condo_id)
);

-- RULES - Todos los usuarios autenticados pueden leer las reglas (son globales)
CREATE POLICY "Authenticated users can view rules" ON rules
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_condos_user_id ON condos(user_id);
CREATE INDEX idx_condos_destino_uso ON condos(destino_uso);
CREATE INDEX idx_assemblies_condo_id ON assemblies(condo_id);
CREATE INDEX idx_assemblies_user_id ON assemblies(user_id);
CREATE INDEX idx_emergency_plans_condo_id ON emergency_plans(condo_id);
CREATE INDEX idx_emergency_plans_user_id ON emergency_plans(user_id);
CREATE INDEX idx_certifications_condo_id ON certifications(condo_id);
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_insurances_condo_id ON insurances(condo_id);
CREATE INDEX idx_insurances_user_id ON insurances(user_id);
CREATE INDEX idx_insurances_insurance_type ON insurances(insurance_type);
CREATE INDEX idx_alerts_condo_id ON alerts(condo_id);
CREATE INDEX idx_alerts_rule_id ON alerts(rule_id);
