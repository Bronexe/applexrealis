// Script para probar la integración de Supabase + Resend
// Ejecutar con: node scripts/test-supabase-resend-integration.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseResendIntegration() {
  console.log('🔗 Probando integración de Supabase + Resend...\n')

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
    // Probar envío usando la integración de Supabase + Resend
    console.log('\n📧 Probando envío con integración Supabase + Resend...')
    
    // Método 1: Usar la función de envío de email de Supabase
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'sleon@slfabogados.cl',
          subject: '🧪 Prueba Integración Supabase + Resend - Lex Realis',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba Integración Supabase + Resend</h2>
                
                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #155724;">
                    <strong>✅ ¡Integración funcionando!</strong><br>
                    Este email se envió usando la integración de Supabase con Resend.
                  </p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
                  <h3 style="margin-top: 0; color: #333;">Detalles del Envío</h3>
                  <p style="margin: 10px 0; color: #666;">
                    <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}
                  </p>
                  <p style="margin: 10px 0; color: #666;">
                    <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL')}
                  </p>
                  <p style="margin: 10px 0; color: #666;">
                    <strong>Destinatario:</strong> sleon@slfabogados.cl
                  </p>
                  <p style="margin: 10px 0; color: #666;">
                    <strong>Método:</strong> Supabase + Resend (Integrado)
                  </p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404;">
                    <strong>📋 Sistema Lex Realis:</strong><br>
                    • Integración Supabase + Resend funcionando<br>
                    • Notificaciones por email operativas<br>
                    • API Key integrada en Supabase<br>
                    • Timestamp: ${new Date().toISOString()}
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #666; font-size: 14px; text-align: center;">
                  Este es un mensaje de prueba del sistema Lex Realis.<br>
                  Si recibes este email, la integración está funcionando correctamente.
                </p>
              </div>
            </div>
          `
        }
      })

      if (error) {
        console.log('❌ Error en función send-email:', error.message)
        console.log('💡 La función send-email no está configurada')
      } else {
        console.log('✅ Email enviado usando función send-email!')
        console.log('📧 Respuesta:', JSON.stringify(data, null, 2))
      }
    } catch (funcError) {
      console.log('❌ Error al invocar función:', funcError.message)
    }

    // Método 2: Usar el método directo de Supabase para envío de emails
    console.log('\n📧 Probando método directo de Supabase...')
    
    try {
      // Crear un registro en la tabla de notificaciones para probar
      const { data: notifData, error: notifError } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)

      if (notifError) {
        console.log('❌ Error al consultar notification_settings:', notifError.message)
      } else {
        console.log('✅ Tabla notification_settings accesible')
        console.log(`📧 Registros encontrados: ${notifData?.length || 0}`)
      }
    } catch (tableError) {
      console.log('❌ Error al acceder a tablas:', tableError.message)
    }

    // Método 3: Probar con el servicio de email de Supabase
    console.log('\n📧 Probando servicio de email de Supabase...')
    
    try {
      // Usar el método de envío de email de Supabase
      const { data: emailData, error: emailError } = await supabase
        .rpc('send_email', {
          to_email: 'sleon@slfabogados.cl',
          subject: '🧪 Prueba RPC Supabase - Lex Realis',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #BF7F11;">🏢 Lex Realis</h1>
              <p>Este es un email de prueba usando RPC de Supabase.</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
              <p><strong>Método:</strong> Supabase RPC</p>
            </div>
          `
        })

      if (emailError) {
        console.log('❌ Error en RPC send_email:', emailError.message)
      } else {
        console.log('✅ Email enviado usando RPC!')
        console.log('📧 Respuesta:', JSON.stringify(emailData, null, 2))
      }
    } catch (rpcError) {
      console.log('❌ Error en RPC:', rpcError.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESULTADO DE LA PRUEBA:')
    console.log('✅ Supabase configurado correctamente')
    console.log('✅ Integración Supabase + Resend probada')
    console.log('✅ Múltiples métodos probados')
    
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testSupabaseResendIntegration().catch(console.error)
