-- Seed compliance rules
INSERT INTO rules (id, description, module, active) VALUES
('ASAMBLEA-ANUAL', 'Debe existir una asamblea ordinaria en los últimos 365 días con acta adjunta', 'assemblies', true),
('PLAN-EVAC-ANUAL', 'El plan de evacuación debe estar actualizado en los últimos 365 días', 'emergency_plans', true),
('SEGURO-VIGENTE', 'Debe existir un Seguro de Incendio Espacios Comunes vigente (requisito normativo obligatorio)', 'insurances', true),
('CERTIF-VIGENTE', 'Debe existir al menos una certificación vigente', 'certifications', true)
ON CONFLICT (id) DO NOTHING;
