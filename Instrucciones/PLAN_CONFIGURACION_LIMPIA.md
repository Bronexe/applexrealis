# 🚀 Plan de Configuración Limpia - Resend + Supabase

## 📊 **DIAGNÓSTICO ACTUAL:**

### ✅ **CONFIGURADO CORRECTAMENTE:**
- **Supabase URL:** ✅ `https://qbxsayqyfndsugtydrao.supabase.co`
- **Supabase Anon Key:** ✅ Configurada
- **Resend API Key:** ✅ Formato válido (36 caracteres)
- **Email From:** ✅ `Lex Realis <contacto@lexrealis.cl>`
- **App URL:** ✅ `http://localhost:3000`
- **Cron Secret:** ✅ Configurada

### ❌ **FALTANTE:**
- **SUPABASE_SERVICE_ROLE_KEY:** ❌ No configurada

## 🎯 **PLAN DE ACCIÓN COMPLETO:**

### **PASO 1: Obtener SUPABASE_SERVICE_ROLE_KEY**

1. **Ir a Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/qbxsayqyfndsugtydrao
   - Iniciar sesión en tu cuenta

2. **Obtener Service Role Key:**
   - Ir a **Settings** → **API**
   - Buscar **"service_role"** en la sección **"Project API keys"**
   - Copiar la clave (empieza con `eyJhbGciOiJIUzI1NiIs...`)

3. **Actualizar .env.local:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **PASO 2: Verificar API Key de Resend**

1. **Ir a Resend Dashboard:**
   - URL: https://resend.com/api-keys
   - Iniciar sesión en tu cuenta

2. **Verificar API Key actual:**
   - Verificar que la API Key sea válida
   - Si no funciona, crear una nueva

3. **Probar API Key:**
   ```bash
   node scripts/test-resend-api-key.js
   ```

### **PASO 3: Configurar Edge Function en Supabase**

1. **Crear Edge Function:**
   - Supabase Dashboard → **Edge Functions**
   - **Create new function** → Nombre: `send-email`

2. **Configurar Variables de Entorno:**
   - En la función, ir a **Settings**
   - Agregar: `RESEND_API_KEY = tu_api_key_aqui`

3. **Desplegar función:**
   - Copiar código de `supabase/functions/send-email/index.ts`
   - Desplegar

### **PASO 4: Probar Integración Completa**

1. **Probar con Service Role Key:**
   ```bash
   node scripts/test-service-role-key.js
   ```

2. **Probar Edge Function:**
   ```bash
   node scripts/test-edge-function.js
   ```

3. **Probar envío de emails:**
   ```bash
   node scripts/test-email-complete.js
   ```

### **PASO 5: Configurar Sistema de Notificaciones**

1. **Configurar tabla notification_settings:**
   ```sql
   -- Ejecutar en Supabase SQL Editor
   ```

2. **Configurar cron jobs:**
   - Actualizar `vercel.json`
   - Configurar endpoints

3. **Probar notificaciones:**
   ```bash
   node scripts/test-notifications-complete.js
   ```

## 🔧 **SCRIPTS DE PRUEBA:**

### **1. Verificar Service Role Key:**
```bash
node scripts/test-service-role-key.js
```

### **2. Probar Edge Function:**
```bash
node scripts/test-edge-function.js
```

### **3. Probar envío completo:**
```bash
node scripts/test-email-complete.js
```

### **4. Probar notificaciones:**
```bash
node scripts/test-notifications-complete.js
```

## 📋 **CHECKLIST DE CONFIGURACIÓN:**

- [ ] **SUPABASE_SERVICE_ROLE_KEY** configurada
- [ ] **Resend API Key** verificada
- [ ] **Edge Function** creada y desplegada
- [ ] **Variables de entorno** configuradas
- [ ] **Envío de emails** funcionando
- [ ] **Sistema de notificaciones** operativo
- [ ] **Cron jobs** configurados
- [ ] **Despliegue** en Vercel

## 🎯 **PRÓXIMO PASO:**

**¿Quieres que empecemos con el PASO 1 (obtener SUPABASE_SERVICE_ROLE_KEY)?**

1. Te guío para obtener la Service Role Key
2. Actualizamos el .env.local
3. Probamos la configuración
4. Continuamos con los siguientes pasos

**¡Empecemos con la configuración limpia!** 🚀
