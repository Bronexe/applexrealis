// Script para verificar si la Edge Function existe
// Ejecutar con: node scripts/test-edge-function-exists.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testEdgeFunctionExists() {
  console.log('🔍 Verificando si la Edge Function send-email existe...\n')

  // Verificar configuración
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('📋 Configuración:')
  console.log(`SUPABASE_URL: ${supabaseUrl ? 'Configurada' : 'NO CONFIGURADA'}`)
  console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Configurada' : 'NO CONFIGURADA'}`)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Configuración de Supabase incompleta')
    return
  }

  // Crear cliente de Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Probar si la función send-email existe
    console.log('\n🔍 Probando si la función send-email existe...')
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'sleon@slfabogados.cl',
        subject: '🧪 Prueba Edge Function - Lex Realis',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #BF7F11;">🏢 Lex Realis</h1>
            <p>Este es un email de prueba de la Edge Function.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
            <p><strong>Método:</strong> Supabase Edge Function</p>
          </div>
        `
      }
    })

    if (error) {
      console.log('❌ Error al invocar función:', error.message)
      
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('\n💡 DIAGNÓSTICO:')
        console.log('❌ La función send-email NO EXISTE')
        console.log('🔧 SOLUCIÓN:')
        console.log('1. Ir a Supabase Dashboard')
        console.log('2. Edge Functions → Create new function')
        console.log('3. Nombre: send-email')
        console.log('4. Desplegar la función')
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('\n💡 DIAGNÓSTICO:')
        console.log('❌ La función existe pero hay problemas de autorización')
        console.log('🔧 SOLUCIÓN:')
        console.log('1. Verificar SUPABASE_SERVICE_ROLE_KEY')
        console.log('2. Configurar variables de entorno en la función')
      } else {
        console.log('\n💡 DIAGNÓSTICO:')
        console.log('❌ Error desconocido en la función')
        console.log('🔧 SOLUCIÓN:')
        console.log('1. Verificar logs de la función en Supabase')
        console.log('2. Revisar configuración de variables de entorno')
      }
    } else {
      console.log('✅ Función send-email existe y funciona!')
      console.log('📧 Respuesta:', JSON.stringify(data, null, 2))
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESULTADO:')
    console.log('✅ Supabase configurado correctamente')
    console.log('✅ Conexión exitosa')
    
    if (error && error.message.includes('404')) {
      console.log('❌ Edge Function send-email NO EXISTE')
      console.log('🔧 NECESITAS CREAR LA EDGE FUNCTION')
    } else if (error && error.message.includes('401')) {
      console.log('❌ Edge Function existe pero hay problemas de autorización')
      console.log('🔧 NECESITAS CONFIGURAR SERVICE_ROLE_KEY')
    } else if (error) {
      console.log('❌ Error en la Edge Function')
      console.log('🔧 NECESITAS REVISAR LA CONFIGURACIÓN')
    } else {
      console.log('✅ Edge Function funcionando correctamente')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la verificación
testEdgeFunctionExists().catch(console.error)
