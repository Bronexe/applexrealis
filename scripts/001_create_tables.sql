-- Create main tables for Property Compliance Dashboard
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Condominiums table
CREATE TABLE IF NOT EXISTS condos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  comuna TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assemblies table
CREATE TABLE IF NOT EXISTS assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ordinaria', 'extraordinaria')),
  date DATE NOT NULL,
  act_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Plans table
CREATE TABLE IF NOT EXISTS emergency_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  version TEXT,
  professional_name TEXT,
  updated_at DATE NOT NULL,
  plan_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('gas', 'ascensor', 'otros')),
  valid_from DATE,
  valid_to DATE,
  cert_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurances table
CREATE TABLE IF NOT EXISTS insurances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  policy_number TEXT,
  insurer TEXT,
  valid_from DATE,
  valid_to DATE,
  policy_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules table for compliance evaluation
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  json_logic JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table for compliance tracking
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condo_id UUID NOT NULL REFERENCES condos(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES rules(id),
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

-- RLS Policies - Allow authenticated users to manage their own data
-- For now, we'll allow all authenticated users to access all data
-- In a real multi-tenant app, you'd filter by user ownership

CREATE POLICY "Allow authenticated users to view condos" ON condos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert condos" ON condos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update condos" ON condos FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete condos" ON condos FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view assemblies" ON assemblies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert assemblies" ON assemblies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update assemblies" ON assemblies FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete assemblies" ON assemblies FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view emergency_plans" ON emergency_plans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert emergency_plans" ON emergency_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update emergency_plans" ON emergency_plans FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete emergency_plans" ON emergency_plans FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view certifications" ON certifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert certifications" ON certifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update certifications" ON certifications FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete certifications" ON certifications FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view insurances" ON insurances FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert insurances" ON insurances FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update insurances" ON insurances FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete insurances" ON insurances FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view alerts" ON alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update alerts" ON alerts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete alerts" ON alerts FOR DELETE USING (auth.uid() IS NOT NULL);

-- Allow everyone to read rules (they're system-wide)
CREATE POLICY "Allow authenticated users to view rules" ON rules FOR SELECT USING (auth.uid() IS NOT NULL);
