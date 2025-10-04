# 📧 Guía para Probar el Sistema de Notificaciones

## 🎯 Página de Pruebas

He creado una página especial para probar las notificaciones:

**URL:** `/configuracion/prueba-notificaciones`

## 📋 Prerequisitos

Antes de probar las notificaciones, asegúrate de tener configurado lo siguiente:

### 1. Variables de Entorno (`.env.local`)

```env
# Resend API (Servicio de Email)
RESEND_API_KEY=re_tu_api_key_aqui

# Email remitente (debe estar verificado en Resend)
EMAIL_FROM=Lex Realis <contacto@lexrealis.cl>

# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://app.lexrealis.cl

# Secret para los cron jobs (opcional para pruebas)
CRON_SECRET=test-secret
NEXT_PUBLIC_CRON_SECRET=test-secret
```

### 2. Configurar Resend

1. **Crear cuenta en Resend:**
   - Ve a https://resend.com
   - Crea una cuenta gratuita

2. **Obtener API Key:**
   - Ve a https://resend.com/api-keys
   - Haz clic en "Create API Key"
   - Nombre: "Lex Realis App"
   - Permisos: "Sending access"
   - Copia la API key y agrégala a tu `.env.local`

3. **Verificar dominio (Producción):**
   - Ve a https://resend.com/domains
   - Agrega tu dominio (ej: lexrealis.cl)
   - Configura los registros DNS según las instrucciones
   - Espera a que se verifique

   **IMPORTANTE:** Para pruebas, puedes usar el dominio de sandbox que Resend proporciona automáticamente, pero los emails solo se enviarán a direcciones específicas de prueba.

### 3. Configurar Base de Datos

Asegúrate de tener la tabla `notification_settings` creada. Ejecuta este script en Supabase SQL Editor:

```sql
-- Crear tabla de configuración de notificaciones (si no existe)
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notificaciones de vencimiento
    expiration_notifications_enabled BOOLEAN DEFAULT true,
    expiration_email_enabled BOOLEAN DEFAULT true,
    expiration_days_before INTEGER DEFAULT 30,
    
    -- Recordatorios de asambleas
    assembly_reminders_enabled BOOLEAN DEFAULT true,
    assembly_reminder_email_enabled BOOLEAN DEFAULT true,
    assembly_reminder_days_before INTEGER DEFAULT 7,
    
    -- Notificaciones generales
    general_notifications_enabled BOOLEAN DEFAULT true,
    general_email_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver y editar su propia configuración
CREATE POLICY "Users can manage their own notification settings" ON notification_settings
FOR ALL USING (auth.uid() = user_id);

-- Crear configuración para todos los usuarios existentes
INSERT INTO notification_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_settings)
ON CONFLICT (user_id) DO NOTHING;
```

## 🧪 Cómo Hacer las Pruebas

### Paso 1: Crear Datos de Prueba

#### Para Probar Notificaciones de Vencimiento:

1. Ve a uno de tus condominios
2. Crea una **Certificación** o un **Seguro** con:
   - Fecha de vencimiento: 20-30 días en el futuro
   - Asegúrate de cargar el archivo PDF

```sql
-- O inserta directamente en la base de datos para pruebas rápidas:
INSERT INTO certifications (condo_id, user_id, kind, valid_from, valid_to, cert_file_url)
VALUES (
    'tu_condo_id_aqui',
    'tu_user_id_aqui',
    'gas',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '25 days',  -- Vence en 25 días
    'https://ejemplo.com/cert.pdf'
);
```

#### Para Probar Recordatorios de Asambleas:

1. Ve a uno de tus condominios → Asambleas
2. Crea una **Asamblea** con:
   - Tipo: Ordinaria o Extraordinaria
   - Fecha: 5-10 días en el futuro

```sql
-- O inserta directamente:
INSERT INTO assemblies (condo_id, user_id, type, date, act_file_url)
VALUES (
    'tu_condo_id_aqui',
    'tu_user_id_aqui',
    'ordinaria',
    CURRENT_DATE + INTERVAL '7 days',  -- En 7 días
    NULL
);
```

### Paso 2: Verificar Configuración de Usuario

Asegúrate de que tu usuario tenga notificaciones habilitadas:

```sql
-- Verificar tu configuración actual
SELECT * FROM notification_settings WHERE user_id = 'tu_user_id_aqui';

-- Si no existe, créala:
INSERT INTO notification_settings (
    user_id,
    expiration_notifications_enabled,
    expiration_email_enabled,
    expiration_days_before,
    assembly_reminders_enabled,
    assembly_reminder_email_enabled,
    assembly_reminder_days_before
) VALUES (
    'tu_user_id_aqui',
    true,
    true,
    30,
    true,
    true,
    10
);
```

### Paso 3: Ejecutar las Pruebas

1. **Ve a la página de pruebas:**
   - Navega a `/configuracion/prueba-notificaciones`

2. **Ejecuta la prueba de documentos por vencer:**
   - Haz clic en "Probar Vencimientos"
   - Revisa los resultados en la página
   - Abre la consola del navegador (F12) para ver logs detallados

3. **Ejecuta la prueba de recordatorios de asambleas:**
   - Haz clic en "Probar Asambleas"
   - Revisa los resultados en la página
   - Verifica los logs en la consola

4. **Revisa tu email:**
   - Si todo está configurado correctamente, deberías recibir los emails
   - Revisa también la carpeta de spam

### Paso 4: Interpretar los Resultados

La página mostrará:
- ✅ **Éxito:** Número de notificaciones enviadas
- ❌ **Errores:** Número de errores y detalles
- 📊 **Detalles:** JSON con información completa de cada notificación

## 🐛 Solución de Problemas

### Error: "API key is invalid"

**Causa:** La API key de Resend no es válida o no está configurada.

**Solución:**
1. Verifica que `RESEND_API_KEY` esté en tu `.env.local`
2. Asegúrate de que la API key sea válida
3. Crea una nueva API key en Resend si es necesario
4. Reinicia el servidor de desarrollo después de cambiar `.env.local`

### Error: "User email not found"

**Causa:** El usuario en auth.users no tiene email registrado.

**Solución:**
1. Verifica que tu usuario tenga email:
```sql
SELECT id, email FROM auth.users WHERE id = 'tu_user_id';
```

### Error: "No users to notify"

**Causa:** No hay usuarios con notificaciones habilitadas.

**Solución:**
1. Verifica la tabla `notification_settings`:
```sql
SELECT * FROM notification_settings WHERE expiration_email_enabled = true;
```
2. Habilita las notificaciones para tu usuario

### Error: "No documents/assemblies found"

**Causa:** No hay documentos o asambleas próximos a vencer.

**Solución:**
1. Crea datos de prueba según el Paso 1
2. Asegúrate de que las fechas estén dentro del rango de días configurado

### Emails no llegan

**Posibles causas y soluciones:**

1. **Dominio no verificado (Producción):**
   - Verifica tu dominio en Resend
   - Usa el sandbox para pruebas

2. **Email en spam:**
   - Revisa la carpeta de spam
   - Marca el email como "no spam"

3. **Límites de Resend:**
   - Plan gratuito: 100 emails/día
   - Verifica que no hayas excedido el límite

4. **Email inválido:**
   - Asegúrate de que el email del usuario sea válido
   - Prueba con un email conocido

## 📊 Verificación en Resend

Para verificar que los emails se están enviando:

1. Ve a https://resend.com/emails
2. Verás una lista de todos los emails enviados
3. Puedes ver el estado de cada email:
   - ✅ **Delivered:** Email entregado exitosamente
   - ⏳ **Processing:** Email en proceso
   - ❌ **Failed:** Email falló (ver detalles del error)

## 🔄 Automatización (Producción)

Para producción, configura cron jobs en Vercel:

1. **Archivo `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/check-expiring-documents",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/check-assembly-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

2. **Variables de entorno en Vercel:**
   - Agrega `CRON_SECRET` con un valor secreto
   - Agrega todas las variables de Resend

3. **Los cron jobs se ejecutarán automáticamente:**
   - Documentos: Diariamente a las 9:00 AM
   - Asambleas: Diariamente a las 10:00 AM

## 📝 Notas Adicionales

- **Ambiente de Desarrollo:** Los cron jobs no se ejecutan automáticamente. Usa la página de pruebas para ejecutarlos manualmente.
- **Sandbox de Resend:** En modo sandbox, solo puedes enviar emails a direcciones específicas que configures en Resend.
- **Logs:** Todos los logs se imprimen en la consola del servidor y del navegador para facilitar el debugging.
- **Rate Limits:** Respeta los límites de Resend para evitar que tu cuenta sea suspendida.

## 🎉 Próximos Pasos

Una vez que las notificaciones funcionen correctamente:

1. ✅ Configura el dominio en Resend para producción
2. ✅ Ajusta las plantillas de email según tus necesidades
3. ✅ Configura los intervalos de notificación por usuario
4. ✅ Activa los cron jobs en Vercel
5. ✅ Monitorea los emails enviados en el dashboard de Resend

---

**¿Necesitas ayuda?** Revisa los logs en la consola del navegador y del servidor para más información sobre cualquier error.

