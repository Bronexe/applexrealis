# 🔧 Solución para Error de Columna "user_id" No Existe

## ⚠️ **PROBLEMA IDENTIFICADO**

El error `ERROR: 42703: column "user_id" does not exist` indica que alguna de las tablas no tiene la columna `user_id` que estamos usando en las políticas RLS.

## 🔍 **DIAGNÓSTICO NECESARIO**

Antes de optimizar las políticas RLS, necesitamos verificar la estructura real de las tablas para usar las columnas correctas.

## 🚀 **PASOS PARA RESOLVER**

### **PASO 1: Verificar Estructura de Tablas**
1. Ve a Supabase SQL Editor
2. Ejecuta el script `scripts/check_table_structure.sql`
3. Revisa la salida para identificar qué columnas tiene cada tabla

### **PASO 2: Identificar Columnas Correctas**
Basándome en la estructura típica de la aplicación, las tablas probablemente tienen:

#### **✅ Tablas con `user_id` (directo)**
- `administrators` - Tiene `user_id`
- `condos` - Tiene `user_id`
- `notification_settings` - Tiene `user_id`

#### **✅ Tablas con `condo_id` (relacionadas)**
- `assemblies` - Tiene `condo_id` (relacionada con `condos`)
- `emergency_plans` - Tiene `condo_id` (relacionada con `condos`)
- `certifications` - Tiene `condo_id` (relacionada con `condos`)
- `insurances` - Tiene `condo_id` (relacionada con `condos`)
- `alerts` - Tiene `condo_id` (relacionada con `condos`)

## 🔧 **SOLUCIÓN ADAPTATIVA**

### **✅ Para Tablas con `user_id` Directo**
```sql
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING ((select auth.uid()) = user_id);
```

### **✅ Para Tablas con `condo_id` (Relacionadas)**
```sql
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (
    (select auth.uid()) = (
      SELECT user_id FROM condos WHERE id = table_name.condo_id
    )
  );
```

## 📋 **INSTRUCCIONES DE EJECUCIÓN**

### **PASO 1: Ejecutar Verificación**
1. Copia el contenido de `scripts/check_table_structure.sql`
2. Ejecuta en Supabase SQL Editor
3. Revisa la salida para confirmar las columnas

### **PASO 2: Ejecutar Optimización Adaptativa**
1. Copia el contenido de `scripts/optimize_rls_policies_adaptive.sql`
2. Ejecuta en Supabase SQL Editor
3. Si hay errores, necesitaremos ajustar las políticas

### **PASO 3: Ajustar Políticas si es Necesario**
Si el script adaptativo falla, necesitaremos crear políticas específicas para cada tipo de tabla.

## 🎯 **ESTRUCTURA ESPERADA**

### **✅ Tablas Principales (con user_id)**
```sql
-- administrators
CREATE POLICY "Allow authenticated users to view administrators" ON administrators
  FOR SELECT USING ((select auth.uid()) = user_id);

-- condos
CREATE POLICY "Allow authenticated users to view condos" ON condos
  FOR SELECT USING ((select auth.uid()) = user_id);

-- notification_settings
CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING ((select auth.uid()) = user_id);
```

### **✅ Tablas Relacionadas (con condo_id)**
```sql
-- assemblies
CREATE POLICY "Allow authenticated users to view assemblies" ON assemblies
  FOR SELECT USING (
    (select auth.uid()) = (
      SELECT user_id FROM condos WHERE id = assemblies.condo_id
    )
  );

-- emergency_plans
CREATE POLICY "Allow authenticated users to view emergency_plans" ON emergency_plans
  FOR SELECT USING (
    (select auth.uid()) = (
      SELECT user_id FROM condos WHERE id = emergency_plans.condo_id
    )
  );

-- certifications
CREATE POLICY "Allow authenticated users to view certifications" ON certifications
  FOR SELECT USING (
    (select auth.uid()) = (
      SELECT user_id FROM condos WHERE id = certifications.condo_id
    )
  );

-- insurances
CREATE POLICY "Allow authenticated users to view insurances" ON insurances
  FOR SELECT USING (
    (select auth.uid()) = (
      SELECT user_id FROM condos WHERE id = insurances.condo_id
    )
  );

-- alerts
CREATE POLICY "Allow authenticated users to view alerts" ON alerts
  FOR SELECT USING (
    (select auth.uid()) = (
      SELECT user_id FROM condos WHERE id = alerts.condo_id
    )
  );
```

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **🔴 Rendimiento de Subconsultas**
- Las políticas con subconsultas pueden ser más lentas
- Pero siguen siendo más eficientes que `auth.uid()` sin SELECT
- Se puede optimizar con índices en `condo_id`

### **🔴 Alternativa: Agregar user_id a Tablas Relacionadas**
Si el rendimiento es crítico, se podría agregar `user_id` directamente a las tablas relacionadas:
```sql
ALTER TABLE assemblies ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE emergency_plans ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- etc.
```

## 🎉 **RESULTADO ESPERADO**

Después de ejecutar la verificación y optimización:
- ✅ **Políticas correctas** para cada tipo de tabla
- ✅ **Mejor rendimiento** con `(select auth.uid())`
- ✅ **Seguridad mantenida** al 100%
- ✅ **Sin errores** de columnas inexistentes

---

**🔍 ¡Primero ejecuta `scripts/check_table_structure.sql` para verificar la estructura real de las tablas!**

