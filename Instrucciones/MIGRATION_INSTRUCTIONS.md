# Instrucciones de Migración - Nuevos Módulos

## Problema Resuelto
Se ha corregido el error "Error fetching condos: {}" que ocurría en la página de reportes. El problema era que:

1. La página de reportes estaba usando el cliente de Supabase en el lado del cliente
2. Faltaban las tablas para los nuevos módulos (administradores y configuraciones de notificación)

## Cambios Realizados

### 1. Estructura de Archivos Modificada
- **`app/reportes/page.tsx`**: Convertido a Server Component que obtiene datos del servidor
- **`app/reportes/reportes-client.tsx`**: Nuevo componente cliente para la funcionalidad interactiva
- **`scripts/004_create_new_tables.sql`**: Script para crear las nuevas tablas
- **`scripts/run_migration.sql`**: Script de migración completo y seguro

### 2. Nuevas Tablas Creadas
- **`administrators`**: Para información del administrador y certificación
- **`notification_settings`**: Para configuraciones de notificaciones del usuario

### 3. Mejoras en la Base de Datos
- Agregado campo `address` a la tabla `condos` si no existe
- Políticas RLS (Row Level Security) configuradas correctamente
- Índices para mejor rendimiento

## Pasos para Ejecutar la Migración

### Opción 1: Usando Supabase Dashboard
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `scripts/run_migration.sql`
4. Ejecuta el script

### Opción 2: Usando Supabase CLI
```bash
# Si tienes Supabase CLI instalado
supabase db reset
# O ejecuta el script específico
supabase db push
```

### Opción 3: Ejecutar Script Individual
Si prefieres ejecutar solo las nuevas tablas:
1. Copia el contenido de `scripts/004_create_new_tables.sql`
2. Ejecuta en el SQL Editor de Supabase

## Verificación de la Migración

Después de ejecutar la migración, verifica que:

1. **Tabla `administrators` existe**:
   ```sql
   SELECT * FROM administrators LIMIT 1;
   ```

2. **Tabla `notification_settings` existe**:
   ```sql
   SELECT * FROM notification_settings LIMIT 1;
   ```

3. **Campo `address` en `condos` existe**:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'condos' AND column_name = 'address';
   ```

## Funcionalidades Ahora Disponibles

### ✅ Módulo de Administrador (`/administrador`)
- Formulario completo de información personal
- Selección múltiple de regiones de Chile
- Subida y gestión de certificación profesional
- Persistencia de datos en base de datos

### ✅ Módulo de Configuración (`/configuracion`)
- Configuración de notificaciones de vencimiento
- Recordatorios de asambleas anuales
- Configuraciones generales de notificaciones
- Persistencia de preferencias por usuario

### ✅ Módulo de Reportes (`/reportes`)
- Generación de reportes personalizados en PDF
- Filtros por tipo de documento y fechas
- Vista previa del reporte
- Descarga automática del PDF generado

## Solución de Problemas

### Si aún tienes errores:
1. **Verifica que las tablas existen**:
   ```sql
   \dt
   ```

2. **Verifica las políticas RLS**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('administrators', 'notification_settings');
   ```

3. **Verifica permisos de usuario**:
   Asegúrate de que tu usuario autenticado tiene permisos para acceder a las tablas.

### Si el error persiste:
1. Limpia la caché del navegador
2. Reinicia el servidor de desarrollo
3. Verifica que estás autenticado correctamente

## Notas Importantes

- **Backup**: Siempre haz backup de tu base de datos antes de ejecutar migraciones
- **Testing**: Prueba las funcionalidades en un entorno de desarrollo primero
- **RLS**: Las políticas de seguridad están configuradas para que cada usuario solo vea sus propios datos

## Soporte

Si encuentras algún problema después de la migración, verifica:
1. Que todas las tablas se crearon correctamente
2. Que las políticas RLS están activas
3. Que el usuario está autenticado
4. Que no hay errores en la consola del navegador

