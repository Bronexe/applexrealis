# Sistema de Asignación de Condominios

## Descripción

Este sistema permite a los super administradores asignar condominios específicos a usuarios, otorgándoles permisos completos de edición y gestión sobre esos condominios, independientemente de si son los propietarios originales.

## Características Implementadas

### 1. Base de Datos

**Tabla `condo_assignments`:**
- Relaciona condominios con usuarios autorizados
- Incluye información sobre quién asignó y cuándo
- Permite agregar notas sobre la asignación
- Previene duplicados (un usuario no puede ser asignado dos veces al mismo condominio)

**Políticas RLS Actualizadas:**
- Todas las tablas principales (`condos`, `assemblies`, `emergency_plans`, `certifications`, `insurances`, `alerts`) ahora permiten acceso a:
  - Propietarios del condominio
  - Usuarios asignados al condominio
  - Super administradores

### 2. Funciones Server Actions

Archivo: `lib/actions/condo-assignments.ts`

**Funciones disponibles:**
- `getAssignableCondos()` - Obtiene todos los condominios disponibles para asignar
- `getAssignableUsers()` - Obtiene todos los usuarios que pueden recibir asignaciones
- `getCondoAssignments(condoId)` - Obtiene asignaciones de un condominio específico
- `getUserAssignments(userId)` - Obtiene todos los condominios asignados a un usuario
- `assignCondoToUser(condoId, userId, notes?)` - Asigna un condominio a un usuario
- `removeCondoAssignment(assignmentId)` - Remueve una asignación
- `getAccessibleCondos()` - Obtiene condominios accesibles por el usuario actual (propios + asignados)

### 3. Interfaz de Usuario

**Panel de Super Admin:**
- Nueva pestaña "Asignaciones" en el panel de super-admin
- Tabla con lista de todos los usuarios y sus asignaciones
- Botón para crear nuevas asignaciones
- Opción de expandir/contraer para ver detalles de asignaciones por usuario
- Opción de remover asignaciones existentes

**Diálogo de Asignación:**
- Seleccionar usuario desde lista desplegable
- Seleccionar condominio desde lista desplegable
- Campo opcional para agregar notas
- Validaciones automáticas para prevenir asignaciones duplicadas o inválidas

### 4. Dashboard y Navegación

**Dashboard Principal:**
- Ahora muestra tanto condominios propios como asignados
- Estadísticas actualizadas para incluir ambos tipos

**Página de Condominios:**
- Lista todos los condominios accesibles (propios + asignados)
- Título actualizado a "Condominios Accesibles"

**Layout de Condominio Individual:**
- Verifica acceso basándose en:
  - Propiedad del condominio
  - Asignación al condominio
  - Rol de super administrador
- Redirecciona al dashboard si no tiene acceso

## Cómo Usar

### Como Super Administrador

1. **Acceder al Panel de Asignaciones:**
   - Ve a `/super-admin`
   - Haz clic en la pestaña "Asignaciones"

2. **Crear una Nueva Asignación:**
   - Haz clic en "Nueva Asignación"
   - Selecciona un usuario del menú desplegable
   - Selecciona un condominio del menú desplegable
   - (Opcional) Agrega notas sobre la asignación
   - Haz clic en "Asignar Condominio"

3. **Ver Asignaciones de un Usuario:**
   - En la tabla de usuarios, busca el usuario deseado
   - Verás el número de condominios asignados en la columna "Condominios Asignados"
   - Haz clic en "Ver detalles" para expandir y ver la lista completa

4. **Remover una Asignación:**
   - Expande las asignaciones de un usuario
   - Haz clic en el ícono de papelera junto a la asignación que deseas remover
   - Confirma la acción

### Como Usuario Regular

Los usuarios asignados a condominios simplemente verán estos condominios en su lista de "Condominios Accesibles" junto con sus propios condominios. Tendrán acceso completo a:
- Dashboard del condominio
- Gestión de asambleas
- Gestión de planes de emergencia
- Gestión de certificaciones
- Gestión de seguros
- Visualización de alertas de cumplimiento

No hay diferencia en los permisos entre ser propietario o estar asignado - ambos tienen acceso completo de edición.

## Script SQL de Instalación

Archivo: `scripts/102_CREATE_CONDO_ASSIGNMENTS.sql`

Para activar esta funcionalidad en tu base de datos de Supabase:

1. Ve al SQL Editor en Supabase
2. Copia y pega el contenido de `scripts/102_CREATE_CONDO_ASSIGNMENTS.sql`
3. Ejecuta el script

El script incluye:
- Creación de la tabla `condo_assignments`
- Índices para optimizar performance
- Políticas RLS para todas las tablas relacionadas
- Funciones auxiliares SQL
- Triggers para mantener timestamps actualizados

## Validaciones Implementadas

- No se puede asignar un condominio a su propietario
- No se pueden crear asignaciones duplicadas
- Solo usuarios activos pueden recibir asignaciones
- Solo super administradores pueden crear/modificar/eliminar asignaciones
- Verificación de existencia de usuario y condominio antes de asignar

## Seguridad

- Todas las operaciones están protegidas con verificación de rol de super admin
- Las políticas RLS garantizan que los usuarios solo vean sus propios datos o los asignados
- Los super admins tienen acceso completo pero las acciones quedan registradas
- Las asignaciones incluyen información de auditoría (quién asignó, cuándo)

## Funciones SQL Auxiliares

**`get_accessible_condos(p_user_id)`**
- Retorna todos los condominios accesibles por un usuario
- Indica si el usuario es propietario o está asignado
- Usada internamente para optimizar consultas

**`get_condo_assignments_with_details(p_condo_id)`**
- Retorna todas las asignaciones de un condominio con información detallada
- Incluye nombres de usuarios y quien realizó la asignación
- Usada en el panel de administración

## Estructura de Datos

### Tabla `condo_assignments`

```sql
{
  id: UUID (PK),
  condo_id: UUID (FK -> condos.id),
  user_id: UUID (FK -> auth.users.id),
  assigned_by: UUID (FK -> auth.users.id),
  assigned_at: TIMESTAMPTZ,
  notes: TEXT (nullable),
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
}
```

### Restricción UNIQUE
- `(condo_id, user_id)` - Previene asignaciones duplicadas

## Próximos Pasos Sugeridos

1. **Notificaciones:** Enviar email al usuario cuando se le asigna un condominio
2. **Permisos Granulares:** Permitir asignar permisos específicos (solo lectura, solo ciertos módulos, etc.)
3. **Historial de Asignaciones:** Mantener registro de asignaciones removidas
4. **Dashboard de Asignaciones:** Agregar estadísticas sobre asignaciones en el panel de super admin
5. **Búsqueda y Filtros:** Añadir capacidad de buscar usuarios/condominios en el diálogo de asignación

## Soporte

Si encuentras algún problema o necesitas ayuda adicional, revisa los logs en la consola del navegador y en Supabase para información de depuración detallada.

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Autor:** Sistema Property Compliance Dashboard

