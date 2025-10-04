# 🛡️ Instrucciones para Configurar Super Administrador

Este documento te guía paso a paso para configurar el sistema de super administrador que te permitirá gestionar todos los usuarios del sistema.

## 📋 Requisitos Previos

1. **Usuario registrado**: Debes tener un usuario registrado en Supabase Auth
2. **Acceso a Supabase**: Necesitas acceso al SQL Editor de Supabase
3. **Base de datos configurada**: El sistema debe estar funcionando correctamente

## 🚀 Pasos para Configurar Super Administrador

### Paso 1: Ejecutar Script de Sistema

1. Ve al **SQL Editor** de tu proyecto en Supabase
2. Ejecuta el script `scripts/create_super_admin_system.sql`
3. Este script:
   - Agrega campos de rol a la tabla `administrators`
   - Crea funciones para verificar permisos
   - Actualiza las políticas RLS
   - Crea sistema de auditoría
   - Agrega triggers para logging automático

### Paso 2: Crear el Primer Super Administrador

1. **IMPORTANTE**: Asegúrate de que el usuario `sebaleon@gmail.com` esté registrado en Supabase Auth
2. El script ya está configurado para crear el super administrador con el email `sebaleon@gmail.com`
3. **Ejecuta el script** `scripts/create_first_super_admin.sql` en Supabase SQL Editor
4. **Si obtienes error de auditoría**: Usa el script alternativo `scripts/create_first_super_admin_simple.sql`
5. El script verificará que el usuario existe y lo convertirá en super administrador

### Paso 3: Verificar Configuración

1. Inicia sesión con tu cuenta de super administrador
2. Deberías ver el enlace "Super Admin" en el sidebar (con ícono de escudo rojo)
3. Haz clic en "Super Admin" para acceder al panel de gestión

## 🎯 Funcionalidades del Super Administrador

### Gestión de Usuarios
- **Ver todos los usuarios**: Lista completa con información detallada
- **Crear nuevos usuarios**: Formulario completo con validaciones
- **Editar usuarios existentes**: Modificar información, roles y estado
- **Activar/Desactivar usuarios**: Control de acceso al sistema
- **Eliminar usuarios**: Eliminación completa (excepto super administradores)

### Roles Disponibles
- **Super Admin**: Acceso completo al sistema y gestión de usuarios
- **Admin**: Gestión limitada (funcionalidad futura)
- **User**: Acceso básico al sistema

### Sistema de Auditoría
- **Log completo**: Registro de todas las acciones realizadas
- **Trazabilidad**: Quién hizo qué y cuándo
- **Seguridad**: No se pueden eliminar super administradores

### Estadísticas del Sistema
- **Contadores**: Total de usuarios, activos, por rol
- **Métricas**: Último acceso, fechas de creación
- **Monitoreo**: Estado general del sistema

## 🔒 Seguridad y Permisos

### Políticas de Seguridad
- Solo super administradores pueden acceder a `/super-admin`
- Los super administradores no se pueden desactivar o eliminar
- Todas las acciones quedan registradas en el log de auditoría
- Las políticas RLS permiten acceso completo a super administradores

### Funciones de Verificación
- `is_super_admin()`: Verifica si el usuario actual es super administrador
- `is_admin_or_super()`: Verifica si es admin o super administrador
- `log_admin_action()`: Registra acciones en el log de auditoría

## 🛠️ Estructura de Archivos Creados

```
app/super-admin/
├── page.tsx                    # Página principal
├── super-admin-client.tsx      # Componente principal
├── user-management-form.tsx    # Formulario crear usuario
└── user-edit-form.tsx         # Formulario editar usuario

lib/actions/
└── super-admin.ts             # Acciones del servidor

scripts/
├── create_super_admin_system.sql    # Script de configuración
└── create_first_super_admin.sql     # Script para crear primer super admin
```

## 📊 Tablas de Base de Datos

### Modificaciones a `administrators`
- `role`: Tipo de usuario (super_admin, admin, user)
- `is_active`: Estado activo/inactivo
- `last_login`: Último acceso al sistema

### Nueva tabla `admin_audit_log`
- Registro de todas las acciones de administradores
- Información de quién, qué, cuándo y dónde
- Valores anteriores y nuevos para cambios

## 🚨 Solución de Problemas

### Error: "No tienes permisos"
- Verifica que ejecutaste ambos scripts SQL
- Confirma que el usuario `sebaleon@gmail.com` existe en Supabase Auth
- Asegúrate de que el usuario tiene el rol `super_admin` asignado

### Error: "Función no existe"
- Ejecuta primero `create_super_admin_system.sql`
- Verifica que no hay errores en la ejecución del script

### Error: "null value in column admin_user_id violates not-null constraint"
- Este error ocurre cuando el trigger de auditoría no puede obtener el usuario autenticado
- **Solución**: Usa el script alternativo `create_first_super_admin_simple.sql`
- Este script evita el problema deshabilitando temporalmente los triggers

### No aparece el enlace "Super Admin"
- Verifica que tu usuario tiene rol `super_admin`
- Confirma que `is_active = true`
- Recarga la página después de los cambios

### Error al crear usuarios
- Verifica que tienes permisos de service role en Supabase
- Confirma que las políticas RLS están configuradas correctamente

## 📝 Comandos SQL Útiles

### Verificar tu rol actual
```sql
SELECT a.role, a.is_active, u.email 
FROM administrators a 
JOIN auth.users u ON a.user_id = u.id 
WHERE u.email = 'sebaleon@gmail.com';
```

### Ver todos los super administradores
```sql
SELECT a.full_name, u.email, a.created_at 
FROM administrators a 
JOIN auth.users u ON a.user_id = u.id 
WHERE a.role = 'super_admin' AND a.is_active = true;
```

### Ver logs de auditoría recientes
```sql
SELECT al.action, al.created_at, u.email as admin_email
FROM admin_audit_log al
JOIN auth.users u ON al.admin_user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;
```

## ✅ Lista de Verificación

- [ ] Script `create_super_admin_system.sql` ejecutado sin errores
- [ ] Usuario `sebaleon@gmail.com` registrado en Supabase Auth
- [ ] Script `create_first_super_admin.sql` ejecutado sin errores
- [ ] Puedes iniciar sesión con tu cuenta
- [ ] Aparece el enlace "Super Admin" en el sidebar
- [ ] Puedes acceder al panel de super administrador
- [ ] Puedes ver la lista de usuarios
- [ ] Puedes crear un nuevo usuario de prueba
- [ ] Puedes editar un usuario existente
- [ ] El log de auditoría registra las acciones

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás un sistema completo de super administrador que te permitirá:

1. **Gestionar todos los usuarios** del sistema
2. **Monitorear la actividad** a través del log de auditoría
3. **Controlar el acceso** activando/desactivando usuarios
4. **Mantener la seguridad** con roles jerárquicos

El sistema está diseñado para ser seguro, escalable y fácil de usar. ¡Disfruta de tu nuevo poder de super administrador! 🚀

