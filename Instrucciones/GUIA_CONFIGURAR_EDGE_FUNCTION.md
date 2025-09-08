# 🚀 Guía para Configurar Edge Function en Supabase

## 📋 **PASO A PASO:**

### **1. Acceder a Supabase Dashboard**
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto: `qbxsayqyfndsugtydrao`

### **2. Crear Edge Function**
1. En el menú lateral, haz clic en **"Edge Functions"**
2. Haz clic en **"Create new function"**
3. Configura la función:
   - **Name:** `send-email`
   - **Description:** `Función para enviar emails usando Resend`
   - **Region:** Selecciona la región más cercana (ej: `us-east-1`)

### **3. Configurar Variables de Entorno**
1. En la página de la función, ve a **"Settings"**
2. En **"Environment Variables"**, agrega:
   ```
   RESEND_API_KEY = tu_api_key_de_resend_aqui
   ```
3. Haz clic en **"Save"**

### **4. Desplegar la Función**
1. Copia el código de `supabase/functions/send-email/index.ts`
2. Pégalo en el editor de código de Supabase
3. Haz clic en **"Deploy"**

### **5. Probar la Función**
1. Ve a la pestaña **"Testing"**
2. Usa este JSON de prueba:
   ```json
   {
     "to": "sleon@slfabogados.cl",
     "subject": "🧪 Prueba Edge Function - Lex Realis",
     "html": "<h1>Prueba de Edge Function</h1><p>Este email se envió desde Supabase Edge Function.</p>"
   }
   ```
3. Haz clic en **"Send request"**

## 🔧 **CÓDIGO DE LA FUNCIÓN:**

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

## ⚠️ **IMPORTANTE:**

1. **API Key de Resend:** Necesitas una API Key válida de Resend
2. **Variables de Entorno:** Configura `RESEND_API_KEY` en la función
3. **Dominio:** La función usa `contacto@lexrealis.cl` como remitente
4. **CORS:** La función incluye headers CORS para permitir requests desde tu app

## 🧪 **PRUEBA DESPUÉS DE CONFIGURAR:**

Una vez desplegada la función, ejecuta:
```bash
node scripts/test-supabase-integration.js
```

## ✅ **RESULTADO ESPERADO:**

- ✅ **Función desplegada** exitosamente
- ✅ **Emails enviados** desde Supabase
- ✅ **Sistema funcionando** correctamente
- ✅ **Notificaciones operativas**

**¡Sigue estos pasos y tendrás la Edge Function funcionando!** 🎉
