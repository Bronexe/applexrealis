# 🚀 Configuración Limpia - Resend + Supabase

## 📊 **DIAGNÓSTICO COMPLETO:**

### ✅ **CONFIGURADO CORRECTAMENTE:**
- **Supabase URL:** ✅ `https://qbxsayqyfndsugtydrao.supabase.co`
- **Supabase Anon Key:** ✅ Configurada
- **App URL:** ✅ `http://localhost:3000`
- **Cron Secret:** ✅ Configurada

### ❌ **PROBLEMAS IDENTIFICADOS:**
- **Resend API Key:** ❌ Formato válido pero inválida para envío
- **SUPABASE_SERVICE_ROLE_KEY:** ❌ No configurada
- **Dominios en Resend:** ❌ 0 dominios configurados

## 🎯 **PLAN DE ACCIÓN COMPLETO:**

### **PASO 1: Configurar Resend desde Cero**

#### **1.1. Obtener Nueva API Key de Resend:**
1. **Ir a Resend Dashboard:**
   - URL: https://resend.com/api-keys
   - Iniciar sesión en tu cuenta

2. **Crear Nueva API Key:**
   - Hacer clic en **"Create API Key"**
   - **Name:** `Lex Realis App`
   - **Permission:** `Full Access`
   - **Expires:** `Never`
   - **Copiar la API Key** (se muestra solo una vez)

3. **Actualizar .env.local:**
   ```env
   RESEND_API_KEY=re_nueva_api_key_aqui
   ```

#### **1.2. Configurar Dominio (Opcional):**
1. **Ir a Domains:**
   - URL: https://resend.com/domains
   - **Add Domain:** `lexrealis.cl`

2. **Configurar DNS:**
   - Agregar registros DNS según las instrucciones
   - Verificar dominio

3. **Actualizar Email From:**
   ```env
   EMAIL_FROM=Lex Realis <contacto@lexrealis.cl>
   ```

### **PASO 2: Configurar Supabase**

#### **2.1. Obtener Service Role Key:**
1. **Ir a Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/qbxsayqyfndsugtydrao
   - **Settings** → **API**

2. **Copiar Service Role Key:**
   - Buscar **"service_role"** en **"Project API keys"**
   - Copiar la clave completa

3. **Actualizar .env.local:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### **2.2. Crear Edge Function:**
1. **Ir a Edge Functions:**
   - Supabase Dashboard → **Edge Functions**
   - **Create new function** → Nombre: `send-email`

2. **Configurar Variables de Entorno:**
   - En la función, ir a **Settings**
   - Agregar: `RESEND_API_KEY = tu_nueva_api_key_aqui`

3. **Desplegar función:**
   - Copiar código de `supabase/functions/send-email/index.ts`
   - Desplegar

### **PASO 3: Probar Configuración**

#### **3.1. Probar API Key de Resend:**
```bash
node scripts/test-resend-api-key.js
```

#### **3.2. Probar Service Role Key:**
```bash
node scripts/test-service-role-key.js
```

#### **3.3. Probar Edge Function:**
```bash
node scripts/test-edge-function.js
```

#### **3.4. Probar Integración Completa:**
```bash
node scripts/test-email-complete.js
```

## 🔧 **SCRIPTS DE PRUEBA DISPONIBLES:**

### **1. Verificar API Key de Resend:**
```bash
node scripts/test-resend-api-key.js
```

### **2. Verificar Service Role Key:**
```bash
node scripts/test-service-role-key.js
```

### **3. Probar Edge Function:**
```bash
node scripts/test-edge-function.js
```

### **4. Probar Integración Completa:**
```bash
node scripts/test-email-complete.js
```

## 📋 **CHECKLIST DE CONFIGURACIÓN:**

- [ ] **Nueva API Key de Resend** obtenida y configurada
- [ ] **Dominio lexrealis.cl** configurado (opcional)
- [ ] **SUPABASE_SERVICE_ROLE_KEY** configurada
- [ ] **Edge Function send-email** creada y desplegada
- [ ] **Variables de entorno** configuradas en la función
- [ ] **Envío de emails** funcionando
- [ ] **Sistema de notificaciones** operativo

## 🎯 **PRÓXIMO PASO:**

**¿Quieres que empecemos con el PASO 1 (obtener nueva API Key de Resend)?**

1. Te guío para obtener la nueva API Key
2. Actualizamos el .env.local
3. Probamos la configuración
4. Continuamos con los siguientes pasos

**¡Empecemos con la configuración limpia!** 🚀
