# 📧 Resumen Completo del Sistema de Notificaciones

## 🎯 Tipos de Notificaciones Implementadas

El sistema cuenta con **3 tipos principales** de notificaciones automáticas por email:

---

## 1. 📄 Notificaciones de Vencimiento de Documentos

### ¿Qué Documentos Se Monitorean?
- **Seguros:**
  - Incendio Espacios Comunes
  - OS10 Vigilantes/Guardias
  - Sismos
  - Responsabilidad Civil
  - Hogar

- **Certificaciones:**
  - Certificación de Gas
  - Certificación de Ascensor
  - Otras Certificaciones

### ¿Cuándo Se Envían?
- **Frecuencia:** Diariamente a las 9:00 AM (automático en producción)
- **Condición:** Cuando un documento vence en los próximos X días
- **Días de anticipación:** Configurable por usuario (default: 30 días)

### ¿Cómo Se Activa?
```sql
-- En notification_settings del usuario:
expiration_notifications_enabled = true
expiration_email_enabled = true
expiration_days_before = 30  -- días de anticipación
```

### Contenido del Email:
- ⚠️ Título: "Documento próximo a vencer - [Nombre Condominio]"
- 📋 Información del documento (nombre, tipo, asegurador/certificador)
- 📅 Días restantes hasta el vencimiento
- 🏢 Nombre del condominio
- 🔗 Botón para ir al dashboard

### Ejemplo de Uso:
Un seguro de incendio vence el 15 de febrero. Si el usuario tiene configurado 30 días de anticipación, recibirá el email el 16 de enero.

---

## 2. 📅 Recordatorios de Asambleas

### ¿Qué Asambleas Se Monitorean?
- **Asambleas Ordinarias:** Reuniones anuales regulares
- **Asambleas Extraordinarias:** Reuniones especiales

### ¿Cuándo Se Envían?
- **Frecuencia:** Diariamente a las 10:00 AM (automático en producción)
- **Condición:** Cuando hay una asamblea programada en los próximos X días
- **Días de anticipación:** Configurable por usuario (default: 7 días)

### ¿Cómo Se Activa?
```sql
-- En notification_settings del usuario:
assembly_reminders_enabled = true
assembly_reminder_email_enabled = true
assembly_reminder_days_before = 7  -- días de anticipación
```

### Contenido del Email:
- 📅 Título: "Recordatorio de Asamblea - [Nombre Condominio]"
- 📋 Tipo de asamblea (Ordinaria/Extraordinaria)
- 📍 Nombre del condominio
- 🗓️ Fecha de la asamblea
- 💡 Recordatorio de importancia de asistir
- 🔗 Botón para ir al dashboard

### Ejemplo de Uso:
Una asamblea ordinaria está programada para el 20 de enero. Si el usuario tiene configurado 7 días de anticipación, recibirá el email el 13 de enero.

---

## 3. 🔔 Notificaciones Generales

### ¿Para Qué Se Usan?
- Actualizaciones del sistema
- Cambios importantes en el condominio
- Mensajes administrativos
- Avisos especiales

### ¿Cuándo Se Envían?
- **Frecuencia:** Bajo demanda (cuando un administrador lo activa)
- **Condición:** Cuando se llama manualmente a la función

### ¿Cómo Se Activa?
```sql
-- En notification_settings del usuario:
general_notifications_enabled = true
general_email_enabled = true
```

### Contenido del Email:
- 🔔 Título personalizado
- 📝 Mensaje personalizado
- 🏢 Nombre del condominio (opcional)
- 🔗 Botón para ir al dashboard

### Ejemplo de Uso:
Un super administrador quiere notificar a todos los usuarios sobre una nueva funcionalidad o cambio en el sistema.

---

## ⚙️ Configuración por Usuario

Cada usuario puede personalizar sus notificaciones en la tabla `notification_settings`:

```sql
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    
    -- Vencimientos
    expiration_notifications_enabled BOOLEAN DEFAULT true,
    expiration_email_enabled BOOLEAN DEFAULT true,
    expiration_days_before INTEGER DEFAULT 30,
    
    -- Asambleas
    assembly_reminders_enabled BOOLEAN DEFAULT true,
    assembly_reminder_email_enabled BOOLEAN DEFAULT true,
    assembly_reminder_days_before INTEGER DEFAULT 7,
    
    -- Generales
    general_notifications_enabled BOOLEAN DEFAULT true,
    general_email_enabled BOOLEAN DEFAULT true
);
```

---

## 🔄 Automatización en Producción

### Cron Jobs Configurados:

**1. Verificación de Vencimientos:**
```json
{
  "path": "/api/cron/check-expiring-documents",
  "schedule": "0 9 * * *"  // Todos los días a las 9:00 AM
}
```

**2. Recordatorios de Asambleas:**
```json
{
  "path": "/api/cron/check-assembly-reminders",
  "schedule": "0 10 * * *"  // Todos los días a las 10:00 AM
}
```

---

## 📊 Flujo de Trabajo Completo

### Para Notificaciones de Vencimiento:

```
1. Cron Job se ejecuta (9:00 AM)
   ↓
2. Sistema busca usuarios con notificaciones habilitadas
   ↓
3. Para cada usuario:
   - Busca sus condominios
   - Busca documentos próximos a vencer
   - Calcula días restantes
   ↓
4. Si hay documentos por vencer:
   - Genera email personalizado
   - Envía a través de Resend
   - Registra en logs
   ↓
5. Usuario recibe email en su bandeja
```

### Para Recordatorios de Asambleas:

```
1. Cron Job se ejecuta (10:00 AM)
   ↓
2. Sistema busca usuarios con recordatorios habilitados
   ↓
3. Para cada usuario:
   - Busca sus condominios
   - Busca asambleas programadas
   - Calcula días hasta la asamblea
   ↓
4. Si hay asambleas próximas:
   - Genera email personalizado
   - Envía a través de Resend
   - Registra en logs
   ↓
5. Usuario recibe email en su bandeja
```

---

## 🎨 Diseño de los Emails

Todos los emails incluyen:
- ✅ Header elegante con gradiente dorado (#BF7F11)
- ✅ Logo "Lex Realis"
- ✅ Contenido claro y estructurado
- ✅ Información destacada en cajas
- ✅ Botón llamativo para ir al dashboard
- ✅ Footer con información del sistema
- ✅ Opción para desactivar notificaciones

---

## 📈 Estadísticas y Monitoreo

### En Resend Dashboard:
- Ver todos los emails enviados
- Estado de entrega (Delivered/Failed)
- Tasa de apertura (si está configurado)
- Errores y bounces

### En el Sistema:
- Logs de cada envío
- Resultados de verificaciones
- Usuarios notificados
- Errores capturados

---

## 🔧 Funciones Disponibles

### Para Desarrollo:
```typescript
// Verificar documentos por vencer
await checkExpiringDocuments()

// Verificar asambleas próximas
await checkAssemblyReminders()

// Enviar notificación general
await sendGeneralNotification(userId, title, message, condoId?)
```

### Endpoints API:
```
GET  /api/cron/check-expiring-documents
GET  /api/cron/check-assembly-reminders
POST /api/test-email  // Para pruebas
```

---

## 💡 Casos de Uso Reales

### Caso 1: Renovación de Seguro
- **Situación:** Seguro vence en 20 días
- **Acción:** Usuario recibe email recordatorio
- **Beneficio:** Evita quedarse sin cobertura

### Caso 2: Asamblea Ordinaria Anual
- **Situación:** Asamblea programada en 7 días
- **Acción:** Todos los copropietarios reciben recordatorio
- **Beneficio:** Mejor participación y quórum

### Caso 3: Certificación de Gas Vencida
- **Situación:** Certificación vence en 15 días
- **Acción:** Administrador recibe alerta
- **Beneficio:** Cumplimiento normativo

### Caso 4: Nueva Funcionalidad del Sistema
- **Situación:** Se implementa sistema de asignaciones
- **Acción:** Super admin envía notificación general
- **Beneficio:** Usuarios informados de mejoras

---

## 🎯 Resumen de Configuración Recomendada

### Para Administradores de Condominios:
```
✅ Vencimientos: Activado (30 días antes)
✅ Asambleas: Activado (7 días antes)
✅ Generales: Activado
```

### Para Super Administradores:
```
✅ Todas las notificaciones activadas
✅ Días de anticipación más largos (45 días)
✅ Acceso a envío de notificaciones generales
```

### Para Usuarios Regulares:
```
⚙️ Configuración personalizable según necesidades
⚙️ Pueden desactivar tipos específicos de notificaciones
⚙️ Pueden ajustar días de anticipación
```

---

## 📞 Soporte

Si tienes dudas sobre las notificaciones:
1. Revisa la configuración en `notification_settings`
2. Verifica que RESEND_API_KEY esté configurada
3. Consulta los logs en Resend Dashboard
4. Usa la página de pruebas: `/configuracion/prueba-notificaciones`

---

**Última actualización:** Octubre 2025  
**Versión del sistema:** 1.0  
**Estado:** ✅ Operativo

