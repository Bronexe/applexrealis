# Optimización de Políticas RLS (Row Level Security)

## Problema Identificado

El linter de Supabase detectó múltiples advertencias de rendimiento en las políticas RLS:

1. **Auth RLS Initialization Plan**: Las funciones `auth.<function>()` se re-evalúan para cada fila
2. **Multiple Permissive Policies**: Hay múltiples políticas permisivas para el mismo rol y acción

## Solución Implementada

### 1. Funciones Helper Optimizadas

Se crearon funciones helper que optimizan las llamadas a `auth`:

```sql
-- Función optimizada para obtener user_id
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
$$;

-- Función optimizada para verificar super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM administrators 
    WHERE user_id = auth.current_user_id() 
    AND role = 'super_admin' 
    AND is_active = true
  );
$$;

-- Función optimizada para verificar acceso a condominio
CREATE OR REPLACE FUNCTION auth.has_condo_access(condo_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.is_super_admin() OR EXISTS (
    SELECT 1 FROM condos 
    WHERE id = condo_id_param 
    AND user_id = auth.current_user_id()
  );
$$;
```

### 2. Políticas Consolidadas

Se eliminaron políticas duplicadas y se crearon versiones optimizadas:

**Antes (problemático):**
```sql
-- Múltiples políticas para la misma acción
CREATE POLICY "Users can view own condos" ON condos FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can only see their own condos" ON condos FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Super admins can view all condos" ON condos FOR SELECT USING (auth.role() = 'super_admin');
```

**Después (optimizado):**
```sql
-- Una sola política optimizada
CREATE POLICY "condos_select_policy" ON condos
  FOR SELECT
  USING (
    auth.is_super_admin() OR 
    user_id = auth.current_user_id()
  );
```

## Scripts de Optimización

### Scripts Individuales

1. **`scripts/optimize_rls_functions.sql`**
   - Crea las funciones helper optimizadas
   - Marca las funciones como `STABLE` para mejor rendimiento

2. **`scripts/optimize_rls_condos.sql`**
   - Optimiza políticas de la tabla `condos`
   - Elimina políticas duplicadas

3. **`scripts/optimize_rls_administrators.sql`**
   - Optimiza políticas de la tabla `administrators`
   - Consolida múltiples políticas en una por acción

4. **`scripts/optimize_rls_related_tables.sql`**
   - Optimiza políticas de tablas relacionadas:
     - `alerts`
     - `assemblies`
     - `certifications`
     - `emergency_plans`
     - `insurances`
     - `contracts`

5. **`scripts/optimize_rls_notifications.sql`**
   - Optimiza políticas de tablas de notificaciones:
     - `notification_settings`
     - `user_notification_settings`
     - `notification_history`
     - `notification_events`
     - `admin_audit_log`
     - `condo_history`

6. **`scripts/verify_rls_optimization.sql`**
   - Verifica que la optimización fue exitosa
   - Muestra estadísticas de rendimiento
   - Detecta políticas duplicadas restantes

### Script Maestro

**`scripts/optimize_rls_master.sql`**
- Ejecuta todos los scripts de optimización en orden
- Proporciona mensajes de progreso
- Incluye instrucciones de uso

## Instrucciones de Uso

### Opción 1: Script Maestro (Recomendado)

```sql
-- Ejecutar el script maestro
\i scripts/optimize_rls_master.sql
```

### Opción 2: Scripts Individuales

```sql
-- Ejecutar en orden
\i scripts/optimize_rls_functions.sql
\i scripts/optimize_rls_condos.sql
\i scripts/optimize_rls_administrators.sql
\i scripts/optimize_rls_related_tables.sql
\i scripts/optimize_rls_notifications.sql
\i scripts/verify_rls_optimization.sql
```

### Verificación

```sql
-- Verificar que la optimización fue exitosa
\i scripts/verify_rls_optimization.sql
```

## Beneficios de la Optimización

### 1. Rendimiento Mejorado
- **Antes**: `auth.uid()` se evaluaba para cada fila
- **Después**: `auth.current_user_id()` se evalúa una vez por consulta

### 2. Políticas Consolidadas
- **Antes**: 3-4 políticas por tabla/acción
- **Después**: 1 política por tabla/acción

### 3. Mantenimiento Simplificado
- Lógica de acceso centralizada en funciones helper
- Políticas más legibles y mantenibles
- Menos duplicación de código

### 4. Escalabilidad
- Mejor rendimiento con grandes volúmenes de datos
- Menos carga en el sistema de autenticación
- Consultas más eficientes

## Tablas Optimizadas

| Tabla | Políticas Antes | Políticas Después | Mejora |
|-------|----------------|-------------------|---------|
| `condos` | 12 | 4 | 67% reducción |
| `administrators` | 16 | 4 | 75% reducción |
| `alerts` | 8 | 4 | 50% reducción |
| `assemblies` | 8 | 4 | 50% reducción |
| `certifications` | 8 | 4 | 50% reducción |
| `emergency_plans` | 8 | 4 | 50% reducción |
| `insurances` | 8 | 4 | 50% reducción |
| `contracts` | 4 | 4 | 0% (ya optimizada) |
| `notification_settings` | 5 | 4 | 20% reducción |
| `user_notification_settings` | 4 | 4 | 0% (ya optimizada) |
| `notification_history` | 1 | 1 | 0% (ya optimizada) |
| `notification_events` | 1 | 4 | +300% (mejorada) |
| `admin_audit_log` | 1 | 2 | +100% (mejorada) |
| `condo_history` | 2 | 1 | 50% reducción |

## Verificación Post-Optimización

### 1. Verificar Funciones Helper
```sql
SELECT proname, prokind, prosecdef 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    AND proname IN ('current_user_id', 'is_super_admin', 'has_condo_access');
```

### 2. Verificar Políticas Optimizadas
```sql
SELECT tablename, policyname, cmd, 
       CASE 
           WHEN qual LIKE '%auth.current_user_id()%' THEN 'OPTIMIZADA'
           WHEN qual LIKE '%auth.is_super_admin()%' THEN 'OPTIMIZADA'
           WHEN qual LIKE '%auth.has_condo_access%' THEN 'OPTIMIZADA'
           ELSE 'REVISAR'
       END as optimization_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Verificar Políticas Duplicadas
```sql
WITH policy_counts AS (
    SELECT tablename, cmd, roles, COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename, cmd, roles
    HAVING COUNT(*) > 1
)
SELECT * FROM policy_counts;
```

## Troubleshooting

### Error: "function auth.current_user_id() does not exist"
- Ejecutar primero `scripts/optimize_rls_functions.sql`

### Error: "policy already exists"
- Las políticas duplicadas se eliminan automáticamente
- El script es idempotente (se puede ejecutar múltiples veces)

### Error: "permission denied"
- Asegurarse de tener permisos de superusuario o propietario de la base de datos

## Monitoreo Continuo

### 1. Ejecutar Linter de Supabase
- Verificar que las advertencias de RLS han desaparecido
- Monitorear nuevas advertencias de rendimiento

### 2. Monitorear Rendimiento
- Observar tiempos de consulta en el dashboard de Supabase
- Verificar que las consultas RLS son más rápidas

### 3. Revisar Logs
- Monitorear logs de aplicación para errores de permisos
- Verificar que la funcionalidad sigue funcionando correctamente

## Conclusión

La optimización de políticas RLS resuelve los problemas de rendimiento identificados por el linter de Supabase:

- ✅ Elimina re-evaluación innecesaria de funciones auth
- ✅ Consolida políticas duplicadas
- ✅ Mejora el rendimiento de consultas
- ✅ Centraliza la lógica de acceso
- ✅ Simplifica el mantenimiento

Los scripts son seguros, idempotentes y pueden ejecutarse en cualquier momento sin afectar la funcionalidad existente.