# 🚀 Prueba Rápida de Notificaciones

## ⚡ Inicio Rápido (2 minutos)

### 1. Configurar Resend (Solo una vez)

1. **Crear cuenta:**
   - Ve a https://resend.com
   - Regístrate gratis (100 emails/día gratis)

2. **Obtener API Key:**
   - Ve a https://resend.com/api-keys
   - Clic en "Create API Key"
   - Copia la API key

3. **Configurar `.env.local`:**
```env
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=Lex Realis <onboarding@resend.dev>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Nota:** Usa `onboarding@resend.dev` para pruebas. En producción, verifica tu propio dominio.

4. **Reiniciar servidor:**
```bash
# Detener con Ctrl+C y ejecutar:
npm run dev
```

### 2. Enviar Email de Prueba

1. **Abrir la página:**
   - http://localhost:3000/configuracion/prueba-notificaciones

2. **Completar el formulario:**
   - **Email:** Tu email personal (ej: tunombre@gmail.com)
   - **Título:** "Prueba del Sistema" (o lo que quieras)
   - **Mensaje:** "Este es un mensaje de prueba" (o lo que quieras)

3. **Enviar:**
   - Clic en "Enviar Email de Prueba"
   - Espera 2-3 segundos

4. **Verificar:**
   - ✅ Mensaje "Email enviado exitosamente"
   - 📧 Revisar tu bandeja de entrada (o spam)

## ✅ Resultado Esperado

Deberías recibir un email bonito con:
- Header con el logo de Lex Realis (color dorado)
- Tu título personalizado
- Tu mensaje personalizado
- Botón para ir al dashboard
- Footer con información del sistema

## 🐛 Si Algo No Funciona

### Error: "API key is invalid"
- ✅ Verifica que copiaste bien la API key
- ✅ Reinicia el servidor (`npm run dev`)
- ✅ Crea una nueva API key en Resend

### Error: "Failed to send email"
- ✅ Revisa la consola del navegador (F12)
- ✅ Revisa la terminal del servidor
- ✅ Verifica que tengas internet

### Email no llega
- ✅ Revisa la carpeta de spam
- ✅ Verifica el email en https://resend.com/emails
- ✅ Espera 1-2 minutos (a veces tarda)

## 🎯 Pruebas Avanzadas

Una vez que funcione el email personalizado, puedes probar:

### 1. Documentos por Vencer
- Crea un seguro o certificación que venza en 20-30 días
- Habilita notificaciones en `notification_settings`
- Clic en "Probar Vencimientos"

### 2. Recordatorios de Asambleas
- Crea una asamblea para dentro de 7 días
- Habilita notificaciones en `notification_settings`
- Clic en "Probar Asambleas"

## 📊 Monitoreo en Resend

Para ver el estado de tus emails:
1. Ve a https://resend.com/emails
2. Verás todos los emails enviados con su estado:
   - ✅ **Delivered:** Entregado exitosamente
   - ⏳ **Processing:** En proceso
   - ❌ **Failed:** Falló (ver detalles)

## 💡 Tips

- **Email de prueba rápido:** Usa tu propio email para las pruebas
- **Sandbox:** En modo gratuito, Resend tiene limitaciones de dominio
- **Límites:** 100 emails/día en plan gratuito
- **Logs:** Siempre revisa la consola (F12) para ver detalles

## 🎉 ¡Listo!

Si el email personalizado funciona, ¡el sistema de notificaciones está operativo! 

Las otras pruebas (vencimientos y asambleas) requieren datos adicionales en la base de datos, pero el servicio de email ya está funcionando correctamente.

---

**Siguiente paso:** Configurar notificaciones automáticas con cron jobs en producción (ver `GUIA_PRUEBA_NOTIFICACIONES.md`)

