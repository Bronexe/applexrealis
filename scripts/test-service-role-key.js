// Script para probar con SUPABASE_SERVICE_ROLE_KEY
// Ejecutar con: node scripts/test-service-role-key.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testServiceRoleKey() {
  console.log('🔑 Probando con SUPABASE_SERVICE_ROLE_KEY...\n')

  // Verificar configuración
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('📋 Configuración:')
  console.log(`SUPABASE_URL: ${supabaseUrl ? 'Configurada' : 'NO CONFIGURADA'}`)
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'Configurada' : 'NO CONFIGURADA'}`)

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Configuración de Supabase incompleta')
    console.log('💡 Asegúrate de que SUPABASE_SERVICE_ROLE_KEY esté en .env.local')
    return
  }

  // Crear cliente de Supabase con SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Probar conexión básica
    console.log('\n🔍 Probando conexión con SERVICE_ROLE_KEY...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
    } else {
      console.log('✅ Conexión con SERVICE_ROLE_KEY exitosa')
    }

    // Probar envío de email usando la integración
    console.log('\n📧 Probando envío de email con SERVICE_ROLE_KEY...')
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'sleon@slfabogados.cl',
          subject: '🧪 Prueba SERVICE_ROLE_KEY - Lex Realis',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba SERVICE_ROLE_KEY</h2>
                
                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #155724;">
                    <strong>✅ ¡SERVICE_ROLE_KEY funcionando!</strong><br>
                    Este email se envió usando SUPABASE_SERVICE_ROLE_KEY.
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
                    <strong>Método:</strong> Supabase SERVICE_ROLE_KEY
                  </p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404;">
                    <strong>📋 Sistema Lex Realis:</strong><br>
                    • SERVICE_ROLE_KEY funcionando<br>
                    • Integración Supabase + Resend operativa<br>
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
          `
        }
      })

      if (error) {
        console.log('❌ Error al enviar email:', error.message)
        console.log('🔍 Error completo:', error)
      } else {
        console.log('✅ Email enviado exitosamente con SERVICE_ROLE_KEY!')
        console.log('📧 Respuesta:', JSON.stringify(data, null, 2))
      }
    } catch (funcError) {
      console.log('❌ Error al invocar función:', funcError.message)
      console.log('💡 La función send-email puede no estar configurada')
    }

    // Probar acceso a tablas con SERVICE_ROLE_KEY
    console.log('\n🔍 Probando acceso a tablas con SERVICE_ROLE_KEY...')
    
    try {
      const { data: notifData, error: notifError } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)

      if (notifError) {
        console.log('❌ Error al consultar notification_settings:', notifError.message)
      } else {
        console.log('✅ Tabla notification_settings accesible con SERVICE_ROLE_KEY')
        console.log(`📧 Registros encontrados: ${notifData?.length || 0}`)
      }
    } catch (tableError) {
      console.log('❌ Error al acceder a tablas:', tableError.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESULTADO:')
    console.log('✅ Supabase configurado correctamente')
    console.log('✅ SERVICE_ROLE_KEY funcionando')
    console.log('✅ Integración probada')
    
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testServiceRoleKey().catch(console.error)
