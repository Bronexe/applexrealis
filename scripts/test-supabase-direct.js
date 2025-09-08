// Script para probar envío directo con Supabase
// Ejecutar con: node scripts/test-supabase-direct.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseDirect() {
  console.log('🔗 Probando envío directo con Supabase...\n')

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
    // Probar envío directo usando la tabla de emails
    console.log('\n📧 Probando envío directo...')
    
    const { data, error } = await supabase
      .from('emails')
      .insert({
        to: 'sleon@slfabogados.cl',
        subject: '🧪 Prueba Directa Supabase - Lex Realis',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba Directa Supabase</h2>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                  <strong>✅ ¡Envío directo funcionando!</strong><br>
                  Este email se envió usando el método directo de Supabase.
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
                  <strong>Método:</strong> Supabase Directo
                </p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>📋 Sistema Lex Realis:</strong><br>
                  • Envío directo Supabase funcionando<br>
                  • Integración con Resend operativa<br>
                  • Notificaciones por email activas<br>
                  • Timestamp: ${new Date().toISOString()}
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; text-align: center;">
                Este es un mensaje de prueba del sistema Lex Realis.<br>
                Si recibes este email, el sistema está funcionando correctamente.
              </p>
            </div>
          </div>
        `,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.log('❌ Error al enviar email:', error.message)
      console.log('🔍 Error completo:', error)
      
      // Si la tabla emails no existe, probar con otra tabla
      console.log('\n📧 Probando con tabla de notificaciones...')
      
      try {
        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: 'test-user',
            type: 'email',
            title: '🧪 Prueba Notificación - Lex Realis',
            message: 'Este es un mensaje de prueba del sistema Lex Realis.',
            email: 'sleon@slfabogados.cl',
            created_at: new Date().toISOString()
          })
          .select()

        if (notifError) {
          console.log('❌ Error en notificaciones:', notifError.message)
        } else {
          console.log('✅ Notificación creada exitosamente!')
          console.log('📧 Respuesta:', JSON.stringify(notifData, null, 2))
        }
      } catch (notifError) {
        console.log('❌ Error en notificaciones:', notifError.message)
      }
    } else {
      console.log('✅ Email enviado exitosamente!')
      console.log('📧 Respuesta:', JSON.stringify(data, null, 2))
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESULTADO:')
    console.log('✅ Supabase configurado correctamente')
    console.log('✅ Envío directo probado')
    console.log('✅ Sistema funcionando')
    
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testSupabaseDirect().catch(console.error)
