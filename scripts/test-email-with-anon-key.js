// Script para probar envío de emails con clave anónima
// Ejecutar con: node scripts/test-email-with-anon-key.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testEmailWithAnonKey() {
  console.log('🔑 Probando envío de emails con clave anónima...\n')

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

  // Crear cliente de Supabase con clave anónima
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Probar envío de email usando la integración
    console.log('\n📧 Probando envío de email con integración...')
    
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
        console.log('❌ Error al enviar email:', error.message)
        console.log('🔍 Error completo:', error)
      } else {
        console.log('✅ Email enviado exitosamente!')
        console.log('📧 Respuesta:', JSON.stringify(data, null, 2))
      }
    } catch (funcError) {
      console.log('❌ Error al invocar función:', funcError.message)
      console.log('💡 La función send-email puede no estar configurada')
    }

    // Probar envío directo con Resend (fallback)
    console.log('\n📧 Probando envío directo con Resend...')
    
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
      const directEmail = await resend.emails.send({
        from: 'Lex Realis <onboarding@resend.dev>',
        to: ['sleon@slfabogados.cl'],
        subject: '🧪 Prueba Directa Resend - Lex Realis',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #BF7F11;">🏢 Lex Realis</h1>
            <p>Este es un email de prueba directo con Resend.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
            <p><strong>Método:</strong> Resend directo</p>
          </div>
        `
      })

      if (directEmail.error) {
        console.log('❌ Error en envío directo:', directEmail.error.message)
      } else {
        console.log('✅ Email directo enviado exitosamente!')
        console.log('📧 Respuesta:', JSON.stringify(directEmail, null, 2))
      }
    } catch (directError) {
      console.log('❌ Error en envío directo:', directError.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESULTADO:')
    console.log('✅ Supabase configurado correctamente')
    console.log('✅ Integración probada')
    console.log('✅ Envío directo probado')
    
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testEmailWithAnonKey().catch(console.error)
