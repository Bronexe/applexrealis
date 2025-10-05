# Solución al Problema de Asignaciones de Condominios

## Problema Identificado

Las políticas de seguridad (RLS) de la tabla `condo_assignments` solo permitían a los super administradores acceder a las asignaciones. Los usuarios regulares no tenían permiso para ver sus propias asignaciones, por lo que aunque la asignación se guardaba correctamente en la base de datos, el usuario no podía verla en su dashboard.

## Solución

Se debe agregar una política RLS que permita a los usuarios ver sus propias asignaciones.

## Pasos para Aplicar la Solución

### Opción 1: Usando la Consola de Supabase

1. Accede a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor**
3. Copia y ejecuta el siguiente script:

```sql
-- Agregar política para que los usuarios puedan ver sus propias asignaciones
DROP POLICY IF EXISTS "Users can view their own assignments" ON condo_assignments;
CREATE POLICY "Users can view their own assignments" ON condo_assignments
FOR SELECT USING (
    -- El usuario puede ver las asignaciones donde él es el asignado
    user_id = auth.uid()
);
```

4. Haz clic en **Run** o presiona `Ctrl+Enter`

### Opción 2: Usando la Terminal

Si tienes configurado Supabase CLI:

```bash
supabase db push --file scripts/102_FIX_CONDO_ASSIGNMENTS_RLS.sql
```

## Verificación

Después de ejecutar el script:

1. Inicia sesión como super admin
2. Asigna un condominio a un usuario desde `/super-admin` → pestaña "Asignaciones"
3. Cierra sesión
4. Inicia sesión con el usuario asignado
5. Ve a `/dashboard`
6. Verifica que el condominio asignado ahora aparezca en la lista

## Explicación Técnica

### Requisitos de Seguridad

1. **Solo super admins pueden asignar condominios a otros usuarios** ✅
2. **Los usuarios deben poder ver los condominios que les fueron asignados** ✅

### Políticas RLS en `condo_assignments`

**Antes del fix:**
- Super admins pueden: ver todas las asignaciones, crear, actualizar y eliminar
- Usuarios regulares: **NO TIENEN NINGÚN ACCESO** ❌ (ni siquiera para ver sus propias asignaciones)

**Después del fix:**
- Super admins pueden: ver todas las asignaciones, crear, actualizar y eliminar (sin cambios)
- Usuarios regulares pueden: **SOLO ver sus propias asignaciones** ✅ (SELECT donde user_id = auth.uid())
- Usuarios regulares **NO pueden**: crear, modificar o eliminar asignaciones ✅

### Tabla de Permisos Detallada

| Acción | Super Admin | Usuario Regular |
|--------|-------------|-----------------|
| Ver todas las asignaciones | ✅ Sí | ❌ No |
| Ver sus propias asignaciones | ✅ Sí | ✅ Sí (con el fix) |
| Crear asignaciones | ✅ Sí | ❌ No |
| Modificar asignaciones | ✅ Sí | ❌ No |
| Eliminar asignaciones | ✅ Sí | ❌ No |

Esto permite que la consulta en el dashboard funcione correctamente:

```typescript
const { data: assignedCondos } = await supabase
  .from("condo_assignments")
  .select(`condos (...)`)
  .eq("user_id", user.id) // Ahora funciona porque el usuario tiene permiso
```

## Ejemplos Prácticos

### Ejemplo 1: Usuario NO puede asignar condominios

```sql
-- Si un usuario regular intenta:
INSERT INTO condo_assignments (condo_id, user_id, assigned_by)
VALUES ('...', '...', auth.uid());

-- Resultado: ERROR de política RLS ❌
-- Solo super admins pueden hacer INSERT
```

### Ejemplo 2: Usuario SÍ puede ver sus asignaciones

```sql
-- Usuario regular puede hacer:
SELECT * FROM condo_assignments WHERE user_id = auth.uid();

-- Resultado: Muestra SOLO las asignaciones donde él es el asignado ✅
```

### Ejemplo 3: Usuario NO puede ver asignaciones de otros

```sql
-- Usuario regular intenta:
SELECT * FROM condo_assignments WHERE user_id = 'otro-usuario-id';

-- Resultado: Sin resultados (filtrado por RLS) ❌
-- La política solo permite ver donde user_id = auth.uid()
```

## Notas Importantes

- ✅ Las asignaciones previas seguirán funcionando una vez aplicado el fix
- ✅ No es necesario reasignar los condominios
- ✅ La seguridad se mantiene: los usuarios solo ven sus propias asignaciones
- ✅ Los super admins mantienen acceso completo a todas las asignaciones
- ✅ Los usuarios NO pueden asignar, modificar o eliminar asignaciones
- ✅ Solo los super admins pueden gestionar asignaciones desde `/super-admin`

