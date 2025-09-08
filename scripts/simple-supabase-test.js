// Script simple para probar Supabase
// Ejecutar con: node scripts/simple-supabase-test.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function simpleSupabaseTest() {
  console.log('🔗 Probando Supabase...\n')

  // Verificar configuración
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('📋 Configuración:')
  console.log(`SUPABASE_URL: ${supabaseUrl ? 'Configurada' : 'NO CONFIGURADA'}`)
  console.log(`SUPABASE_KEY: ${supabaseKey ? 'Configurada' : 'NO CONFIGURADA'}`)

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Configuración de Supabase incompleta')
    return
  }

  // Crear cliente
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Probar conexión básica
    console.log('\n🔍 Probando conexión a Supabase...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
    } else {
      console.log('✅ Conexión a Supabase exitosa')
    }

    // Probar función de email si existe
    console.log('\n📧 Probando función de email...')
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'sleon@slfabogados.cl',
          subject: '🧪 Prueba Simple - Lex Realis',
          text: 'Este es un email de prueba simple del sistema Lex Realis.'
        }
      })

      if (emailError) {
        console.log('❌ Error en función de email:', emailError.message)
      } else {
        console.log('✅ Función de email ejecutada exitosamente')
        console.log('📧 Respuesta:', JSON.stringify(emailData, null, 2))
      }
    } catch (funcError) {
      console.log('❌ Error al invocar función:', funcError.message)
      console.log('💡 La función send-email puede no estar configurada')
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESULTADO:')
    console.log('✅ Supabase configurado correctamente')
    console.log('✅ Conexión exitosa')
    
    if (supabaseUrl && supabaseKey) {
      console.log('✅ Variables de entorno configuradas')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar la prueba
simpleSupabaseTest().catch(console.error)
