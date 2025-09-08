# 🚀 Guía para Crear Edge Function en Supabase

## 📊 **DIAGNÓSTICO:**

✅ **Supabase configurado correctamente**  
✅ **Conexión exitosa**  
❌ **Edge Function send-email NO EXISTE o NO ESTÁ CONFIGURADA**

## 🎯 **SOLUCIÓN: Crear Edge Function**

### **PASO 1: Acceder a Supabase Dashboard**

1. **Ir a Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/qbxsayqyfndsugtydrao
   - Iniciar sesión en tu cuenta

2. **Navegar a Edge Functions:**
   - En el menú lateral, haz clic en **"Edge Functions"**
   - Deberías ver la lista de funciones (probablemente vacía)

### **PASO 2: Crear Nueva Edge Function**

1. **Hacer clic en "Create new function"**

2. **Configurar la función:**
   - **Name:** `send-email`
   - **Description:** `Función para enviar emails usando Resend`
   - **Region:** Selecciona la región más cercana (ej: `us-east-1`)

3. **Hacer clic en "Create function"**

### **PASO 3: Configurar Variables de Entorno**

1. **En la página de la función, ir a "Settings"**

2. **En "Environment Variables", agregar:**
   ```
   RESEND_API_KEY = tu_api_key_de_resend_aqui
   ```

3. **Hacer clic en "Save"**

### **PASO 4: Agregar Código de la Función**

1. **En el editor de código, reemplazar todo el contenido con:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { to, subject, html, text } = await req.json()

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: to, subject, and html or text' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'RESEND_API_KEY not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare email data
    const emailData: any = {
      from: 'Lex Realis <contacto@lexrealis.cl>',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
    }

    // Add content (prefer HTML over text)
    if (html) {
      emailData.html = html
    } else if (text) {
      emailData.text = text
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', responseData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: responseData 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        data: responseData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### **PASO 5: Desplegar la Función**

1. **Hacer clic en "Deploy"**

2. **Esperar a que se despliegue** (puede tomar unos minutos)

3. **Verificar que el estado sea "Active"**

### **PASO 6: Probar la Función**

1. **Ir a la pestaña "Testing"**

2. **Usar este JSON de prueba:**
   ```json
   {
     "to": "sleon@slfabogados.cl",
     "subject": "🧪 Prueba Edge Function - Lex Realis",
     "html": "<h1>Prueba de Edge Function</h1><p>Este email se envió desde Supabase Edge Function.</p>"
   }
   ```

3. **Hacer clic en "Send request"**

### **PASO 7: Verificar Resultado**

- ✅ **Si funciona:** Verás una respuesta exitosa
- ❌ **Si falla:** Revisa los logs en la pestaña "Logs"

## 🧪 **Probar desde la Aplicación**

Una vez desplegada la función, ejecuta:
```bash
node scripts/test-edge-function-exists.js
```

## ✅ **Resultado Esperado**

- ✅ **Edge Function creada** y desplegada
- ✅ **Variables de entorno** configuradas
- ✅ **Emails enviados** exitosamente
- ✅ **Sistema funcionando** correctamente

## 🎯 **Próximo Paso**

**¿Quieres que te guíe paso a paso para crear la Edge Function?**

1. Te ayudo a acceder a Supabase Dashboard
2. Creamos la función send-email
3. Configuramos las variables de entorno
4. Desplegamos la función
5. Probamos el envío de emails

**¡Empecemos a crear la Edge Function!** 🚀
